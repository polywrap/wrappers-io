import path from "path-browserify";
import { InMemoryFile } from "@nerfzael/memory-fs";

function prefix(words: string[]) {
  // check border cases size 1 array and empty first word)
  if (!words[0] || words.length === 1) return words[0] || "";
  let i = 0;
  // while all words have the same character at position i, increment i
  while (words[0][i] && words.every((w) => w[i] === words[0][i])) i++;

  // prefix is the substring from the beginning to the last successfully checked i
  return words[0].substr(0, i);
}

export const stripBasePath = (files: InMemoryFile[]): InMemoryFile[] => {
  const basePath = prefix(files.map((f) => f.path));

  return files
    .map((file) => ({
      path: path.relative(basePath, file.path) ?? ".",
      content: file.content,
    }))
    .filter((file) => !!file.path);
};
