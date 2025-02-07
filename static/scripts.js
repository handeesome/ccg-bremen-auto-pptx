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
    let originalOptions;
    let dropdownVerseTo = document.getElementById("xuanZhaoDropdownVerseTo");

    dropdownBook.addEventListener("change", async function () {
      await updateChapterDropdown(
        this,
        "xuanZhaoDropdownChap",
        "xuanZhaoDropdownVerseFrom",
        "xuanZhaoDropdownVerseTo"
      );

      bookIndex = this.selectedIndex - 1;
      originalOptions = Array.from(dropdownVerseTo.options).map((option) =>
        option.cloneNode(true)
      );
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
      });
    }
  }
});

document.getElementById("dynamicBirthday").innerHTML =
  dynamicDate + dynamicBirthday;
