export function parseVerse(verseString) {
  const regex = /(.+?)\s+(\d+):(\d+)(?:-(\d+))?/;
  const match = verseString.match(regex);

  if (!match) return null; // Return null if format is incorrect

  return {
    book: match[1], // Extract the book name
    chapter: parseInt(match[2], 10), // Extract the chapter number
    verseFrom: parseInt(match[3], 10), // Extract the starting verse
    verseTo: match[4] ? parseInt(match[4], 10) : parseInt(match[3], 10), // Extract ending verse if available
  };
}
