const fs = require('fs');

const hub = fs.readFileSync('e:/Technopark/frontend/src/patient-hub.css', 'utf8');
const oldColors = ['#2F7A3A', '#3D9B4A', '#9FE0A6', '#1e5c2a', '#152238', '#1B2A4A', '#eaf6ee', '#c8f0ce', '#1f7a3a', '#c6e7cc'];

oldColors.forEach(col => {
  const reg = new RegExp(col, 'gi');
  const count = (hub.match(reg) || []).length;
  console.log(`hub: ${col} -> ${count} times`);
});
