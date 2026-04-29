const express = require("express");
const cors = require("cors");
const ExcelJS = require("exceljs");
const axios = require("axios");
const fs = require("fs"); // <--- NUEVO: Para manejar archivos
const path = require("path"); // <--- NUEVO: Para rutas de carpetas

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE ARCHIVOS PARA PERSISTENCIA ---
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const SALES_FILE = path.join(__dirname, "sales.json");

// Función para cargar datos al iniciar
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

// Función para guardar datos
const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error guardando en ${filePath}:`, e);
    }
};

// Cargar datos iniciales
let products = loadData(PRODUCTS_FILE); 
let sales = loadData(SALES_FILE);
// ---------------------------------------------------

// OBTENER PRODUCTOS
app.get("/api/products", (req, res) => {
    res.json(products);
});

// CREAR PRODUCTO
app.post("/api/products", (req, res) => {
    try {
        const product = {
            id: String(Date.now()), 
            name: (req.body.name || "SIN NOMBRE").toUpperCase(),
            is_miscellaneous: Boolean(req.body.is_miscellaneous), 
            is_extra: Boolean(req.body.is_extra), 
            colors: []
        };
        products.push(product);
        saveData(PRODUCTS_FILE, products); // <--- GUARDAR
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: "Error interno al crear" });
    }
});

// AÑADIR COLOR
app.post("/api/products/:id/colors", (req, res) => {
    const product = products.find(p => String(p.id) === String(req.params.id));
    if (!product) return res.status(404).json({error: "Producto no encontrado"});
    
    const color = {
        id: String(Date.now() + Math.random()),
        name: (req.body.name || "ÚNICO").toUpperCase(),
        stock: {} 
    };
    product.colors.push(color);
    saveData(PRODUCTS_FILE, products); // <--- GUARDAR
    res.json(color);
});

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
        
        saveData(PRODUCTS_FILE, products); // <--- GUARDAR
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
        
        saveData(PRODUCTS_FILE, products); // <--- GUARDAR STOCK ACTUALIZADO
        saveData(SALES_FILE, sales);       // <--- GUARDAR VENTA
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
    saveData(PRODUCTS_FILE, products); // <--- GUARDAR
    res.json({ ok: true });
});

// ELIMINAR COLOR
app.delete("/api/products/:productId/colors/:colorId", (req, res) => {
    const product = products.find(p => p.id == req.params.productId);
    if (product) {
        product.colors = product.colors.filter(c => c.id != req.params.colorId);
        saveData(PRODUCTS_FILE, products); // <--- GUARDAR
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

// EXPORTAR EXCEL
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

// Cambiado puerto a 8000 como estaba originalmente
app.listen(8000, () => console.log("🚀 Servidor Suma Pro con Persistencia en puerto 8000"));