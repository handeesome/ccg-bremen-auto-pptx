import { chapterNumbers } from "./data/bibleData.js";
import {
  generateSuffixDropdown,
  generateBibleDropdown,
  updateChapterDropdown,
  updateVerseDropdown,
  updateVerseData,
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
  if (dropdownBook) {
    generateBibleDropdown(dropdownBook);
    let placeholder = document.createElement("option");
    placeholder.text = "请选择一卷书";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;

    // Insert the placeholder at the beginning
    dropdownBook.insertBefore(placeholder, dropdownBook.firstChild);

    let bookIndex;
    let originalOptions;
    let dropdownVerseTo = document.getElementById("xuanZhaoDropdownVerseTo");

    dropdownBook.addEventListener("change", async function () {
      await updateChapterDropdown(
        this,
        "xuanZhaoDropdownChap",
        "xuanZhaoDropdownVerseFrom",
        "xuanZhaoDropdownVerseTo",
        "textBetween"
      );

      bookIndex = this.selectedIndex - 1;
      originalOptions = Array.from(dropdownVerseTo.options).map((option) =>
        option.cloneNode(true)
      );
      let bookName = this.options[this.selectedIndex].text;
      updateVerseData("book", bookName, xuanZhaoTextBox);
    });

    let dropdownChap = document.getElementById("xuanZhaoDropdownChap");
    let dropdownVerseFrom = document.getElementById(
      "xuanZhaoDropdownVerseFrom"
    );
    if (dropdownChap) {
      dropdownChap.addEventListener("change", async function () {
        await updateVerseDropdown(
          bookIndex,
          this.selectedIndex,
          dropdownVerseFrom,
          dropdownVerseTo
        );

        originalOptions = Array.from(dropdownVerseTo.options).map((option) =>
          option.cloneNode(true)
        );
        updateVerseData("chapter", this.value, xuanZhaoTextBox);
      });
    }

    if (dropdownVerseFrom) {
      dropdownVerseFrom.addEventListener("change", function () {
        dropdownVerseTo.innerHTML = "";
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
        updateVerseData("verseFrom", this.value, xuanZhaoTextBox);
      });
    }

    if (dropdownVerseTo) {
      dropdownVerseTo.addEventListener("change", function () {
        updateVerseData("verseTo", this.value, xuanZhaoTextBox);
      });
    }
  }
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
