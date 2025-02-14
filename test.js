function updateFromCCGBremen() {
  let url = "https://ccg-bremen.de/default.php";
  const proxy = "https://api.allorigins.win/raw?url=";

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

      let AddTextarea = document.getElementById("activityAddTextarea");
      localStorage.removeItem("activityData");
      activities.forEach((activity, index) => {
        if (!document.getElementById(`activity${index}`)) {
          AddTextarea.dispatchEvent(new Event("click"));
        }
        let textarea = document.getElementById(`activity${index}`);
        console.log(textarea.textContent);
        textarea.value = activity;
        textarea.dispatchEvent(new Event("change"));
      });
    })
    .catch((error) => console.error("Error fetching page:", error));
}
