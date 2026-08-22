/* HalliSavi - Supabase connected app.js */

const SUPABASE_URL = "https://utvvfyqindpnhqyefzee.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T964NZcXYVpPmVuHPpQSTA_hMUrlUKL";

const PHONE = "919206934370";
const WA = "919206934370";

const DEFAULT_PRODUCTS = [
  {id:"benne",name:"Benne Murukku",price:249,img:"assets/benne.png",tag:"Crispy & Buttery"},
  {id:"kodbale",name:"Kodbale",price:249,img:"assets/kodbale.png",tag:"Traditional & Crunchy"},
  {id:"masala",name:"Masala Mixture",price:249,img:"assets/masala.png",tag:"Spicy & Delicious"},
  {id:"ragi",name:"Ragi Mixture",price:249,img:"assets/ragi.png",tag:"Wholesome & Crunchy"},
  {id:"peanuts",name:"Roasted Peanuts",price:199,img:"assets/peanuts.png",tag:"Roasted & Fresh"}
];

let PRODUCTS = [...DEFAULT_PRODUCTS];
let supabaseClient = null;

function productSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function localFallbackProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem("hs_products") || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) {}

  return DEFAULT_PRODUCTS;
}

async function loadProductsFromSupabase() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    PRODUCTS = localFallbackProducts();
    return false;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    const { data, error } = await supabaseClient
      .from("products")
      .select("id,name,description,price,image_url,active")
      .eq("active", true)
      .order("id", { ascending: true });

    if (error) throw error;

    if (Array.isArray(data) && data.length) {
      PRODUCTS = data.map(p => ({
        id: productSlug(p.name),
        dbId: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        img: p.image_url || "",
        tag: p.description || ""
      }));

      console.log("HalliSavi: products loaded from Supabase", PRODUCTS);

      return true;
    }

    PRODUCTS = [];
    return true;

  } catch (error) {
    console.error("HalliSavi: Supabase products load failed:", error);
    PRODUCTS = localFallbackProducts();
    return false;
  }
}

const cities = [
  "Bengaluru","Mysuru","Mangaluru","Hubballi","Dharwad",
  "Belagavi","Tumakuru","Mandya","Hassan","Shivamogga",
  "Chikkamagaluru","Kolar","Other"
];

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("hs_cart") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(c) {
  localStorage.setItem("hs_cart", JSON.stringify(c));
  renderCartCount();
}

function add(id, qty = 1) {
  let c = getCart();
  let x = c.find(i => i.id === id);

  if (x) {
    x.qty += qty;
  } else {
    c.push({id, qty});
  }

  saveCart(c);
  renderCart();
  toast("Added to your Snack Box");
}

function change(id, d) {
  let c = getCart();
  let x = c.find(i => i.id === id);

  if (!x) return;

  x.qty += d;

  if (x.qty <= 0) {
    c = c.filter(i => i.id !== id);
  }

  saveCart(c);
  renderCart();
}

function renderCartCount() {
  document.querySelectorAll(".cartCount").forEach(e => {
    e.textContent = getCart().reduce((a, x) => a + x.qty, 0);
  });
}

function cartData() {
  return getCart()
    .map(x => ({
      ...x,
      p: PRODUCTS.find(p => p.id === x.id)
    }))
    .filter(x => x.p);
}

function total() {
  return cartData().reduce(
    (a, x) => a + x.p.price * x.qty,
    0
  );
}

function renderCart(el = document.querySelector("#cartList")) {
  if (!el) return;

  const c = cartData();

  el.innerHTML = c.length
    ? c.map(x => `
      <div class="cartItem">
        <img src="${x.p.img}" alt="${x.p.name}">
        <div>
          <b>${x.p.name}</b>
          <small>₹${x.p.price} × ${x.qty}</small>
          <div class="miniQty">
            <button onclick="change('${x.id}',-1)">−</button>
            ${x.qty}
            <button onclick="change('${x.id}',1)">+</button>
          </div>
        </div>
        <b>₹${x.p.price * x.qty}</b>
      </div>
    `).join("")
    : "<p>Your Snack Box is empty.</p>";

  document.querySelectorAll(".cartTotal").forEach(e => {
    e.textContent = "₹" + total().toLocaleString("en-IN");
  });

  document.querySelectorAll(".minMsg").forEach(e => {
    e.textContent = total() < 1000
      ? `Add ₹${1000 - total()} more to reach the ₹1,000 minimum.`
      : "Minimum order reached ✓";
  });
}

function toast(s) {
  const t = document.createElement("div");

  t.textContent = s;

  t.style =
    "position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:#064d26;color:#fff;padding:12px 18px;border-radius:10px;z-index:999;font-weight:700";

  document.body.append(t);

  setTimeout(() => t.remove(), 1800);
}

