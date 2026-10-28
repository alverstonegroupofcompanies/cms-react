const fs = require('fs');

let css = fs.readFileSync('e:/Technopark/frontend/src/patient-hub.css', 'utf8');

// 1. Modal backdrop tokens
css = css.replace(
`  --ph-teal: #3D9B4A;
  --ph-teal-dark: #2F7A3A;
  --ph-teal-soft: #EAF3EC;
  --ph-navy: #1B2A4A;
  --ph-ink: #1B2A4A;
  --ph-muted: #64748b;
  --ph-line: #e2e8f0;`,
`  --ph-teal: #7f5539;
  --ph-teal-dark: #543825;
  --ph-teal-soft: #ede0d4;
  --ph-navy: #382417;
  --ph-ink: #382417;
  --ph-muted: #6f5342;
  --ph-line: #e6ccb2;`
);

// 2. Auth brand logo plates
css = css.replace('.ph-auth-card-brand .brand-logo-plate {\n  background: #152238;\n}', '.ph-auth-card-brand .brand-logo-plate {\n  background: #3d2719;\n}');
css = css.replace('.ph-register-logo .brand-logo-plate {\n  background: #152238;\n}', '.ph-register-logo .brand-logo-plate {\n  background: #3d2719;\n}');

// 3. po- section replacements
const poReplacements = [
  ['background: linear-gradient(110deg, rgba(15, 28, 48, 0.88) 0%, rgba(15, 28, 48, 0.55) 55%, rgba(47, 122, 58, 0.45) 100%);',
   'background: linear-gradient(110deg, rgba(41, 26, 16, 0.90) 0%, rgba(61, 39, 25, 0.72) 55%, rgba(127, 85, 57, 0.6) 100%);'],
  ['.po-hero-inner h1 span {\n  color: #9FE0A6;\n}', '.po-hero-inner h1 span {\n  color: #ddb892;\n}'],
  ['.po-stat-card--teal { background: linear-gradient(145deg, #2F7A3A, #3D9B4A); }', '.po-stat-card--teal { background: linear-gradient(145deg, #7f5539, #63422c); }'],
  ['.po-stat-card--navy { background: linear-gradient(145deg, #1B2A4A, #2a3f66); }', '.po-stat-card--navy { background: linear-gradient(145deg, #9c6644, #7f5539); }'],
  ['.po-stat-card--mist { background: linear-gradient(145deg, #3d6b7a, #5a8f9e); }', '.po-stat-card--mist { background: linear-gradient(145deg, #b08968, #8c684d); }'],
  ['background: linear-gradient(90deg, #3D9B4A, #7bc48a);', 'background: linear-gradient(90deg, #7f5539, #ddb892);'],
  ['.po-visit-card.is-live {\n  border-color: #b7e0bc;\n  background: linear-gradient(180deg, #f4faf6 0%, #fff 40%);\n}',
   '.po-visit-card.is-live {\n  border-color: #ddb892;\n  background: linear-gradient(180deg, #faf6f2 0%, #fff 40%);\n}'],
  ['background: #EAF3EC;\n  color: #2F7A3A;', 'background: #ede0d4;\n  color: #7f5539;'],
  ['background: #f0fdf4;\n  border: 1px solid #bbf7d0;', 'background: #faf6f2;\n  border: 1px solid #ddb892;'],
  ['color: #166534;', 'color: #7f5539;'],
  ['color: #14532d;', 'color: #382417;'],
  ['.po-visit-copy h3 {\n  margin: 0 0 0.4rem;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: clamp(1.55rem, 2.5vw, 2rem);\n  font-weight: 700;\n  color: #1B2A4A;',
   '.po-visit-copy h3 {\n  margin: 0 0 0.4rem;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: clamp(1.55rem, 2.5vw, 2rem);\n  font-weight: 700;\n  color: #382417;'],
  ['border: 1px solid #dbe7df;', 'border: 1px solid #e6ccb2;'],
  ['.po-doctor strong {\n  display: block;\n  font-size: 0.92rem;\n  color: #1B2A4A;\n}', '.po-doctor strong {\n  display: block;\n  font-size: 0.92rem;\n  color: #382417;\n}'],
  ['.po-panel-head h3 {\n  margin: 0.15rem 0 0;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: 1.45rem;\n  font-weight: 700;\n  color: #1B2A4A;',
   '.po-panel-head h3 {\n  margin: 0.15rem 0 0;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: 1.45rem;\n  font-weight: 700;\n  color: #382417;'],
  ['.po-panel-link {\n  font-size: 0.86rem;\n  font-weight: 700;\n  color: #2F7A3A;', '.po-panel-link {\n  font-size: 0.86rem;\n  font-weight: 700;\n  color: #7f5539;'],
  ['.po-panel-link:hover {\n  color: #3D9B4A;\n}', '.po-panel-link:hover {\n  color: #9c6644;\n}'],
  ['.po-side-ico {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  display: grid;\n  place-items: center;\n  background: #EAF3EC;\n  color: #2F7A3A;',
   '.po-side-ico {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  display: grid;\n  place-items: center;\n  background: #ede0d4;\n  color: #7f5539;'],
  ['.po-side-row strong {\n  display: block;\n  font-size: 0.95rem;\n  color: #1B2A4A;\n}', '.po-side-row strong {\n  display: block;\n  font-size: 0.95rem;\n  color: #382417;\n}'],
  ['.po-facts dd {\n  margin: 0.15rem 0 0;\n  font-weight: 700;\n  color: #1B2A4A;\n}', '.po-facts dd {\n  margin: 0.15rem 0 0;\n  font-weight: 700;\n  color: #382417;\n}'],
  ['.po-rx-list strong {\n  display: block;\n  font-size: 0.9rem;\n  color: #1B2A4A;\n}', '.po-rx-list strong {\n  display: block;\n  font-size: 0.9rem;\n  color: #382417;\n}'],
  ['.po-rx-list em {\n  font-style: normal;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #2F7A3A;\n}', '.po-rx-list em {\n  font-style: normal;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #7f5539;\n}']
];

