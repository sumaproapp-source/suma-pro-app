const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const axios = require("axios");

const app = express();

app.use(cors());

app.use(express.json({
  limit: "50mb"
}));

app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));

const mongoose = require("mongoose");

// ✅ Conexión Mongo estable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mongo conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

/* =========================
   SCHEMAS
========================= */

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  is_miscellaneous: Boolean,
  is_extra: Boolean,
  colors: Array
}, {
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const SaleSchema = new mongoose.Schema({
  date: Date,
  items: Array
}, {
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Product = mongoose.model("Product", ProductSchema);
const Sale = mongoose.model("Sale", SaleSchema);

const TicketSchema = new mongoose.Schema({
  date: Date,
  items: Array,
  total_items: Number,
  ticket_number: Number
});

const Ticket = mongoose.model("Ticket", TicketSchema);

/* =========================
   PRODUCTOS
========================= */

// GET
app.get("/api/products", async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


//TICKET
app.get("/api/tickets", async (req, res) => {
  try {

    const tickets = await Ticket.find()
      .sort({ date: -1 });

    res.json(tickets);

  } catch (err) {

    res.status(500).json({
      error: "Error obteniendo tickets"
    });

  }
});


// CREATE
app.post("/api/products", async (req, res) => {
  try {
   const product = new Product({
  name: (req.body.name || "SIN NOMBRE").toUpperCase(),
  price: Number(req.body.price) || 0,
  is_miscellaneous: Boolean(req.body.is_miscellaneous),
  is_extra: Boolean(req.body.is_extra),
  colors: []
});

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Error creando producto" });
  }
});

// ADD COLOR
app.post("/api/products/:id/colors", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const color = {
      id: String(Date.now() + Math.random()),
      name: (req.body.name || "ÚNICO").toUpperCase(),
      stock: {}
    };

    product.colors.push(color);
    await product.save();

    res.json(color);
  } catch (err) {
    res.status(500).json({ error: "Error añadiendo color" });
  }
});

// UPDATE STOCK
app.put("/api/stock", async (req, res) => {
  try {
    const { product_id, color_id, model, stock } = req.body;

    const product = await Product.findById(product_id);

    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    const color = product.colors.find(c => c.id == color_id);

    if (!color)
      return res.status(404).json({ error: "Color no encontrado" });

    const finalModel = product.is_miscellaneous ? "N/A" : model;

    // ✅ evita negativos
    color.stock[finalModel] = Math.max(0, parseInt(stock) || 0);

    // 🔥 ESTA ES LA LÍNEA IMPORTANTE
    product.markModified("colors");

    await product.save();

    res.json({
      ok: true,
      stock: color.stock[finalModel]
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Error actualizando stock"
    });
  }
});
// DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando producto" });
  }
});

// DELETE COLOR
app.delete("/api/products/:productId/colors/:colorId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    product.colors = product.colors.filter(c => c.id != req.params.colorId);
    await product.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando color" });
  }
});

/* =========================
   VENTAS
========================= */

app.post("/api/sales", async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay items" });
    }

    for (const item of items) {
      const p = await Product.findById(item.product_id);
      if (!p || p.is_extra) continue;

      const c = p.colors.find(col => col.id == item.color_id);
      if (!c) continue;

      const modelKey = p.is_miscellaneous ? "N/A" : item.iphone_model;
      const currentStock = c.stock[modelKey] || 0;

      if (currentStock < item.quantity) {
        return res.status(400).json({ error: `Sin stock de ${p.name}` });
      }
    }

    for (const item of items) {
      const p = await Product.findById(item.product_id);
      if (p && !p.is_extra && item.color_id) {
        const c = p.colors.find(col => col.id == item.color_id);
        const modelKey = p.is_miscellaneous ? "N/A" : item.iphone_model;

        if (c && c.stock[modelKey] !== undefined) {
          c.stock[modelKey] -= item.quantity;
        }
     // 🔥 FORZAR GUARDADO EN MONGO
        p.markModified("colors");
        await p.save();
      }
    }

    const sale = new Sale({
      date: new Date(),
      items
    });

    await sale.save();

const ticket = new Ticket({
  date: new Date(),
  items,
  total_items: items.reduce((a, b) => a + b.quantity, 0),
  ticket_number: Date.now()
});

await ticket.save();

res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error procesando venta" });
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    const data = await Sale.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo ventas" });
  }
});

 app.delete("/api/clear", async (req, res) => {
   try {
     const { key } = req.body;

     // 🔐 clave secreta (la defines tú en Render)
     if (key !== process.env.ADMIN_KEY) {
       return res.status(403).json({ error: "No autorizado" });
     }
 
     await Product.deleteMany({});
     await Sale.deleteMany({});

     res.json({ ok: true, message: "Inventario borrado" });

   } catch (err) {
     res.status(500).json({ error: "Error borrando datos" });
   }
 });

  app.delete("/api/tickets", async (req, res) => {

  try {

    const { key } = req.body;

    if (key !== process.env.ADMIN_KEY) {

      return res.status(403).json({
        error: "No autorizado"
      });

    }

    await Sale.deleteMany({});
    await Ticket.deleteMany({});

    res.json({
      ok: true,
      message: "Tickets borrados"
    });

  } catch (err) {

    res.status(500).json({
      error: "Error borrando tickets"
    });

  }

});

/* =========================
   GOOGLE DRIVE
========================= */

const G_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHpPWjDzbQiLvAyN950k-5xAfpvfI3FIHrY_TGUqTrOxUWN_y8LgzLEtmnmjoVRlDT3g/exec";

app.post("/api/sync-drive", async (req, res) => {
  try {
    const r = await axios.post(G_SCRIPT_URL, JSON.stringify(req.body), {
      headers: { "Content-Type": "text/plain" }
    });

    res.json({ ok: true, google: r.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   EXPORT EXCEL
========================= */

app.get("/api/export/inventory", async (req, res) => {
  const products = await Product.find();

  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Inventario");

  sheet.columns = [
    { header: "TIPO", key: "t", width: 15 },
    { header: "PRODUCTO", key: "p", width: 25 },
    { header: "COLOR", key: "c", width: 15 },
    { header: "MODELO", key: "m", width: 20 },
    { header: "STOCK", key: "s", width: 10 }
  ];

  products.forEach(p => {
    const tipo = p.is_extra ? "EXTRA" : (p.is_miscellaneous ? "MISC" : "FUNDA");

    p.colors.forEach(c => {
      Object.entries(c.stock || {}).forEach(([model, qty]) => {
        sheet.addRow({
          t: tipo,
          p: p.name,
          c: c.name,
          m: model,
          s: qty
        });
      });
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=inventario.xlsx");

  await wb.xlsx.write(res);
  res.end();
});

/* ========================= */

// ✅ PUERTO DINÁMICO (Render)
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => 
  console.log("🚀 Servidor Mongo listo en puerto", PORT)
);
