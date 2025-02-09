import {
  oldTestament,
  newTestament,
  chapterNumbers,
  chinese_numbers,
} from "./data/bibleData.js";

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

export function generateSuffixDropdown(dropdownId, ifPreacher = false) {
  let suffixes = [];
  if (ifPreacher) {
    suffixes = ["牧师", "师母", "传道"];
  } else {
    suffixes = ["弟兄", "姊妹"];
  }
  const dropdown = document.getElementById(dropdownId);
  populateDropdown(dropdown, suffixes);
}
export function generateBibleDropdown(dropdown) {
  populateDropdown(dropdown, [...oldTestament, ...newTestament]);
}

export async function updateChapterDropdown(
  bibleDropdown,
  chapterDropdownId,
  dropdownVerseFromId,
  dropdownVerseToId,
  textBetweenId
) {
  const bibleBookIndex = bibleDropdown.selectedIndex - 1;
  const chapterDropdown = document.getElementById(chapterDropdownId);
  const dropdownVerseFrom = document.getElementById(dropdownVerseFromId);
  const dropdownVerseTo = document.getElementById(dropdownVerseToId);
  const textBetween = document.getElementById(textBetweenId);
  chapterDropdown.innerHTML = "";

  const inputChapter = generateChapterOptions(bibleBookIndex);
  populateDropdown(chapterDropdown, inputChapter);
  chapterDropdown.style.display = "inline-block";

  const inputVerse = await generateVerseOptions(bibleBookIndex, 0);
  populateDropdown(dropdownVerseFrom, inputVerse);
  dropdownVerseFrom.style.display = "inline-block";
  populateDropdown(dropdownVerseTo, inputVerse);
  dropdownVerseTo.style.display = "inline-block";
  textBetween.style.display = "inline-block";
}

export async function updateVerseDropdown(
  bookIndex,
  chapterIndex,
  verseDropdownFrom,
  verseDropdownTo
) {
  const options = await generateVerseOptions(bookIndex, chapterIndex);

  verseDropdownFrom.innerHTML = "";
  populateDropdown(verseDropdownFrom, options);
  populateDropdown(verseDropdownTo, options);
}

async function generateVerseOptions(bookIndex, chapterIndex) {
  try {
    let response = await fetch("../static/data/bible_verses.json");
    let data = await response.json();
    let verseNumber = data[bookIndex][chapterIndex];
    let options = chinese_numbers
      .slice(0, verseNumber)
      .map((num) => `第${num}节`);
    return options;
  } catch (error) {
    console.error("Error loading JSON:", error);
    return []; // Return an empty array to prevent errors
  }
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

export function populateDropdown(dropdown, options) {
  dropdown.innerHTML = "";
  options.forEach((option, index) => {
    const optionElement = document.createElement("option");
    optionElement.value = index + 1;
    optionElement.textContent = option;
    dropdown.appendChild(optionElement);
  });
}

let verseData = JSON.parse(localStorage.getItem("verseData")) || {
  book: "none",
  chapter: "1",
  verseFrom: "1",
  verseTo: "1",
};
export function updateVerseData(key, value, xuanZhaoTextBox) {
  if (key === "book") {
    Object.assign(verseData, { chapter: "1", verseFrom: "1", verseTo: "1" });
  } else if (key === "chapter") {
    Object.assign(verseData, { verseFrom: "1", verseTo: "1" });
  } else if (key === "verseFrom") {
    verseData.verseTo = value;
  }
  verseData[key] = value;
  localStorage.setItem("verseData", JSON.stringify(verseData)); // Save to localStorage
  xuanZhaoTextBox.textContent = formatVerseData(verseData);
}

function formatVerseData(verseData) {
  return `${verseData.book} ${verseData.chapter}:${verseData.verseFrom}-${verseData.verseTo}`;
}
