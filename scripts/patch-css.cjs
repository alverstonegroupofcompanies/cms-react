const fs = require('fs')
const p = 'e:/Technopark/frontend/src/index.css'
let t = fs.readFileSync(p, 'utf8')
const start = t.indexOf('.home-logo span { color: var(--accent); }')
const authStart = t.indexOf('/* ========== AUTH SPLIT ========== */')
const authEnd = t.indexOf('.register-steps {', authStart)
if (start < 0 || authStart < 0 || authEnd < 0) {
  console.log({ start, authStart, authEnd })
  process.exit(1)
}
const newAuth = `/* ========== AUTH SPLIT ========== */
.auth-split {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
}

.auth-split-visual {
  position: relative;
  background: url('/images/staff-hero.jpg') center/cover no-repeat;
  display: flex;
  align-items: flex-end;
  padding: 2.5rem 3rem 3rem;
  overflow: hidden;
}

.auth-split-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(155deg, rgba(27, 42, 74, 0.78) 0%, rgba(27, 42, 74, 0.4) 50%, rgba(21, 34, 56, 0.82) 100%),
    url('/images/leaf-pattern.svg') right 10% top 12% / 150px no-repeat;
  pointer-events: none;
}

.auth-visual-overlay { display: none; }

.auth-visual-content {
  position: relative;
  color: white;
  z-index: 1;
  max-width: 26rem;
}

.auth-visual-content .brand-logo-link,
.auth-visual-content .brand-logo { margin-bottom: 1.5rem; }

.auth-visual-content h1 {
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 2.8vw, 2.4rem);
  font-weight: 600;
  margin-bottom: 0.65rem;
  line-height: 1.2;
}

.auth-visual-content p {
  opacity: 0.9;
  max-width: 360px;
  line-height: 1.55;
}

.auth-split-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background:
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(61, 155, 74, 0.08), transparent 50%),
    var(--bg);
}

.auth-form-wrap {
  width: 100%;
  max-width: 420px;
  background: var(--card);
  padding: 2.25rem 2.35rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  animation: am-fade-up 380ms var(--ease-out) both;
}

.auth-form-brand { margin-bottom: 1.25rem; }

.auth-shield, .auth-phone-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent);
  margin: 0 0 1rem;
}

.auth-form-wrap h2 {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.35rem;
  text-align: left;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin-bottom: 1.35rem;
  text-align: left;
}

.demo-creds {
  text-align: center;
  font-size: 0.8rem;
  margin-top: 1rem;
  color: var(--text-muted);
  background: var(--bg);
  padding: 0.5rem;
  border-radius: 6px;
}

.back-link {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: color var(--dur) var(--ease-out);
}

.back-link:hover { color: var(--accent); }

`
t = t.slice(0, start) + newAuth + t.slice(authEnd)
fs.writeFileSync(p, t)
console.log('ok')
