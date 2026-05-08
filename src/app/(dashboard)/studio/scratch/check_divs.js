import fs from 'fs';

const content = fs.readFileSync('d:\\Project\\yaml-anchor-ui\\src\\app\\(dashboard)\\studio\\page.tsx', 'utf8');

let openDivs = 0;
let closeDivs = 0;

const divRegex = /<div|<\/div>/g;
let match;

while ((match = divRegex.exec(content)) !== null) {
    if (match[0] === '<div') {
        openDivs++;
    } else {
        closeDivs++;
    }
}

console.log(`Open divs: ${openDivs}`);
console.log(`Close divs: ${closeDivs}`);
