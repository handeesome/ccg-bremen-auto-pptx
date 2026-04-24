import { createAlertDialog } from "./popup.js";

const t2sConverter = OpenCC.Converter({ from: "tw", to: "cn" });
const DRAFT_STORAGE_KEY = "songDIYDraft";

const songNameInput = document.getElementById("song-name-input");
const songSlotLabel = document.getElementById("song-slot-label");
const lyricsInput = document.getElementById("lyrics-input");
const generateButton = document.getElementById("generate-lyrics-btn");
const saveButton = document.getElementById("save-diy-btn");
const downloadButton = document.getElementById("download-diy-btn");
const lyricsContainer = document.getElementById("lyricsContainer");
const slidePreviewContainer = document.getElementById("slidePreviewContainer");

let savedState = [];

initialize();

function initialize() {
  songSlotLabel.textContent = "独立工具：用于制作单首诗歌 PPTX";

  const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
  songNameInput.value = draft.songName || "";
  lyricsInput.value = draft.lyrics || "";

  const pages = draft.pages;
  if (Array.isArray(pages) && pages.length) {
    renderSourceCards(lyricsInput.value);
    renderPreviewCards(pages);
    savedState = [...pages];
    saveButton.disabled = false;
    downloadButton.disabled = false;
  }
}

generateButton.addEventListener("click", () => {
  renderSourceCards(lyricsInput.value);
  clearPreview();
  saveButton.disabled = false;
  downloadButton.disabled = false;
});

saveButton.addEventListener("click", () => {
  saveDIY();
  createAlertDialog("song-diy-save-success", "歌词已保存");
});

downloadButton.addEventListener("click", async () => {
  saveDIY();
  try {
    const payload = {
      songName: songNameInput.value.trim(),
      pages: collectPreviewPages(),
    };
    const response = await fetch("/submit-song", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to generate song PPTX");
    }
    window.location.href = "/download/" + data.fileName;
  } catch (error) {
    createAlertDialog("song-diy-download-error", error.message);
  }
});

function renderSourceCards(rawLyrics) {
  const simplifiedLyrics = t2sConverter((rawLyrics || "").trim());
  lyricsContainer.innerHTML = "";
  slidePreviewContainer.innerHTML = "";

  if (!simplifiedLyrics) {
    return;
  }

  const paragraphs = splitLyricsIntoParagraphs(simplifiedLyrics);
  paragraphs.forEach((text, index) => {
    const card = document.createElement("div");
    card.classList.add("card", "mb-2", "draggable", "form-control");
    card.draggable = true;
    card.dataset.index = String(index);
    card.innerHTML = `
      <div class="card-body text-center">
        <button class="btn btn-sm btn-secondary card-btn" type="button">编辑</button>
        ${text
          .split("\n")
          .map((line) => `<div>${escapeHtml(line)}</div>`)
          .join("")}
      </div>`;
    lyricsContainer.appendChild(card);

    card.querySelector(".card-btn").addEventListener("click", (event) => {
      event.target.style.visibility = "hidden";
      card.draggable = false;
      card.setAttribute("contenteditable", true);
      card.focus();
      card.onblur = () => {
        card.draggable = true;
        card.removeAttribute("contenteditable");
        event.target.style.visibility = "visible";
      };
    });
  });

  makeDraggable();
}

function renderPreviewCards(pages) {
  clearPreview();
  const row = document.createElement("div");
  row.classList.add("row");
  slidePreviewContainer.appendChild(row);

  pages.forEach((text) => {
    const colContainer = document.createElement("div");
    colContainer.classList.add("col-12", "col-md-6", "mt-2");
    colContainer.style.position = "relative";

    const card = document.createElement("div");
    card.classList.add("card", "mb-2", "draggable", "form-control");
    card.draggable = true;
    card.innerHTML = `
      <div class="card-body text-center">
        <button class="card-btn btn btn-sm btn-danger" type="button">删除</button>
        ${text
          .split("\n")
          .map((line) => `<div>${escapeHtml(line)}</div>`)
          .join("")}
      </div>`;
    colContainer.appendChild(card);
    row.appendChild(colContainer);

    card.querySelector(".card-btn").addEventListener("click", (event) => {
      event.target.closest(".col-12, .col-md-6").remove();
      updateSlideNumbers();
    });
  });

  updateSlideNumbers();
  makeDraggable();
}

function clearPreview() {
  slidePreviewContainer.innerHTML = '<div class="row"></div>';
}

function splitLyricsIntoParagraphs(lyrics) {
  if (lyrics.includes("\n\n")) {
    return lyrics.split("\n\n").filter((paragraph) => paragraph.trim() !== "");
  }

  const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
  const paragraphs = [];
  for (let index = 0; index < lines.length; index += 4) {
    paragraphs.push(lines.slice(index, index + 4).join("\n"));
  }
  return paragraphs;
}

function makeDraggable() {
  const containers = [lyricsContainer, slidePreviewContainer];
  let draggedItem = null;
  let sourceContainer = null;

  containers.forEach((container) => {
    container.addEventListener("dragstart", (event) => {
      const target = event.target.closest(".draggable");
      if (!target) return;
      sourceContainer = container;
      draggedItem =
        container === lyricsContainer ? target.cloneNode(true) : target;
      draggedItem.classList.add("dragging");
      setTimeout(() => {
        target.style.opacity = "0.3";
      }, 0);
    });

    container.addEventListener("dragend", (event) => {
      const target = event.target.closest(".draggable");
      if (target) {
        target.style.opacity = "1";
      }
      if (draggedItem) {
        draggedItem.classList.remove("dragging");
      }
      draggedItem = null;
      sourceContainer = null;
    });
  });

  slidePreviewContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  slidePreviewContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!draggedItem) return;

    const row = slidePreviewContainer.querySelector(".row");
    const sourceCard = sourceContainer === lyricsContainer ? draggedItem : null;

    if (sourceCard) {
      sourceCard.querySelector(".card-btn")?.remove();
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("card-btn", "btn", "btn-sm", "btn-danger");
      deleteButton.type = "button";
      deleteButton.textContent = "删除";
      deleteButton.addEventListener("click", (e) => {
        e.target.closest(".col-12, .col-md-6").remove();
        updateSlideNumbers();
      });
      sourceCard.querySelector(".card-body").prepend(deleteButton);

      const colContainer = document.createElement("div");
      colContainer.classList.add("col-12", "col-md-6", "mt-2");
      colContainer.style.position = "relative";
      colContainer.appendChild(sourceCard);
      row.appendChild(colContainer);
    } else {
      const existingCol = draggedItem.closest(".col-12, .col-md-6");
      row.appendChild(existingCol);
    }

    updateSlideNumbers();
  });
}

function updateSlideNumbers() {
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

function collectPreviewPages() {
  return Array.from(slidePreviewContainer.querySelectorAll(".card-body"))
    .map((page) =>
      Array.from(page.querySelectorAll("div"))
        .map((div) => div.textContent)
        .join("\n"),
    )
    .filter(Boolean);
}

function saveDIY() {
  const pages = collectPreviewPages();
  const lyrics = lyricsInput.value;
  const songName = songNameInput.value.trim();
  localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      songName,
      lyrics,
      pages,
    }),
  );
  savedState = [...pages];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
