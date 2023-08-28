window.onload = async () => {
  await fetchUser();
  await fetchOrder();
  profile.innerHTML = localStorage.getItem("loggedUser");
};
const id = window.location.search.split("=")[1];
console.log(id);
const customerDetails = document.querySelector(".customerDetails");
const productContainer = document.querySelector(".productContainer");
const orders = document.querySelector(".orders");
const profile = document.querySelector(".profile");

const fetchUser = async () => {
  try {
    const res = await fetch(
      `https://shopieapi.azurewebsites.net/api/v1/users/one/${id}`
    );
    const data = await res.json();
    console.log(data);
    customerDetails.innerHTML = `  

    <div class="userName">${data.user.username}</div>
        <div class="email">${data.user.email}</div>
    
    `;
  } catch (error) {
    console.log(error);
  }
};

const fetchOrder = async () => {
  try {
    const res = await fetch(
      `https://shopieapi.azurewebsites.net/api/v1/orders/${id}`
    );
    const data = await res.json();
    console.log(data);
    const products = data.products;
    let sumTotal = 0;
    products.forEach((product, index) => {
      const date = Intl.DateTimeFormat("en-US").format(product.createdAt);
      orders.innerHTML += `
      <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.total}</td>
      <td>${date}</td>
      </tr>

      `;
      sumTotal += product.total;
    });
    document.querySelector(".total").innerHTML = sumTotal;
  } catch (error) {
    console.log(error);
  }
};
