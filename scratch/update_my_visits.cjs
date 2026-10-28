const fs = require('fs');

let css = fs.readFileSync('e:/Technopark/frontend/src/pages/patient/my-visits.css', 'utf8');

// Title / Header comment
css = css.replace(
  'Color palette: Deep Navy (#152238), Emerald (#1f7a3a / #2fb356), Soft Mist (#f0fdf4)',
  'Color palette: Deep Coffee (#382417), Coffee Bean (#7f5539), Toffee (#9c6644), Almond (#ede0d4), Tan (#ddb892)'
);

// Colors mapping
const replacements = [
  // Primary buttons and gradients
  ['linear-gradient(135deg, #22964b 0%, #1f7a3a 50%, #17632f 100%)', 'linear-gradient(135deg, #9c6644 0%, #7f5539 50%, #543825 100%)'],
  ['linear-gradient(135deg, #27a754 0%, #228b43 50%, #1a6f35 100%)', 'linear-gradient(135deg, #b08968 0%, #9c6644 50%, #7f5539 100%)'],
  ['linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 250, 246, 0.96) 55%, rgba(235, 246, 240, 0.93) 100%)', 'linear-gradient(135deg, #ffffff 0%, #faf6f2 55%, #ede0d4 100%)'],
  ['linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 'linear-gradient(135deg, #ede0d4 0%, #faf6f2 100%)'],
  ['linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', 'linear-gradient(180deg, #faf6f2 0%, #ffffff 100%)'],
  ['linear-gradient(90deg, #1f7a3a, #269146)', 'linear-gradient(90deg, #7f5539, #9c6644)'],
  ['linear-gradient(180deg, #fbfdfc 0%, #ffffff 100%)', 'linear-gradient(180deg, #faf6f2 0%, #ffffff 100%)'],
  
  // Specific RGBA
  ['rgba(61, 155, 74, 0.22)', 'rgba(221, 184, 146, 0.35)'],
  ['rgba(61, 155, 74, 0.12)', 'rgba(221, 184, 146, 0.2)'],
  ['rgba(31, 122, 58, 0.09)', 'rgba(127, 85, 57, 0.12)'],
  ['rgba(31, 122, 58, 0.22)', 'rgba(221, 184, 146, 0.35)'],
  ['rgba(31, 122, 58, 0.26)', 'rgba(127, 85, 57, 0.25)'],
  ['rgba(31, 122, 58, 0.34)', 'rgba(156, 102, 68, 0.35)'],
  ['rgba(31, 122, 58, 0.28)', 'rgba(127, 85, 57, 0.35)'],
  ['rgba(31, 122, 58, 0.2)', 'rgba(127, 85, 57, 0.25)'],
  ['rgba(31, 122, 58, 0.12)', 'rgba(127, 85, 57, 0.15)'],
  ['rgba(31, 122, 58, 0.3)', 'rgba(127, 85, 57, 0.3)'],
  ['rgba(31, 122, 58, 0.15)', 'rgba(127, 85, 57, 0.2)'],
  ['rgba(34, 197, 94, 0.7)', 'rgba(127, 85, 57, 0.7)'],
  ['rgba(34, 197, 94, 0)', 'rgba(127, 85, 57, 0)'],
  ['rgba(22, 163, 74, 0.22)', 'rgba(127, 85, 57, 0.25)'],

  // Direct hex
  ['#1f7a3a', '#7f5539'],
  ['#2fb356', '#9c6644'],
  ['#22c55e', '#7f5539'],
  ['#15803d', '#7f5539'],
  ['#269146', '#9c6644'],
  ['#f0fdf4', '#faf6f2'],
  ['#dcfce7', '#ede0d4'],
  ['#152238', '#382417'],
  ['rgba(21, 34, 56,', 'rgba(56, 36, 23,']
];

for(const [from, to] of replacements) {
  css = css.split(from).join(to);
}

fs.writeFileSync('e:/Technopark/frontend/src/pages/patient/my-visits.css', css);
console.log('my-visits.css updated successfully!');
