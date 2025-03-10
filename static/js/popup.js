const savedStates = new Map(); // Store states for each songId
const initializedDraggables = new Set();

export function searchSongPopup() {
  const popupOverlay = document.getElementById("popup-overlay");
  popupOverlay.addEventListener("click", function (event) {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    if (event.target === popupOverlay) {
      searchInput.value = "";
      searchResults.innerHTML = "";
      popupOverlay.style.display = "none";
      document.body.style.overflow = "auto"; // Re-enable scrolling
    }
  });

  // Fetch the JSON data
  fetch("/static/temp/GDriveSongs.json")
    .then((response) => response.json())
    .then((data) => {
      const flattenedData = [];

      function traverseFolder(folderId, path = "") {
        const folder = data[folderId];
        const currentPath = path ? `${path} / ${folder.name}` : folder.name;

        // Add files in the current folder
        folder.files.forEach((file) => {
          flattenedData.push({
            id: file.id,
            name: file.name,
            path: currentPath,
            type: "file",
            folderId: folderId,
            modifiedTime: file.modifiedTime,
          });
        });

        // Recursively process subfolders
        folder.subfolders.forEach((subfolderId) => {
          flattenedData.push({
            id: subfolderId,
            name: data[subfolderId].name,
            path: currentPath,
            type: "folder",
          });

          traverseFolder(subfolderId, currentPath);
        });
      }

      // Start traversal from the root folder
      traverseFolder("13Czs3mdHpL-5XDggphM9n2em4z2ZkSf4");

      // Initialize Fuse.js
      const options = {
        keys: ["name", "path"],
        threshold: 0.3,
      };

      const fuse = new Fuse(flattenedData, options);

      // Initialize OpenCC Converters
      const s2tConverter = OpenCC.Converter({ from: "cn", to: "tw" });
      const t2sConverter = OpenCC.Converter({ from: "tw", to: "cn" });

      // Search functionality
      const searchInput = document.getElementById("search-input");
      const resultList = document.getElementById("search-results");

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        resultList.innerHTML = "";

        if (query.length > 0) {
          // Convert input to both Traditional and Simplified
          const queryTraditional = s2tConverter(query);
          const querySimplified = t2sConverter(query);

          // Combine results for both Traditional and Simplified searches
          const traditionalResults = fuse.search(queryTraditional);
          const simplifiedResults = fuse.search(querySimplified);
          const combinedResults = [...traditionalResults, ...simplifiedResults];

          // Display search results (max 5 results)
          combinedResults.slice(0, 5).forEach((result) => {
            const item = result.item;
            if (item.type === "file") {
              const li = document.createElement("li");
              li.className = "row";
              const fileName = item.name;

              // Construct Google Drive Folder URL
              const folderUrl = `https://drive.google.com/drive/folders/${item.folderId}`;
              const downloadUrl = `https://drive.google.com/uc?id=${item.id}&export=download`;
              const fileUrl = `https://drive.google.com/file/d/${item.id}/view`;
              const modifiedTime = item.modifiedTime.split("T")[0]; // Extract the date part

              li.innerHTML = `
                <div class="col-12 col-md-5">
                    <div class="row">
                        <div class="col-12">
                            <strong class="clickable">${fileName}</strong>
                        </div>
                        <div class="col-12 text-muted">
                            ${modifiedTime}
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-2 text-end">
                    <a href="${fileUrl}" target="_blank">
                        <i class="bi bi-file-earmark"></i> 查看
                    </a>
                </div>
                <div class="col-12 col-md-3 text-end">
                    <a href="${folderUrl}" target="_blank">
                        <i class="bi bi-folder"></i> 打开文件夹
                    </a>
                </div>
                <div class="col-12 col-md-2 text-end">
                    <a href="${downloadUrl}" target="_blank">
                        <i class="bi bi-download"></i> 下载
                    </a>
                </div>
                `;
              resultList.appendChild(li);

              li.querySelector(".clickable").addEventListener(
                "click",
                function () {
                  const fileName = this.innerText.split(".")[0];
                  if (window.clickedInput) {
                    window.clickedInput.value = fileName;
                    window.clickedInput = null;
                  }

                  // Close the popup (optional)
                  popupOverlay.style.display = "none";
                }
              );
            }
          });
          if (combinedResults.length <= 0) {
            const noResults = document.createElement("li");
            noResults.className = "no-results";
            noResults.innerHTML = "No results found. Please check elsewhere.";
            resultList.appendChild(noResults);
          }
        }
      });
    })
    .catch((err) => console.error("Error loading JSON:", err));
}

