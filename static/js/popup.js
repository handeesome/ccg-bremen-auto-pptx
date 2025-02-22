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
