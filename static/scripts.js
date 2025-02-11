import {
  generateSuffixDropdown,
  createBibleDropdownSet,
  getBibleVerses,
  resumedVerseData,
} from "./dropdown.js";

document.addEventListener("DOMContentLoaded", async () => {
  await getBibleVerses();

  // Populate dropdowns for form-section
  const dropdownIds = [
    "suffixZhengdao1",
    "suffixSihui1",
    "suffixPpt1",
    "suffixJiedai1",
    "suffixErtongxue1",
    "suffixZhengdao2",
    "suffixSihui2",
    "suffixPpt2",
    "suffixJiedai2",
    "suffixErtongxue2",
  ];
  dropdownIds.forEach((id) =>
    generateSuffixDropdown(id, id.includes("Zhengdao"))
  );

  createBibleDropdownSet("bibleDropdownSet1", "xuanZhao", "宣召:");
  createBibleDropdownSet("bibleDropdownSet2", "qiYingJingWen", "启应经文:");
  createBibleDropdownSet("bibleDropdownSet3", "duJing", "读经:");

  resumedVerseData();
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
