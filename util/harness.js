const child_process = require('child_process');
const fs = require('fs');

const MAX = Number(process.argv[2] || 4); // Maximum concurrent processes
const queues = fs.readFileSync('./queues.txt', 'utf-8').trim().split('\n').map(line => line.trim()).filter(line=> line.length > 0 && !line.startsWith('#'));

let activeProcesses = [];
let queueIndex = 0;

function spawn(queue) {
    const child = child_process.spawn('node', ['./index.js', queue], {stdio: 'inherit'});
    return child;
}

function startNextProcess() {
    if (queueIndex < queues.length) {
        const queue = queues[queueIndex];
        queueIndex++;
        
        const child = spawn(queue);
        activeProcesses.push(child);
        
        child.on('exit', (code) => {
            activeProcesses = activeProcesses.filter(p => p !== child);
            startNextProcess();
        });
        
        child.on('error', (err) => {
            console.error(`Error spawning process for queue ${queue}:`, err);
            activeProcesses = activeProcesses.filter(p => p !== child);
            startNextProcess();
        });
    }
}

// Start initial batch of MAX processes
for (let i = 0; i < Math.min(MAX, queues.length); i++) {
    startNextProcess();
}
