const alerts = document.querySelector(".alert");
const email = document.querySelector(".email");
const username = document.querySelector(".username");
const password = document.querySelector(".password");
const password2 = document.querySelector(".confirm-password");
const registerBtn = document.querySelector(".register-btn");

const checkRegisterInputs = async () => {
  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();
  if (
    usernameValue.length == 0 ||
    emailValue.length == 0 ||
    passwordValue.length == 0
  ) {
    alerts.innerHTML = "Please fill in all fields";
  } else {
    if (passwordValue !== password2Value) {
      let html = `passwords do not match`;
      alerts.innerHTML = html;
      setTimeout(() => {
        alerts.innerHTML = "";
      }, 2000);
    } else {
      let user = {
        username: username.value,
        email: email.value,
        password: password.value,
      };
      return user;
    }
  }
};

registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const user = await checkRegisterInputs();
  try {
    const res = await fetch(
      "https://shopieapi.azurewebsites.net/api/v1/users/add",
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
      alerts.innerHTML = data.message;
      setTimeout(() => {
        window.location.href =
          "https://witty-cliff-015ff9e10.3.azurestaticapps.net/index.html";
      }, 2000);
    }
    if (data.status === "failed") {
      alerts.innerHTML = data.message;
      setTimeout(() => {
        alerts.innerHTML = "";
      }, 2000);
    }
  } catch (error) {
    alert(error);
    console.log(error);
    // alerts.innerHTML = error.message;
  }
});
