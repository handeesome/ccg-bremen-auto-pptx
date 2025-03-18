export function parseLRC(lrcText, paragraphs) {
  const lines = lrcText.split("\n"); // Split into lines
  const regex = /\[([0-9:.]+)\]/g; // Regex to match timestamps
  let timestampsMap = []; // Stores { timestamp, lyric }

  for (let line of lines) {
    let matches = [...line.matchAll(regex)]; // Find all timestamps
    let lyrics = line.replace(regex, "").trim(); // Remove timestamps

    if (matches.length > 0) {
      matches.forEach((match) => {
        let timestamp = match[1];
        timestampsMap.push({ timestamp, lyrics });
      });
    }
  }

  // Sort by timestamps
  timestampsMap.sort(
    (a, b) => timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp)
  );

  let pages = [];
  let currentPage = [];
  let match_group = [];

  for (let i = 0; i < timestampsMap.length; i++) {
    let lyric = timestampsMap[i].lyrics;

    if (lyric) {
      currentPage.push(lyric);
    } else if (currentPage.length > 0) {
      pages.push(currentPage.join("\n"));
      currentPage = [];
    }
  }
  // Push the last paragraph if not empty
  if (currentPage.length > 0) {
    pages.push(currentPage.join("\n"));
  }
  for (let i = 0; i < pages.length; i++) {
    let text_lines = pages[i].split("\n");
    let matches = [];
    let current_section = [];
    for (let j = 0; j < text_lines.length; j++) {
      current_section.push(text_lines[j]);
      let section_str = current_section.join("\n");

      if (paragraphs.includes(section_str)) {
        matches.push(section_str);
        current_section = [];
      }
    }
    if (current_section.length > 0) {
      matches.push(current_section.join("\n"));
    }
    match_group.push(matches);
  }
  match_group = match_group.flat();

  let lyrics = [...new Set(match_group)];
  lyrics = lyrics.join("\n\n");
  let output = { lyrics: lyrics, pages: match_group };
  return output;
}

// Helper function to convert timestamps to seconds
function timeToSeconds(timestamp) {
  let [min, sec] = timestamp.split(":");
  return parseInt(min) * 60 + parseFloat(sec);
}
