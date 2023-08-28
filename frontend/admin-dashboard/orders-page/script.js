const profile = document.querySelector(".profile");
const logout = document.querySelector(".logout");
const ordersHtml = document.querySelector(".orders");

window.onload = async () => {
  await fetchOrders();
  const username = localStorage.getItem("loggedUser");
  console.log(username);
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

const fetchOrders = async () => {
  try {
    const res = await fetch(
      "https://shopieapi.azurewebsites.net/api/v1/orders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    console.log(data);
    if (data.status === "success") {
      const orders = data.orders;
      console.log(orders);
      let html = "";
      orders.map((order) => {
        html += `
        <tr>
        <td>${order.id}</td>
        <td>${order.user_id}</td>
        <td>${order.name}</td>
        <td><button class="view-button">View Order</button></td>
      </tr>
        `;
      });
      ordersHtml.innerHTML = html;
    }
  } catch (error) {}
};

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.reload();
});

ordersHtml.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-button")) {
    const id = e.target.parentElement.parentElement.children[1].textContent;
    window.location.href = `http://127.0.0.1:5500/frontend/admin-dashboard/singleOrder/index.html?id=${id}`;
  }
});
