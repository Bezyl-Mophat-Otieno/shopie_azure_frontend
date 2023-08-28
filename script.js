const alerts = document.querySelector(".alertContainer");
const email = document.querySelector(".email");
const password = document.querySelector(".password");
const loginBtn = document.querySelector("#loginBtn");

const checkLoginInputs = async () => {
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  if (emailValue.length == 0 || passwordValue.length == 0) {
    alerts.innerHTML = `
    
    <div class="alert" >
    "Please fill in all fields"
    </div>

    `;
  } else {
    let user = {
      email: email.value,
      password: password.value,
    };
    return user;
  }
};

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = await checkLoginInputs();
  try {
    const res = await fetch(
      "https://shopieapi.azurewebsites.net/api/v1/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(user),
      }
    );
    const data = await res.json();
    if (data.status === "success") {
      alerts.innerHTML = `
      <div class = "alert">
      ${data.message}
      </div>
      `;

      const token = data.token;
      if (token) {
        // store the token to localstorage
        localStorage.setItem("token", token);
        // get loggedInUser using the token
        const res = await fetch(
          "https://shopieapi.azurewebsites.net/api/v1/users/user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              token: token,
            },
          }
        );
        const data = await res.json();
        // store the user in local storage
        localStorage.setItem("loggedUser", data.user.username);
        localStorage.setItem("user_id", data.user.id);
        if (data?.user?.role === "admin") {
          window.location.href =
            "http://127.0.0.1:5500/frontend/admin-dashboard/index.html";
        } else {
          window.location.href =
            "http://127.0.0.1:5500/frontend/user-dashboard/index.html";
        }
      }
    } else {
      if (data.status === "failed") {
        alerts.innerHTML = `
        <div class = "alert">
        ${data.message}
        </div>
        `;
        setTimeout(() => {
          alerts.innerHTML = "";
        }, 2000);
      } else {
        alerts.innerHTML = alerts.innerHTML = `
        <div class = "alert">
        ${data.message}
        </div>
        `;
        setTimeout(() => {
          alerts.innerHTML = "";
        }, 2000);
      }
    }
  } catch (err) {
    alerts.innerHTML = `
    <div class = "alert">
    ${err.message}
    </div>
    `;
    console.log(err);
  }
});
