const categories = [
  { id:"all", name:"All", img:"assets/images/burger.png" },
  { id:"burger", name:"Burgers", img:"assets/images/burger.png" },
  { id:"pizza", name:"Pizza", img:"assets/images/pizza.png" },
  { id:"pasta", name:"Pasta", img:"assets/images/burger.png" },
  { id:"drinks", name:"Drinks", img:"assets/images/coffee.png" },
  { id:"snacks", name:"Snacks", img:"assets/images/snacks.png" }
];

const foods = [
  {
    id:1,
    cat:"burger",
    type:"nonveg",
    name:"Classic Chicken Burger",
    desc:"Crispy chicken patty with fresh lettuce & mayo",
    price:139,
    img:"assets/images/burger.png",
    tag:"BESTSELLER"
  },
  {
    id:2,
    cat:"pasta",
    type:"veg",
    name:"White Sauce Pasta",
    desc:"Creamy & cheesy white sauce pasta",
    price:189,
    img:"assets/images/burger.png",
    tag:"TRENDING"
  },
  {
    id:3,
    cat:"drinks",
    type:"veg",
    name:"Cold Coffee",
    desc:"Refreshing cold coffee",
    price:99,
    img:"assets/images/coffee.png",
    tag:"BESTSELLER"
  },
  {
    id:4,
    cat:"pizza",
    type:"veg",
    name:"Cheese Pizza",
    desc:"Loaded cheese pizza with herbs",
    price:249,
    img:"assets/images/pizza.png",
    tag:"POPULAR"
  },
  {
    id:5,
    cat:"snacks",
    type:"veg",
    name:"French Fries",
    desc:"Crispy salted fries",
    price:99,
    img:"assets/images/snacks.png",
    tag:"HOT"
  }
];

let activeCat = "all";
let activeFilter = "all";
let cart = [];
let selected = null;
let dQty = 1;
let discount = 0;
let placeholderIndex = 0;

const placeholders = [
  "Search for burger...",
  "Search for pizza...",
  "Search for pasta...",
  "Search for cold coffee...",
  "Search for fries...",
  "Search for snacks..."
];

function init(){
  renderCategories();
  renderFoods();
  updateCart();

  rotatePlaceholder();
  setInterval(rotatePlaceholder, 1800);

  document.getElementById("searchInput").addEventListener("input", renderFoods);

  document.getElementById("menuScreen").addEventListener("scroll", () => {
    if(cart.length > 0){
      document.getElementById("cartBar").classList.add("compact");
    }
  });
}

function rotatePlaceholder(){
  const input = document.getElementById("searchInput");

  if(document.activeElement !== input && input.value === ""){
    input.placeholder = placeholders[placeholderIndex % placeholders.length];
    placeholderIndex++;
  }
}

function renderCategories(){
  document.getElementById("categoryRow").innerHTML = categories.map(c => `
    <button class="cat ${activeCat === c.id ? "active" : ""}" onclick="setCat('${c.id}')">
      <img src="${c.img}" alt="${c.name}">
      ${c.name}
    </button>
  `).join("");
}

function setCat(id){
  activeCat = id;
  renderCategories();
  renderFoods();

  document.getElementById("menuScreen").scrollTo({
    top:270,
    behavior:"smooth"
  });
}

