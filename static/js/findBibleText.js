import { Searcher } from "./bibleSearch.js";
export function findBibleText(searchPrompt) {
  let result = [];

  Searcher.setOptions({
    onError: function (err, source) {
      console.error(source ? err + ": " + source : err);
    },
    onTextLine: function (prefix, text) {
      result.push({ [prefix]: text });
    },
  });

  Searcher.indexSearch(searchPrompt);
  return result;
}
