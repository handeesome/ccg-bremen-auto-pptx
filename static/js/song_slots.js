import { createAlertDialog } from "./popup.js";

const SONG_SLOTS = [
  { id: "song1", label: "第一首诗歌" },
  { id: "song2", label: "第二首诗歌" },
  { id: "song3", label: "第三首诗歌" },
  { id: "song4", label: "回应诗歌" },
];

let slotAssignments = SONG_SLOTS.map(() => null);
let uiReady = false;
let draggedSlotIndex = null;

function getFormData() {
  return JSON.parse(localStorage.getItem("formData")) || {};
}

function saveFormData(formData) {
  localStorage.setItem("formData", JSON.stringify(formData));
}

function renderSlotStates() {
  SONG_SLOTS.forEach((slot, index) => {
    const row = document.getElementById(`${slot.id}-slot-row`);
    const container = document.getElementById(`${slot.id}-import-state`);
    if (!row || !container) return;
    const assignment = slotAssignments[index];

    if (assignment) {
      row.classList.add("filled");
      container.innerHTML = `
        <div class="song-slot-card" draggable="true" data-slot-index="${index}">
          <button type="button" class="song-slot-card-close" data-slot-index="${index}" aria-label="移除">×</button>
          <div class="song-slot-card-main">
            <span class="song-slot-card-title">${escapeHtml(assignment.title)}</span>
            ${assignment.audioPath ? '<span class="song-slot-audio-badge">含音频</span>' : ""}
          </div>
        </div>
      `;
    } else {
      row.classList.remove("filled");
      container.innerHTML = '<div class="song-slot-empty"></div>';
    }
  });

  document.querySelectorAll(".song-slot-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      draggedSlotIndex = Number(event.currentTarget.dataset.slotIndex);
      event.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      draggedSlotIndex = null;
      document.querySelectorAll(".song-slot-row").forEach((row) => {
        row.classList.remove("drag-target");
      });
    });
  });

  document.querySelectorAll(".song-slot-card-close").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      clearSlot(Number(event.currentTarget.dataset.slotIndex));
    });
  });
}

function applyAssignmentsToFormData() {
  const formData = getFormData();
  const previousImportSlotIds = new Set(
    (Array.isArray(formData.songImports) ? formData.songImports : []).map(
      (item) => item.slotId,
    ),
  );

  SONG_SLOTS.forEach((slot, index) => {
    const assignment = slotAssignments[index];
    const input = document.getElementById(`${slot.id}Input`);
    const diyBtn = document.getElementById(`DIYBtn${slot.id}`);

    if (assignment) {
      formData[slot.id] = assignment.title;
      formData[`${slot.id}Pages`] = [...assignment.pages];
      formData[`${slot.id}Lyrics`] = assignment.pages.join("\n\n");
      formData[`${slot.id}AudioPath`] = assignment.audioPath || null;
      formData[`${slot.id}ImportFileName`] = assignment.originalName;
      if (input) {
        input.value = assignment.title;
      }
      if (diyBtn) {
        diyBtn.textContent = "自己制作 / 覆盖";
      }
    } else {
      if (previousImportSlotIds.has(slot.id)) {
        delete formData[slot.id];
        delete formData[`${slot.id}Pages`];
        delete formData[`${slot.id}Lyrics`];
      }
      delete formData[`${slot.id}AudioPath`];
      delete formData[`${slot.id}ImportFileName`];
    }
  });

  formData.songImports = slotAssignments
    .map((assignment, index) =>
      assignment
        ? {
            slotId: SONG_SLOTS[index].id,
            ...assignment,
          }
        : null,
    )
    .filter(Boolean);

  saveFormData(formData);
  renderSlotStates();
}

function assignImportedFiles(importedFiles) {
  let assignedCount = 0;

  importedFiles.forEach((file) => {
    const emptyIndex = slotAssignments.findIndex((slot) => slot === null);
    if (emptyIndex === -1) {
      return;
    }

    slotAssignments[emptyIndex] = {
      title: file.suggestedTitle,
      originalName: file.originalName,
      pages: file.pages || [],
      audioPath: file.audioPath || null,
    };
    assignedCount += 1;
  });

  applyAssignmentsToFormData();

  if (assignedCount < importedFiles.length) {
    createAlertDialog(
      "song-slot-cap-dialog",
      "最多只能导入 4 个诗歌 PPTX，多余的文件已忽略。"
    );
  }
}

async function importSongFiles(files) {
  const validFiles = Array.from(files || []).filter((file) => /\.pptx$/i.test(file.name));
  if (!validFiles.length) {
    createAlertDialog("song-slot-invalid-dialog", "请选择 .pptx 文件。");
    return;
  }

  const formData = new FormData();
  validFiles.slice(0, 4).forEach((file) => formData.append("files", file));

  const status = document.getElementById("song-slot-upload-status");
  if (status) {
    status.textContent = "正在导入诗歌 PPTX...";
  }

  try {
    const response = await fetch("/api/song-slots/import", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "导入诗歌 PPTX 失败");
    }

    assignImportedFiles(data.files || []);
    if (status) {
      status.textContent = `已导入 ${(data.files || []).length} 个诗歌 PPTX，可继续调整顺序。`;
    }
  } catch (error) {
    console.error("Song slot import failed:", error);
    if (status) {
      status.textContent = error.message;
    }
    createAlertDialog("song-slot-import-error", error.message);
  }
}

function moveSlot(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= SONG_SLOTS.length) return;
  const nextAssignments = [...slotAssignments];
  [nextAssignments[fromIndex], nextAssignments[toIndex]] = [
    nextAssignments[toIndex],
    nextAssignments[fromIndex],
  ];
  slotAssignments = nextAssignments;
  applyAssignmentsToFormData();
}

