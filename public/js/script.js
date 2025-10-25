document.addEventListener("DOMContentLoaded", function () {
  const inputImagem = document.getElementById("inputImagem");

  if (inputImagem) {
    inputImagem.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const previewImage = document.getElementById("previewImage");
      const placeholder = document.getElementById("uploadPlaceholder");

      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
          placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.src = "#";
        previewImage.style.display = "none";
        placeholder.style.display = "block";
      }
    });
  }

  const passwordInput = document.getElementById("password");
  const iconEye = document.getElementById("Eyeicon");

  if (passwordInput && iconEye) {
    function showHide() {
      if (passwordInput.type === "password") {
        passwordInput.setAttribute("type", "text");
        iconEye.classList.add("hide");
      } else {
        passwordInput.setAttribute("type", "password");
        iconEye.classList.remove("hide");
      }
    }

    iconEye.addEventListener("click", showHide);
  }

  if (typeof AOS !== "undefined") {
    AOS.init();
  }
});
