import {
  oldTestament,
  newTestament,
  chapterNumbers,
  chinese_numbers,
} from "../data/bibleData.js";

export async function getBibleVerses() {
  try {
    let response = await fetch("../static/data/bibleVerses.json");

    window.bibleVerses = await response.json(); // Store in window object
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}

function addTextBox(container, textBoxCounter, itemName, itemID) {
  textBoxCounter++;

  const label = document.createElement("label");
  label.setAttribute("for", itemID + textBoxCounter);
  label.textContent = itemName + " " + textBoxCounter + ": ";

  const textarea = document.createElement("textarea");
  textarea.setAttribute("id", itemID + textBoxCounter);
  textarea.setAttribute("name", itemID + textBoxCounter);
  textarea.setAttribute("rows", "4");
  textarea.setAttribute("cols", "50");
  textarea.setAttribute("maxlength", "255");
  const textBoxContainer = document.createElement("div");
  textBoxContainer.classList.add("textBoxContainer");
  textBoxContainer.appendChild(label);
  textBoxContainer.appendChild(textarea);

  container.appendChild(textBoxContainer);

  return textBoxCounter;
}

function generateSuffixDropdown(dropdownId, ifPreacher = false) {
  let suffixes = [];
  if (ifPreacher) {
    suffixes = ["牧师", "师母", "传道"];
  } else {
    suffixes = ["弟兄", "姊妹"];
  }
  const dropdown = document.getElementById(dropdownId);
  populateDropdown(dropdown, suffixes);
}
function generateBookDropdown(dropdown) {
  populateDropdown(dropdown, [...oldTestament, ...newTestament], true);
}

function updateChapterDropdown(
  dropdownBible,
  dropdownChap,
  dropdownVerseFrom,
  dropdownVerseTo,
  textBetween
) {
  const bibleBookIndex = dropdownBible.selectedIndex - 1;
  const bibleBookName = dropdownBible.value;
  dropdownChap.innerHTML = "";

  const inputChapter = generateChapterOptions(bibleBookIndex);
  populateDropdown(dropdownChap, inputChapter);
  dropdownChap.style.display = "inline-block";

  const inputVerse = generateVerseOptions(bibleBookName, 0);
  populateDropdown(dropdownVerseFrom, inputVerse);
  dropdownVerseFrom.style.display = "inline-block";
  populateDropdown(dropdownVerseTo, inputVerse);
  dropdownVerseTo.style.display = "inline-block";
  textBetween.style.display = "inline-block";
}

function updateVerseDropdown(
  bookName,
  chapterIndex,
  verseDropdownFrom,
  verseDropdownTo
) {
  const options = generateVerseOptions(bookName, chapterIndex);

  verseDropdownFrom.innerHTML = null;
  populateDropdown(verseDropdownFrom, options);
  populateDropdown(verseDropdownTo, options);
}

function generateVerseOptions(bookName, chapterIndex) {
  if (!window.bibleVerses || !window.bibleVerses[bookName]) return [];
  let verseNumber = window.bibleVerses[bookName][chapterIndex] || 0;
  return chinese_numbers.slice(0, verseNumber).map((num) => `第${num}节`);
}

function generateChapterOptions(bookIndex) {
  const number = chapterNumbers[bookIndex];
  const options = [];
  let chapterInCN = "章";

  if (number == 150) {
    chapterInCN = "篇";
  }
  for (let i = 0; i < number; i++) {
    const text = "第" + chinese_numbers[i] + chapterInCN;
    options.push(text);
  }
  return options;
}

function populateDropdown(dropdown, options, isBook = false) {
  dropdown.innerHTML = "";
  options.forEach((option, index) => {
    const optionElement = document.createElement("option");
    if (isBook) {
      optionElement.value = option;
    } else {
      optionElement.value = index + 1;
    }
    optionElement.textContent = option;
    dropdown.appendChild(optionElement);
  });
}

function updateVerseData(prefix, key, value, xuanZhaoTextBox) {
  let verseData = JSON.parse(localStorage.getItem("verseData")) || {
    xuanZhao: [],
    qiYingJingWen: [],
    duJing: [],
  };
  let parts = prefix.split("-");
  let verseFor = parts[0];
  let index = parseInt(parts[parts.length - 1], 10) || 0;
  // Ensure array exists
  if (!Array.isArray(verseData[verseFor])) {
    verseData[verseFor] = [];
  }
  // Ensure the verse entry exists
  if (!verseData[verseFor][index]) {
    verseData[verseFor][index] = {
      book: "book",
      chapter: "1",
      verseFrom: "1",
      verseTo: "1",
    };
  }
  let selectedVerse = verseData[verseFor][index];

  if (key === "book") {
    Object.assign(selectedVerse, {
      chapter: "1",
      verseFrom: "1",
      verseTo: "1",
    });
  } else if (key === "chapter") {
    Object.assign(selectedVerse, { verseFrom: "1", verseTo: "1" });
  } else if (key === "verseFrom") {
    selectedVerse.verseTo = value;
  }

  selectedVerse[key] = value;
  localStorage.setItem("verseData", JSON.stringify(verseData)); // Save to localStorage
  if (xuanZhaoTextBox) {
    xuanZhaoTextBox.textContent = formatVerse(selectedVerse);
  }
}

function formatVerse(verseData) {
  return `${verseData.book} ${verseData.chapter}:${verseData.verseFrom}-${verseData.verseTo}`;
}

function updateBibleDropdowns(
  prefix,
  dropdownBook,
  dropdownChap,
  dropdownVerseFrom,
  dropdownVerseTo,
  textBetween,
  xuanZhaoTextBox
) {
  if (dropdownBook) {
    generateBookDropdown(dropdownBook);
    let placeholder = document.createElement("option");
    placeholder.text = "请选择一卷书";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;

    // Insert the placeholder at the beginning
    dropdownBook.insertBefore(placeholder, dropdownBook.firstChild);

    let originalOptions;
    let bookName;
    dropdownBook.addEventListener("change", function () {
      updateChapterDropdown(
        this,
        dropdownChap,
        dropdownVerseFrom,
        dropdownVerseTo,
        textBetween
      );
      originalOptions = Array.from(dropdownVerseTo.options).map((option) =>
        option.cloneNode(true)
      );
      bookName = this.value;
      updateVerseData(prefix, "book", bookName, xuanZhaoTextBox);
    });

    if (dropdownChap) {
      dropdownChap.addEventListener("change", function () {
        updateVerseDropdown(
          bookName,
          this.selectedIndex,
          dropdownVerseFrom,
          dropdownVerseTo
        );

        originalOptions = Array.from(dropdownVerseTo.options).map((option) =>
          option.cloneNode(true)
        );
        updateVerseData(prefix, "chapter", this.value, xuanZhaoTextBox);
      });
    }

    if (dropdownVerseFrom) {
      dropdownVerseFrom.addEventListener("change", function () {
        dropdownVerseTo.innerHTML = null;
        originalOptions.forEach((option) =>
          dropdownVerseTo.appendChild(option.cloneNode(true))
        );

        for (
          let i = 0;
          i < this.selectedIndex && this.options.length > 0;
          i++
        ) {
          dropdownVerseTo.remove(0);
        }
        updateVerseData(prefix, "verseFrom", this.value, xuanZhaoTextBox);
      });
    }

    if (dropdownVerseTo) {
      dropdownVerseTo.addEventListener("change", function () {
        updateVerseData(prefix, "verseTo", this.value, xuanZhaoTextBox);
      });
    }
  }
}

function createBibleDropdownSet(containerId, prefix, labelText) {
  let container = document.getElementById(containerId);

  // Create Row
  let row = document.createElement("div");
  row.className = "row align-items-center mb-3";
  row.id = `dropdownSet-${prefix}`;

  // Left Column (Label + TextBox)
  let colLabel = document.createElement("div");
  colLabel.className = "d-flex";
  colLabel.style.flex = "0 0 20%";
  colLabel.style.maxWidth = "20%";

  let label = document.createElement("label");
  label.setAttribute("for", prefix);
  label.textContent = labelText;

  let textBox = document.createElement("span");
  textBox.className = "ms-auto";
  textBox.id = `${prefix}TextBox`;

  colLabel.appendChild(label);
  colLabel.appendChild(textBox);

  // Right Column (Dropdowns)
  let colDropdowns = document.createElement("div");
  colDropdowns.className = "col-4";

  let dropdownWrapper = document.createElement("div");
  dropdownWrapper.className = "d-flex gap-2 align-items-center";

  let dropdownBook = createDropdown(`${prefix}DropdownBook`, true);
  let dropdownChap = createDropdown(`${prefix}DropdownChap`, false);
  let dropdownVerseFrom = createDropdown(`${prefix}DropdownVerseFrom`, false);
  let textBetween = document.createElement("span");
  textBetween.id = `${prefix}TextBetween`;
  textBetween.textContent = "至";
  textBetween.style.display = "none";

  let dropdownVerseTo = createDropdown(`${prefix}DropdownVerseTo`, false);

  let button = document.createElement("button");
  button.className = "btn btn-primary";
  button.textContent = " + ";
  button.type = "button";
  button.id = `${prefix}Button`;
  button.onclick = function () {
    // Count existing rows inside the container
    let existingSets = document.querySelectorAll(`#${containerId} .row`).length;
    let newPrefix = `${prefix}-${existingSets}`; // Append number to prefix
    let newRow = createBibleDropdownSet(containerId, newPrefix, labelText);
    newRow.querySelector("label").textContent = "";

    // Set the new row's button to "-" (delete)
    let newButton = newRow.querySelector("button");
    newButton.textContent = " − ";
    newButton.className = "btn btn-danger";
    newButton.onclick = function () {
      newRow.remove(); // Remove the new row when "-" is clicked
    };
  };

  dropdownWrapper.appendChild(dropdownBook);
  dropdownWrapper.appendChild(dropdownChap);
  dropdownWrapper.appendChild(dropdownVerseFrom);
  dropdownWrapper.appendChild(textBetween);
  dropdownWrapper.appendChild(dropdownVerseTo);
  dropdownWrapper.appendChild(button);

  colDropdowns.appendChild(dropdownWrapper);

  // Append Columns to Row
  row.appendChild(colLabel);
  row.appendChild(colDropdowns);

  // Append Row to Container
  container.appendChild(row);

  // Initialize dropdowns
  updateBibleDropdowns(
    prefix,
    dropdownBook,
    dropdownChap,
    dropdownVerseFrom,
    dropdownVerseTo,
    textBetween,
    textBox
  );
  return row;
}

// Helper function to create a dropdown element
function createDropdown(id, visible) {
  let dropdown = document.createElement("select");
  dropdown.className = "form-select";
  dropdown.id = id;
  dropdown.name = id;
  if (!visible) dropdown.style.display = "none";
  return dropdown;
}

function resumedVerseData() {
  let verseData = JSON.parse(localStorage.getItem("verseData"));
  if (!verseData) return;

  for (let category in verseData) {
    let button = document.getElementById(`${category}Button`);

    verseData[category].forEach((verse, index) => {
      if (!verse) return;

      if (index > 0) {
        button.dispatchEvent(new Event("click"));
      }

      let prefix = index === 0 ? `${category}` : `${category}-${index}`;
      updateDropdowns(prefix, verse);
    });
  }
}

function updateDropdowns(prefix, verse) {
  let dropdownBook = document.getElementById(`${prefix}DropdownBook`);
  let dropdownChap = document.getElementById(`${prefix}DropdownChap`);
  let dropdownVerseFrom = document.getElementById(`${prefix}DropdownVerseFrom`);
  let dropdownVerseTo = document.getElementById(`${prefix}DropdownVerseTo`);

  if (!dropdownBook || !dropdownChap || !dropdownVerseFrom || !dropdownVerseTo)
    return;

  dropdownBook.value = verse.book;
  dropdownBook.dispatchEvent(new Event("change"));

  dropdownChap.value = verse.chapter;
  dropdownChap.dispatchEvent(new Event("change"));

  dropdownVerseFrom.value = verse.verseFrom;
  dropdownVerseFrom.dispatchEvent(new Event("change"));

  dropdownVerseTo.value = verse.verseTo;
  dropdownVerseTo.dispatchEvent(new Event("change"));
}

export { generateSuffixDropdown, createBibleDropdownSet, resumedVerseData };
