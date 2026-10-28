const fs = require('fs');

const lines = fs.readFileSync('e:/Technopark/frontend/src/patient-hub.css', 'utf8').split('\n');
const oldColors = ['#2F7A3A', '#3D9B4A', '#9FE0A6', '#1e5c2a', '#152238', '#1B2A4A', '#eaf6ee', '#c8f0ce', '#c6e7cc'];

lines.forEach((line, idx) => {
  for(const c of oldColors) {
    if(line.toLowerCase().includes(c.toLowerCase())) {
      console.log(`Line ${idx+1}: ${line.trim()}`);
      break;
    }
  }
});
