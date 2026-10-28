const fs = require('fs');

['LabReports.tsx', 'Prescriptions.tsx', 'Profile.tsx', 'About.tsx'].forEach(f => {
  const p = 'e:/Technopark/frontend/src/pages/patient/' + f;
  if(fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    const matches = [...c.matchAll(/className=["']([^"']+)["']/g)].map(m => m[1]);
    console.log(f, matches.slice(0, 10));
  }
});
