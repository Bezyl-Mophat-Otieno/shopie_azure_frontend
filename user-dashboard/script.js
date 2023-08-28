const main = document.querySelector(".main");
const searchBar = document.querySelector(".search-bar");
const profile = document.querySelector(".profile");
const logout = document.querySelector(".logout");
const alert = document.querySelector(".alertContainer");
let products = [];
window.onload = async () => {
  await fetchProducts();
  const username = localStorage.getItem("loggedUser");
  if (username !== null || username == "") {
    profile.innerHTML = username;
  }
  const token = localStorage.getItem("token");
  console.log(typeof token);
  if (token == null || token == "") {
    window.location.href =
      "http://127.0.0.1:5500/frontend/authentication-page/login/index.html";
  }
};

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.reload();
});

searchBar.addEventListener("keyup", (e) => {
  const searchString = e.target.value.toLowerCase();
  search(searchString);
});

// A function to search for products
const search = (searchString) => {
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchString) ||
      product.description.toLowerCase().includes(searchString)
    );
  });
  displayProducts({ products: filteredProducts, status: "success" });
  if (filteredProducts.length == 0) {
    productContainer.innerHTML = `<h2 style="text-align: center;">No products found</h2>`;
  }
  if (searchString == "") {
    fetchProducts();
  }
};

const productContainer = document.querySelector(".my-shop-products");

const fetchProducts = async () => {
  try {
    const res = await fetch(
      "https://shopieapi.azurewebsites.net/api/v1/products"
    );
    const object = await res.json();
    console.log(object);

    displayProducts(object);
  } catch (error) {
    console.log(error);
    alert.innerHTML = error.message;
  }
};

const displayProducts = async (object) => {
  let html = "";
  if (object.status == "success") {
    products = object.products;
    products.map((product) => {
      html += `
      <div class="product" id=${product.id}>
      <img
        src=${product.image}
        alt=""
        class="product-img"
      />
      <div class="product-name">${product.name}</div>
      <div class="product-desc">
          ${product.description}
      </div>
      <div class="details">
        <div class="price">KSH. ${product.price} /=</div>
        <div class="quntity">${product.quantity} <small>pieces</small></div>
      </div>
      <button class="action-btn">Add Cart</button>
    </div>
        `;
    });
    productContainer.innerHTML = html;
  } else {
    productContainer.innerHTML = `<h2 style="text-align: center;">${object.message}</h2>`;
  }
};

// adding to cart
productContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("action-btn")) {
    const productId = e.target.parentElement.id;
    const res = await fetch(
      `https://shopieapi.azurewebsites.net/api/v1/products/${productId}`
    );
    const object = await res.json();
    console.log(object);
    if (object.status == "success") {
      const product = object.product;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      console.log(cart);
      const productInCart = cart.find((item) => item.id == product.id);
      if (productInCart) {
        productInCart.quantity++;
      } else {
        product.quantity = 1;
        cart.push(product);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert.innerHTML = `
      <div class="alert">
      Product Added to Cart successfully
      </div>
      `;
      setTimeout(() => {
        alert.innerHTML = ``;
      }, 3000);
    }
  }

  // clicking the image to view the product
  if (e.target.classList.contains("product-img")) {
    const productId = e.target.parentElement.id;
    window.location.href = `http://127.0.0.1:5500/frontend/user-dashboard/single-product/index.html?id=${productId}`;
  }
});
