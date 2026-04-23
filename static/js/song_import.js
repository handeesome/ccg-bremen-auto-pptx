const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const pickFilesButton = document.getElementById("pick-files");
const exportButton = document.getElementById("export-btn");
const clearButton = document.getElementById("clear-btn");
const statusText = document.getElementById("status-text");
const selectedFileList = document.getElementById("selected-file-list");
const previewList = document.getElementById("preview-list");

let selectedFiles = [];

pickFilesButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  selectedFiles = Array.from(event.target.files || []);
  refreshSelectionState();
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
  const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
    /\.pptx$/i.test(file.name)
  );
  selectedFiles = files;
  refreshSelectionState();
});

clearButton.addEventListener("click", () => {
  selectedFiles = [];
  fileInput.value = "";
  refreshSelectionState();
});

exportButton.addEventListener("click", async () => {
  if (!selectedFiles.length) {
    return;
  }

  const extractFormData = buildUploadFormData();

  setBusyState("正在读取并导出 PPTX...");
  previewList.innerHTML = "";

  try {
    const extractResponse = await fetch("/api/song-import/extract", {
      method: "POST",
      body: extractFormData,
    });
    const extractData = await extractResponse.json();
    if (!extractResponse.ok) {
      throw new Error(extractData.error || "读取失败");
    }

    renderPreviews(extractData.files || []);

    const response = await fetch("/api/song-import/convert", {
      method: "POST",
      body: buildUploadFormData(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "导出失败");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const filename = parseDownloadFilename(disposition) || "converted-song-pptx.zip";
    downloadBlob(blob, filename);
    statusText.textContent = "导出完成。";
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    exportButton.disabled = selectedFiles.length === 0;
  }
});

function refreshSelectionState() {
  previewList.innerHTML = "";
  renderSelectedFiles();
  exportButton.disabled = selectedFiles.length === 0;
  clearButton.disabled = selectedFiles.length === 0;
  statusText.textContent = selectedFiles.length
    ? `已选择 ${selectedFiles.length} 个文件，点击“导出并下载PPTX”。`
    : "等待上传文件";
}

function buildUploadFormData() {
  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file));
  return formData;
}

function renderSelectedFiles() {
  if (!selectedFiles.length) {
    selectedFileList.innerHTML =
      '<div class="selected-file-empty text-muted">还没有添加文件</div>';
    return;
  }

  selectedFileList.innerHTML = selectedFiles
    .map(
      (file, index) => `
        <div class="selected-file-item d-flex justify-content-between align-items-center gap-3">
          <span>${escapeHtml(file.name)}</span>
          <span class="text-muted small">${index + 1}</span>
        </div>
      `
    )
    .join("");
}

function renderPreviews(files) {
  previewList.innerHTML = "";

  files.forEach((file) => {
    const card = document.createElement("section");
    card.className = "preview-card";

    const slidesMarkup = file.slides
      .map((slide) => {
        const text = slide.text || "这一页没有读取到文字";
        return `
          <div class="slide-block">
            <div class="fw-bold mb-2">Slide ${slide.number}</div>
            <pre>${escapeHtml(text)}</pre>
          </div>
        `;
      })
      .join("");

    card.innerHTML = `
      <div class="preview-header">
        <div>
          <div class="fw-bold">${escapeHtml(file.originalName)}</div>
          <div class="text-muted">共 ${file.slides.length} 页</div>
        </div>
      </div>
      <div class="preview-body">${slidesMarkup}</div>
    `;

    previewList.appendChild(card);
  });
}

function setBusyState(message) {
  statusText.textContent = message;
  exportButton.disabled = true;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseDownloadFilename(disposition) {
  const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch (error) {
      console.error("Failed to decode filename*:", error);
    }
  }

  const basicMatch = disposition.match(/filename\s*=\s*"([^"]+)"/i);
  if (basicMatch) {
    return basicMatch[1];
  }

  const unquotedMatch = disposition.match(/filename\s*=\s*([^;]+)/i);
  if (unquotedMatch) {
    return unquotedMatch[1].trim();
  }

  return null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
