import {
  generateSuffixDropdown,
  generateBookDropdown,
  updateChapterDropdown,
  updateVerseDropdown,
  updateVerseData,
  generateBibleDropdowns,
} from "./dropdown.js";

const xuanZhaoTextBox = document.getElementById("xuanZhaoTextBox");
document.addEventListener("DOMContentLoaded", () => {
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

  // Retrieve Bible verses
  let dropdownBook = document.getElementById("xuanZhaoDropdownBook");
  let dropdownChap = document.getElementById("xuanZhaoDropdownChap");
  let dropdownVerseFrom = document.getElementById("xuanZhaoDropdownVerseFrom");
  let dropdownVerseTo = document.getElementById("xuanZhaoDropdownVerseTo");
  let textBetween = document.getElementById("textBetween");
  let xuanZhaoTextBox = document.getElementById("xuanZhaoTextBox");
  generateBibleDropdowns(
    dropdownBook,
    dropdownChap,
    dropdownVerseFrom,
    dropdownVerseTo,
    textBetween,
    xuanZhaoTextBox
  );
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
