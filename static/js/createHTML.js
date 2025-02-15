import { generateSuffixDropdown, updateBibleDropdowns } from "./dropdown.js";
import {
  removeTextareaData,
  removeVerseData,
  updateTextareaData,
  updateFromCCGBremen,
  updateInputData,
  updateRadioData,
} from "./processData.js";
import { findBibleText } from "./findBibleText.js";

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
    weekList.insertAdjacentHTML(
      "beforeend",
      `
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
      </div>`
    );
    generateSuffixDropdown(
      `suffix${weekListId + role.id}`,
      `suffix${weekListId + role.id}`.includes("zhengDao")
    );
    let input = document.getElementById(`${weekListId + role.id}`);
    let suffix = document.getElementById(`suffix${weekListId + role.id}`);

    input.addEventListener("change", function () {
      updateInputData(weekListId + role.id, [input.value, suffix.value]);
    });
  });
}

export function createBibleDropdownSet(containerId, prefix, labelText) {
  let container = document.getElementById(containerId);

  let html = `
    <div class="row align-items-center mb-3" id="dropdownSet-${prefix}">
      <!-- Label & TextBox -->
      <div class="col-auto">
        <label for="${prefix}">${labelText}</label>
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
      removeVerseData(newRow, prefix);
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
        <label class="col-form-label">${labelText}</label>
      </div>
      <div class="col-auto">
        <input type=${type} id="${containerId}Input"/>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);

  let input = document.getElementById(`${containerId}Input`);
  input.className = "form-control";

  input.addEventListener("change", function () {
    updateInputData(containerId, this.value);
  });
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
    <div class="col-md-${width} d-flex">
      <label class="w-100">
        <input
          type="radio"
          id="${containerId + contentTitle}Radio"
          name="${containerId}Radio"
          class="d-none" 
          value="${contentTitle}"
          checked/>
        <div class="card p-3 h-100 d-flex flex-column">
          <blockquote class="blockquote mb-0 flex-grow-1" id="${
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
      <footer class="blockquote-footer text-end mt-auto mb-auto">
        ${contentTitle}
      </footer>
    `;
    blockquote.insertAdjacentHTML("afterend", footer);
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
  let radio = document.getElementById(`${containerId + contentTitle}Radio`);
  radio.addEventListener("change", function () {
    if (this.checked) {
      updateRadioData(containerId, contentTitle);
    }
  });
}

function createTextarea(container, category) {
  let newTextareaDiv = document.createElement("div");
  newTextareaDiv.classList.add("mb-3", "d-flex", "align-items-center");

  let textareaElement = document.createElement("textarea");
  textareaElement.className = "form-control";
  textareaElement.rows = 2;
  textareaElement.placeholder = "Type something...";
  let index = container.querySelectorAll("textarea").length;
  textareaElement.id = `${category}${index}`;

  newTextareaDiv.appendChild(textareaElement);
  container.appendChild(newTextareaDiv);
  textareaElement.addEventListener("change", function () {
    updateTextareaData(this.value, category);
  });
  return newTextareaDiv;
}

export function createTextareaSet(containerId, category) {
  let container = document.getElementById(containerId);
  createTextarea(container, category);

  let buttonContainer = document.createElement("div");
  buttonContainer.className = "text-center";
  let buttonPrimary = document.createElement("button");
  buttonPrimary.className = "btn btn-primary mb-3";
  buttonPrimary.id = `${category}AddTextarea`;
  buttonPrimary.type = "button";
  buttonPrimary.innerHTML = "+";
  buttonContainer.insertAdjacentElement("beforeend", buttonPrimary);
  container.insertAdjacentElement("beforeend", buttonContainer);

  buttonPrimary.addEventListener("click", function () {
    let index = container.querySelectorAll("textarea").length;
    let newTextareaDiv = createTextarea(container, category);
    let buttonRemove = document.createElement("button");
    buttonRemove.type = "button";
    buttonRemove.className = "btn btn-danger ms-2 col-auto";
    buttonRemove.innerHTML = "-";
    buttonRemove.onclick = function () {
      container.removeChild(newTextareaDiv);
      removeTextareaData(index, category);
    };
    newTextareaDiv.appendChild(buttonRemove);
    buttonContainer.insertAdjacentElement("beforebegin", newTextareaDiv);
  });
}

export function createFetchButton(containerId) {
  let container = document.getElementById(containerId);
  let button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-info absolute-btn";
  button.id = "getFromCCGBremen";
  let span = document.createElement("span");
  span.id = "buttonText";
  span.innerHTML = "从CCG Bremen网站自动获取";
  button.appendChild(span);
  container.appendChild(button);

  button.addEventListener("click", function () {
    updateFromCCGBremen();
  });
}

export function updateJinJuText() {
  const updateText = () => {
    let fullverse = JSON.parse(localStorage.getItem("formData")).jinJu[0]
      .fullVerse;
    let verses = findBibleText(fullverse).verses;
    let text = verses.map((verse) => verse.text).join(" ");
    document.getElementById("jinJuText").textContent = text;
  };
  ["jinJuDropdownVerseFrom", "jinJuDropdownVerseTo"].forEach((id) => {
    document.getElementById(id).addEventListener("change", updateText);
  });
}
