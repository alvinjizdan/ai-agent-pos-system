const { Types } = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const escapeRegex = (text) => String(text || '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

// Helper untuk menormalisasi input pencarian kode pesanan (misal: "RND-001", "rnd-1", "1")
const resolveOrderQuery = (identifier) => {
  const clean = String(identifier || '').trim();
  if (!clean) return null;

  if (Types.ObjectId.isValid(clean)) {
    return { _id: clean };
  }

  const match = clean.match(/RND-(\d+)/i) || clean.match(/^(\d+)$/);
  if (match) {
    const numStr = String(parseInt(match[1], 10)).padStart(3, '0');
    return {
      $or: [
        { orderCode: new RegExp(`^RND-${numStr}$`, 'i') },
        { orderCode: new RegExp(`^${escapeRegex(clean)}$`, 'i') }
      ]
    };
  }

  return { orderCode: new RegExp(`^${escapeRegex(clean)}$`, 'i') };
};

// Helper: Menghasilkan kode pesanan berikutnya secara berurutan
const generateNextOrderCode = async () => {
  const latestOrders = await Order.find({ orderCode: /^RND-\d+$/i }).sort({ orderCode: -1 }).limit(20);
  let maxNum = 0;
  for (const o of latestOrders) {
    const match = o.orderCode?.match(/RND-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  if (maxNum === 0) {
    const total = await Order.countDocuments();
    maxNum = total;
  }

  return `RND-${String(maxNum + 1).padStart(3, '0')}`;
};

// Helper: Migrasi otomatis dokumen pesanan lama yang belum memiliki field orderCode
const backfillOrderCodes = async () => {
  try {
    const unassignedCount = await Order.countDocuments({
      $or: [{ orderCode: { $exists: false } }, { orderCode: null }, { orderCode: '' }]
    });

    if (unassignedCount === 0) return;

    const allOrdersAsc = await Order.find().sort({ date: 1 });
    for (let i = 0; i < allOrdersAsc.length; i++) {
      const ord = allOrdersAsc[i];
      if (!ord.orderCode) {
        const code = `RND-${String(i + 1).padStart(3, '0')}`;
        await Order.findByIdAndUpdate(ord._id, { orderCode: code });
      }
    }
  } catch (err) {
    console.error("Gagal melakukan auto-backfill orderCode:", err.message);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customerName, items, totalPrice } = req.body;
    
    // Pastikan data lama sudah ter-backfill agar penomoran kode akurat
    await backfillOrderCodes();
    const nextOrderCode = await generateNextOrderCode();

    const newOrder = await Order.create({
      orderCode: nextOrderCode,
      customerName,
      items, 
      totalPrice
    });

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const itemDibeli = items[i];
        const product = await Product.findOne({ name: itemDibeli.name });

        if (product) {
          let sisaStok = product.stock - itemDibeli.quantity;
          if (sisaStok < 0) sisaStok = 0; 
          
          product.stock = sisaStok;
          await product.save();
        }
      }
    }

    res.json({ 
      message: "Order berhasil dicatat & Stok otomatis berkurang!", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Error saat mencatat order:", error);
    res.status(500).json({ error: "Gagal mencatat order dan update stok" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Jalankan backfill jika ada order lama tanpa kode
    await backfillOrderCodes();

    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
    }

    const orders = await Order.find(query).sort({ date: -1 });

    const formattedOrders = orders.map((order, index) => ({
        id: order._id,
        orderCode: order.orderCode || `RND-${String(orders.length - index).padStart(3, '0')}`,
        customerName: order.customerName,
        totalPrice: order.totalPrice,
        status: order.status,
        date: order.date,
        items: JSON.stringify(order.items) 
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const query = resolveOrderQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ error: "Parameter ID atau Kode pesanan tidak valid" });
    }

    const updated = await Order.findOneAndUpdate(query, { status: req.body.status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: `Pesanan '${req.params.id}' tidak ditemukan` });
    }

    res.json({ 
      message: "Status diperbarui", 
      orderCode: updated.orderCode,
      status: updated.status 
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal update status: " + error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const query = resolveOrderQuery(req.params.id);
    if (!query) {
      return res.status(400).json({ error: "Parameter ID atau Kode pesanan tidak valid" });
    }

    const deleted = await Order.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: `Pesanan '${req.params.id}' tidak ditemukan` });
    }

    res.json({ message: "Pesanan berhasil dihapus", orderCode: deleted.orderCode });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus pesanan: " + error.message });
  }
};
