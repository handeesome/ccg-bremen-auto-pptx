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
export function resumedVerseData() {
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
  let verseData = JSON.parse(localStorage.getItem("verseData")) || {
    xuanZhao: [],
    qiYing: [],
    duJing: [],
    jinJu: [],
    jingWen: [],
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
      fullVerse: "book 1:1-1",
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
  selectedVerse.fullVerse = formatVerse(selectedVerse);

  localStorage.setItem("verseData", JSON.stringify(verseData)); // Save to localStorage
}

function formatVerse(verseData) {
  return `${verseData.book} ${verseData.chapter}:${verseData.verseFrom}-${verseData.verseTo}`;
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
  console.log(toRemove);
  let verseData = JSON.parse(localStorage.getItem("verseData"));
  let indexToRemove = verseData[prefix].findIndex(
    (item) => item.fullVerse === toRemove
  );
  verseData[prefix].splice(indexToRemove, 1); // Remove the element at found index
  localStorage.setItem("verseData", JSON.stringify(verseData));
}

export function updateActivityData(index, value) {
  let activityData = JSON.parse(localStorage.getItem("activityData")) || {};
  activityData[index] = value;
  localStorage.setItem("activityData", JSON.stringify(activityData));
}
export function removeActivityData(index) {
  let activityData = JSON.parse(localStorage.getItem("activityData")) || {};
  delete activityData[index];
  let sortedKeys = Object.keys(activityData)
    .map(Number)
    .sort((a, b) => a - b);
  let oldKeys = sortedKeys.slice(index, Object.keys(activityData).length);
  let newKeys = [index, ...oldKeys];
  newKeys.pop();
  let updatedActivityData = {};
  sortedKeys.slice(0, index).forEach((key) => {
    updatedActivityData[key] = activityData[key];
  });

  // Assign new keys with old values
  oldKeys.forEach((oldKey, i) => {
    updatedActivityData[newKeys[i]] = activityData[oldKey];
  });

  localStorage.setItem("activityData", JSON.stringify(updatedActivityData));
}
