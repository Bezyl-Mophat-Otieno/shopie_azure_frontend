const alert = document.querySelector(".alert");
const email = document.querySelector(".email");
const password = document.querySelector(".password");
const confirmPassword = document.querySelector(".password2");
const setBtn = document.querySelector(".setBtn");

window.onload = () => {
  const token = localStorage.getItem("reset_token");
  if (token == null || token == "") {
    window.location.href =
      "http://127.0.0.1:5500/frontend/user-dashboard/reset-password/index.html ";
  }
};
const verifyInputs = () => {
  if (
    email.value === "" ||
    password.value === "" ||
    confirmPassword.value === ""
  ) {
    alert.innerHTML = "Please fill in all fields";
    setTimeout(() => {
      alert.innerHTML = "";
    }, 3000);
    return false;
  } else if (password.value !== confirmPassword.value) {
    alert.innerHTML = "Passwords do not match";
    setTimeout(() => {
      alert.innerHTML = "";
    }, 3000);
    return false;
  }
  return true;
};
setBtn.addEventListener("click", async () => {
  console.log("clicked");
  try {
    const userId = window.location.search.split("=")[1];
    console.log(userId);
    const verified = verifyInputs();
    if (verified) {
      const res = await fetch(
        `https://shopieapi.azurewebsites.net/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        }
      );
      const data = await res.json();
      console.log(data);
      if (data.status == "success") {
        alert.innerHTML = data.message;
        setTimeout(() => {
          alert.innerHTML = "";
        }, 3000);
        window.location.href =
          "http://127.0.0.1:5500/frontend/authentication-page/login/index.html";
      }
    }
  } catch (error) {
    console.log(error);
  }
});
