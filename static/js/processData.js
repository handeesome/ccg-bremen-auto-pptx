import { createTextareaSet } from "./createHTML.js";
import { books, simple_books } from "./bibleIndexes.js";
export function parseVerse(verseString) {
  const regex = /(.+?)\s+(\d+):(\d+)(?:-(\d+))?/;
  const match = verseString.match(regex);

  if (!match) return null; // Return null if format is incorrect

  return {
    book: match[1], // Extract the book name
    chapter: parseInt(match[2], 10), // Extract the chapter number
    verseFrom: parseInt(match[3], 10), // Extract the starting verse
    verseTo: match[4] ? parseInt(match[4], 10) : parseInt(match[3], 10), // Extract ending verse if available
  };
}
export function resumeVerseData() {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  if (!formData) return;
  let verseData = ["xuanZhao", "qiYing", "duJing", "jinJu", "jingWen"];

  verseData.forEach((category) => {
    let button = document.getElementById(`${category}Button`);
    if (!formData[category]) return;
    formData[category].map((verse, index) => {
      if (!verse) return;

      if (index > 0) {
        button.dispatchEvent(new Event("click"));
      }

      let prefix = index === 0 ? `${category}` : `${category}-${index}`;
      updateDropdowns(prefix, verse);
    });
  });
}
export function updateDropdowns(prefix, verse) {
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

export function updateVerseData(prefix, key, value) {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  let parts = prefix.split("-");
  let verseFor = parts[0];
  let index = parseInt(parts[parts.length - 1], 10) || 0;
  // Ensure array exists
  if (!Array.isArray(formData[verseFor])) {
    formData[verseFor] = [];
  }
  // Ensure the verse entry exists
  if (!formData[verseFor][index]) {
    formData[verseFor][index] = {
      book: "book",
      chapter: "1",
      verseFrom: "1",
      verseTo: "1",
      fullName: "book 1:1-1",
    };
  }
  let selectedVerse = formData[verseFor][index];

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
  let fullName = formatVerse(selectedVerse);
  let abbrWord = simple_books[books.indexOf(selectedVerse.book)];
  selectedVerse.fullName = fullName;
  selectedVerse.abbr = abbrWord;
  selectedVerse.abbrName = formatVerse(selectedVerse, false);

  localStorage.setItem("formData", JSON.stringify(formData)); // Save to localStorage
}

function formatVerse(verse, fullName = true) {
  let chapterVerse = "";
  if (verse.verseFrom === verse.verseTo) {
    chapterVerse = `${verse.chapter}:${verse.verseFrom}`;
  } else {
    chapterVerse = `${verse.chapter}:${verse.verseFrom}-${verse.verseTo}`;
  }
  if (fullName) return `${verse.book} ${chapterVerse}`;
  else return `${verse.abbr} ${chapterVerse}`;
}
export function removeVerseData(newRow, prefix) {
  let dropdowns = newRow.querySelectorAll("select");
  let verse = {
    book: dropdowns[0].value,
    chapter: dropdowns[1].value,
    verseFrom: dropdowns[2].value,
    verseTo: dropdowns[3].value,
  };
  let toRemove = formatVerse(verse);
  let formData = JSON.parse(localStorage.getItem("formData"));
  let indexToRemove = formData[prefix].findIndex(
    (item) => item.fullName === toRemove
  );
  formData[prefix].splice(indexToRemove, 1); // Remove the element at found index
  localStorage.setItem("formData", JSON.stringify(formData));
}

export function updateTextareaData(value, category) {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  let textareaData = formData[category] || [];
  textareaData.push(value);
  formData[category] = textareaData;
  localStorage.setItem("formData", JSON.stringify(formData));
}
export function removeTextareaData(index, category) {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  formData[category].splice(index, 1);
  localStorage.setItem("formData", JSON.stringify(formData));
}

export function resumeTextareaData(category) {
  let formData = JSON.parse(localStorage.getItem("formData"));
  if (!formData) return;
  let textarea = formData[category] || [];
  let button = document.getElementById(`${category}AddTextarea`);
  for (let i = 0; i < textarea.length; i++) {
    if (i > 0) {
      button.dispatchEvent(new Event("click"));
    }
    let textarea = document.getElementById(`${category}${i}`);
    textarea.value = formData[category][i];
  }
}

export function updateFromCCGBremen() {
  let url = "https://ccg-bremen.de/default.php";
  const proxy = "https://api.allorigins.win/get?url=";
  const buttonText = document.getElementById("buttonText");
  buttonText.innerHTML = `<i class="fas fa-spinner loading-icon"></i> 获取中...`;

  fetch(proxy + encodeURIComponent(url))
    .then((response) => response.text()) // Convert response to text (HTML)
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      // Extract 金句
      let heading = Array.from(doc.querySelectorAll("h2")).find((h2) =>
        h2.textContent.includes("金句")
      );
      const jinJu = heading?.parentElement
        .querySelectorAll("p")[1]
        .textContent.trim();

      updateDropdowns("jinJu", parseVerse(jinJu));

      heading = Array.from(doc.querySelectorAll("h2")).find((h2) =>
        h2.textContent.includes("教会通讯")
      );
      const tongXun = heading?.parentElement.querySelector("ol");
      const activities = Array.from(tongXun?.querySelectorAll("li") || []).map(
        (li) => li.textContent
      );
      document.getElementById("activityTextarea").innerHTML = "";
      createTextareaSet("activityTextarea", "activity");
      let AddTextarea = document.getElementById("activityAddTextarea");
      let formData = JSON.parse(localStorage.getItem("formData")) || {};
      delete formData["activity"];
      localStorage.setItem("formData", JSON.stringify(formData));
      activities.forEach((activity, index) => {
        if (!document.getElementById(`activity${index}`)) {
          AddTextarea.dispatchEvent(new Event("click"));
        }
        let textarea = document.getElementById(`activity${index}`);
        textarea.value = activity;
        textarea.dispatchEvent(new Event("change"));
      });
      buttonText.innerHTML = `<i class="fas fa-check"></i> 获取成功`;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      buttonText.innerHTML = `<i class="fas fa-exclamation-circle"></i> 获取失败`;
    });
}

