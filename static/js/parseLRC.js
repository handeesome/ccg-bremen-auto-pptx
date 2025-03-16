export function parseLRC(lrcText) {
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
  let lyrics = [...new Set(pages)];
  lyrics = lyrics.join("\n\n");
  let output = { lyrics: lyrics, pages: pages };
  return output;
}

// Helper function to convert timestamps to seconds
function timeToSeconds(timestamp) {
  let [min, sec] = timestamp.split(":");
  return parseInt(min) * 60 + parseFloat(sec);
}
