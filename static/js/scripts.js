import {
  getBibleVerses,
  resumedVerseData,
  updateDropdowns,
} from "./dropdown.js";
import {
  createWeekList,
  createBibleDropdownSet,
  createInput,
  createRadio,
} from "./createHTML.js";

import { findBibleText } from "./findBibleText.js";
import { parseVerse } from "./processData.js";

document.addEventListener("DOMContentLoaded", async () => {
  await getBibleVerses();

  // Part 1
  createWeekList("thisWeekList");
  createInput("zhuTi1", "text", "主题:");
  createInput("date1", "date", "日期:");
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
  createRadio(
    "verseRadio",
    2,
    "所以，弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的；你们如此事奉乃是理所当然的。",
    "罗12:1"
  );
  createRadio(
    "verseRadio",
    2,
    "少种的少收，多种的多收”，这话是真的。各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。",
    "林后9:6-7"
  );

  let response = await fetch("../static/data/lyrics.json");
  let lyricsData = await response.json();
  createRadio("lyricsRadio", 3, lyricsData["宝架清影"], "宝架清影");
  createRadio("lyricsRadio", 3, lyricsData["靠近十架"], "靠近十架");
  createRadio("lyricsRadio", 3, lyricsData["破碎"], "破碎");

  createBibleDropdownSet("jinJu", "jinJu", "每月金句:");
  console.log(parseVerse(dynamicJinju));
  updateDropdowns("jinJu", parseVerse(dynamicJinju));

  createInput("date2", "date", "日期:");
  createInput("zhuTi2", "text", "主题:");
  createBibleDropdownSet("nextWeekJingWen", "jingWen", "经文:");
  createWeekList("nextWeekList");
  resumedVerseData();

  // let verseData = JSON.parse(localStorage.getItem("verseData"));
  // let selectedVerse = verseData.xuanZhao[0];
  // let verses = findBibleText(selectedVerse.fullVerse);
  // console.log(verses);
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