export function updateInputData(key, value) {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  formData[key] = value;
  localStorage.setItem("formData", JSON.stringify(formData));
}
export function resumeInputData() {
  let formData = JSON.parse(localStorage.getItem("formData"));
  if (!formData) return;
  let inputData = [
    "zhuTi1Input",
    "date1Input",
    "date2Input",
    "zhuTi2Input",
    "song1Input",
    "song2Input",
    "song3Input",
    "song4Input",
    "nextWeekListerTong",
    "nextWeekListjieDai",
    "nextWeekListppt",
    "nextWeekListsiHui",
    "nextWeekListzhengDao",
    "thisWeekListerTong",
    "thisWeekListjieDai",
    "thisWeekListppt",
    "thisWeekListsiHui",
    "thisWeekListzhengDao",
  ];
  inputData.forEach((key) => {
    if (!document.getElementById(key)) return;
    let input = document.getElementById(key);
    let arr = formData[key.replace("Input", "")];
    if (Array.isArray(arr)) {
      input.value = arr[0];
    } else {
      input.value = arr;
    }
  });
}

export function updateRadioData(category, value) {
  let formData = JSON.parse(localStorage.getItem("formData")) || {};
  formData[category] = value;
  localStorage.setItem("formData", JSON.stringify(formData));
}
export function resumeRadioData() {
  let formData = JSON.parse(localStorage.getItem("formData"));
  if (!formData) return;
  let radioData = ["verseRadio", "lyricsRadio"];
  radioData.forEach((category) => {
    let radio = formData[category];
    let radios = document.getElementsByName(category);
    radios.forEach((r) => {
      if (r.value === radio) {
        r.checked = true;
      }
    });
  });
}
