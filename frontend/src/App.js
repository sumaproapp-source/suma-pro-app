import React, { useEffect, useState } from "react";
import axios from "axios";

// --- CAMBIAR TU IP AQUÍ ---
const API = "https://suma-pro-app.onrender.com/api";

const MODELS = [
  "XS MAX","X/XS", "XR", "7G/8G/SE (2020-2024)", "iPhone 7P/8P", "iPhone 11",
  "iPhone 12 ","iPhone 12 Pro", "iPhone 12 Mini", "iPhone 12 Pro Max", "iPhone 13", "iPhone 13 Pro Max","iPhone  13 Mini", "iPhone 14", 
  "iPhone 13 Pro", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 14 Plus",
  "iPhone 15", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "16 Pro",
  "iPhone 16 Pro Max", "iPhone 16 E/SE", "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone Air",
  "S20 FE", "S20 Plus", "S21 Ultra", "S21", "S21 Plus", "S22", "S22 Plus",
  "S22 Ultra", "S23", "S23 Plus", "S23 Ultra","S25","S25 Ultra","S26","S26 Ultra", "S23 FE", "S24 / S25",
  "S24 / 25 Plus", "S24 FE", "S24 Ultra", "S25 Ultra", "S25 FE", "S21 FE",
  "A15", "A16", "A55", "A35", "A13 4G / A32 5G", "A52S / A52", "A21S",
  "A36 / A56", "A54", "A26 / A17", "A34", "A70", "A22 5G", "A25", "A53",
  "A14", "A10", "A12", "AA13 4G", "A14", "A15", "A16", "A17 / A26", "A21S",
  "A22", "A25", "A36 / 56", "A20 E / A40", "A50", "A52", "A53", "A54",
  "A35", "A34", "A70", "P30 (Huawei)", "S20 FE", "Otro"
];

