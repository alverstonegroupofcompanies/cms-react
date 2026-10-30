import { Link } from 'react-router-dom'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'
import './specialty-disciplines-grid.css'

interface SpecialtyDisciplinesGridProps {
  signedIn?: boolean
}

export default function SpecialtyDisciplinesGrid({ signedIn = false }: SpecialtyDisciplinesGridProps) {
  const bookVisitTo = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'

  return (
    <section className="sdg-section" id="departments" aria-label="Care Across Our Specialty Disciplines">
      <div className="sdg-container">
        {/* ==================================================================
            1. SECTION HEADER
            ================================================================== */}
        <div className="sdg-header">
          <SplitText as="h2" className="sdg-title">
            Care Across Our <span className="sdg-title-accent">Specialty Disciplines</span>
          </SplitText>

          <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
            <p className="sdg-subtitle">
              From gentle pediatric visits to certified pathology diagnostics, book experienced clinicians dedicated to
              your health.
            </p>
          </Reveal>
        </div>

        {/* ==================================================================
            2. 8-TILE CHECKERBOARD GRID
            ================================================================== */}
        <Reveal direction="up" distance={24} stagger={0.07} className="sdg-tiles-grid">
            {/* ROW 1 */}
            {/* Tile 1: IMAGE (Pediatrics) */}
            <div className="sdg-tile sdg-tile--image">
              <img
                src="/images/dept-pediatrics.jpg"
                alt="Friendly specialist pediatrician examining a young child in modern colorful clinic"
                loading="lazy"
              />
              <span className="sdg-img-badge">Child Care</span>
            </div>

            {/* Tile 2: LIGHT TEXT (Pediatrics - Warm Cream) */}
            <div className="sdg-tile sdg-tile--text sdg-tile--cream">
              <div className="sdg-text-top">
                <span className="sdg-tag">Pediatric OP</span>
                <h3 className="sdg-tile-title">Pediatrics &amp; Child Wellness</h3>
                <p className="sdg-tile-desc">
                  Gentle, attentive outpatient care for infants, children, and adolescents with friendly specialist
                  pediatricians and routine developmental milestones.
                </p>
              </div>
              <Link to={`${bookVisitTo}?dept=Pediatrics`} className="sdg-tile-link">
                <span>More Information</span>
                <span className="sdg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Tile 3: IMAGE (General Medicine) */}
            <div className="sdg-tile sdg-tile--image">
              <img
                src="/images/dept-general-medicine.jpg"
                alt="Senior internal medicine specialist doctor reviewing patient wellness charts on tablet"
                loading="lazy"
              />
              <span className="sdg-img-badge">Primary Care</span>
            </div>

            {/* Tile 4: DARK TEXT (General Medicine - Midnight Forest) */}
            <div className="sdg-tile sdg-tile--text sdg-tile--dark">
              <div className="sdg-text-top">
                <span className="sdg-tag">Adult Wellness</span>
                <h3 className="sdg-tile-title">General &amp; Internal Medicine</h3>
                <p className="sdg-tile-desc">
                  Everyday adult health concerns, lifestyle disease monitoring, hypertension checkups, and routine
                  preventive wellness screenings.
                </p>
              </div>
              <Link to={`${bookVisitTo}?dept=General+Medicine`} className="sdg-tile-link">
                <span>More Information</span>
                <span className="sdg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            {/* ROW 2 */}
            {/* Tile 5: MUTED TEXT (Dermatology - Slate Sage) */}
            <div className="sdg-tile sdg-tile--text sdg-tile--slate">
              <div className="sdg-text-top">
                <span className="sdg-tag">Skin Clinic</span>
                <h3 className="sdg-tile-title">Dermatology &amp; Aesthetics</h3>
                <p className="sdg-tile-desc">
                  Specialized consultations for dermatological health, chronic skin allergies, and advanced non-invasive
                  clinical aesthetics.
                </p>
              </div>
              <Link to={`${bookVisitTo}?dept=Dermatology`} className="sdg-tile-link">
                <span>More Information</span>
                <span className="sdg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Tile 6: IMAGE (Dermatology) */}
            <div className="sdg-tile sdg-tile--image">
              <img
                src="/images/dept-dermatology.jpg"
                alt="Doctor performing advanced digital skin analysis in dermatology consultation suite"
                loading="lazy"
              />
              <span className="sdg-img-badge">Skin Clinic</span>
            </div>

            {/* Tile 7: LIGHT TEXT (Diagnostic Pathology - Soft Porcelain) */}
            <div className="sdg-tile sdg-tile--text sdg-tile--porcelain">
              <div className="sdg-text-top">
                <span className="sdg-tag">NABL Accredited</span>
                <h3 className="sdg-tile-title">Advanced Diagnostic Pathology</h3>
                <p className="sdg-tile-desc">
                  Precision laboratory diagnostics with automated testing machinery and rapid digital report delivery to
                  your portal.
                </p>
              </div>
              <Link to={`${bookVisitTo}?dept=Pathology`} className="sdg-tile-link">
                <span>More Information</span>
                <span className="sdg-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Tile 8: IMAGE (Diagnostic Pathology) */}
            <div className="sdg-tile sdg-tile--image">
              <img
                src="/images/dept-lab-diagnostics.jpg"
                alt="Precision clinical automated laboratory analyzers and testing equipment"
                loading="lazy"
              />
              <span className="sdg-img-badge">Modern Lab</span>
            </div>
          </Reveal>
      </div>
    </section>
  )
}