function moveDraggedCardToSlot(targetIndex) {
  if (draggedSlotIndex === null || draggedSlotIndex === targetIndex) return;
  moveSlot(draggedSlotIndex, targetIndex);
}

function clearSlot(index) {
  const slotId = SONG_SLOTS[index].id;
  slotAssignments[index] = null;
  const formData = getFormData();
  delete formData[slotId];
  delete formData[`${slotId}Pages`];
  delete formData[`${slotId}Lyrics`];
  delete formData[`${slotId}AudioPath`];
  delete formData[`${slotId}ImportFileName`];
  formData.songImports = slotAssignments
    .map((assignment, currentIndex) =>
      assignment
        ? {
            slotId: SONG_SLOTS[currentIndex].id,
            ...assignment,
          }
        : null,
    )
    .filter(Boolean);
  saveFormData(formData);

  const input = document.getElementById(`${slotId}Input`);
  if (input) {
    input.value = "";
  }
  const diyBtn = document.getElementById(`DIYBtn${slotId}`);
  if (diyBtn) {
    diyBtn.textContent = "自己制作";
  }
  renderSlotStates();
}

function restoreFromLocalStorage() {
  const formData = getFormData();
  const imports = Array.isArray(formData.songImports) ? formData.songImports : [];
  slotAssignments = SONG_SLOTS.map((slot) => {
    const saved = imports.find((item) => item.slotId === slot.id);
    if (!saved) {
      return null;
    }
    return {
      title: saved.title,
      originalName: saved.originalName,
      pages: Array.isArray(saved.pages) ? saved.pages : [],
      audioPath: saved.audioPath || null,
    };
  });
  applyAssignmentsToFormData();
}

export function initSongSlotImport() {
  if (uiReady) return;
  uiReady = true;

  const songSection = document.getElementById("song1").parentElement;
  const songInputs = SONG_SLOTS.map((slot) => document.getElementById(slot.id));
  const layout = document.createElement("div");
  layout.className = "song-upload-layout row g-4 align-items-start w-100";
  layout.innerHTML = `
    <div class="col-12 col-lg-6 d-flex align-items-center">
      <div id="song-input-column">
        <div class="alert alert-warning small mb-3" role="alert">
          Google Drive 功能 Coming Up!
        </div>
        <div class="alert alert-info small mb-3" role="alert">
          可以不上传 PPTX，只填写诗歌名。这样生成的总 PPTX 会保留诗歌标题，歌词部分留给你们之后自己补上。
        </div>
      </div>
    </div>
    <div class="col-12 col-lg-6">
      <div class="song-slot-import card h-100">
        <div class="card-body">
          <div class="fw-bold">导入诗歌 PPTX</div>
          <div class="text-muted small">上传后右侧会按四个固定位置显示。拖动卡片即可调整到 第一首 / 第二首 / 第三首 / 回应诗歌。</div>
          <div class="d-flex gap-2 mt-3">
            <input id="song-slot-file-input" type="file" accept=".pptx" multiple hidden />
            <button type="button" class="btn btn-outline-primary" id="song-slot-pick-btn">选择本地 PPTX</button>
          </div>
          <div id="song-slot-dropzone" class="song-slot-dropzone mt-3">
            把诗歌 PPTX 拖到这里
          </div>
          <div id="song-slot-upload-status" class="small text-muted mt-2">暂未导入诗歌 PPTX</div>
          <div class="song-slot-grid mt-3" id="song-slot-grid"></div>
        </div>
      </div>
    </div>
  `;
  songSection.appendChild(layout);

  const inputColumn = document.getElementById("song-input-column");
  songInputs.forEach((node) => inputColumn.appendChild(node));

  const slotGrid = document.getElementById("song-slot-grid");
  SONG_SLOTS.forEach((slot) => {
    slotGrid.insertAdjacentHTML(
      "beforeend",
      `
        <div class="song-slot-row" id="${slot.id}-slot-row" data-slot-id="${slot.id}">
          <div class="song-slot-row-label">${slot.label}</div>
          <div id="${slot.id}-import-state" class="song-slot-drop-cell"></div>
        </div>
      `,
    );
  });

  SONG_SLOTS.forEach((slot, index) => {
    const row = document.getElementById(`${slot.id}-slot-row`);
    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      row.classList.add("drag-target");
    });
    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-target");
    });
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("drag-target");
      moveDraggedCardToSlot(index);
    });
  });

  const fileInput = document.getElementById("song-slot-file-input");
  const pickButton = document.getElementById("song-slot-pick-btn");
  const dropzone = document.getElementById("song-slot-dropzone");

  pickButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (event) => {
    importSongFiles(event.target.files);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("active");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    importSongFiles(event.dataTransfer?.files || []);
  });

  SONG_SLOTS.forEach((slot, index) => {
    const input = document.getElementById(`${slot.id}Input`);
    input.addEventListener("change", () => {
      if (!slotAssignments[index]) return;
      slotAssignments[index] = {
        ...slotAssignments[index],
        title: input.value.trim() || slotAssignments[index].title,
      };
      applyAssignmentsToFormData();
    });
  });

  renderSlotStates();
}

export function restoreImportedSongSlots() {
  if (!uiReady) return;
  restoreFromLocalStorage();
}

export function clearImportedSongSlots() {
  if (!uiReady) return;
  slotAssignments = SONG_SLOTS.map(() => null);
  applyAssignmentsToFormData();
  const status = document.getElementById("song-slot-upload-status");
  if (status) {
    status.textContent = "暂未导入诗歌 PPTX";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
