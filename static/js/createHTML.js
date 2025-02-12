import {
  generateSuffixDropdown,
  updateBibleDropdowns,
  formatVerse,
} from "./dropdown.js";

export function createWeekList(weekListId) {
  const roles = [
    { id: "zhengDao", label: "证道" },
    { id: "siHui", label: "司会" },
    { id: "ppt", label: "PPT\u2005" },
    { id: "jieDai", label: "接待" },
    { id: "erTong", label: "儿童" },
  ];
  let weekList = document.getElementById(weekListId);
  roles.forEach((role) => {
    weekList.innerHTML += `
          <div class="row align-items-center mb-3">
            <div class="col-auto">
              <label class="form-label">${role.label}:</label>
            </div>
            <div class="col-4">
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-input" id="${
                  weekListId + role.id
                }" />
                <select class="form-select form-select-suffix" id="suffix${
                  weekListId + role.id
                }" ></select>
              </div>
            </div>
          </div>
        `;
    generateSuffixDropdown(
      `suffix${weekListId + role.id}`,
      `suffix${weekListId + role.id}`.includes("zhengDao")
    );
  });
}

export function createBibleDropdownSet(containerId, prefix, labelText) {
  let container = document.getElementById(containerId);

  let html = `
    <div class="row align-items-center mb-3" id="dropdownSet-${prefix}">
      <!-- Label & TextBox -->
      <div class="col-auto">
        <label class="form-label" for="${prefix}">${labelText}</label>
      </div>

      <!-- Dropdowns -->
      <div class="col-4">
        <div class="d-flex gap-2 align-items-center">
          <select class="form-select" id="${prefix}DropdownBook"></select>
          <select class="form-select" id="${prefix}DropdownChap" style="display: none"></select>
          <select class="form-select" id="${prefix}DropdownVerseFrom" style="display: none"></select>
          <span id="${prefix}TextBetween" style="display: none;">至</span>
          <select class="form-select" id="${prefix}DropdownVerseTo" style="display: none"></select>
          <button class="btn btn-primary" type="button" id="${prefix}Button"> + </button>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", html);

  // Get new elements
  let newRow = document.getElementById(`dropdownSet-${prefix}`);
  let button = newRow.querySelector("button");

  // Set button event to add a new dropdown row
  button.onclick = function () {
    let existingSets = document.querySelectorAll(`#${containerId} .row`).length;
    let newPrefix = `${prefix}-${existingSets}`;
    let newRow = createBibleDropdownSet(containerId, newPrefix, labelText);
    newRow.querySelector("label").textContent = "\u3000\u3000\u2005";

    let newButton = newRow.querySelector("button");
    newButton.textContent = " − ";
    newButton.className = "btn btn-danger";
    newButton.onclick = function () {
      newRow.remove();

      let dropdowns = newRow.querySelectorAll("select");
      let verse = {
        book: dropdowns[0].value,
        chapter: dropdowns[1].value,
        verseFrom: dropdowns[2].value,
        verseTo: dropdowns[3].value,
      };
      let toRemove = formatVerse(verse);
      let verseData = JSON.parse(localStorage.getItem("verseData"));
      let indexToRemove = verseData[prefix].findIndex(
        (item) => item.fullVerse === toRemove
      );
      verseData[prefix].splice(indexToRemove, 1); // Remove the element at found index
      localStorage.setItem("verseData", JSON.stringify(verseData));
    };
  };

  // Initialize dropdowns
  updateBibleDropdowns(
    prefix,
    newRow.querySelector(`#${prefix}DropdownBook`),
    newRow.querySelector(`#${prefix}DropdownChap`),
    newRow.querySelector(`#${prefix}DropdownVerseFrom`),
    newRow.querySelector(`#${prefix}DropdownVerseTo`),
    newRow.querySelector(`#${prefix}TextBetween`),
    newRow.querySelector(`#${prefix}TextBox`)
  );

  return newRow;
}

export function createInput(containerId, type, labelText) {
  let container = document.getElementById(containerId);
  let html = `
    <div class="row align-items-center mb-3">
      <div class="col-auto" id=${containerId}Label>
        <label class="form-label">${labelText}</label>
      </div>
      <div class="col-3">
        <input type=${type} id="${containerId}Input"/>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);

  if (type === "text") {
    let input = document.getElementById(`${containerId}Input`);
    input.className = "form-control";
  }
  if (containerId.includes("song")) {
    let label = document.getElementById(`${containerId}Label`);
    label.className += " song-container";
  }
}

export function createRadio(
  containerId,
  numberOfOptions,
  content,
  contentTitle = null
) {
  let container = document.getElementById(containerId);
  let width = Number.isInteger(12 / numberOfOptions)
    ? `${12 / numberOfOptions}`
    : "auto";
  let html = `
    <div class="col-md-${width}">
      <label class="w-100">
        <input
          type="radio"
          id="${containerId + contentTitle}Radio"
          name="${containerId}Radio"
          class="d-none" 
          checked/>
        <div class="card p-3">
          <blockquote class="blockquote mb-0" id="${
            containerId + contentTitle
          }Blockquote">
            <p>
              ${content}
            </p>
          </blockquote>
        </div>
      </label>
    </div>
  `;
  container.insertAdjacentHTML("afterbegin", html);
  let blockquote = document.getElementById(
    `${containerId + contentTitle}Blockquote`
  );
  if (containerId.includes("verse")) {
    let footer = `
      <footer class="blockquote-footer text-end">
        ${contentTitle}
      </footer>
    `;
    blockquote.insertAdjacentHTML("beforeend", footer);
  }
  if (containerId.includes("lyrics")) {
    blockquote.innerHTML = "";
    blockquote.style = "text-align: center;max-height: 10rem;overflow-y: auto;";
    let title = document.createElement("p");
    title.innerHTML = `<strong>${contentTitle}</strong>`;
    blockquote.appendChild(title);
    content.forEach((page) => {
      for (let i = 0; i < page.length; i += 2) {
        let p = document.createElement("p");
        p.textContent = page[i] + (page[i + 1] ? " " + page[i + 1] : "");
        blockquote.appendChild(p);
      }
    });
  }
}
