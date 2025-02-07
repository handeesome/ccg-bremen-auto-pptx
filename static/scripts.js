import {
  generateSuffixDropdown,
  generateBibleDropdown,
  updateChapterDropdown,
  updateVerseDropdown,
} from "./dropdown.js";

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
    dropdownBook.innerHTML = `
            <option value="" disabled selected
                    >请选择一卷书
                  </option>
                  
        `;
    generateBibleDropdown(dropdownBook);

    let bookIndex;
    dropdownBook.addEventListener("change", function () {
      updateChapterDropdown(
        this,
        "xuanZhaoDropdownChap",
        "xuanZhaoDropdownVerseFrom"
      );
      bookIndex = this.selectedIndex - 1;
    });
    let dropdownChap = document.getElementById("xuanZhaoDropdownChap");
    if (dropdownChap) {
      dropdownChap.addEventListener("change", function () {
        let verseDropdownFrom = document.getElementById(
          "xuanZhaoDropdownVerseFrom"
        );
        updateVerseDropdown(bookIndex, this.selectedIndex, verseDropdownFrom);
      });
    }
  }
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
