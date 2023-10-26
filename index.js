import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function saveDataToJson(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Data sparad till ${filename}`);
}

