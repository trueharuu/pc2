const child_process = require('child_process');
const fs = require('fs');

const queues = fs.readFileSync('./queues.txt', 'utf-8').trim().split('\n').map(line => line.trim()).filter(line=> line.length > 0 && !line.startsWith('#'));

for (const queue of queues) {
    // fs.mkdirSync(`./thread/${queue}`, { recursive: true });
    child_process.spawn('node', ['./index.js', queue], {stdio: 'inherit'});
}