export function openDIYpopup(songId) {
  const overlayDIY = document.getElementById(`overlay-DIY-${songId}`);
  overlayDIY.style.display = "block";
  document.body.style.overflow = "hidden";
  DIYpopup(overlayDIY, songId);

  // Only call makeDraggable if it hasn't been initialized for this songId
  if (!initializedDraggables.has(songId)) {
    makeDraggable(songId);
    initializedDraggables.add(songId);
  }
}

export function DIYpopup(popupOverlay, songId) {
  // Check if changes were made
  const hasChanges = () => {
    const slidePreviewContainer = document.getElementById(
      `slidePreviewContainer${songId}`
    );
    const pages = slidePreviewContainer.querySelectorAll(".card-body");
    const currentState = Array.from(pages).map((page) =>
      Array.from(page.querySelectorAll("div"))
        .map((div) => div.textContent)
        .join("\n")
    );
    const savedState = savedStates.get(songId) || [];
    return JSON.stringify(currentState) !== JSON.stringify(savedState);
  };

  // Restore saved state
  const restoreState = () => {
    const savedState = savedStates.get(songId) || [];
    if (savedState) {
      const slidePreviewContainer = document.getElementById(
        `slidePreviewContainer${songId}`
      );
      slidePreviewContainer.innerHTML = "";
      const row = document.createElement("div");
      row.classList.add("row");
      slidePreviewContainer.appendChild(row);

      savedState.forEach((text) => {
        const colContainer = document.createElement("div");
        colContainer.classList.add("col-4", "mt-2");
        colContainer.style.position = "relative";

        const card = document.createElement("div");
        card.classList.add("card", "mb-2", "draggable", "form-control");
        card.draggable = true;
        card.innerHTML = `
          <div class="card-body">
            ${text
              .split("\n")
              .map((line) => `<div>${line}</div>`)
              .join("")}
          </div>`;

        colContainer.appendChild(card);
        row.appendChild(colContainer);
      });
    }
  };

  // download song pptx
  const dlSongPPTX = (songId) => {
    const dialogId = "song-name-dialog";
    const dialogText = "请输入诗歌名:";
    const buttonCount = 2;
    const confirmDialog = createDialog(dialogId, dialogText, buttonCount);

    // Create a form element
    const form = document.createElement("form");
    form.id = "song-name-form";
    form.classList.add("confirm-dialog");

    // Add input
    const input = document.createElement("input");
    input.type = "text";
    input.id = `${songId}-name-input`;
    input.placeholder = "请输入诗歌名";

    if (confirmDialog && !confirmDialog.querySelector("input")) {
      const buttons = confirmDialog.querySelectorAll(".btn");
      buttons[0].classList.add("btn-primary", "cancel-btn");
      buttons[0].textContent = "取消";
      buttons[0].type = "button";
      buttons[1].classList.add("btn-success", "enter-btn");
      buttons[1].textContent = "确定";
      confirmDialog.querySelector("p").insertAdjacentElement("afterend", input);
      form.appendChild(confirmDialog.firstElementChild);
      confirmDialog.appendChild(form);
    }
    confirmDialog.style.display = "flex";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = JSON.parse(localStorage.getItem("formData")) || {};
      const songPages = formData[`${songId}Pages`];
      if (!songPages) {
        console.error(`No song pages found for songId: ${songId}`);
        return;
      }
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
          console.log("Success:", data); // Handle success response
          // You can show a success message to the user, update UI, etc.
        })
        .catch((error) => {
          console.error("Error:", error); // Handle error response
          // You can show an error message to the user, etc.
        });
    });
    confirmDialog.querySelector(".cancel-btn").addEventListener("click", () => {
      form.reset();
      confirmDialog.style.display = "none";
      document.body.style.overflow = "auto";
    });

    // Prepare the data to be sent
  };

  popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay) {
      if (hasChanges()) {
        showConfirmationDialog(
          songId,
          popupOverlay,
          () => {
            popupOverlay.style.display = "none";
            document.body.style.overflow = "auto";
          },
          restoreState
        );
      } else {
        popupOverlay.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  });
  //生成歌词 button
  const btn = popupOverlay.querySelector(".btn-primary");
  btn.addEventListener("click", function () {
    const DIYInput = popupOverlay.querySelector(".DIY-input");
    DIYInput.style.display = "none";
    const DIYPages = popupOverlay.querySelector(".DIY-pages");
    DIYPages.style.display = "flex";
    splitLyrics(songId);
    const topCornerBtns = popupOverlay.querySelector(".top-corner-buttons");
    topCornerBtns.style.visibility = "visible";
    const backBtn = popupOverlay.querySelector(".back-btn");
    backBtn.addEventListener("click", function () {
      DIYInput.style.display = "flex";
      DIYPages.style.display = "none";
      backBtn.style.visibility = "hidden";
      saveBtn.style.visibility = "hidden";
      savedStates.delete(songId);
    });
    const saveBtn = popupOverlay.querySelector(".save-btn");
    saveBtn.addEventListener("click", function () {
      saveDIY(popupOverlay, songId);
    });
    const downloadBtn = popupOverlay.querySelector(".download-btn");
    downloadBtn.addEventListener("click", function () {
      saveDIY(popupOverlay, songId);
      popupOverlay.style.display = "block";
      document.body.style.overflow = "hidden";
      dlSongPPTX(songId);
    });
  });
}

