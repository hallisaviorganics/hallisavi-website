/* HalliSavi - Supabase connected app.js
   FIXED CART + LIVE PRODUCTS
   - Uses the same hs_cart localStorage key on every page
   - Loads products from Supabase when the Supabase SDK is available
   - Keeps product IDs stable using the database ID when possible
   - Re-renders the cart after products finish loading
*/

const SUPABASE_URL = "https://utvvfyqindpnhqyefzee.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T964NZcXYVpPmVuHPpQSTA_hMUrlUKL";

const PHONE = "919206934370";
const WA = "919206934370";

const DEFAULT_PRODUCTS = [
  { id:"benne", name:"Benne Murukku", price:249, img:"assets/benne.png", tag:"Crispy & Buttery" },
  { id:"kodbale", name:"Kodbale", price:249, img:"assets/kodbale.png", tag:"Traditional & Crunchy" },
  { id:"masala", name:"Masala Mixture", price:249, img:"assets/masala.png", tag:"Spicy & Delicious" },
  { id:"ragi", name:"Ragi Mixture", price:249, img:"assets/ragi.png", tag:"Wholesome & Crunchy" },
  { id:"peanuts", name:"Roasted Peanuts", price:199, img:"assets/peanuts.png", tag:"Roasted & Fresh" }
];

let PRODUCTS = [...DEFAULT_PRODUCTS];
let supabaseClient = null;

function productSlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("hs_cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("hs_cart", JSON.stringify(cart));
  renderCartCount();
}

function findProduct(id) {
  return PRODUCTS.find(p => String(p.id) === String(id));
}

/* Add product to the one shared cart. */
function add(id, qty = 1) {
  const product = findProduct(id);
  if (!product) {
    console.error("HalliSavi: product not found:", id, PRODUCTS);
    alert("This product is not available. Please refresh the page.");
    return;
  }

  const cart = getCart();
  const existing = cart.find(x => String(x.id) === String(id));

  if (existing) {
    existing.qty = Number(existing.qty || 0) + Number(qty || 1);
  } else {
    cart.push({
      id: String(id),
      qty: Number(qty || 1)
    });
  }

  saveCart(cart);
  renderCart();
  toast(product.name + " added to your Snack Box");
}

function change(id, delta) {
  const cart = getCart();
  const item = cart.find(x => String(x.id) === String(id));

  if (!item) return;

  item.qty = Number(item.qty || 0) + Number(delta || 0);

  const cleanCart = cart.filter(x => Number(x.qty) > 0);
  saveCart(cleanCart);
  renderCart();
}

function renderCartCount() {
  const count = getCart().reduce(
    (sum, item) => sum + Math.max(0, Number(item.qty || 0)),
    0
  );

  document.querySelectorAll(".cartCount").forEach(el => {
    el.textContent = count;
  });
}

function cartData() {
  return getCart()
    .map(item => {
      const product = findProduct(item.id);
      return product ? { ...item, p: product } : null;
    })
    .filter(Boolean);
}

function total() {
  return cartData().reduce(
    (sum, item) =>
      sum + Number(item.p.price || 0) * Number(item.qty || 0),
    0
  );
}

function renderCart(target = document.querySelector("#cartList")) {
  if (!target) return;

  const cart = cartData();

  target.innerHTML = cart.length
    ? cart.map(item => `
      <div class="cartItem">
        <img src="${escapeHtml(item.p.img || "")}" alt="${escapeHtml(item.p.name)}">
        <div>
          <b>${escapeHtml(item.p.name)}</b>
          <small>₹${Number(item.p.price).toLocaleString("en-IN")} × ${item.qty}</small>
          <div class="miniQty">
            <button type="button" onclick="change('${escapeJs(item.id)}',-1)">−</button>
            ${item.qty}
            <button type="button" onclick="change('${escapeJs(item.id)}',1)">+</button>
          </div>
        </div>
        <b>₹${(Number(item.p.price) * Number(item.qty)).toLocaleString("en-IN")}</b>
      </div>
    `).join("")
    : "<p>Your Snack Box is empty.</p>";

  const cartTotal = total();

  document.querySelectorAll(".cartTotal").forEach(el => {
    el.textContent = "₹" + cartTotal.toLocaleString("en-IN");
  });

  document.querySelectorAll(".minMsg").forEach(el => {
    el.textContent = cartTotal < 1000
      ? `Add ₹${1000 - cartTotal} more to reach the ₹1,000 minimum.`
      : "Minimum order reached ✓";
  });

  const orderButton = document.querySelector("#orderButton");
  if (orderButton) {
    orderButton.disabled = cartTotal < 1000 || cart.length === 0;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[ch]));
}

