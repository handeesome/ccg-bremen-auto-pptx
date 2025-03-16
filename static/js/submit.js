// main.js

import { findBibleText } from "./findBibleText.js";
import { createAlertDialog } from "./popup.js";

function navigateToUnselectedDropdowns() {
  // Get all select elements
  const selects = document.querySelectorAll('select[id*="Book"]');
  let firstUnselected = null;

  selects.forEach((select) => {
    // Check if no option is selected
    if (!select.value) {
      select.classList.add("unselected"); // Add class for styling

      // Scroll to the first unselected dropdown
      if (!firstUnselected) {
        firstUnselected = select;
        select.scrollIntoView({ behavior: "smooth", block: "center" });
        select.focus();
      }
    } else {
      select.classList.remove("unselected");
    }
    select.addEventListener("change", function () {
      // Remove red border when a value is selected
      if (this.value) {
        this.classList.remove("unselected");
      }
    });
  });
}

document.getElementById("submitForm").addEventListener("click", function () {
  let formData = JSON.parse(localStorage.getItem("formData")) || "{}";

  // Check if the required date field is present
  if (!formData["date1"]) {
    let date = document.getElementById("date1Input");
    date.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    date.focus();
    alert("请输入日期");
    return; // Exit the function to prevent form submission
  }

  let categories = ["xuanZhao", "qiYing", "duJing", "jinJu", "jingWen"];

  try {
    categories.forEach((category) => {
      formData[category].forEach((verse, index) => {
        formData[category][index].fullVerse = findBibleText(verse.fullName);
      });
    });
  } catch (error) {
    navigateToUnselectedDropdowns();
    alert("你有经文未选择，请检查后再试。");
    return;
  }

  fetch("/process-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData), // Send the entire JSON data
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.fileName) {
        window.location.href = "/download/" + data.fileName; // Redirect to download
        alert("PPTX下载成功，记得放在Google Drive上哦！");
      } else {
        alert("发生了一些错误，请检查后再试。");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("网络错误，请稍后再试。");
    });
});

export function dlSongPPTX(songId) {
  const formData = JSON.parse(localStorage.getItem("formData")) || {};
  const songPages = formData[`${songId}Pages`];
  if (!songPages) {
    console.error(`No song pages found for songId: ${songId}`);
    return;
  }
  const input = document.getElementById(`${songId}-name-input`);
  const dataToSend = {
    songName: input.value,
    pages: songPages,
  };
  // Send the data using fetch
  fetch("/submit-song", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify JSON data format
    },
    body: JSON.stringify(dataToSend), // Convert the dataToSend object to a JSON string
  })
    .then((response) => response.json()) // Assuming the server returns JSON
    .then((data) => {
      // Use setTimeout to ensure dialog hiding is processed first
      window.location.href = "/download/" + data.fileName;
      createAlertDialog(
        "pptx-success-dialog",
        "PPTX下载成功，记得放在Google Drive上哦！"
      );
    })
    .catch((error) => {
      console.error("Error:", error); // Handle error response
      // You can show an error message to the user, etc.
    });
}