function splitLyrics(songId) {
  const lyrics = document.getElementById(`lyricsInput${songId}`).value.trim();
  const container = document.getElementById(`lyricsContainer${songId}`);
  container.innerHTML = ""; // Clear previous content
  const slidePreviewContainer = document.getElementById(
    `slidePreviewContainer${songId}`
  );
  slidePreviewContainer.innerHTML = "";
  const row = document.createElement("div");
  row.classList.add("row");
  slidePreviewContainer.appendChild(row);
  let paragraphs;

  if (lyrics.includes("\n\n")) {
    // Split by double line breaks
    paragraphs = lyrics.split("\n\n").filter((p) => p.trim() !== "");
  } else {
    // Split into paragraphs every 4 lines
    const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
    paragraphs = [];
    for (let i = 0; i < lines.length; i += 4) {
      paragraphs.push(lines.slice(i, i + 4).join("\n"));
    }
  }

  // Generate cards for each paragraph
  paragraphs.forEach((text, index) => {
    const card = document.createElement("div");
    card.classList.add("card", "mb-2", "draggable", "form-control");
    card.draggable = true;
    card.innerHTML = `
      <div class="card-body">
          <button class="btn btn-sm btn-secondary card-btn" type="button">编辑</button>
          ${text
            .split("\n")
            .map((line) => `<div>${line}</div>`)
            .join("")}
      </div>`;
    card.setAttribute("data-index", index);
    container.appendChild(card);

    card.querySelector(".card-btn").addEventListener("click", (e) => {
      e.target.style.visibility = "hidden";
      card.draggable = false;
      card.setAttribute("contenteditable", true);
      card.style.cursor = "text";
      card.focus();
      card.onblur = () => {
        card.draggable = true;
        card.setAttribute("contenteditable", false);
        card.style.cursor = "grab";
        e.target.style.visibility = "visible";
      };
    });
  });
}

