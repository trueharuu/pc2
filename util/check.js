const child_process = require("child_process");
const fs = require("fs");

const queues = fs
  .readFileSync("./queues.txt", "utf-8")
  .trim()
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));

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

const ORDER = "TIJLOSZ";

console.log('result,queue,major,minor');
for (const queue of queues) {
  const queueResults = [];
  
  for (const major of permutations(queue.split(""), 4)) {
    const results = [];
    for (const minor of permutations(ORDER.split(""), 3)) {
      const result = fs.existsSync(
        `../data_2/${major.join("")}/${minor.join("")}.js`,
        "utf-8",
      );
      results.push({ result, minor: minor.join("") });
    }

    // Check if all results are the same
    const allSame = results.every((r) => r.result === results[0].result);
    
    if (allSame) {
      const result = results[0].result;
      queueResults.push({ type: 'major', result, major: major.join("") });
    } else {
      for (const { result, minor } of results) {
        queueResults.push({ type: 'detail', result, major: major.join(""), minor });
      }
    }
  }

  // Check if all queue results are the same
  const allQueueSame = queueResults.every((r) => r.result === queueResults[0].result);
  
  if (allQueueSame) {
    const result = queueResults[0].result;
    console.log(`${result ? 'HIT' : 'MISS'},${queue}`);
  } else {
    for (const item of queueResults) {
      if (item.type === 'major') {
        console.log(`${item.result ? 'HIT' : 'MISS'},${queue},${item.major}`);
      } else {
        console.log(`${item.result ? 'HIT' : 'MISS'},${queue},${item.major},${item.minor}`);
      }
    }
  }
}
