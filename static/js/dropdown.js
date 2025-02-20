import {
  oldTestament,
  newTestament,
  chapterNumbers,
  chinese_numbers,
} from "../data/bibleData.js";
import { updateVerseData } from "./processData.js";

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
    suffixes = ["牧师", "师母", "传道", "神学生"];
  } else {
    suffixes = ["弟兄", "姊妹"];
  }
  const dropdown = document.getElementById(dropdownId);
  populateDropdown(dropdown, suffixes, true);
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

function populateDropdown(dropdown, options, isValue = false) {
  dropdown.innerHTML = "";
  options.forEach((option, index) => {
    const optionElement = document.createElement("option");
    if (isValue) {
      optionElement.value = option;
    } else {
      optionElement.value = index + 1;
    }
    optionElement.textContent = option;
    dropdown.appendChild(optionElement);
  });
}

function updateBibleDropdowns(
  prefix,
  dropdownBook,
  dropdownChap,
  dropdownVerseFrom,
  dropdownVerseTo,
  textBetween
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
      updateVerseData(prefix, "book", bookName);
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
        updateVerseData(prefix, "chapter", this.value);
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
        updateVerseData(prefix, "verseFrom", this.value);
      });
    }

    if (dropdownVerseTo) {
      dropdownVerseTo.addEventListener("change", function () {
        updateVerseData(prefix, "verseTo", this.value);
      });
    }
  }
}

export { generateSuffixDropdown, updateBibleDropdowns };