mainDiv: {
  backgroundImage: `url(${process.env.PUBLIC_URL}/fondo2.png)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh',
  paddingBottom: '140px',
  fontFamily: '"Rajdhani", sans-serif',
  color: '#fff',
},
  glowCard: {
    backgroundColor: 'rgba(28, 46, 116, 0.6)', 
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow: '0 0 20px rgba(0, 150, 255, 0.4)',
    border: '1px solid rgba(0, 150, 255, 0.2)',
  },
  glowCardExtra: {
    backgroundColor: 'rgba(25, 32, 59, 0.8)', 
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 0 15px rgba(243, 156, 18, 0.3)',
    border: '1px solid rgba(243, 156, 18, 0.2)', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  futuristicButton: {
    background: 'linear-gradient(135deg, #007bff 0%, #0099ff 100%)',
    color: 'white',
    border: '1px solid rgba(0, 150, 255, 0.5)',
    borderRadius: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  plusMinusButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 5px rgba(255,255,255,0.05), 2px 2px 5px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#fff', 
    textShadow: '0 1px 10px rgba(0, 150, 255, 0.7)',
    fontSize: '1.4rem',
    marginTop: 0,
    marginBottom: '15px',
  },
  selectField: {
    backgroundColor: 'rgba(16, 28, 54, 0.8)',
    border: '1px solid rgba(0, 150, 255, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    padding: '6px 10px',
    fontSize: '0.9rem',
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); 
  const [pendingSale, setPendingSale] = useState([]);
  const [selectedModel, setSelectedModel] = useState({});
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [modal, setModal] = useState({ show: false, type: '', data: {} });
  const [inputValue, setInputValue] = useState("");

useEffect(() => {
  fetchProducts();
  fetchSales();
  fetchTickets();
}, [adminMode]);
  

  const fetchProducts = async () => {
    try { 
      const res = await axios.get(`${API}/products`);
      setProducts(res.data); 
    } catch (err) { 
      console.error("Error al obtener productos:", err); 
    }
  };

  const fetchSales = async () => {
    try { 
      const res = await axios.get(`${API}/sales`); 
      setSalesHistory(res.data); 
    } catch (err) { 
      console.error("Error al obtener ventas:", err); 
    }
  };
  const fetchTickets = async () => {
  try {

    const res = await axios.get(`${API}/tickets`);

    setTickets(res.data);

  } catch (err) {

    console.error("Error tickets:", err);

  }
};
  const openModal = (type, data = {}) => {
    setInputValue("");
    setModal({ show: true, type, data });
  };

  const handleModalConfirm = async () => {
    const { type, data } = modal;
    const PIN_CORRECTO = "2408"; 
    try {
        if (type === 'PIN') {
            if (inputValue === PIN_CORRECTO) setAdminMode(true);
            else alert("PIN Incorrecto");
        } 
        else if (type === 'STOCK') {
            const nuevoTotal = parseInt(data.current) + parseInt(inputValue || 0);
            if (nuevoTotal < 0) return alert("El stock no puede ser menor a 0");
            await axios.put(`${API}/stock`, { product_id: data.pId, color_id: data.cId, model: data.model, stock: nuevoTotal });
        } 
        else if (type === 'COLOR') {
            if (!inputValue) return;
            await axios.post(`${API}/products/${data.pId}/colors`, { name: inputValue.toUpperCase() });
        }
        setModal({ show: false, type: '', data: {} });
        fetchProducts();
    } catch (err) { alert("Error en la operación del servidor"); }
  };

  const handleAdminAuth = () => { adminMode ? setAdminMode(false) : openModal('PIN'); };

  const handleDeleteColor = async (pId, cId) => {
    if (window.confirm("¿Borrar esta variante/color?")) {
      try { 
        await axios.delete(`${API}/products/${pId}/colors/${cId}`); 
        fetchProducts(); 
      } catch (err) { alert("Error al borrar variante"); }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Borrar producto completo?")) {
      try { 
        await axios.delete(`${API}/products/${id}`); 
        fetchProducts(); 
      } catch (err) { alert("Error al borrar producto"); }
    }
  };

  const handleAddProduct = async (typeId) => {
  if (!newProductName.trim()) return;

  // Creamos el objeto EXACTAMENTE como lo espera tu backend
  const nuevoProducto = {
  name: newProductName.toUpperCase().trim(),
  price: Number(newProductPrice) || 0,
  is_miscellaneous: typeId === 1,
  is_extra: typeId === 2
};

  try {
    // Usamos la IP que confirmaste
    const respuesta = await axios.post(`${API}/products`, nuevoProducto);
    
    if (respuesta.status === 200 || respuesta.status === 201) {
      setNewProductName(""); // Limpia el input
      setNewProductPrice("");
      fetchProducts(); // Refresca la lista
    }
  } catch (err) {
    console.error("DETALLE DEL ERROR:", err.response?.data || err.message);
    alert("Error al añadir: El servidor no responde o el formato es inválido");
  }
};

  const modifyCart = (pId, cId, model, delta, maxStock) => {
    const key = `${pId}-${cId}-${model}`;
    const currentQty = cart[key] || 0;
    const next = currentQty + delta;
    if (next >= 0 && next <= maxStock) { setCart({ ...cart, [key]: next }); }
  };

  const handleAddPedidoExtra = (p) => {
    const itemToProcess = {
        product_id: p.id,
        product_name: p.name,
        iphone_model: selectedModel[p.id] || "OTROS",
        quantity: 1, 
        is_miscellaneous: false,
        is_extra: true 
    };
    setPendingSale([...pendingSale, itemToProcess]);
  };

  const globalConfirm = async () => {
    const itemsToProcess = [];
    products.forEach(p => {
      if (!p.is_extra) {
        p.colors.forEach(c => {
            const modelsToCheck = p.is_miscellaneous ? ["N/A"] : MODELS;
            modelsToCheck.forEach(m => {
              const qty = cart[`${p.id}-${c.id}-${m}`];
              if (qty > 0) itemsToProcess.push({
                product_id: p.id, product_name: p.name, color_id: c.id, color_name: c.name,
                iphone_model: m, quantity: qty, is_miscellaneous: p.is_miscellaneous, is_extra: false
              });
            });
        });
      }
    });
    if (itemsToProcess.length === 0 && pendingSale.length === 0) return;
    try {
      if (itemsToProcess.length > 0) {
          await axios.post(`${API}/sales`, { items: itemsToProcess });
      }
      setPendingSale([...pendingSale, ...itemsToProcess]);
      setCart({}); fetchProducts(); fetchSales();
    } catch (err) { alert("Error al registrar la venta"); }
  };

  const sendWhatsApp = () => {
    if (pendingSale.length === 0) return;
    const grouped = pendingSale.reduce((acc, item) => {
      if (!acc[item.product_name]) acc[item.product_name] = [];
      acc[item.product_name].push(item);
      return acc;
    }, {});
    const extras = pendingSale.filter(item => item.is_extra);
    let msg = "";
    Object.keys(grouped).forEach(prod => {
      if (!grouped[prod][0].is_extra) {
          msg += `*${prod}*\n`;
          grouped[prod].forEach(i => {
            const qty = i.quantity > 1 ? ` (${i.quantity})` : "";
            const mod = i.iphone_model === "N/A" ? "" : `${i.iphone_model} `;
            const col = (i.color_name.toLowerCase().includes("unico")) ? "" : i.color_name;
            msg += `${mod}${col}${qty}\n`.trim() + "\n";
          });
          msg += `\n`;
      }
    });
    if (extras.length > 0) {
        msg += `🧡 *PEDIDOS ESPECIALES *\n`;
        extras.forEach(i => { msg += `${i.product_name} (${i.iphone_model})\n`; });
        msg += `\n`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg.trim())}`);
    setPendingSale([]);
  };

  const exportarADrive = async () => {
  const datosParaEnviar = [];

  products.forEach(p => {

  if (!p.colors) return;

  p.colors.forEach(c => {

    MODELS.forEach(modelo => {

      const cantidad =
        (c.stock && c.stock[modelo]) || 0;

      // ✅ SOLO ENVÍA STOCK REAL
      if (cantidad > 0) {

        datosParaEnviar.push({
          modelo: modelo,
          producto: p.name,
          color: c.name,
          stock: cantidad
        });
      }
    });
  });
});
    
  // ==========================================
  // 2. AQUÍ VA EL BLOQUE QUE PUSISTE (Validación)
  // ==========================================
  if (datosParaEnviar.length === 0) {
    alert("⚠️ No hay productos o modelos configurados para sincronizar.");
    return; // Detiene la ejecución para no llamar a la API en vano
  }
  // ==========================================

  console.log("Enviando a Drive:", datosParaEnviar.length, "filas");

  try {
    const respuesta = await axios.post(`${API}/sync-drive`, datosParaEnviar);
    alert("🚀 Sincronizado con Drive exitosamente");
  } catch (e) {
    console.error(e);
    alert("❌ Error al sincronizar: Revisa la consola del servidor");
  }
};
const imprimirTicket = (ticket) => {

  const ventana = window.open("", "_blank");

  ventana.document.write(`
<html>

<head>
<title>Ticket</title>

<style>

body{
  font-family: monospace;
  width:300px;
  padding:15px;
  color:#000;
}

.logo{
  width:220px;
  display:block;
  margin:auto;
  margin-top:10px;
  margin-bottom:-20px;
}

.center{
  text-align:center;
}

.line{
  border-top:1px dashed #000;
  margin:10px 0;
}

.title{
  text-align:center;
  font-size:20px;
  font-weight:bold;
  margin:10px 0;
}

.row{
  display:flex;
  justify-content:space-between;
  margin:3px 0;
}

.total{
  background:#000;
  color:#fff;
  padding:10px;
  font-size:26px;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
  margin-top:10px;
  border-radius:8px;
}

.small{
  font-size:12px;
}

.insta{
  text-align:center;
  margin-top:15px;
  font-weight:bold;
  font-size:18px;
}

</style>

</head>

<body>

<img 
  src="/ticket-logo.png"
  class="logo"
/>

<div class="center">
  Mauricio Sarmiento<br>
  NIF: 79443976K<br>
  Habernaria 3<br>
  S/C Tenerife 38107
</div>

<div class="line"></div>

<div class="title">
  TICKET DE COMPRA
</div>

${ticket.items.map(item => {

  const product = products.find(
    p => p.id === item.product_id
  );

  const precio = product?.price || 0;

  return `

  <div style="margin-bottom:12px;">

    <b>
      ${item.quantity}x
      ${item.product_name}
    </b>

    <br>

    ${item.iphone_model || ""}

    ${item.color_name || ""}

    <div class="row">
      <span>${precio}€ x ${item.quantity}</span>
      <b>${precio * item.quantity}€</b>
    </div>

  </div>

  `;

}).join("")}

<div class="line"></div>

<div class="total">

  <span>TOTAL</span>

  <span>
    ${ticket.items.reduce((acc, item) => {

      const product = products.find(
        p => p.id === item.product_id
      );

      return acc + (
        (product?.price || 0)
        * item.quantity
      );

    }, 0)}€
  </span>

</div>

<div class="line"></div>

<div class="row small">

  <span>
    Ticket #${String(ticket.ticket_number).slice(-6)}
  </span>

  <span>
    ${new Date(ticket.date).toLocaleString()}
  </span>

</div>

<div class="line"></div>

<div class="center">
  ★ GRACIAS POR SU COMPRA ★
</div>

<div class="insta">
  Instagram: @sumapr0
</div>

</body>

</html>
`);

  ventana.document.close();

  ventana.onload = () => {

    ventana.focus();

    ventana.print();

    setTimeout(() => {
      ventana.close();
    }, 500);

  };

};
const downloadInventoryExcel = () => {
  let csvContent = "sep=,\nMODELO,PRODUCTO,COLOR,STOCK\n";

  products.forEach(p => {
    if (!p.colors) return;

    p.colors.forEach(c => {
      if (!c.stock) return;

      Object.entries(c.stock).forEach(([modelo, cantidad]) => {
        if (cantidad > 0) {
          const model = modelo.replace(/,/g, "");
          const name = p.name.toUpperCase().replace(/,/g, "");
          const color = c.name.toUpperCase().replace(/,/g, "");

          csvContent += `${model},${name},${color},${cantidad}\n`;
        }
      });
    });
  });

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `INVENTARIO_MODELOS_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
};

  const borrarTodo = async () => {

  const clave = prompt("Introduce la clave admin");

  if (!clave) return;

  try {

    const res = await axios.delete(`${API}/clear`, {
      data: {
        key: clave
      }
    });

    if (res.data.ok) {

      alert("🔥 Inventario borrado");

      setProducts([]);
      setTickets([]);
      setSalesHistory([]);
      setPendingSale([]);
      setCart({});

      fetchProducts();
      fetchSales();
      fetchTickets();

    } else {

      alert("❌ Clave incorrecta");

    }

  } catch (err) {

    console.error(err);

    alert("❌ Error borrando inventario");

  }
};
  const borrarTickets = async () => {

  const clave = prompt("Clave admin");

  if (!clave) return;

  try {

    const response = await fetch(
      `${API}/tickets`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: clave
        })
      }
    );

    const data = await response.json();

    if (data.ok) {

      alert("🗑️ Tickets borrados");

      setTickets([]);
      setSalesHistory([]);

      fetchTickets();
      fetchSales();

    } else {

      alert("❌ Error");

    }

  } catch (err) {

    console.error(err);

    alert("❌ Error borrando tickets");

  }

};
  
  const cases = products.filter(p => !p.is_miscellaneous && !p.is_extra);
  const misc = products.filter(p => p.is_miscellaneous);
  const pedidoExtras = products.filter(p => p.is_extra);
  const groupedTickets = tickets.reduce((acc, ticket) => {

  const date = new Date(ticket.date);

  const month = date.toLocaleString("es-ES", {
    month: "long",
    year: "numeric"
  });

  if (!acc[month]) {
    acc[month] = [];
  }

  acc[month].push(ticket);

  return acc;

}, {});
  
  return (
    <div style={styles.mainDiv}>
      <div style={{ maxWidth: "500px", margin: "auto", padding: "10px", position: "relative", zIndex: 2 }}>
        {/* HEADER */}
        <div style={{ backgroundColor: 'rgba(5, 10, 30, 0.6)', borderRadius: '15px', marginBottom: '25px', boxShadow: '0 0 200px rgba(0, 150, 255, 0.4)', border: '1px solid rgba(0, 150, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', overflow: 'hidden' }}>
          <img src="/logo.png" alt="Logo" style={{ height: 'auto', maxHeight: '130px', maxWidth: '70%', display: 'block', objectFit: 'contain' }} />
          <button onClick={handleAdminAuth} style={{ backgroundColor: 'rgba(10, 20, 40, 0.8)', color: '#fff', border: adminMode ? '1px solid #5cff4d' : '1px solid #1e3a5f', borderRadius: '20px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem' }}>
            {adminMode ? "🔓 Admin" : "🔒 Login"}
          </button>
        </div>

        {/* PANEL ADMIN */}
{adminMode && (
  <div style={{ ...styles.glowCard, border: "2px solid #00c3ff" }}>
    
    <button
      onClick={downloadInventoryExcel}
      style={{
        ...styles.futuristicButton,
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        background: 'rgba(0, 150, 255, 0.15)'
      }}
    >
      📊 DESCARGAR EXCEL CSV
    </button>

    <button
      onClick={borrarTodo}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        background: "#ff4d4d",
        border: "none",
        borderRadius: "10px",
        color: "white",
        fontWeight: "bold",
        fontSize: "0.8rem",
        cursor: "pointer"
      }}
    >
      🗑️ BORRAR TODO INVENTARIO
    </button>

    <button
      onClick={borrarTickets}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        background: "#ff9800",
        border: "none",
        borderRadius: "10px",
        color: "white",
        fontWeight: "bold",
        fontSize: "0.8rem",
        cursor: "pointer"
      }}
    >
      🗑️ BORRAR TICKETS
    </button>   
        
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
      
      <input
        value={newProductName}
        onChange={e => setNewProductName(e.target.value)}
        placeholder="Nombre del producto..."
        style={{
          flex: "1 1 auto",
          minWidth: "200px",
          padding: "10px",
          ...styles.selectField
        }}
      />
       <input
        type="number"
        value={newProductPrice}
        onChange={e => setNewProductPrice(e.target.value)}
        placeholder="Precio €"
        style={{
          width: "90px",
          padding: "10px",
          ...styles.selectField
        }}
      />
  
      <button
        onClick={() => handleAddProduct(0)}
        style={{
          ...styles.futuristicButton,
          flex: 1,
          padding: "10px",
          fontSize: '0.7rem'
        }}
      >
        +FUNDA
      </button>

      <button
        onClick={() => handleAddProduct(1)}
        style={{
          ...styles.futuristicButton,
          flex: 1,
          padding: "10px",
          fontSize: '0.7rem'
        }}
      >
        +MISC
      </button>

      <button
        onClick={() => handleAddProduct(2)}
        style={{
          ...styles.futuristicButton,
          flex: 1,
          padding: "10px",
          fontSize: '0.7rem',
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
        }}
      >
        +EXTRA
      </button>

    </div>

    <button
      onClick={exportarADrive}
      style={{
        backgroundColor: "#4285F4",
        color: "white",
        padding: "14px",
        borderRadius: "12px",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer",
        width: "100%",
        fontSize: "1rem",
        marginTop: "20px"
      }}
    >
      📁 SINCRONIZAR DRIVE
    </button>

  </div>
)}

        {/* LISTADO DE FUNDAS */}
        {cases.length > 0 && <h3 style={{ ...styles.title, color: '#000' }}>🔵 FUNDAS</h3>}
        {cases.map(p => (
          <div key={p.id} style={styles.glowCard}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderBottom: '1px solid rgba(255, 255, 255, 0.14)', paddingBottom: '12px', marginBottom: '15px' }}>
              <span style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>{p.name}</span>
              {adminMode && <button onClick={() => handleDeleteProduct(p.id)} style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: '0.8rem' }}>Borrar</button>}
            </div>
            {p.colors && p.colors.map(c => {
              const currentModel = selectedModel[`${p.id}-${c.id}`] || MODELS[0];
              const stock = (c.stock && c.stock[currentModel]) || 0;
              return (
                <div key={c.id} style={{ marginBottom: "15px", paddingBottom: "15px", borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '10px' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {adminMode && <button onClick={() => handleDeleteColor(p.id, c.id)} style={{ color: "#ff4d4d", border: "none", background: "none", fontWeight: "bold" }}>✕</button>}
                      <span style={{ fontWeight: "bold", color: 'rgb(224, 221, 19)' }}>{c.name}</span>
                    </div>
                    <select value={currentModel} onChange={e => setSelectedModel({...selectedModel, [`${p.id}-${c.id}`]: e.target.value})} style={styles.selectField}>
                      {MODELS.map((m, i) => ( <option key={i} value={m} style={{backgroundColor: '#050a1e'}}>{m}</option> ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <button onClick={() => modifyCart(p.id, c.id, currentModel, -1, stock)} style={styles.plusMinusButton}>-</button>
                    <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{cart[`${p.id}-${c.id}-${currentModel}`] || 0}</span>
                    <button onClick={() => modifyCart(p.id, c.id, currentModel, 1, stock)} style={{ ...styles.plusMinusButton, color: '#00ffcc' }}>+</button>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <small style={{ color: stock === 0 ? "red" : "#00ffcc" }}>Stock: {stock}</small>
                      {adminMode && <button onClick={() => openModal('STOCK', { pId: p.id, cId: c.id, model: currentModel, current: stock })} style={{ display: "block", background: "none", border: "none", color: '#007bff' }}>📝</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            {adminMode && <button onClick={() => openModal('COLOR', { pId: p.id })} style={{ ...styles.futuristicButton, width: "100%", padding: "10px", background: 'rgba(0,150,255,0.1)' }}>+ AÑADIR VARIANTE</button>}
          </div>
        ))}

        {/* OTROS PRODUCTOS */}
        {misc.length > 0 && <h3 style={{ ...styles.title, color: '#000' }}>📦 OTROS</h3>}
        {misc.map(p => (
          <div key={p.id} style={styles.glowCard}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '15px' }}>
              <span style={{ fontSize: '1.1rem' }}>{p.name}</span>
              {adminMode && <button onClick={() => handleDeleteProduct(p.id)} style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px" }}>Borrar</button>}
            </div>
            {p.colors && p.colors.map(c => {
              const stock = (c.stock && c.stock["N/A"]) || 0;
              return (
                <div key={c.id} style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    {adminMode && <button onClick={() => handleDeleteColor(p.id, c.id)} style={{ color: "#ff4d4d", background: "none", border: "none" }}>✕</button>}
                    <span style={{ fontWeight: "bold", color: '#f7f200' }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <button onClick={() => modifyCart(p.id, c.id, "N/A", -1, stock)} style={styles.plusMinusButton}>-</button>
                    <span style={{ fontSize: "1.4rem" }}>{cart[`${p.id}-${c.id}-N/A`] || 0}</span>
                    <button onClick={() => modifyCart(p.id, c.id, "N/A", 1, stock)} style={styles.plusMinusButton}>+</button>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <small style={{ color: stock === 0 ? "red" : "#00ffcc" }}>Stock: {stock}</small>
                      {adminMode && <button onClick={() => openModal('STOCK', { pId: p.id, cId: c.id, model: "N/A", current: stock })}>📝</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            {adminMode && <button onClick={() => openModal('COLOR', { pId: p.id })} style={{...styles.futuristicButton, width: "100%", padding: "10px"}}>+ AÑADIR VARIANTE</button>}
          </div> 
        ))}

        {/* PEDIDOS ESPECIALES */}
        {pedidoExtras.length > 0 && (
          <>
            <h3 style={{ ...styles.title, color: '#d43622da' }}>🧡 PEDIDOS ESPECIALES</h3>
            {pedidoExtras.map(p => (
              <div key={p.id} style={styles.glowCardExtra}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                  <select value={selectedModel[p.id] || "OTROS"} onChange={e => setSelectedModel({ ...selectedModel, [p.id]: e.target.value })} style={styles.selectField}>
                    {MODELS.map((m, i) => ( <option key={i} value={m}>{m}</option> ))}
                    <option value="OTROS">OTROS</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {adminMode && <button onClick={() => handleDeleteProduct(p.id)} style={{background: 'none', border: '1px solid red', color: 'red', borderRadius: '5px'}}>🗑️</button>}
                  <button onClick={() => handleAddPedidoExtra(p)} style={{ ...styles.futuristicButton, padding: "10px" }}>ANOTAR</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div> 
      {/* HISTORIAL TICKETS */}
{adminMode && tickets.length > 0 && (
  <div style={{
    ...styles.glowCard,
    maxWidth: "500px",
    margin: "20px auto"
  }}>
    
    <h3 style={{
      ...styles.title,
      fontSize: "1.1rem",
      marginBottom: "10px"
    }}>
      🧾 HISTORIAL TICKETS
    </h3>

    {Object.entries(groupedTickets).map(([month, monthTickets]) => (

      <details
        key={month}
        style={{
          marginBottom: "15px"
        }}
      >

        <summary
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            color: "#00ffcc",
            marginBottom: "10px",
            fontSize: "0.95rem"
          }}
        >
          📅 {month} ({monthTickets.length})
        </summary>

        {monthTickets.map(ticket => (
          <div
            key={ticket._id}
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              padding: "10px 0"
            }}
          >

            <div style={{
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "0.95rem"
            }}>
              Ticket #{ticket.ticket_number}
            </div>

            <small style={{
              opacity: 0.8
            }}>
              {new Date(ticket.date).toLocaleString()}
            </small>

            <div style={{
              marginTop: "5px",
              color: "#00ffcc",
              fontSize: "0.9rem"
            }}>
              {ticket.total_items} artículos
            <button
              onClick={() => imprimirTicket(ticket)}
              style={{
                marginTop: "8px",
                padding: "6px 10px",
                background: "#00c3ff",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              🖨️ IMPRIMIR
            </button>
                
            </div>

          </div>
        ))}

      </details>

    ))}

  </div>
)}

      {/* FOOTER */}
      <footer style={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: 'rgba(16, 51, 124, 0.95)', padding: "15px 0", zIndex: 100 }}>
        <div style={{ maxWidth: "500px", margin: "auto", display: "flex", justifyContent: "space-between", padding: "0 20px", fontSize: "0.8rem", marginBottom: "10px" }}>
          <span>📦 HOY: <b style={{ color: '#00ffcc' }}>{
  salesHistory
    .filter(s => {

      const today = new Date();
      const saleDate = new Date(s.date);

      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );

    })
    .reduce(
      (t, s) =>
        t + (
          s.items
            ? s.items.reduce((sum, i) => sum + i.quantity, 0)
            : 0
        ),
      0
    )
}</b></span>
          <span>⏳ PENDIENTES: <b>{pendingSale.length}</b></span>
        </div>
        <div style={{ maxWidth: "500px", margin: "auto", display: "flex", gap: "10px", padding: "0 10px" }}>
          <button onClick={globalConfirm} style={{ ...styles.futuristicButton, flex: 2, padding: "15px" }}>LIMPIAR / ENTER</button>
          <button onClick={sendWhatsApp} style={{ ...styles.futuristicButton, flex: 1, padding: "15px", background: '#25D366' }}>WHATSAPP 📲</button>
        </div>
      </footer>

      {/* MODAL */}
      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ ...styles.glowCard, width: "85%", maxWidth: "320px", textAlign: "center" }}>
            <h3 style={styles.title}>{modal.type === 'PIN' ? "🔐 Acceso" : modal.type === 'COLOR' ? "➕ Añadir" : "📝 Stock"}</h3>
            <input type={modal.type === 'PIN' ? "password" : "text"} autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} style={{ ...styles.selectField, width: "80%", padding: "12px", marginBottom: "20px", textAlign: "center" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setModal({ show: false })} style={{ ...styles.futuristicButton, flex: 1, padding: "10px", background: "#444" }}>X</button>
              <button onClick={handleModalConfirm} style={{ ...styles.futuristicButton, flex: 1, padding: "10px" }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
}

export default App;
