const alert = document.querySelector(".alert");
const customers = document.querySelector(".customer-list");
const profile = document.querySelector(".profile");

window.onload = async () => {
  await fetchCustomers();
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

const fetchCustomers = async () => {
  try {
    const res = await fetch("https://shopieapi.azurewebsites.net/api/v1/users");
    const object = await res.json();
    console.log(object);
    if (object.status === "success") {
      let html = "";
      const users = object.users;
      users.map((user) => {
        html += `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><button class="deactivate-btn"> ${
          user.deleted ? "Activate" : "Deactivate"
        } </button></td>
      </tr>
      <tr></tr>
      <tr></tr>`;
      });
      customers.innerHTML = html;
    } else {
      alert.innerHtml = object.message;
    }
  } catch (error) {
    console.log(error);
    alert.innerHtml = object.message;
  }
};

customers.addEventListener("click", async (e) => {
  if (e.target.classList.contains("deactivate-btn")) {
    console.log(e.target.innerText == "Deactivate");
    if (e.target.innerText == "Deactivate") {
      console.log(e.target.parentElement.innerHTML);
      const id =
        e.target.parentElement.parentElement.firstElementChild.innerHTML;
      console.log(id);
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/users/delete/${id}`,
        {
          method: "PUT",
        }
      );
      const object = await res.json();
      if (object.status === "success") {
        alert.innerHTML = object.message;
        setTimeout(async () => {
          alert.innerHTML = "";
          await fetchCustomers();
        }, 3000);
      } else {
        alert.innerHTML = object.message;
      }
    }

    if (e.target.innerText == "Activate") {
      console.log(e.target.parentElement.innerHTML == "Activate");
      const id =
        e.target.parentElement.parentElement.firstElementChild.innerHTML;
      console.log(id);
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/users/activate/${id}`,
        {
          method: "PUT",
        }
      );
      const object = await res.json();
      if (object.status === "success") {
        alert.innerHTML = object.message;
        setTimeout(async () => {
          alert.innerHTML = "";
          await fetchCustomers();
        }, 3000);
      } else {
        alert.innerHTML = object.message;
      }
    }
  }
});
