const fs = require('fs');

const lines = fs.readFileSync('e:/Technopark/frontend/src/patient-homepage.css', 'utf8').split('\n');
const oldCols = ['#065f46', '#064e3b', '#a7f3d0', '#ecfdf5', '#059669', '#047857'];

lines.forEach((line, idx) => {
  for(const c of oldCols) {
    if(line.toLowerCase().includes(c.toLowerCase())) {
      console.log(`Line ${idx+1}: ${line.trim()}`);
      break;
    }
  }
});