function productCard(p) {
  const image = p.img || `assets/${p.id}.png`;

  return `
    <article class="card">
      <a href="product.html?id=${encodeURIComponent(p.id)}">
        <div class="photo">
          <img src="${image}" alt="${p.name}">
        </div>

        <h3>${p.name}</h3>
      </a>

      <div class="price">
        ₹${Number(p.price).toLocaleString("en-IN")}
      </div>

      <button class="add" onclick="add('${p.id}')">
        Add to Snack Box +
      </button>
    </article>
  `;
}

function renderProducts() {
  document.querySelectorAll(".productGrid").forEach(e => {
    e.innerHTML = PRODUCTS.map(productCard).join("");
  });
}

function citiesSelect() {
  document.querySelectorAll(".citySelect").forEach(s => {
    s.innerHTML = cities
      .map(c => `<option>${c}</option>`)
      .join("");
  });
}

function goWA(text) {
  window.open(
    `https://wa.me/${WA}?text=${encodeURIComponent(text)}`,
    "_blank"
  );
}

function saveOrders(orders) {
  // Legacy local fallback kept only for old browser data.
  localStorage.setItem("hs_orders", JSON.stringify(orders));
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem("hs_orders") || "[]");
  } catch (e) {
    return [];
  }
}

function orderMessage(order) {
  const itemLines = order.items
    .map(x => `- ${x.p.name} x ${x.qty} @ ₹${x.p.price}`)
    .join("\n");

  return `HalliSavi Order

Order ID: ${order.id}
Customer: ${order.name}
Mobile: ${order.mobile}
Address: ${order.address}, ${order.city} - ${order.pin}

Items:
${itemLines}

Total: ₹${order.total.toLocaleString("en-IN")}

Please confirm the order and payment details.`;
}

async function placeOrder(e) {
  e.preventDefault();

  const c = cartData();
  const t = total();

  if (t < 1000) {
    alert("Minimum order value is ₹1,000.");
    return;
  }

  if (!supabaseClient) {
    alert("Unable to connect to the order system. Please refresh the page and try again.");
    return;
  }

  const f = new FormData(e.target);
  const id = "HS" + Date.now().toString().slice(-8);
  const button = document.querySelector("#orderButton");

  const order = {
    id,
    name: String(f.get("name") || "").trim(),
    mobile: String(f.get("mobile") || "").trim(),
    address: String(f.get("address") || "").trim(),
    city: String(f.get("city") || "").trim(),
    pin: String(f.get("pin") || "").trim(),
    items: c.map(x => ({
      id: x.id,
      dbId: x.p.dbId ?? null,
      name: x.p.name,
      qty: Number(x.qty),
      price: Number(x.p.price),
      image_url: x.p.img || ""
    })),
    total: Number(t),
    status: "Order Received"
  };

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Saving Order...";
    }

    // 1. Save the customer/order header in Supabase.
    const { error: orderError } = await supabaseClient
      .from("orders")
      .insert(order);

    if (orderError) throw new Error("Order could not be saved: " + orderError.message);

    // 2. Save each item separately for reporting and admin details.
    const orderItems = order.items.map(item => ({
      order_id: order.id,
      product_id: item.dbId,
      product_name: item.name,
      quantity: item.qty,
      price: item.price
    }));

    const { error: itemError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemError) {
      // Best-effort rollback so we don't leave an incomplete order.
      await supabaseClient.from("orders").delete().eq("id", order.id);
      throw new Error("Order items could not be saved: " + itemError.message);
    }

    // Keep the last order ID locally only for the Track Order page.
    localStorage.setItem("hs_last_order", order.id);
    saveCart([]);

    // WhatsApp remains part of the existing customer flow.
    goWA(orderMessage(order));

    location.href = "track.html?id=" + encodeURIComponent(order.id);
  } catch (error) {
    console.error("HalliSavi order save failed:", error);
    alert(error.message || "Order could not be saved. Please try again.");
    if (button) {
      button.disabled = false;
      button.textContent = "Place Order & Continue on WhatsApp";
    }
  }
}

function renderOrderSummary() {
  renderCart();

  const b =
    document.querySelector("#orderButton");

  if (b) {
    b.disabled = total() < 1000;
  }
}

async function init() {

  renderCartCount();

  // Load live products from Supabase
  await loadProductsFromSupabase();

  renderProducts();

  citiesSelect();

  renderCart();

  document.querySelectorAll(".year").forEach(e => {
    e.textContent =
      new Date().getFullYear();
  });

  document.querySelectorAll("[data-wa]").forEach(e => {
    e.onclick = () => goWA(
      "Hello HalliSavi, I would like to know more about your homemade snacks."
    );
  });
}

document.addEventListener(
  "DOMContentLoaded",
  init
);
