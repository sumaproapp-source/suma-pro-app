const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: [
    "https://suma-pro-app-ylld.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch(err => console.log("❌ Error Mongo:", err));

const ProductSchema = new mongoose.Schema({
  name: String,
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

const Product = mongoose.model("Product", ProductSchema);


// --- CONFIGURACIÓN JSON (NO TOCADO) ---
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const SALES_FILE = path.join(__dirname, "sales.json");

const loadData = (filePath) => {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (e) {
            console.error(`Error leyendo ${filePath}:`, e);
            return [];
        }
    }
    return [];
};

const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error guardando en ${filePath}:`, e);
    }
};

let products = loadData(PRODUCTS_FILE); 
let sales = loadData(SALES_FILE);
// ---------------------------------------------------


// 🔥 GET PRODUCTOS (Mongo)
app.get("/api/products", async (req, res) => {
    try {
        const data = await Product.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});


// 🔥 CREAR PRODUCTO (Mongo)
app.post("/api/products", async (req, res) => {
    try {
        const product = {
            name: (req.body.name || "SIN NOMBRE").toUpperCase(),
            is_miscellaneous: Boolean(req.body.is_miscellaneous),
            is_extra: Boolean(req.body.is_extra),
            colors: []
        };

        const newProduct = new Product(product);
        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error interno al crear" });
    }
});


// 🔥 AÑADIR COLOR (AHORA EN MONGO)
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
    res.status(500).json({ error: "Error al añadir color" });
  }
});


// 🔴 TODO LO DEMÁS SIGUE IGUAL (JSON)

// ACTUALIZAR STOCK
app.put("/api/stock", (req, res) => {
    try {
        const { product_id, color_id, model, stock } = req.body;
        const product = products.find(p => p.id == product_id);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        
        const color = product.colors.find(c => c.id == color_id);
        if (!color) return res.status(404).json({ error: "Color no encontrado" });
        
        const finalModel = product.is_miscellaneous ? "N/A" : model;
        color.stock[finalModel] = parseInt(stock) || 0;
        
        saveData(PRODUCTS_FILE, products);
        res.json({ ok: true, stock: color.stock[finalModel] });
    } catch (e) {
        res.status(500).json({ error: "Error al actualizar stock" });
    }
});

// REGISTRAR VENTA
app.post("/api/sales", (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "No hay items" });

    try {
        for (const item of items) {
            const p = products.find(prod => prod.id == item.product_id);
            if (!p || p.is_extra) continue;
            const c = p.colors.find(col => col.id == item.color_id);
            if (!c) continue;
            const modelKey = p.is_miscellaneous ? "N/A" : item.iphone_model;
            const currentStock = c.stock[modelKey] || 0;
            if (currentStock < item.quantity) {
                return res.status(400).json({ error: `Sin stock de ${p.name} (${modelKey})` });
            }
        }

        items.forEach(item => {
            const p = products.find(prod => prod.id == item.product_id);
            if (p && !p.is_extra && item.color_id) {
                const c = p.colors.find(col => col.id == item.color_id);
                const modelKey = p.is_miscellaneous ? "N/A" : item.iphone_model;
                if (c && c.stock[modelKey] !== undefined) {
                    c.stock[modelKey] -= item.quantity;
                }
            }
        });

        const newSale = { id: Date.now(), date: new Date(), items };
        sales.push(newSale); 
        
        saveData(PRODUCTS_FILE, products);
        saveData(SALES_FILE, sales);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: "Error procesando venta" });
    }
});

app.get("/api/sales", (req, res) => {
    res.json(sales); 
});

// ELIMINAR PRODUCTO
app.delete("/api/products/:id", (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    saveData(PRODUCTS_FILE, products);
    res.json({ ok: true });
});

// ELIMINAR COLOR
app.delete("/api/products/:productId/colors/:colorId", (req, res) => {
    const product = products.find(p => p.id == req.params.productId);
    if (product) {
        product.colors = product.colors.filter(c => c.id != req.params.colorId);
        saveData(PRODUCTS_FILE, products);
    }
    res.json({ ok: true });
});

// SYNC GOOGLE DRIVE
const G_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxAd7wskdU8_D5CKkRprlVaWMbHyLrEoepLT-zocL1OHnGjZXA2Us7dWIEXQ3c_qwVUcw/exec";
app.post("/api/sync-drive", async (req, res) => {
  try {
    const r = await axios.post(G_SCRIPT_URL, JSON.stringify(req.body), { 
        headers: { "Content-Type": "text/plain" },
        maxRedirects: 5 
    });
    res.json({ ok: true, google: r.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPORTAR EXCEL (sigue usando JSON por ahora)
app.get("/api/export/inventory", async (req, res) => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Inventario");
    sheet.columns = [
        { header: "TIPO", key: "t", width: 15 },
        { header: "PRODUCTO", key: "p", width: 25 },
        { header: "COLOR/VAR", key: "c", width: 15 },
        { header: "MODELO", key: "m", width: 20 },
        { header: "STOCK", key: "s", width: 10 }
    ];
    products.forEach(p => {
        const tipo = p.is_extra ? "EXTRA" : (p.is_miscellaneous ? "MISCELÁNEO" : "FUNDA");
        p.colors.forEach(c => {
            Object.entries(c.stock || {}).forEach(([model, qty]) => {
                sheet.addRow({ t: tipo, p: p.name, c: c.name, m: model, s: qty });
            });
        });
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=inventario.xlsx");
    await wb.xlsx.write(res);
    res.end();
});

app.listen(8000, () => console.log("🚀 Servidor Suma Pro con Persistencia en puerto 8000"));