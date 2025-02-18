import { getBibleVerses } from "./dropdown.js";
import {
  createWeekList,
  createBibleDropdownSet,
  createInput,
  createRadio,
  createTextareaSet,
  createFetchButton,
  updateJinJuText,
} from "./createHTML.js";

import {
  resumeInputData,
  resumeTextareaData,
  resumeVerseData,
} from "./processData.js";

document.addEventListener("DOMContentLoaded", async () => {
  await getBibleVerses();

  //Part 0
  createRadio("isCommunion", 2, "圣餐崇拜", "圣餐崇拜");
  createRadio("isCommunion", 2, "主日崇拜", "主日崇拜");

  let response = await fetch("../static/data/lyrics.json");
  let lyricsData = await response.json();
  createRadio("lyricsRadio", 3, lyricsData["宝架清影"], "宝架清影");
  createRadio("lyricsRadio", 3, lyricsData["靠近十架"], "靠近十架");
  createRadio("lyricsRadio", 3, lyricsData["破碎"], "破碎");

  // Part 1
  createWeekList("thisWeekList");
  createInput("zhuTi1", "text", "主题:");
  createInput("date1", "date", "日期:");
  createInput("date2", "date", "日期:");
  createInput("zhuTi2", "text", "主题:");
  createBibleDropdownSet("nextWeekJingWen", "jingWen", "经文:");
  createWeekList("nextWeekList");
  //Part 2
  createBibleDropdownSet("bibleDropdownSet1", "xuanZhao", "宣召:");
  createBibleDropdownSet("bibleDropdownSet2", "qiYing", "启应:");
  createBibleDropdownSet("bibleDropdownSet3", "duJing", "读经:");
  //Part 3
  createInput("song1", "text", "第一首诗歌:");
  createInput("song2", "text", "第二首诗歌:");
  createInput("song3", "text", "第三首诗歌:");
  createInput("song4", "text", "回应诗歌:");

  //Part 4
  createTextareaSet("activityTextarea", "activity");
  createFetchButton("fetchButtonParent");
  createBibleDropdownSet("jinJu", "jinJu", "每月金句:");
  document.getElementById("jinJuButton").remove();
  updateJinJuText();

  // Part 5
  createRadio(
    "verseRadio",
    2,
    "所以，弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的；你们如此事奉乃是理所当然的。所以，弟兄们",
    "罗12:1"
  );
  createRadio(
    "verseRadio",
    2,
    "少种的少收，多种的多收”，这话是真的。各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。",
    "林后9:6-7"
  );

  // Part 6
  createTextareaSet("prayerWorldTextarea", "prayerWorld");
  createTextareaSet("prayerChurchTextarea", "prayerChurch");

  // Make sure the radio buttons trigger at start once
  document.querySelectorAll('input[type="radio"]:checked').forEach((radio) => {
    radio.dispatchEvent(new Event("change"));
  });

  //resume from local storage
  const savedData = localStorage.getItem("formData");
  if (savedData) {
    const restore = confirm("Would you like to restore your previous session?");
    if (restore) {
      resumeInputData();
      resumeVerseData();
      resumeTextareaData("activity");
      resumeTextareaData("prayerWorld");
      resumeTextareaData("prayerChurch");
    } else {
      localStorage.removeItem("formData"); // Clear if user doesn't want to restore
    }
  }
});
