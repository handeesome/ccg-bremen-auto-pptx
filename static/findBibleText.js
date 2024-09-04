import { Searcher } from "./bibleSearch.js";
export function findBibleText(searchPrompt) {
  var result = "";

  Searcher.setOptions({
    onError: function (err, source) {
      console.error(source ? err + ": " + source : err);
    },
    onTitle: function (title) {
      result += "$" + title + "\n";
    },
    onTextLine: function (prefix, text) {
      result += prefix + " " + text + "\n";
    },
  });

  Searcher.indexSearch(searchPrompt);
  return result;
}
