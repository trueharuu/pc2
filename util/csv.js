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
const queues = process.argv[2]
  ? [process.argv[2]]
  : fs
      .readFileSync("queues.txt", "utf-8")
      .split("\n")
      .filter((x) => !x.startsWith("#"));

for (const queue of queues) {
  const ORDER = "TIJLOSZ";
  const SECOND = queue;

  const qs = permutations(SECOND.split(""), 4).map((a) => a.join(""));
  const ps = permutations(ORDER.split(""), 3).map((a) => a.join(""));

  const csv = [];
  csv.push(["", ...ps]);
  for (const q of qs) {
    const t = [q];
    for (const p of ps) {
      const file = `../data_2/${q}/${p}.js`;
      try {
        const result = fs
          .readFileSync(file, "utf-8")
          .split("\n")[0]
          .split("=")[1];
        t.push(result);
      } catch {
        t.push("?");
      }
    }

    csv.push(t);
  }
  fs.writeFileSync(`../stats/${SECOND}.csv`, csv.map((x) => x.join(",")).join("\n"));
}
