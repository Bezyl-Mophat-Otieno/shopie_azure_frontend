const alert = document.querySelector(".alertContainer");
const confirmBtn = document.querySelector(".confirmBtn");
const email = document.querySelector(".email");

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

confirmBtn.addEventListener("click", async () => {
  if (email === "") {
    alert.innerHTML = "<div class='alert'> Please Enter Your Email</div>";
    setTimeout(() => {
      alert.innerHTML = "";
    }, 3000);
  } else {
    try {
      const res = await fetch(
        "https://shopieapi.azurewebsites.net/api/v1/users/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value }),
        }
      );
      const data = await res.json();
      console.log(data);
      if (data.status == "success") {
        // generate random token
        const token = generateRandomString(10);
        // store the token to localstorage
        localStorage.setItem("reset_token", token);
        alert.innerHTML = `
        <div class="alert">
        ${data.message}
        </div>
        `;
        setTimeout(() => {
          alert.innerHTML = "";
          email.value = "";
        }, 3000);

        // the token should be cleared after 3o minutes

        setTimeout(() => {
          localStorage.removeItem("reset_token");
        }, 1800000);
      }
    } catch (error) {
      alert.innerHTML = `
      <div class="alert">
      ${error.message}
      </div>
      `;
      setTimeout(() => {
        alert.innerHTML = "";
      }, 3000);
    }
  }
});
