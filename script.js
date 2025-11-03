// ✅ Initialize default products if none exist
if (!localStorage.getItem("products")) {
  const defaultProducts = [
    { code: "P001", name: "Shampoo", price: 50, stock: 20 },
    { code: "P002", name: "Soap", price: 25, stock: 30 },
    { code: "P003", name: "Toothpaste", price: 40, stock: 15 }
  ];
  localStorage.setItem("products", JSON.stringify(defaultProducts));
}

if (!localStorage.getItem("cart")) {
  localStorage.setItem("cart", JSON.stringify([]));
}

const messageBox = document.getElementById("message");

// ✅ Helper to compute total
function computeTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + item.subtotal, 0);
}

// ✅ Helper to update summary display
function updateSummary(change = 0) {
  const total = computeTotal();
  document.getElementById("totalDisplay").textContent = `₱${total.toFixed(2)}`;
  document.getElementById("changeDisplay").textContent = `₱${change.toFixed(2)}`;
}

// ✅ Helper to show messages (always visible)
function showMessage(msg) {
  const total = computeTotal();
  messageBox.innerHTML = `${msg} <br><strong>Total: ₱${total.toFixed(2)}</strong>`;
  messageBox.style.display = "block";
}

// ✅ Load & Save helpers
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveProducts(data) {
  localStorage.setItem("products", JSON.stringify(data));
}
function saveCart(data) {
  localStorage.setItem("cart", JSON.stringify(data));
}

// ✅ Render products
function renderProducts() {
  const products = getProducts();
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = products
    .map(
      p => `<tr>
        <td>${p.code}</td>
        <td>${p.name}</td>
        <td>₱${p.price.toFixed(2)}</td>
        <td>${p.stock}</td>
      </tr>`
    )
    .join("");
}

// ✅ Render cart
function renderCart() {
  const cart = getCart();
  const tbody = document.querySelector("#cartTable tbody");

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No items yet</td></tr>`;
  } else {
    tbody.innerHTML = cart
      .map(
        item => `<tr>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₱${item.price.toFixed(2)}</td>
          <td>₱${item.subtotal.toFixed(2)}</td>
        </tr>`
      )
      .join("");
  }

  updateSummary(); // update total
}

// ✅ Add to cart (auto-update stock)
document.getElementById("addToCart").addEventListener("click", () => {
  const code = document.getElementById("code").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const products = getProducts();
  const cart = getCart();

  const product = products.find(p => p.code === code);
  if (!product) {
    showMessage("❌ Product not found!");
    return;
  }

  if (quantity > product.stock) {
    showMessage("⚠️ Not enough stock!");
    return;
  }

  // ✅ Deduct stock immediately
  product.stock -= quantity;
  saveProducts(products);

  // Check if item already in cart
  const existing = cart.find(item => item.code === code);
  if (existing) {
    existing.quantity += quantity;
    existing.subtotal = existing.price * existing.quantity;
  } else {
    cart.push({
      code: product.code,
      name: product.name,
      price: product.price,
      quantity,
      subtotal: product.price * quantity
    });
  }

  saveCart(cart);
  renderCart();
  renderProducts();
  showMessage(`🛒 Added ${product.name} (x${quantity})`);
});

// ✅ Clear cart (restores stock)
document.getElementById("clearCart").addEventListener("click", () => {
  const cart = getCart();
  const products = getProducts();

  // Return stock
  cart.forEach(item => {
    const prod = products.find(p => p.code === item.code);
    if (prod) prod.stock += item.quantity;
  });

  saveProducts(products);
  saveCart([]);
  renderProducts();
  renderCart();
  showMessage("🧹 Cart cleared! Total: ₱0.00");
  updateSummary(0);
});

// ✅ Checkout
document.getElementById("checkout").addEventListener("click", () => {
  const cart = getCart();
  const cash = parseFloat(document.getElementById("cash").value) || 0;
  const total = computeTotal();

  if (cart.length === 0) {
    showMessage("🛒 Cart is empty!");
    return;
  }

  if (cash < total) {
    showMessage(`💸 Not enough cash! Total: ₱${total.toFixed(2)}`);
    return;
  }

  const change = cash - total;

  saveCart([]);
  renderCart();
  renderProducts();
  document.getElementById("cash").value = "";
  updateSummary(change);

  showMessage(`✅ Transaction complete!<br>Change: ₱${change.toFixed(2)} | Total: ₱${total.toFixed(2)}`);
});

// ✅ Add product
document.getElementById("addProduct").addEventListener("click", () => {
  const code = document.getElementById("prodCode").value.trim();
  const name = document.getElementById("prodName").value.trim();
  const price = parseFloat(document.getElementById("prodPrice").value);
  const stock = parseInt(document.getElementById("prodStock").value);
  const products = getProducts();

  if (products.some(p => p.code === code)) {
    showMessage("⚠️ Product code already exists!");
    return;
  }

  products.push({ code, name, price, stock });
  saveProducts(products);
  renderProducts();
  showMessage("✅ Product added!");
});

// ✅ Remove product
document.getElementById("removeProduct").addEventListener("click", () => {
  const code = document.getElementById("prodCode").value.trim();
  let products = getProducts();
  const before = products.length;
  products = products.filter(p => p.code !== code);

  if (products.length === before) {
    showMessage("❌ Product not found!");
  } else {
    saveProducts(products);
    renderProducts();
    showMessage("🗑️ Product removed!");
  }
});

// ✅ Reset all
document.getElementById("resetAll").addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// ✅ Initialize UI (with persistent summary display)
function init() {
  const rightPanel = document.querySelector(".right");
  if (!document.getElementById("summary")) {
    const summaryDiv = document.createElement("div");
    summaryDiv.id = "summary";
    summaryDiv.style.marginTop = "15px";
    summaryDiv.innerHTML = `
      <h3>Total: <span id="totalDisplay">₱0.00</span></h3>
      <h3>Change: <span id="changeDisplay">₱0.00</span></h3>
    `;
    rightPanel.appendChild(summaryDiv);
  }

  messageBox.style.display = "block";
  messageBox.innerHTML = `<strong>Total: ₱0.00</strong>`;

  renderProducts();
  renderCart();
  updateSummary();
}

init();