function escapeJs(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function toast(message) {
  const old = document.querySelector(".hs-toast");
  if (old) old.remove();

  const el = document.createElement("div");
  el.className = "hs-toast";
  el.textContent = message;
  el.style.cssText =
    "position:fixed;bottom:25px;left:50%;transform:translateX(-50%);" +
    "background:#064d26;color:#fff;padding:12px 18px;border-radius:10px;" +
    "z-index:9999;font-weight:700;box-shadow:0 4px 18px rgba(0,0,0,.2)";
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 1800);
}

function productCard(product) {
  const image = product.img || `assets/${product.id}.png`;

  return `
    <article class="card">
      <a href="product.html?id=${encodeURIComponent(product.id)}">
        <div class="photo">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}">
        </div>
        <h3>${escapeHtml(product.name)}</h3>
      </a>

      <div class="price">
        ₹${Number(product.price).toLocaleString("en-IN")}
      </div>

      <button class="add" type="button"
              onclick="add('${escapeJs(product.id)}')">
        Add to Snack Box +
      </button>
    </article>
  `;
}

function renderProducts() {
  document.querySelectorAll(".productGrid").forEach(grid => {
    grid.innerHTML = PRODUCTS.map(productCard).join("");
  });
}

const cities = [
  "Bengaluru","Mysuru","Mangaluru","Hubballi","Dharwad",
  "Belagavi","Tumakuru","Mandya","Hassan","Shivamogga",
  "Chikkamagaluru","Kolar","Other"
];

function citiesSelect() {
  document.querySelectorAll(".citySelect").forEach(select => {
    select.innerHTML = cities
      .map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
      .join("");
  });
}

function goWA(text) {
  window.open(
    `https://wa.me/${WA}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener"
  );
}

async function loadProductsFromSupabase() {
  /* If the SDK is missing, keep the fallback products. */
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.warn("HalliSavi: Supabase SDK not loaded; using fallback products.");
    PRODUCTS = [...DEFAULT_PRODUCTS];
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

    if (Array.isArray(data)) {
      PRODUCTS = data.map(row => ({
        /* IMPORTANT:
           Use the database ID as the cart ID when available.
           This prevents duplicate-name/slug collisions. */
        id: String(row.id),
        slug: productSlug(row.name),
        dbId: row.id,
        name: row.name,
        price: Number(row.price) || 0,
        img: row.image_url || "",
        tag: row.description || ""
      }));
    } else {
      PRODUCTS = [];
    }

    console.log("HalliSavi: live products loaded:", PRODUCTS);
    return true;
  } catch (error) {
    console.error("HalliSavi: failed to load products:", error);
    PRODUCTS = [...DEFAULT_PRODUCTS];
    return false;
  }
}

/* Convert old slug-based cart entries to database-ID entries.
   This makes old carts continue working after this fix. */
function migrateCartIds() {
  const raw = getCart();
  if (!raw.length) return;

  let changed = false;
  const migrated = [];

  for (const item of raw) {
    let product = PRODUCTS.find(p => String(p.id) === String(item.id));

    if (!product) {
      product = PRODUCTS.find(p =>
        p.slug &&
        String(p.slug) === String(item.id)
      );
    }

    if (!product) {
      /* Match the old built-in product IDs. */
      product = PRODUCTS.find(p =>
        productSlug(p.name) === String(item.id)
      );
    }

    if (product) {
      const existing = migrated.find(x => String(x.id) === String(product.id));

      if (existing) {
        existing.qty += Number(item.qty || 0);
      } else {
        migrated.push({
          id: String(product.id),
          qty: Number(item.qty || 0)
        });
      }

      if (String(item.id) !== String(product.id)) changed = true;
    }
  }

  if (changed) {
    localStorage.setItem("hs_cart", JSON.stringify(migrated));
  }
}

function renderOrderSummary() {
  renderCart();
}

async function init() {
  renderCartCount();

  /* Load the same live product list on EVERY page. */
  await loadProductsFromSupabase();

  /* Fix carts created by the older slug-based version. */
  migrateCartIds();

  renderCartCount();
  renderProducts();
  citiesSelect();
  renderCart();

  document.querySelectorAll(".year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

document.addEventListener("DOMContentLoaded", init);
