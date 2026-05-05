import React, { useEffect, useState } from "react";

// Main application component for SyncMarket Pro
export default function App() {
  // Local state for list of products and the currently selected product
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  // Form state for creating a new product
  const [form, setForm] = useState({
    name: "",
    price: "",
    desc: "",
    image: null,
  });

  // Load previously saved products from localStorage on initial mount
  useEffect(() => {
    const saved = localStorage.getItem("syncmarket_products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  // Persist products to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("syncmarket_products", JSON.stringify(products));
  }, [products]);

  // Handle image upload and convert to data URL
  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  // Save a new product and reset form
  const saveProduct = () => {
    if (!form.name || !form.price || !form.image) {
      alert("Completa nombre, precio e imagen");
      return;
    }
    const product = {
      id: Date.now(),
      ...form,
      designs: [],
      createdAt: new Date().toLocaleDateString("es-CL"),
    };
    setProducts([product, ...products]);
    setSelected(product);
    setForm({ name: "", price: "", desc: "", image: null });
  };

  // Generate promotional designs for a product
  const generateDesigns = (product) => {
    const templates = [
      { name: "Marketplace limpio", bg: "#ffffff", badge: "DISPONIBLE", color: "#0f172a" },
      { name: "Oferta fuerte", bg: "#0f172a", badge: "OFERTA", color: "#ffffff" },
      { name: "Tienda premium", bg: "#111827", badge: "NUEVO", color: "#ffffff" },
      { name: "Entrega rápida", bg: "#1e293b", badge: "ENTREGA RÁPIDA", color: "#ffffff" },
      { name: "Liquidación", bg: "#7f1d1d", badge: "LIQUIDACIÓN", color: "#ffffff" },
      { name: "Catálogo online", bg: "#020617", badge: "IMPORTADORA CHL", color: "#ffffff" },
    ];
    const img = new Image();
    img.src = product.image;
    img.onload = () => {
      const generated = templates.map((t) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");
        // Draw background
        ctx.fillStyle = t.bg;
        ctx.fillRect(0, 0, 1080, 1080);
        // Draw card behind product image
        ctx.fillStyle = t.bg === "#ffffff" ? "#f1f5f9" : "rgba(255,255,255,0.08)";
        roundRect(ctx, 70, 80, 940, 890, 45);
        ctx.fill();
        // Draw product image centered
        ctx.drawImage(img, 240, 150, 600, 560);
        // Price button
        ctx.fillStyle = "#2563eb";
        roundRect(ctx, 330, 760, 420, 90, 24);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`$${Number(product.price).toLocaleString("es-CL")}`, 540, 820);
        // Title
        ctx.fillStyle = t.color;
        ctx.font = "bold 48px Arial";
        ctx.fillText(product.name.slice(0, 32), 540, 725);
        // Badge
        ctx.fillStyle = "#f97316";
        roundRect(ctx, 70, 70, 340, 66, 18);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 25px Arial";
        ctx.fillText(t.badge, 240, 112);
        // Footer text
        ctx.fillStyle = t.color;
        ctx.font = "28px Arial";
        ctx.fillText("Entrega rápida • Retiro en bodega • Débito o transferencia", 540, 930);
        return {
          title: t.name,
          url: canvas.toDataURL("image/png"),
        };
      });
      const updated = products.map((p) => (p.id === product.id ? { ...p, designs: generated } : p));
      setProducts(updated);
      setSelected({ ...product, designs: generated });
    };
  };

  // Copy publication text for a product
  const copyPost = (p) => {
    const text = `${p.name}\n\nPrecio: $${Number(p.price).toLocaleString("es-CL")}\n\n${p.desc || "Producto disponible. Entrega rápida, retiro en bodega y reparto según sector."}\n\nMedios de pago:\nTransferencia o débito.\n\nEscríbeme para confirmar disponibilidad.`;
    navigator.clipboard.writeText(text);
    alert("Publicación copiada ✅");
  };

  // Open Facebook Marketplace and copy post automatically
  const openMarketplace = (p) => {
    copyPost(p);
    window.open("https://www.facebook.com/marketplace/create/item", "_blank");
  };

  // Download generated design image
  const download = (url, title) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.png`;
    a.click();
  };

  // Delete a product from list
  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="app">
      {/* Sidebar with product list and create button */}
      <aside className="sidebar">
        <h1>SyncMarket Pro</h1>
        <p>Generador visual para Marketplace</p>
        <button onClick={() => setSelected(null)}>+ Nuevo producto</button>
        <div className="product-list">
          {products.map((p) => (
            <div key={p.id} className="product-item" onClick={() => setSelected(p)}>
              <strong>{p.name}</strong>
              <span>${Number(p.price).toLocaleString("es-CL")}</span>
            </div>
          ))}
        </div>
      </aside>
      {/* Main content area */}
      <main className="main">
        {!selected && (
          <div className="card">
            <h2>Crear producto</h2>
            <input
              placeholder="Nombre del producto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
            />
            <textarea
              placeholder="Descripción para Marketplace"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
            <input type="file" accept="image/*" onChange={uploadImage} />
            {form.image && <img className="preview" src={form.image} alt="Vista previa" />}
            <button className="primary" onClick={saveProduct}>
              Guardar producto
            </button>
          </div>
        )}
        {selected && (
          <div>
            <div className="top-card">
              <div>
                <h2>{selected.name}</h2>
                <p>${Number(selected.price).toLocaleString("es-CL")}</p>
              </div>
              <div className="actions">
                <button onClick={() => generateDesigns(selected)}>Generar imágenes</button>
                <button onClick={() => copyPost(selected)}>Copiar publicación</button>
                <button onClick={() => openMarketplace(selected)}>Abrir Marketplace</button>
                <button onClick={() => deleteProduct(selected.id)}>Eliminar</button>
              </div>
            </div>
            <div className="grid">
              <div className="card">
                <h3>Imagen original</h3>
                <img className="preview" src={selected.image} alt="Original" />
                <p>{selected.desc}</p>
              </div>
              <div className="card">
                <h3>Diseños generados</h3>
                <div className="design-grid">
                  {selected.designs?.map((d, i) => (
                    <div key={i} className="design">
                      <img src={d.url} alt={d.title} />
                      <strong>{d.title}</strong>
                      <button onClick={() => download(d.url, d.title)}>Descargar</button>
                    </div>
                  ))}
                  {(!selected.designs || selected.designs.length === 0) && (
                    <p>Aún no hay diseños. Presiona “Generar imágenes”.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Utility to draw rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}