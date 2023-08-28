const productContainer = document.querySelector(".productContainer");
const container = document.querySelector(".container");
const emptyCart = document.querySelector(".emptyCart");
const profile = document.querySelector(".profile");
const logout = document.querySelector(".logout");
const alert = document.querySelector(".alertContainer");
window.onload = async () => {
  const token = localStorage.getItem("token");
  console.log(typeof token);
  if (token == null || token == "") {
    window.location.href =
      "http://127.0.0.1:5500/frontend/authentication-page/login/index.html";
  }
  await fetchCart();
  const username = localStorage.getItem("loggedUser");
  if (username !== null && username !== "") {
    profile.innerHTML = username;
  }
};

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.reload();
});

const fetchTotal = async () => {
  const products = JSON.parse(localStorage.getItem("cart")) || [];
  console.log(products);
  let total = 0;
  products.map((product) => {
    total += product.price * product.quantity;
  });
  container.innerHTML = `
  <div class="totalContainer">
  <div class="total">
  <h1 class="total-text">Total: KSH.${total}/=</h1>
  <button class="checkout-btn">CHECKOUT</button>
  </div>
  </div>
  `;
  await paypalCheckOut(total);
};

const paypalCheckOut = async (total) => {
  paypal
    .Buttons({
      async createOrder() {
        try {
          const response = await fetch(
            "http://localhost:5000/api/v1/orders/create-paypal-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                total,
                cart: [
                  {
                    sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
                    quantity: "YOUR_PRODUCT_QUANTITY",
                  },
                ],
              }),
            }
          );

          const order = await response.json();
          return order.id;
        } catch (error) {
          console.error("Error creating PayPal order:", error);
        }
      },
      async onApprove(data) {
        try {
          const response = await fetch(
            "http://localhost:5000/api/v1/orders/capture-paypal-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            }
          );

          const orderData = await response.json();
          const transaction = orderData.purchase_units[0].payments.captures[0];
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2)
          );

          const products = JSON.parse(localStorage.getItem("cart"));
          await productCheckOut(products);
          localStorage.removeItem("cart");
          alert.innerHTML = `
          <div class = 'alert'> 
          Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details
          </div>
          `;
          setTimeout(() => {
            alert.innerHTML = "";
            window.location.reload();
          }, 3000);
          // When ready to go live, remove the alert and show a success message within this page.
        } catch (error) {
          console.error("Error capturing PayPal order:", error);
        }
      },
    })
    .render(container);
};

const fetchCart = async () => {
  let html = "";
  const products = JSON.parse(localStorage.getItem("cart")) || [];

  if (products.length > 0) {
    await fetchTotal();
    products.map((product) => {
      html += `
              <div class="product" id=${product.id} >
              <img
                src=${product.image}
                alt=""
                class="product-img"
              />
              <div class="product-name">${product.name}</div>
              <div class="product-desc">
              ${product.description}

              </div>
              <div class="price">KSH.${product.price}/=</div>
              <div class="quntity">${product.quantity}<small>pieces</small></div>
              <button class="remove-btn">REMOVE FROM CART</button>
            </div>
              `;
    });
    productContainer.innerHTML = html;
  } else {
    emptyCart.innerHTML = `<img
    src="https://cdn.dribbble.com/users/887568/screenshots/3172047/media/725fca9f20d010f19b3cd5411c50a652.gif"
    alt=""
  />`;
  }
};

productContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const products = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = e.target.parentElement.getAttribute("id");
    const newProducts = products.filter((product) => product.id !== productId);
    console.log(newProducts);
    localStorage.setItem("cart", JSON.stringify(newProducts));
    await fetchCart();
    if (newProducts.length === 0) {
      window.location.reload();
    }
  }
});

const productCheckOut = async (products) => {
  try {
    products.map(async (product) => {
      const requestBody = {
        user_id: localStorage.getItem("user_id"),
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        total: product.price * product.quantity,
      };
      const res = await fetch(
        "https://shopieapi.azurewebsites.net/api/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      // update the stock
      // fetch a single product from the db

      const fetchProduct = async (productId) => {
        let html = "";
        const res = await fetch(
          `https://shopieapi.azurewebsites.net/api/v1/products/${productId}`
        );
        const object = await res.json();
        console.log(object);
        if (object.status == "success") {
          return object.product;
        }
      };

      const myStock = await fetchProduct(product.id);

      const res2 = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/products/update/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            quantity: myStock.quantity - product.quantity,
          }),
        }
      );
      console.log(product);
      const data = await res.json();
      console.log(data);
    });
  } catch (error) {
    console.log(error);
  }
};

container.addEventListener("click", async (e) => {
  try {
    const products = JSON.parse(localStorage.getItem("cart"));

    await productCheckOut(products);

    // clear local storage
    localStorage.removeItem("cart");
    alert.innerHTML =
      "<div class = 'alert'> Your Order Has Been Recieved Successfully </div>";
    setTimeout(() => {
      alert.innerHTML = "";
      window.location.reload();
    }, 3000);
  } catch (error) {
    alert.innerHTML =
      "<div class = 'alert'> Something Went Wrong Please Try Again </div>";
    setTimeout(() => {
      alert.innerHTML = "";
      window.location.reload();
    }, 3000);
  }
  // get the products from the local storage
});
