const fs = require('fs');

let css = fs.readFileSync('e:/Technopark/frontend/src/patient-homepage.css', 'utf8');

const map = [
  ['#065f46', '#7f5539'],
  ['#064e3b', '#543825'],
  ['#059669', '#7f5539'],
  ['#047857', '#543825'],
  ['#a7f3d0', '#ddb892'],
  ['#ecfdf5', '#ede0d4'],
  ['#6ee7b7', '#e6ccb2'],
  ['#10b981', '#9c6644']
];

for(const [from, to] of map) {
  css = css.split(from).join(to);
}

fs.writeFileSync('e:/Technopark/frontend/src/patient-homepage.css', css);
console.log('patient-homepage.css updated successfully!');
