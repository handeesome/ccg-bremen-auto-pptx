import { Searcher } from "./bibleSearch.js";
export function findBibleText(searchPrompt) {
  let result = { fullName: null, verses: {} };

  Searcher.setOptions({
    onError: function (err, source) {
      console.error(source ? err + ": " + source : err);
    },
    onTitle: function (title) {
      result.fullName = title;
    },
    onTextLine: function (prefix, text) {
      result.verses[prefix] = text;
    },
  });

  Searcher.indexSearch(searchPrompt);
  return result;
}