function makeDraggable(songId) {
  const lyricsContainer = document.getElementById(`lyricsContainer${songId}`);
  const slidePreviewContainer = document.getElementById(
    `slidePreviewContainer${songId}`
  );
  let draggedItem = null;
  let sourceContainer = null;
  let dropIndicator = document.createElement("div");
  dropIndicator.classList.add("drop-indicator");

  [lyricsContainer, slidePreviewContainer].forEach((container) => {
    container.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("draggable")) {
        sourceContainer = container;
        if (container === lyricsContainer) {
          // Clone only if dragging from lyrics container
          draggedItem = e.target.cloneNode(true);
          const btn = draggedItem.querySelector(".card-btn");
          if (btn) {
            btn.remove();
          }
          draggedItem.classList.add("dragging");
          // Add slide number div if it doesn't exist
          if (!draggedItem.querySelector(".slide-number")) {
            const slideNumberDiv = document.createElement("div");
            slideNumberDiv.classList.add("slide-number", "text-center", "mt-1");
            draggedItem.appendChild(slideNumberDiv);
          }
        } else {
          draggedItem = e.target;
          draggedItem.classList.add("dragging");
        }
        setTimeout(() => (e.target.style.opacity = "0.3"), 0);
      }
    });

    container.addEventListener("dragend", (e) => {
      if (draggedItem) {
        draggedItem.classList.remove("dragging");
        e.target.style.opacity = "1";
        draggedItem = null;
        sourceContainer = null;
      }
      dropIndicator.style.display = "none";
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const closest = getDragAfterElement(container, e.clientX, e.clientY);
      if (closest.element) {
        const parentCol = closest.element.parentElement;
        if (!parentCol.contains(dropIndicator)) {
          parentCol.appendChild(dropIndicator);
        }
        dropIndicator.style.height = "100%";
        dropIndicator.style.display = "block";
        dropIndicator.style.left = closest.isLeft ? "0px" : "100%";
      } else {
        dropIndicator.style.display = "none";
      }
    });

    if (container === slidePreviewContainer) {
      container.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedItem) {
          const btn = document.createElement("button");
          btn.classList.add("card-btn", "btn", "btn-sm", "btn-danger");
          btn.textContent = "删除";
          btn.type = "button";
          draggedItem.appendChild(btn);
          btn.addEventListener("click", (e) => {
            e.target.parentElement.parentElement.remove();
            updateSlideNumbers(songId);
          });
          if (sourceContainer === lyricsContainer) {
            const colContainer = document.createElement("div");
            colContainer.classList.add("col-4", "mt-2");
            colContainer.style.position = "relative";
            colContainer.appendChild(draggedItem);
          }
          const { element, isLeft } = getDragAfterElement(
            container,
            e.clientX,
            e.clientY
          );
          if (element) {
            const parentCol = element.parentElement;
            if (isLeft) {
              parentCol.parentNode.insertBefore(
                draggedItem.parentElement,
                parentCol
              );
            } else {
              parentCol.parentNode.insertBefore(
                draggedItem.parentElement,
                parentCol.nextSibling
              );
            }
          } else {
            container.firstElementChild.appendChild(draggedItem.parentElement);
          }
        }
        updateSlideNumbers(songId);
      });
    }
  });

  function getDragAfterElement(container, x, y) {
    const draggableElements = [
      ...container.querySelectorAll(".card:not(.dragging)"),
    ];

    let closestElement = null;
    let isLeft = false;
    let minDistance = Number.POSITIVE_INFINITY;

    draggableElements.forEach((child) => {
      const box = child.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy); // Use Pythagorean theorem

      if (distance < minDistance) {
        minDistance = distance;
        closestElement = child;
        isLeft = x < centerX; // Check if mouse is on the left or right
      }
    });

    // Check if the mouse is beyond the last element
    const last3Element = draggableElements[draggableElements.length - 3];
    if (last3Element) {
      const last3Box = last3Element.getBoundingClientRect();
      if (y > last3Box.bottom) {
        if (x < last3Box.left) {
          return { element: closestElement, isLeft };
        }
        return { element: null, isLeft: false }; // Indicate to add at the end
      }
    }

    return { element: closestElement, isLeft };
  }
}

