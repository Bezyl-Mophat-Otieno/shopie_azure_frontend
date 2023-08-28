const productName = document.querySelector(".productName");
const productPrice = document.querySelector(".productPrice");
const productDescription = document.querySelector(".productDesc");
const productImage = document.querySelector("#image");
const productQuantity = document.querySelector(".quantity");
const logout = document.querySelector(".logout");
const profile = document.querySelector(".profile");
console.log(productQuantity);
const addBtn = document.querySelector(".add-btn");
const alerts = document.querySelector(".alertContainer");
const productContainer = document.querySelector(".product-container");
let imageUrl = "";

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
// Uploading the image to cloudinary
productImage.addEventListener("change", async (event) => {
  const target = event.target;
  const files = target.files;

  if (files) {
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("upload_preset", "shopie");
      formData.append("cloud_name", "dfukupatj");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dfukupatj/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      imageUrl = await data.url;
    } catch (error) {
      // Handle error appropriately
    }
  }
});

// Validating the inputs
const checkInputs = async () => {
  const productNameValue = productName.value.trim();
  const productPriceValue = productPrice.value.trim();
  const productDescValue = productDescription.value.trim();
  const productImageValue = productImage.value.trim();
  const productQuantityValue = productQuantity.value.trim();

  if (
    productNameValue.length == 0 ||
    productPriceValue.length == 0 ||
    productDescValue.length == 0 ||
    productQuantityValue.length == 0
  ) {
    alerts.innerHTML = `
    <div class="alert" >
    Please Fill in all fields
    </div>
    `;
  } else {
    let product = {
      name: productName.value,
      description: productDescription.value,
      image: imageUrl,
      quantity: productQuantity.value,
      price: productPrice.value,
    };
    return product;
  }
};

// Adding the product to the database
addBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  if (addBtn.innerHTML == "Add Product") {
    const product = await checkInputs();
    try {
      const res = await fetch(
        "https://shopieapi.azurewebsites.net/api/v1/products/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(product),
        }
      );
      console.log(product);
      const data = await res.json();
      console.log(data);
      if (data.status === "success") {
        await fetchProducts();
        alerts.innerHTML = `
        <div class="alert">
        ${data.message}
        </div>
        `;
        setTimeout(() => {
          alerts.innerHTML = "";
          productName.value = "";
          productPrice.value = "";
          productDescription.value = "";
          productImage.value = "";
          productQuantity.value = "";
        }, 3000);
      } else {
        alerts.innerHTML = data.message;
        setTimeout(() => {
          alerts.innerHTML = "";
        }, 3000);
      }
    } catch (error) {
      alert(error.message);
      console.log(error);
      alerts.innerHTML = error.message;
      setTimeout(() => {
        alerts.innerHTML = "";
      }, 3000);
    }
  }
  if (addBtn.innerHTML == "Update Product") {
    const product = await checkInputs();
    const id = productContainer.getAttribute("id");
    console.log(product);
    try {
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/products/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(product),
        }
      );
      console.log(product);
      const data = await res.json();
      console.log(data);
      if (data.status === "success") {
        await fetchProducts();
        alerts.innerHTML = data.message;
        setTimeout(() => {
          alerts.innerHTML = "";
          productName.value = "";
          productPrice.value = "";
          productDescription.value = "";
          productImage.value = "";
          productQuantity.value = "";
          addBtn.innerHTML = "Add Product";
        }, 3000);
      } else {
        alerts.innerHTML = data.message;
        setTimeout(() => {
          alerts.innerHTML = "";
        }, 3000);
      }
    } catch (error) {
      alert(error.message);
      alerts.innerHTML = data.message;
      setTimeout(() => {
        alerts.innerHTML = "";
      }, 3000);
    }
  }
});

// Fetching all products from the database

const fetchProducts = async () => {
  let html = "";
  try {
    const res = await fetch(
      "https://shopieapi.azurewebsites.net/api/v1/products"
    );
    const object = await res.json();
    console.log(object);

    if (object.status == "success") {
      const products = object.products;
      products.map((product) => {
        html += `
        <div class="product" id=${product.id}>
        <img
          src=${product.image}
          alt=""
          class="product-img"
        />
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.description}
        </div>
        <div class="details">
          <div class="price">KSH. ${product.price}/=</div>
          <div class="quntity">${product.quantity} <small> pieces</small></div>
        </div>
        <div class="actions">
          <button class="action-btn-update">Update</button>
          <button class="action-btn-delete">Delete</button>
        </div>
      </div>
        `;
      });
      productContainer.innerHTML = html;
    }
  } catch (error) {
    console.log(error);
    alerts.innerHTML = error.message;
  }
};

// delete a product

productContainer.addEventListener("click", async (e) => {
  e.preventDefault();
  if (e.target.classList.contains("action-btn-delete")) {
    const id = e.target.parentElement.parentElement.id;
    console.log(id);
    try {
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/products/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );
      const data = await res.json();
      console.log(data);
      if (data.status === "success") {
        await fetchProducts();
        alerts.innerHTML = data.message;
        setTimeout(async () => {
          alerts.innerHTML = "";
          await fetchProducts();
        }, 3000);
      } else {
        alerts.innerHTML = data.message;
        setTimeout(() => {
          alerts.innerHTML = "";
        }, 3000);
      }
    } catch (error) {
      console.log(error);
      alerts.innerHTML = error.message;
      setTimeout(() => {
        alerts.innerHTML = "";
      }, 3000);
    }
  }
  // update a product

  if (e.target.classList.contains("action-btn-update")) {
    const id = e.target.parentElement.parentElement.id;
    productContainer.setAttribute("id", id);
    try {
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/products/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );
      const object = await res.json();
      console.log(object);
      const product = object.product;

      // fill the form with the data
      productName.value = product.name;
      productPrice.value = product.price;
      productDescription.value = product.description;
      productQuantity.value = product.quantity;
      addBtn.innerHTML = "Update Product";
    } catch (error) {
      console.log(error);
    }
  }
});
