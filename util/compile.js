/**
 * @param {Array} arr
 * @param {number} len
 * @returns {Array<Array>}
 */
function permutations(arr, len) {
  if (len === 1) return arr.map((v) => [v]);
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let rest = arr.slice(0, i).concat(arr.slice(i + 1));
    let perms = permutations(rest, len - 1);
    for (let perm of perms) {
      result.push([arr[i]].concat(perm));
    }
  }

  // return deduplicated result
  const s = new Set();
  for (const r of result) {
    s.add(r.join(""));
  }
  return Array.from(s).map((v) => v.split(""));
}

const fs = require("fs");
const path = require("path");
const queues = process.argv[2]
  ? process.argv[2].split(',')
  : fs
      .readFileSync("queues.txt", "utf-8")
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0 && !x.startsWith("#"));

for (const queue of queues) {
  for (const major of permutations(queue.split(""), 4)) {
    const majorKey = major.join("");
    const sourceDir = path.join("..", "data_2", majorKey);
    const destDir = path.join("..", "2nd", queue, majorKey);

    if (!fs.existsSync(sourceDir)) {
      continue;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(sourceDir, destDir, { recursive: true });
  }
}