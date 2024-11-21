const apiUrl = "http://localhost:3000/api";

// Lấy danh sách sản phẩm
const fetchProducts = async () => {
  const response = await fetch(`${apiUrl}/products`);
  const products = await response.json();
  renderProducts(products);
};

// Hiển thị sản phẩm ra giao diện
const renderProducts = (products) => {
  const productsList = document.getElementById("products-list");
  productsList.innerHTML = products.map(product => `
    <div class="product">
      <h3>${product.name}</h3>
      <p>Giá: ${product.price} VND</p>
      <button onclick="deleteProduct('${product.id}')">Xóa</button>
    </div>
  `).join("");
};

// Xóa sản phẩm
const deleteProduct = async (id) => {
  await fetch(`${apiUrl}/products/${id}`, { method: "DELETE" });
  fetchProducts();
};

// Thêm sản phẩm
const addProduct = async () => {
  const newProduct = { name: "Sản phẩm mới", price: 100000 };
  await fetch(`${apiUrl}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct),
  });
  fetchProducts();
};

document.getElementById("add-product-btn").addEventListener("click", addProduct);
fetchProducts();