for(const [from, to] of poReplacements) {
  css = css.replace(from, to);
}

// 4. pb- section replacements
const pbReplacements = [
  ['radial-gradient(ellipse 70% 40% at 0% 0%, rgba(47, 158, 74, 0.07), transparent 55%),\n    radial-gradient(ellipse 50% 35% at 100% 20%, rgba(27, 42, 74, 0.05), transparent 50%),\n    linear-gradient(180deg, #f3f6f4 0%, #eef2f0 100%)',
   'radial-gradient(ellipse 70% 40% at 0% 0%, rgba(127, 85, 57, 0.08), transparent 55%),\n    radial-gradient(ellipse 50% 35% at 100% 20%, rgba(221, 184, 146, 0.12), transparent 50%),\n    linear-gradient(180deg, #faf6f2 0%, #f5eee8 100%)'],
  ['linear-gradient(125deg, #152238 0%, #1c3348 48%, #243b2e 100%)', 'linear-gradient(125deg, #3d2719 0%, #543825 48%, #7f5539 100%)'],
  ['radial-gradient(ellipse 50% 80% at 90% 20%, rgba(159, 224, 166, 0.18), transparent 55%),\n    linear-gradient(115deg, rgba(15, 28, 48, 0.2), transparent 60%)',
   'radial-gradient(ellipse 50% 80% at 90% 20%, rgba(221, 184, 146, 0.18), transparent 55%),\n    linear-gradient(115deg, rgba(41, 26, 16, 0.25), transparent 60%)'],
  ['background: linear-gradient(125deg, #152238 0%, #1e3d2a 100%);', 'background: linear-gradient(125deg, #3d2719 0%, #63422c 100%);'],
  ['border: 1px solid rgba(159, 224, 166, 0.35);\n  color: #c8f0ce;', 'border: 1px solid rgba(221, 184, 146, 0.35);\n  color: #ede0d4;'],
  ['border: 1px solid rgba(201, 215, 204, 0.9);', 'border: 1px solid #e6ccb2;'],
  ['background: linear-gradient(180deg, #eaf6ee 0%, #f4faf6 100%);', 'background: linear-gradient(180deg, #faf6f2 0%, #ede0d4 100%);'],
  ['background: linear-gradient(90deg, #3D9B4A, #9FE0A6);', 'background: linear-gradient(90deg, #7f5539, #ddb892);'],
  ['background: linear-gradient(145deg, #2F7A3A, #1e5c2a);', 'background: linear-gradient(145deg, #7f5539, #543825);'],
  ['.pb-step.done .pb-step-num {\n  background: #3D9B4A;\n  color: #fff;\n}', '.pb-step.done .pb-step-num {\n  background: #9c6644;\n  color: #fff;\n}'],
  ['.pb-step.active .pb-step-label { color: #1e5c2a; }', '.pb-step.active .pb-step-label { color: #543825; }'],
  ['.pb-step.done .pb-step-label { color: #2F7A3A; }', '.pb-step.done .pb-step-label { color: #7f5539; }'],
  ['border: 1px solid rgba(201, 215, 204, 0.85);', 'border: 1px solid #e6ccb2;'],
  ['background: linear-gradient(90deg, #2F7A3A, #9FE0A6);', 'background: linear-gradient(90deg, #7f5539, #ddb892);'],
  ['.pb-shell-head h2 {\n  margin: 0 0 0.35rem;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: clamp(1.55rem, 2.5vw, 2rem);\n  font-weight: 700;\n  color: #152238;',
   '.pb-shell-head h2 {\n  margin: 0 0 0.35rem;\n  font-family: var(--ph-display, \'Cormorant Garamond\', Georgia, serif);\n  font-size: clamp(1.55rem, 2.5vw, 2rem);\n  font-weight: 700;\n  color: #382417;'],
  ['border: 1px solid #c6e7cc;\n  background: linear-gradient(160deg, #f3faf5, #fff);', 'border: 1px solid #ddb892;\n  background: linear-gradient(160deg, #faf6f2, #fff);'],
  ['.pb-picked strong {\n  font-size: 0.9rem;\n  color: #152238;\n}', '.pb-picked strong {\n  font-size: 0.9rem;\n  color: #382417;\n}'],
  ['.pb-picked span {\n  font-size: 0.75rem;\n  font-weight: 750;\n  color: #2F7A3A;\n}', '.pb-picked span {\n  font-size: 0.75rem;\n  font-weight: 750;\n  color: #7f5539;\n}'],
  ['border: 1px solid #e2e8e4;\n  background: linear-gradient(165deg, #f7faf8 0%, #fff 55%);', 'border: 1px solid #e6ccb2;\n  background: linear-gradient(165deg, #faf6f2 0%, #fff 55%);'],
  ['.pb-dept-card.is-on {\n  border-color: #3D9B4A;\n  background: linear-gradient(165deg, #eaf6ee 0%, #fff 60%);',
   '.pb-dept-card.is-on {\n  border-color: #7f5539;\n  background: linear-gradient(165deg, #ede0d4 0%, #fff 60%);'],
  ['background: linear-gradient(145deg, #e8f6ec, #f4faf6);\n  color: #2F7A3A;\n  border: 1px solid #d0e6d5;',
   'background: linear-gradient(145deg, #ede0d4, #faf6f2);\n  color: #7f5539;\n  border: 1px solid #ddb892;'],
  ['background: linear-gradient(145deg, #2F7A3A, #3D9B4A);', 'background: linear-gradient(145deg, #7f5539, #9c6644);'],
  ['.pb-dept-card strong {\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #152238;',
   '.pb-dept-card strong {\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #382417;'],
  ['.pb-doctor-card.is-on {\n  border-color: #3D9B4A;\n  background: linear-gradient(120deg, #f3faf5, #fff);',
   '.pb-doctor-card.is-on {\n  border-color: #7f5539;\n  background: linear-gradient(120deg, #faf6f2, #fff);'],
  ['.pb-doctor-copy strong {\n  font-size: 1.02rem;\n  color: #152238;\n}', '.pb-doctor-copy strong {\n  font-size: 1.02rem;\n  color: #382417;\n}'],
  ['color: #2F7A3A !important;', 'color: #7f5539 !important;'],
  ['color: #2F7A3A;\n  padding: 0.35rem 0.65rem;\n  border-radius: 999px;\n  background: #eaf6ee;',
   'color: #7f5539;\n  padding: 0.35rem 0.65rem;\n  border-radius: 999px;\n  background: #ede0d4;'],
  ['.pb-date-card.is-on {\n  border-color: #3D9B4A;\n  background: linear-gradient(165deg, #eaf6ee, #fff);',
   '.pb-date-card.is-on {\n  border-color: #7f5539;\n  background: linear-gradient(165deg, #ede0d4, #fff);'],
  ['.pb-date-card.is-on .pb-date-dow { color: #2F7A3A; }', '.pb-date-card.is-on .pb-date-dow { color: #7f5539; }'],
  ['.pb-date-card strong {\n  font-size: 0.92rem;\n  color: #152238;', '.pb-date-card strong {\n  font-size: 0.92rem;\n  color: #382417;'],
  ['.pb-slot-card {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.4rem;\n  padding: 0.85rem 0.7rem;\n  border-radius: 14px;\n  border: 1px solid #e2e8e4;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  font-weight: 650;\n  font-size: 0.9rem;\n  color: #152238;',
   '.pb-slot-card {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.4rem;\n  padding: 0.85rem 0.7rem;\n  border-radius: 14px;\n  border: 1px solid #e6ccb2;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  font-weight: 650;\n  font-size: 0.9rem;\n  color: #382417;'],
  ['.pb-slot-card.is-on {\n  border-color: #2F7A3A;\n  background: #2F7A3A;\n  color: #fff;\n  box-shadow: 0 10px 20px rgba(47, 122, 58, 0.25);\n}',
   '.pb-slot-card.is-on {\n  border-color: #7f5539;\n  background: #7f5539;\n  color: #ede0d4;\n  box-shadow: 0 10px 20px rgba(127, 85, 57, 0.25);\n}'],
  ['.pb-ready-card {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  padding: 1.15rem 1.2rem;\n  border-radius: 16px;\n  background: #f7faf8;\n  border: 1px solid #dde8e1;\n}',
   '.pb-ready-card {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  padding: 1.15rem 1.2rem;\n  border-radius: 16px;\n  background: #faf6f2;\n  border: 1px solid #e6ccb2;\n}'],
  ['.pb-ready-row strong {\n  text-align: right;\n  color: #152238;', '.pb-ready-row strong {\n  text-align: right;\n  color: #382417;'],
  ['.pb-fee { color: #2F7A3A !important; }', '.pb-fee { color: #7f5539 !important; }'],
  ['linear-gradient(160deg, #152238 0%, #1c2f4a 55%, #1e3a2f 100%)', 'linear-gradient(160deg, #3d2719 0%, #543825 55%, #7f5539 100%)'],
  ['color: rgba(159, 224, 166, 0.92);', 'color: #ddb892;'],
  ['.pb-aside-list li.is-set .pb-aside-dot {\n  background: #9FE0A6;\n  box-shadow: 0 0 0 4px rgba(159, 224, 166, 0.2);\n}',
   '.pb-aside-list li.is-set .pb-aside-dot {\n  background: #ddb892;\n  box-shadow: 0 0 0 4px rgba(221, 184, 146, 0.25);\n}'],
  ['.pb-aside-fee strong {\n  color: #9FE0A6;', '.pb-aside-fee strong {\n  color: #ddb892;'],
  ['background: linear-gradient(160deg, #eaf6ee, #f4faf6);\n  border: 1px solid #c6e7cc;',
   'background: linear-gradient(160deg, #faf6f2, #ede0d4);\n  border: 1px solid #ddb892;'],
  ['.pb-aside-tip-ico {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 1.75rem;\n  height: 1.75rem;\n  flex-shrink: 0;\n  border-radius: 999px;\n  background: #2F7A3A;\n  color: #fff;\n}',
   '.pb-aside-tip-ico {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 1.75rem;\n  height: 1.75rem;\n  flex-shrink: 0;\n  border-radius: 999px;\n  background: #7f5539;\n  color: #ede0d4;\n}'],
  ['.pb-aside-tip p {\n  margin: 0;\n  font-size: 0.86rem;\n  line-height: 1.45;\n  color: #1B2A4A;\n}',
   '.pb-aside-tip p {\n  margin: 0;\n  font-size: 0.86rem;\n  line-height: 1.45;\n  color: #382417;\n}'],
  ['background: linear-gradient(160deg, #152238, #1e3a2f);', 'background: linear-gradient(160deg, #3d2719, #63422c);'],
  ['color: rgba(159, 224, 166, 0.9);', 'color: #ddb892;'],
  ['background: rgba(159, 224, 166, 0.18);\n  border: 1px solid rgba(159, 224, 166, 0.35);\n  color: #c8f0ce;',
   'background: rgba(221, 184, 146, 0.22);\n  border: 1px solid rgba(221, 184, 146, 0.4);\n  color: #ede0d4;'],
  ['.pb-summary-list dd {\n  margin: 0;\n  font-size: 0.98rem;\n  font-weight: 650;\n  color: #152238;\n}',
   '.pb-summary-list dd {\n  margin: 0;\n  font-size: 0.98rem;\n  font-weight: 650;\n  color: #382417;\n}'],
  ['background: #eaf6ee;\n  color: #2F7A3A;', 'background: #ede0d4;\n  color: #7f5539;']
];

for(const [from, to] of pbReplacements) {
  css = css.replace(from, to);
}

fs.writeFileSync('e:/Technopark/frontend/src/patient-hub.css', css);
console.log('patient-hub.css updated successfully!');