function renderFoods(){
  const q = document.getElementById("searchInput").value.toLowerCase();

  const list = foods.filter(f => {
    const catOk = activeCat === "all" || f.cat === activeCat;
    const filterOk = activeFilter === "all" || f.type === activeFilter;
    const searchOk = f.name.toLowerCase().includes(q);

    return catOk && filterOk && searchOk;
  });

  document.getElementById("sectionTitle").innerText =
    q ? "Search Results" : "Popular Items";

  document.getElementById("foodList").innerHTML = list.map(f => {
    const item = cart.find(i => i.id === f.id);

    return `
      <div class="food-card" onclick="openDetail(${f.id})">
        <img src="${f.img}" alt="${f.name}">

        <div class="food-info">
          <span class="tag">${f.tag}</span>
          <h4>${f.name}</h4>
          <p>${f.desc}</p>

          <div class="price-row">
            <b>₹${f.price}</b>

            ${
              item
                ? `
                  <div class="qty-small" onclick="event.stopPropagation()">
                    <button onclick="changeQty(${f.id}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${f.id}, 1)">+</button>
                  </div>
                `
                : `
                  <button class="add-btn" onclick="event.stopPropagation(); addItem(${f.id})">
                    + Add
                  </button>
                `
            }
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function addItem(id){
  const food = foods.find(f => f.id === id);
  const existing = cart.find(i => i.id === id);

  if(existing){
    existing.qty++;
  }else{
    cart.push({...food, qty:1});
  }

  updateCart();
  renderFoods();
  expandCartBar();
}

function changeQty(id, number){
  const item = cart.find(i => i.id === id);

  if(!item) return;

  item.qty += number;

  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }

  updateCart();
  renderFoods();
  renderCart();
}

function updateCart(){
  const count = cart.reduce((sum,item) => sum + item.qty, 0);
  const total = cart.reduce((sum,item) => sum + item.qty * item.price, 0);

  document.getElementById("cartCount").innerText = count;
  document.getElementById("cartText").innerText = `${count} Items`;
  document.getElementById("cartTotal").innerText = `₹${total}`;

  document.getElementById("cartBar").style.display =
    count > 0 ? "flex" : "none";
}

function expandCartBar(){
  const bar = document.getElementById("cartBar");

  bar.classList.remove("compact");

  clearTimeout(window.cartTimer);

  window.cartTimer = setTimeout(() => {
    if(cart.length > 0){
      bar.classList.add("compact");
    }
  }, 3500);
}

function openDetail(id){
  selected = foods.find(f => f.id === id);
  dQty = 1;

  document.getElementById("detailImage").src = selected.img;
  document.getElementById("detailName").innerText = selected.name;
  document.getElementById("detailPrice").innerText = `₹${selected.price}`;
  document.getElementById("detailDesc").innerText = selected.desc;
  document.getElementById("detailTag").innerText = selected.tag;
  document.getElementById("detailQty").innerText = dQty;

  document.querySelectorAll(".extra input").forEach(input => {
    input.checked = false;
  });

  updateDetailTotal();
  showScreen("detailScreen");
}

function detailQtyChange(number){
  dQty += number;

  if(dQty < 1){
    dQty = 1;
  }

  document.getElementById("detailQty").innerText = dQty;
  updateDetailTotal();
}

function updateDetailTotal(){
  if(!selected) return;

  let extra = 0;

  document.querySelectorAll(".extra input:checked").forEach(input => {
    extra += Number(input.dataset.price);
  });

  const total = (selected.price + extra) * dQty;

  document.getElementById("detailTotal").innerText = `₹${total}`;
}

function addDetailToCart(){
  for(let i = 0; i < dQty; i++){
    addItem(selected.id);
  }

  showScreen("menuScreen");
}

function selectChip(button){
  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.remove("active");
  });

  button.classList.add("active");
}

function showCart(){
  renderCart();
  showScreen("cartScreen");
}

function renderCart(){
  document.getElementById("cartItems").innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">

      <div class="cart-item-info">
        <b>${item.name}</b>
        <p>₹${item.price}</p>

        <div class="qty-small">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>

      <button class="remove" onclick="removeItem(${item.id})">🗑</button>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum,item) => {
    return sum + item.qty * item.price;
  }, 0);

  document.getElementById("subtotal").innerText = `₹${subtotal}`;
  document.getElementById("discountAmount").innerText = `₹${discount}`;
  document.getElementById("finalTotal").innerText = `₹${subtotal + 20 - discount}`;
}

function removeItem(id){
  cart = cart.filter(item => item.id !== id);

  updateCart();
  renderCart();
  renderFoods();
}

function clearCart(){
  cart = [];
  discount = 0;

  updateCart();
  renderCart();
  renderFoods();
}

function applyCoupon(){
  const code = document.getElementById("couponInput").value.toUpperCase();

  if(code === "AROMA10"){
    discount = 29;
    alert("Coupon applied successfully!");
  }else{
    discount = 0;
    alert("Use coupon code AROMA10");
  }

  renderCart();
}

function placeOrder(){
  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  document.getElementById("orderId").innerText =
    "#ORD-" + Math.floor(10000 + Math.random() * 90000);

  clearCart();
  showScreen("statusScreen");
}

function showScreen(id){
  closeDrawer();

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  const showCartBar = id === "menuScreen" && cart.length > 0;

  document.getElementById("cartBar").style.display =
    showCartBar ? "flex" : "none";

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  if(id === "menuScreen"){
    document.querySelectorAll(".nav-item")[0].classList.add("active");
  }

  if(id === "offersScreen"){
    document.querySelectorAll(".nav-item")[1].classList.add("active");
  }

  if(id === "statusScreen"){
    document.querySelectorAll(".nav-item")[2].classList.add("active");
  }
}

function toggleFilter(){
  document.getElementById("filterPanel").classList.toggle("show");
}

function setFilter(type, button){
  activeFilter = type;

  document.querySelectorAll(".filter").forEach(filter => {
    filter.classList.remove("active");
  });

  button.classList.add("active");

  renderFoods();
}

function openDrawer(){
  document.getElementById("drawer").classList.add("show");
  document.getElementById("drawerBackdrop").classList.add("show");
}

function closeDrawer(){
  document.getElementById("drawer").classList.remove("show");
  document.getElementById("drawerBackdrop").classList.remove("show");
}

function callWaiter(){
  alert("Waiter has been notified for Table No. 12.");
}

init();