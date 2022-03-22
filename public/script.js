const dragContainer = document.getElementById("dragContainer");
const fileInput = document.getElementById("fileInput");
const uploadDiv = document.getElementById("upload");
const uploadingDiv = document.getElementById("uploading");
const progress = document.getElementById("progress");
const progressPercentage = document.getElementById("progressPercentage");
const qrContainer = document.getElementById("qrContainer");
const urlInput = document.getElementById("urlInput");
const toast = document.querySelector(".toast");

let file;

// when drag over container
dragContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  //   adding active class
  dragContainer.classList.add("active");
});

// when drag leave container
dragContainer.addEventListener("dragleave", (e) => {
  e.preventDefault();
  //   removing active class
  dragContainer.classList.remove("active");
});

// when file dropped in container
dragContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  //   removing active class
  dragContainer.classList.remove("active");
  file = e.dataTransfer.files[0];

  uploadFile();
});

function chooseFile() {
  fileInput.click();
}

fileInput.addEventListener("change", (e) => {
  e.preventDefault();
  file = e.target.files[0];
  uploadFile();
});

function uploadFile() {
  const xhr = new XMLHttpRequest();

  // open request
  xhr.open("POST", "/upload", true);

  // setting formdata
  const formData = new FormData();
  formData.append("file", file);

  // updating progressbar
  xhr.upload.addEventListener("progress", (event) => {
    if (event.lengthComputable) {
      uploadDiv.style.display = "none";
      uploadingDiv.style.display = "block";
      const percentage = parseInt((event.loaded / event.total) * 100) + "%";
      progress.style.width = percentage;
      progressPercentage.textContent = percentage;
    }
  });

  // call when uploading is done
  xhr.addEventListener("loadend", (e) => {
    if (e.target.status === 201) {
      showToast("Upload Completed");

      uploadDiv.style.display = "block";
      uploadingDiv.style.display = "none";

      const { url } = JSON.parse(e.target.response);

      qrContainer.style.display = "block";
      dragContainer.style.display = "none";

      // generating qr code

      new QRCode(document.getElementById("qrCode"), {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      urlInput.value = url;
    } else {
      showToast(
        "Uploading failed somthing went wrong please try again",
        "error"
      );
      uploadDiv.style.display = "block";
      uploadingDiv.style.display = "none";
    }
  });

  // send request
  xhr.send(formData);
}

function copyLink() {
  /* Select the text field */
  urlInput.select();
  urlInput.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  navigator.clipboard.writeText(urlInput.value);

  showToast("Link Copied");
}

function showToast(msg, type) {
  if (type === "error") {
    toast.style.backgroundColor = "#EA2027";
  }
  toast.style.right = "10px";
  toast.textContent = msg;
  setTimeout(() => {
    toast.textContent = "";
    toast.style.right = "-100%";
  }, 3000);
}