function updateSlideNumbers(songId) {
  const slidePreviewContainer = document.getElementById(
    `slidePreviewContainer${songId}`
  );
  const slides = slidePreviewContainer.querySelectorAll(".draggable");
  slides.forEach((slide, index) => {
    let slideNumber = slide.querySelector(".slide-number");
    if (!slideNumber) {
      slideNumber = document.createElement("div");
      slideNumber.classList.add("slide-number", "text-center", "mt-1");
      slide.appendChild(slideNumber);
    }
    slideNumber.textContent = `${index + 1}`;
  });
}

function showConfirmationDialog(songId, popupOverlay, onConfirm, onDiscard) {
  const handleClick = (e) => {
    const target = e.target;
    if (target.classList.contains("save-btn")) {
      saveDIY(popupOverlay, songId);
      onConfirm();
    } else if (target.classList.contains("discard-btn")) {
      if (onDiscard) onDiscard();
      onConfirm();
    }
    if (
      target.classList.contains("save-btn") ||
      target.classList.contains("discard-btn") ||
      target.classList.contains("cancel-btn")
    ) {
      confirmDialog.style.display = "none";
    }
  };
  // Create confirmation dialog if it doesn't exist
  const dialogId = "confirm-dialog-overlay";
  const dialogText = "你想要保存更改吗";
  const buttonCount = 3;
  const confirmDialog = createDialog(dialogId, dialogText, buttonCount);
  if (confirmDialog) {
    const buttons = confirmDialog.querySelectorAll(".btn");
    buttons[0].classList.add("btn-secondary", "discard-btn");
    buttons[0].textContent = "放弃更改";
    buttons[1].classList.add("btn-success", "save-btn");
    buttons[1].textContent = "保存";
    buttons[2].classList.add("btn-primary", "cancel-btn");
    buttons[2].textContent = "继续";

    // Show dialog and handle button clicks
    confirmDialog.style.display = "flex";
    confirmDialog.addEventListener("click", handleClick);
  }
}

function saveDIY(popupOverlay, songId) {
  // Save initial state when popup opens
  const saveInitialState = (slidePreviewContainer) => {
    const pages = slidePreviewContainer.querySelectorAll(".card-body");
    const state = Array.from(pages).map((page) =>
      Array.from(page.querySelectorAll("div"))
        .map((div) => div.textContent)
        .join("\n")
    );
    savedStates.set(songId, state);
  };
  const slidePreviewContainer = document.getElementById(
    `slidePreviewContainer${songId}`
  );
  const pages = slidePreviewContainer.querySelectorAll(".card-body");
  let contentLst = [];
  pages.forEach((page) => {
    let originalText = Array.from(page.querySelectorAll("div"))
      .map((div) => div.textContent)
      .join("\n");
    contentLst.push(originalText);
  });
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  formData[`${songId}Pages`] = contentLst;
  localStorage.setItem("formData", JSON.stringify(formData));
  popupOverlay.style.display = "none";
  document.body.style.overflow = "auto";
  const DIYbtn = document.getElementById(`DIYBtn${songId}`);
  DIYbtn.textContent = "查看歌词";
  DIYbtn.classList.remove("btn-primary");
  DIYbtn.classList.add("btn-secondary");
  saveInitialState(slidePreviewContainer);
}

function createDialog(id, text, buttonCount) {
  let dialog = document.getElementById(id);
  if (!dialog) {
    dialog = document.createElement("div");
    dialog.className = "overlay";
    dialog.id = id;

    // Create the dialog container
    const dialogBox = document.createElement("div");
    dialogBox.className = "confirm-dialog";

    // Create the text element
    const message = document.createElement("p");
    message.textContent = text;
    dialogBox.appendChild(message);

    // Create the buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "confirm-buttons";

    // Generate buttons based on count
    for (let i = 0; i < buttonCount; i++) {
      const button = document.createElement("button");
      button.className = "btn";
      buttonsContainer.appendChild(button);
    }

    dialogBox.appendChild(buttonsContainer);
    dialog.appendChild(dialogBox);
    document.getElementById("dialogs-container").appendChild(dialog);
  }
  return dialog;
}
