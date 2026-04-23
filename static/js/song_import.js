const CHUNK_SIZE = 25;

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const pickFilesButton = document.getElementById("pick-files");
const exportButton = document.getElementById("export-btn");
const clearButton = document.getElementById("clear-btn");
const statusText = document.getElementById("status-text");
const selectedFileList = document.getElementById("selected-file-list");
const resultList = document.getElementById("result-list");
const summaryCount = document.getElementById("summary-count");
const summaryProgress = document.getElementById("summary-progress");
const progressBar = document.getElementById("batch-progress-bar");

let selectedFiles = [];
let isProcessing = false;

pickFilesButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  const incomingFiles = Array.from(event.target.files || []);
  appendFiles(incomingFiles);
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
  const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
    /\.pptx$/i.test(file.name)
  );
  appendFiles(files);
});

clearButton.addEventListener("click", () => {
  selectedFiles = [];
  fileInput.value = "";
  resultList.innerHTML =
    '<div class="selected-file-empty text-muted">处理开始后会在这里显示结果</div>';
  updateProgress(0, 0);
  refreshSelectionState();
});

exportButton.addEventListener("click", async () => {
  if (!selectedFiles.length || isProcessing) {
    return;
  }

  isProcessing = true;
  exportButton.disabled = true;
  clearButton.disabled = true;
  resultList.innerHTML = "";
  updateProgress(0, selectedFiles.length);
  statusText.textContent = `准备按每批 ${CHUNK_SIZE} 个文件开始处理...`;

  try {
    const batchId = await createBatch();
    let processedTotal = 0;
    let failureTotal = 0;

    for (let index = 0; index < selectedFiles.length; index += CHUNK_SIZE) {
      const chunkFiles = selectedFiles.slice(index, index + CHUNK_SIZE);
      const chunkNumber = Math.floor(index / CHUNK_SIZE) + 1;
      const chunkTotal = Math.ceil(selectedFiles.length / CHUNK_SIZE);

      statusText.textContent = `正在处理第 ${chunkNumber}/${chunkTotal} 批，共 ${chunkFiles.length} 个文件...`;
      const chunkResult = await processChunk(batchId, chunkFiles);

      processedTotal += chunkResult.processedCount;
      failureTotal += chunkResult.failedCount;
      updateProgress(index + chunkFiles.length, selectedFiles.length);
      renderResultChunk(chunkResult, chunkNumber);
    }

    statusText.textContent = `转换完成，成功 ${processedTotal} 个，失败 ${failureTotal} 个，正在打包下载...`;
    await finalizeBatch(batchId);
    statusText.textContent = `批量导出完成。成功 ${processedTotal} 个，失败 ${failureTotal} 个。`;
  } catch (error) {
    statusText.textContent = error.message || "批量处理失败";
  } finally {
    isProcessing = false;
    refreshSelectionState();
  }
});

function appendFiles(files) {
  const validFiles = files.filter((file) => /\.pptx$/i.test(file.name));
  if (!validFiles.length) {
    refreshSelectionState();
    return;
  }

  const existingKeys = new Set(
    selectedFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
  );

  validFiles.forEach((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (!existingKeys.has(key)) {
      selectedFiles.push(file);
      existingKeys.add(key);
    }
  });

  refreshSelectionState();
}

function refreshSelectionState() {
  renderSelectedFiles();
  summaryCount.textContent = String(selectedFiles.length);
  exportButton.disabled = selectedFiles.length === 0 || isProcessing;
  clearButton.disabled = selectedFiles.length === 0 || isProcessing;
  if (!isProcessing) {
    statusText.textContent = selectedFiles.length
      ? `已加入 ${selectedFiles.length} 个文件。页面会自动按批次处理，每批 ${CHUNK_SIZE} 个。`
      : "等待上传文件";
  }
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
          <div>
            <div>${escapeHtml(file.name)}</div>
            <div class="text-muted small">${formatFileSize(file.size)}</div>
          </div>
          <span class="text-muted small">${index + 1}</span>
        </div>
      `
    )
    .join("");
}

async function createBatch() {
  const response = await fetch("/api/song-import/batch-start", {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "无法创建批处理任务");
  }
  return data.batchId;
}

async function processChunk(batchId, files) {
  const formData = new FormData();
  formData.append("batchId", batchId);
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/song-import/batch-chunk", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "批处理分块失败");
  }
  return data;
}

async function finalizeBatch(batchId) {
  const response = await fetch("/api/song-import/batch-finalize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ batchId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "打包下载失败");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const filename = parseDownloadFilename(disposition) || "converted-song-pptx.zip";
  downloadBlob(blob, filename);
}

function renderResultChunk(result, chunkNumber) {
  const processedMarkup = (result.processed || [])
    .map(
      (item) => `
        <div class="result-item success">
          <div class="fw-bold">${escapeHtml(item.name)}</div>
          <div class="small text-muted">
            已导出为 ${escapeHtml(item.outputName)} · ${item.slideCount} 页${
              item.audioCopied ? " · 已复制音频" : ""
            }
          </div>
        </div>
      `
    )
    .join("");

  const failedMarkup = (result.failed || [])
    .map(
      (item) => `
        <div class="result-item failure">
          <div class="fw-bold">${escapeHtml(item.name)}</div>
          <div class="small text-danger">${escapeHtml(item.error)}</div>
        </div>
      `
    )
    .join("");

  const section = document.createElement("section");
  section.className = "preview-card";
  section.innerHTML = `
    <div class="preview-header">
      <div>
        <div class="fw-bold">批次 ${chunkNumber}</div>
        <div class="text-muted">成功 ${result.processedCount} 个，失败 ${result.failedCount} 个</div>
      </div>
    </div>
    <div class="preview-body">
      ${processedMarkup || '<div class="selected-file-empty text-muted">本批次没有成功文件</div>'}
      ${failedMarkup}
    </div>
  `;

  resultList.appendChild(section);
}

function updateProgress(done, total) {
  const safeTotal = total || 0;
  const percent = safeTotal === 0 ? 0 : Math.round((done / safeTotal) * 100);
  progressBar.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));
  summaryProgress.textContent = `${done} / ${safeTotal}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
