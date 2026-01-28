const child_process = require('child_process');
const fs = require('fs');

const { tracing } = require('./tracing.js');
const hydra = child_process.spawn('./hydra.out', ['-d', '-w'], {cwd:process.cwd()});

tracing.debug('ARGV', process.argv);

// console.log(tracing.)
let resultResolve = null;
let resultBuffer = '';
let startupResolve = null;
let startupBuffer = '';

hydra.stderr.on('data', (data) => {
    const s = data.toString();
    tracing.thread('ERRH').debug(s);
    
    // Check for startup completion
    if (startupResolve) {
        startupBuffer += s;
        if (startupBuffer.includes('Running see 7') && 
            startupBuffer.includes('Running decision mode') && 
            startupBuffer.includes('Running weighted mode')) {
            startupResolve();
            startupResolve = null;
            startupBuffer = '';
        }
    }
    
    resultBuffer += s;
    if (resultBuffer.includes('Result: ')) {
        const match = resultBuffer.match(/Result: (.+)/);
        if (match && resultResolve) {
            resultResolve(match[1].trim());
            resultResolve = null;
            resultBuffer = '';
        }
    }
});

hydra.stdout.on('data', (data) => {
    tracing.thread('OUTH').debug(`${data}`);
});

hydra.on('close', (code) => {
    tracing.thread('CLSH').warn(`hydra exited with code ${code}`);
});

function waitForStartup() {
    return new Promise((resolve) => {
        startupResolve = resolve;
    });
}

function waitForResult() {
    return new Promise((resolve) => {
        resultResolve = resolve;
    });
}

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
        s.add(r.join(''));
    }
    return Array.from(s).map((v) => v.split(''));
}

const ORDER = 'TIJLOSZ';
const SECOND = process.argv[2];

const qs = permutations(SECOND.split(''), 4).map((a) => a.join(''));
const ps = permutations(ORDER.split(''), 3).map((a) => a.join(''));

async function main() {
    tracing.thread('MAIN').warn('waiting for hydra');
    await waitForStartup();
    // tracing.thread('MAIN').info('Hydra started, processing queues...');
    
    const iz = Date.now();
    let tw = 0;
    for (const q of qs) {
        for (const p of ps) {
            // tracing.info(`processing ${q} ${p}`);
            hydra.stdin.write(`${q}${p} 4\n`);
            const i = Date.now();
            const weight = await waitForResult();
            const di = Date.now() - i;
            const file = fs.readFileSync('./tree_data.js', 'utf-8')
            tw += parseInt(weight);

            await fs.promises.mkdir(`../data_2/${q}`, { recursive: true });
            await fs.promises.writeFile(`../data_2/${q}/${p}.js`, `// ${q}-${p}=${weight}\n${file}`);
            tracing.thread(q).info(`saved ../data_2/${q}/${p}.js [${weight}] in ${di} ms`);
        }
        tracing.thread('MAIN').warn(`completed queue ${q} in ${Date.now() - iz} ms [${tw}]`);
    }
    hydra.stdin.end();
}

main();