
const PHONE="919206934370", WA="919206934370";
const DEFAULT_PRODUCTS=[
{id:"benne",name:"Benne Murukku",price:249,img:"assets/benne.png",tag:"Crispy & Buttery"},
{id:"kodbale",name:"Kodbale",price:249,img:"assets/kodbale.png",tag:"Traditional & Crunchy"},
{id:"masala",name:"Masala Mixture",price:249,img:"assets/masala.png",tag:"Spicy & Delicious"},
{id:"ragi",name:"Ragi Mixture",price:249,img:"assets/ragi.png",tag:"Wholesome & Crunchy"},
{id:"peanuts",name:"Roasted Peanuts",price:199,img:"assets/peanuts.png",tag:"Roasted & Fresh"}
];
function getProducts(){
  try{
    const saved=JSON.parse(localStorage.getItem("hs_products")||"null");
    return Array.isArray(saved)&&saved.length?saved:DEFAULT_PRODUCTS;
  }catch(e){return DEFAULT_PRODUCTS}
}
const PRODUCTS=new Proxy([],{
  get(_,prop){
    const p=getProducts();
    if(prop==="find") return p.find.bind(p);
    if(prop==="filter") return p.filter.bind(p);
    if(prop==="map") return p.map.bind(p);
    if(prop==="length") return p.length;
    if(prop===Symbol.iterator) return p[Symbol.iterator].bind(p);
    return p[prop];
  }
});
const cities=["Bengaluru","Mysuru","Mangaluru","Hubballi","Dharwad","Belagavi","Tumakuru","Mandya","Hassan","Shivamogga","Chikkamagaluru","Kolar","Other"];
function getCart(){return JSON.parse(localStorage.getItem("hs_cart")||"[]")}
function saveCart(c){localStorage.setItem("hs_cart",JSON.stringify(c));renderCartCount()}
function add(id,qty=1){let c=getCart(),x=c.find(i=>i.id===id); if(x)x.qty+=qty;else c.push({id,qty});saveCart(c);toast("Added to your Snack Box");}
function change(id,d){let c=getCart(),x=c.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)c=c.filter(i=>i.id!==id);saveCart(c);renderCart()}
function renderCartCount(){document.querySelectorAll(".cartCount").forEach(e=>e.textContent=getCart().reduce((a,x)=>a+x.qty,0))}
function cartData(){return getCart().map(x=>({...x,p:PRODUCTS.find(p=>p.id===x.id)})).filter(x=>x.p)}
function total(){return cartData().reduce((a,x)=>a+x.p.price*x.qty,0)}
function renderCart(el=document.querySelector("#cartList")){if(!el)return;let c=cartData();el.innerHTML=c.length?c.map(x=>`<div class="cartItem"><img src="${x.p.img}"><div><b>${x.p.name}</b><small>₹${x.p.price} × ${x.qty}</small><div class="miniQty"><button onclick="change('${x.id}',-1)">−</button> ${x.qty} <button onclick="change('${x.id}',1)">+</button></div></div><b>₹${x.p.price*x.qty}</b></div>`).join(""):"<p>Your Snack Box is empty.</p>";document.querySelectorAll(".cartTotal").forEach(e=>e.textContent="₹"+total().toLocaleString("en-IN"));document.querySelectorAll(".minMsg").forEach(e=>e.textContent=total()<1000?`Add ₹${1000-total()} more to reach the ₹1,000 minimum.`:"Minimum order reached ✓")}
function toast(s){let t=document.createElement("div");t.textContent=s;t.style="position:fixed;bottom:25px;left:50%;transform:translateX(-50%);background:#064d26;color:#fff;padding:12px 18px;border-radius:10px;z-index:999;font-weight:700";document.body.append(t);setTimeout(()=>t.remove(),1800)}
function productCard(p){return `<article class="card"><a href="product.html?id=${p.id}"><div class="photo"><img src="${p.img}" alt="${p.name}"></div><h3>${p.name}</h3></a><div class="price">₹${p.price}</div><button class="add" onclick="add('${p.id}')">Add to Snack Box +</button></article>`}
function renderProducts(){document.querySelectorAll(".productGrid").forEach(e=>e.innerHTML=PRODUCTS.map(productCard).join(""))}
function citiesSelect(){document.querySelectorAll(".citySelect").forEach(s=>s.innerHTML=cities.map(c=>`<option>${c}</option>`).join(""))}
function goWA(text){window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`,"_blank")}
function saveOrders(orders){localStorage.setItem("hs_orders",JSON.stringify(orders))}
function getOrders(){return JSON.parse(localStorage.getItem("hs_orders")||"[]")}
function orderMessage(order){
  const itemLines=order.items.map(x=>`- ${x.p.name} x ${x.qty} @ ₹${x.p.price}`).join("\n");
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
function placeOrder(e){e.preventDefault();let c=cartData(),t=total();if(t<1000){alert("Minimum order value is ₹1,000.");return}if(c.reduce((a,x)=>a+x.qty,0)<4){alert("Minimum order quantity is 4 packs.");return}let f=new FormData(e.target),id="HS"+Date.now().toString().slice(-8);let order={id,name:f.get("name"),mobile:f.get("mobile"),address:f.get("address"),city:f.get("city"),pin:f.get("pin"),items:c,total:t,status:"Order Received",date:new Date().toLocaleString("en-IN")};let orders=getOrders();orders.push(order);saveOrders(orders);localStorage.setItem("hs_last_order",id);saveCart([]);goWA(orderMessage(order));location.href="track.html?id="+id}
function renderOrderSummary(){renderCart();let b=document.querySelector("#orderButton");if(b)b.disabled=total()<1000}
function init(){renderCartCount();renderProducts();citiesSelect();renderCart();document.querySelectorAll(".year").forEach(e=>e.textContent=new Date().getFullYear());document.querySelectorAll("[data-wa]").forEach(e=>e.onclick=()=>goWA("Hello HalliSavi, I would like to know more about your homemade snacks."))}
document.addEventListener("DOMContentLoaded",init)
