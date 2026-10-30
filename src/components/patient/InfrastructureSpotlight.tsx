import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'
import AnimatedCounter from '../motion/AnimatedCounter'
import ExpandableImage from '../motion/ExpandableImage'
import { IconBuilding, IconFlask, IconPill, IconStethoscope, IconClock, IconCheck } from '../Icons'
import './infrastructure-spotlight.css'

export interface FacilityItem {
  id: string
  tabLabel: string
  subLabel: string
  icon: ReactNode
  tag: string
  name: string
  location: string
  image: string
  imageAlt: string
  caption: string
  gradient: string
  statTop: {
    label: string
    value?: number
    prefix?: string
    suffix?: string
    textValue?: string
  }
  statLeft: {
    label: string
    value?: number
    prefix?: string
    suffix?: string
    textValue?: string
  }
  statRight: {
    label: string
    value?: number
    prefix?: string
    suffix?: string
    textValue?: string
  }
  heading: string
  description: string
  checklist: {
    title: string
    detail: string
  }[]
}

export const FACILITIES_DATA: FacilityItem[] = [
  {
    id: 'campus',
    tabLabel: 'Integrated Campus',
    subLabel: 'Central Complex',
    icon: <IconBuilding size={17} />,
    tag: 'INTEGRATED CAMPUS',
    name: 'Alverstone Medcity Healthcare Campus',
    location: 'Chandanathope, Kollam · Central Campus',
    image: '/images/patient-site-banner.jpg',
    imageAlt: 'Alverstone Medcity Integrated Healthcare Campus Building in Chandanathope, Kollam',
    caption: 'Alverstone Medcity Modern Campus Building with Landscaped Grounds and Wide Ramps',
    gradient: 'linear-gradient(145deg, #fef08a 0%, #f97316 55%, #dc2626 100%)',
    statTop: {
      label: 'Campus Space',
      value: 45000,
      suffix: '+ Sq.Ft',
    },
    statLeft: {
      label: 'Parking & Transit',
      value: 120,
      suffix: '+ Bays',
    },
    statRight: {
      label: 'Campus Access',
      textValue: '24/7 Open',
    },
    heading: 'A Healthcare Experience That Respects Your Time',
    description:
      'We believe medical visits should feel organized and reassuring, not stressful. Alverstone Medcity was founded to eliminate long waits and fragmented care through smart scheduling and campus integration in Chandanathope, Kollam.',
    checklist: [
      {
        title: 'Smart Slot Scheduling',
        detail: 'Pick a slot that fits your day and walk in knowing your doctor is ready for you.',
      },
      {
        title: 'Diagnostics & Pharmacy On Campus',
        detail: 'Collect medicines and provide lab samples without traveling across town.',
      },
      {
        title: 'Unified Electronic Patient Account',
        detail: 'Your prescriptions, doctor notes, and lab reports stay organized and accessible 24/7.',
      },
      {
        title: '100% Step-Free Campus Access',
        detail: 'Wide entrance ramps, smooth transit corridors, and wheelchair escorts for senior patients.',
      },
    ],
  },
  {
    id: 'lab',
    tabLabel: 'Diagnostic Lab',
    subLabel: 'NABL Certified',
    icon: <IconFlask size={17} />,
    tag: 'NABL ACCREDITED',
    name: 'Automated Diagnostic Pathology & Lab',
    location: 'Ground Floor · Wing B Diagnostic Suite',
    image: '/images/dept-lab-diagnostics.jpg',
    imageAlt: 'NABL automated hematology and clinical biochemistry analyzers in modern laboratory',
    caption: 'Automated Clinical Biochemistry Analyzers and High-Precision Diagnostic Suites',
    gradient: 'linear-gradient(145deg, #fed7aa 0%, #ea580c 50%, #b91c1c 100%)',
    statTop: {
      label: 'Test Accuracy',
      value: 99.8,
      suffix: '%',
    },
    statLeft: {
      label: 'Daily Panels',
      value: 450,
      suffix: '+ Tests',
    },
    statRight: {
      label: 'Digital TAT',
      textValue: '< 2 Hours',
    },
    heading: 'Certified Diagnostic Accuracy on Campus',
    description:
      'Equipped with automated biochemistry analyzers and hematology suites, our on-campus diagnostic wing ensures samples never need transport across town, delivering verified results directly to your doctor’s screen.',
    checklist: [
      {
        title: 'Direct E-Worksheet Synchronization',
        detail: 'Verified findings populate your physician’s console the moment testing is validated.',
      },
      {
        title: 'Immediate Digital Portal Delivery',
        detail: 'Access and download verified laboratory reports from your phone anytime, day or night.',
      },
      {
        title: 'Gentle Clinical Phlebotomy',
        detail: 'Dedicated sampling suites with ergonomic armchairs and friendly certified phlebotomists.',
      },
      {
        title: 'Cold-Chain Sample Preservation',
        detail: 'Calibrated temperature containment ensuring biological integrity from draw to analysis.',
      },
    ],
  },
  {
    id: 'pharmacy',
    tabLabel: '24/7 Pharmacy',
    subLabel: 'In-House Dispensary',
    icon: <IconPill size={17} />,
    tag: '24/7 DISPENSARY',
    name: 'Hospital Clinical Pharmacy Counter',
    location: 'Central Entrance Atrium · 24 Hours Open',
    image: '/images/service-pharmacy.jpg',
    imageAlt: 'Indian clinical pharmacist counseling patient at organized hospital pharmacy counter',
    caption: '24/7 In-House Clinical Pharmacy with Temperature-Monitored Medicine Shelving',
    gradient: 'linear-gradient(145deg, #fde68a 0%, #d97706 50%, #991b1b 100%)',
    statTop: {
      label: 'Formulations',
      textValue: '100% Genuine',
    },
    statLeft: {
      label: 'Dispense Speed',
      textValue: '< 3 Mins',
    },
    statRight: {
      label: 'Service Hours',
      textValue: '24 × 7 Always',
    },
    heading: 'Zero-Wait Prescription Dispensing Under One Roof',
    description:
      'Step directly from your consultation into our fully stocked, temperature-monitored clinical pharmacy. Prescriptions sent digitally by your doctor are verified and assembled before you reach the desk.',
    checklist: [
      {
        title: 'Direct E-Prescription Synchronization',
        detail: 'Zero transcription errors and no lost slips—prescriptions route automatically from your doctor.',
      },
      {
        title: 'Calibrated 2°C–8°C Cold Chain',
        detail: 'Monitored refrigeration units for insulins, vaccines, and pediatric formulations.',
      },
      {
        title: 'Personalized Dosage Counseling',
        detail: 'Pharmacists explain timing relative to meals, duration, and proper storage before you leave.',
      },
      {
        title: 'Night & Emergency Dispensing',
        detail: 'Fully staffed through the night so families never struggle to find open pharmacies during emergencies.',
      },
    ],
  },
  {
    id: 'suites',
    tabLabel: 'Consultation Suites',
    subLabel: 'Private OPD Rooms',
    icon: <IconStethoscope size={17} />,
    tag: 'PRIVATE CLINICAL SUITES',
    name: 'Specialist Outpatient Consultation Suites',
    location: 'Floors 1 & 2 · Clinical Consultation Wing',
    image: '/images/roles/doctor.jpg',
    imageAlt: 'Sunlit modern doctor consultation room with desk, stethoscope and diagnostic display',
    caption: 'Private Specialist Consultation Room with Acoustic Isolation and Natural Daylight',
    gradient: 'linear-gradient(145deg, #fbcfe8 0%, #f43f5e 50%, #e11d48 100%)',
    statTop: {
      label: 'Private Suites',
      value: 18,
      suffix: '+ Rooms',
    },
    statLeft: {
      label: 'Average Wait',
      textValue: '< 8 Mins',
    },
    statRight: {
      label: 'Sanitization',
      textValue: '100% Clean',
    },
    heading: 'Unhurried, Private Care with Senior Clinicians',
    description:
      'Every consulting suite is engineered for acoustic privacy, natural light, and patient dignity. Consultation rooms feature digital diagnostic displays, ergonomic examination beds, and quiet ambiance.',
    checklist: [
      {
        title: 'Complete Acoustic Privacy',
        detail: 'Sound-dampened suites allow you to discuss sensitive health matters in total confidentiality.',
      },
      {
        title: 'High-Resolution Clinical Terminals',
        detail: 'Review previous visit notes, medication schedules, and digital charts side-by-side with your doctor.',
      },
      {
        title: 'Ergonomic Examination Lounges',
        detail: 'Comfortable, sanitized examination couches designed for elderly patients and infants.',
      },
      {
        title: 'Zero Rush Consultation Timing',
        detail: 'Doctors take time to listen, explain diagnoses clearly, and answer every family question.',
      },
    ],
  },
  {
    id: 'lounge',
    tabLabel: 'Patient Lounge',
    subLabel: 'Quiet Waiting Space',
    icon: <IconClock size={17} />,
    tag: 'HOSPITALITY COMFORT',
    name: 'Hospitality-Grade Reception & Waiting Lounge',
    location: 'Ground Floor Atrium · Reception Plaza',
    image: '/images/patient-about.jpg',
    imageAlt: 'Calm sunlit clinic corridor and patient waiting lounge with comfortable seating',
    caption: 'Sunlit Patient Lounge with Ergonomic Armchairs and Live Queue Displays',
    gradient: 'linear-gradient(145deg, #fed7aa 0%, #f97316 50%, #c2410c 100%)',
    statTop: {
      label: 'Lounge Seating',
      value: 80,
      suffix: '+ Guests',
    },
    statLeft: {
      label: 'Queue Status',
      textValue: 'Live Sync',
    },
    statRight: {
      label: 'Air Quality',
      textValue: 'HEPA Clean',
    },
    heading: 'A Calm, Welcoming Environment Before Your Turn',
    description:
      'Say goodbye to noisy, crowded hospital waiting halls. Our reception lounge offers comfortable ergonomic armchairs, live token displays, and dedicated elder concierge assistance in a sunlit atrium.',
    checklist: [
      {
        title: 'Real-Time Queue TV Displays',
        detail: 'Monitor live doctor queue numbers from any seat without standing near the door.',
      },
      {
        title: 'Dedicated Senior Concierge Desk',
        detail: 'Attentive staff ready to assist with transit, wheelchair escorts, and check-in guidance.',
      },
      {
        title: 'Complimentary Amenities',
        detail: 'Filtered drinking water, complimentary high-speed Wi-Fi, and reading periodicals.',
      },
      {
        title: 'Quiet Acoustic Design',
        detail: 'Sound-absorbing ceilings and gentle natural lighting reduce anxiety for waiting families.',
      },
    ],
  },
]

interface InfrastructureSpotlightProps {
  signedIn?: boolean
}

export default function InfrastructureSpotlight({ signedIn = false }: InfrastructureSpotlightProps) {
  const [activeTabId, setActiveTabId] = useState<string>(FACILITIES_DATA[0].id)
  const currentFacility = FACILITIES_DATA.find((f) => f.id === activeTabId) || FACILITIES_DATA[0]

  const bookVisitTo = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'

  return (
    <section className="is-section" id="campus-infrastructure" aria-label="Campus Facilities and Clinical Infrastructure">
      {/* Ambient background soft pastel gradient blobs */}
      <div className="is-ambient-bg" aria-hidden="true">
        <div className="is-blob is-blob-1" />
        <div className="is-blob is-blob-2" />
        <div className="is-blob is-blob-3" />
      </div>

      <div className="is-container">
        {/* ==================================================================
            1. SECTION HEADER WITH FACILITY TABS
            ================================================================== */}
        <div className="is-header">
          <SplitText as="h2" className="is-title">
            World-Class Care Built Around <span className="is-title-accent">Your Time &amp; Comfort</span>
          </SplitText>

          <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
            <p className="is-subtitle">
              Explore our integrated campus in Chandanathope, Kollam—where consultation suites, 24/7 clinical pharmacy,
              and precision diagnostics are housed together to eliminate waits and travel delays.
            </p>
          </Reveal>

          {/* Interactive Facility Switcher Tabs */}
          <div className="is-tabs-row" role="tablist" aria-label="Select a campus facility">
            {FACILITIES_DATA.map((fac) => {
              const isActive = fac.id === currentFacility.id
              return (
                <button
                  key={fac.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`is-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveTabId(fac.id)}
                >
                  <span className="is-tab-icon" aria-hidden="true">
                    {fac.icon}
                  </span>
                  <span className="is-tab-name">{fac.tabLabel}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ==================================================================
            2. THE SHOWCASE STAGE (EXACT MATCH TO REFERENCE DESIGN)
            ================================================================== */}
        <div className="is-showcase-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFacility.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="is-showcase-grid"
            >
              {/* LEFT COLUMN: Visual Frame with Floating Frosted Glass Cards */}
              <div className="is-visual-col">
                <div className="is-portrait-card">
                  {/* Warm Sunset/Golden Rounded Backdrop */}
                  <div className="is-portrait-backdrop" style={{ background: currentFacility.gradient }} />

                  {/* Facility Photo Window with Expandable View */}
                  <div className="is-portrait-img-box">
                    <ExpandableImage
                      src={currentFacility.image}
                      alt={currentFacility.imageAlt}
                      caption={currentFacility.caption}
                    />
                  </div>

                  {/* Floating Frosted Stat 1: Top (Indigo / Purple in screenshot) */}
                  <div className="is-floating-badge is-badge-top">
                    <span className="is-badge-label">{currentFacility.statTop.label}</span>
                    <span className="is-badge-value">
                      {currentFacility.statTop.value !== undefined ? (
                        <AnimatedCounter
                          value={currentFacility.statTop.value}
                          prefix={currentFacility.statTop.prefix}
                          suffix={currentFacility.statTop.suffix}
                          duration={1.2}
                        />
                      ) : (
                        currentFacility.statTop.textValue
                      )}
                    </span>
                  </div>

                  {/* Floating Frosted Stat 2: Left (Cyan / Sky Blue in screenshot) */}
                  <div className="is-floating-badge is-badge-left">
                    <span className="is-badge-label">{currentFacility.statLeft.label}</span>
                    <span className="is-badge-value">
                      {currentFacility.statLeft.value !== undefined ? (
                        <AnimatedCounter
                          value={currentFacility.statLeft.value}
                          prefix={currentFacility.statLeft.prefix}
                          suffix={currentFacility.statLeft.suffix}
                          duration={1.3}
                        />
                      ) : (
                        currentFacility.statLeft.textValue
                      )}
                    </span>
                  </div>

                  {/* Floating Frosted Stat 3: Right (Teal / Emerald in screenshot) */}
                  <div className="is-floating-badge is-badge-right">
                    <span className="is-badge-label">{currentFacility.statRight.label}</span>
                    <span className="is-badge-value">
                      {currentFacility.statRight.value !== undefined ? (
                        <AnimatedCounter
                          value={currentFacility.statRight.value}
                          prefix={currentFacility.statRight.prefix}
                          suffix={currentFacility.statRight.suffix}
                          duration={1.1}
                        />
                      ) : (
                        currentFacility.statRight.textValue
                      )}
                    </span>
                  </div>

                  {/* Frosted Glass Name Badge (Docked across the bottom of the card) */}
                  <div className="is-name-dock">
                    <div className="is-dock-icon" aria-hidden="true">
                      <IconBuilding size={18} />
                    </div>
                    <div className="is-dock-texts">
                      <h3 className="is-dock-name">{currentFacility.name}</h3>
                      <p className="is-dock-role">{currentFacility.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Facility Details, Features & Actions */}
              <div className="is-content-col">
                <div className="is-about-block">
                  <h3 className="is-about-heading">{currentFacility.heading}</h3>
                  <p className="is-about-desc">{currentFacility.description}</p>
                </div>

                {/* The 4-Item Feature Checklist */}
                <div className="is-checklist-block">
                  <h4 className="is-checklist-heading">Infrastructure Highlights</h4>
                  <ul className="is-checklist-list">
                    {currentFacility.checklist.map((item) => (
                      <li key={item.title} className="is-check-item">
                        <div className="is-check-icon" aria-hidden="true">
                          <IconCheck size={18} />
                        </div>
                        <div className="is-check-text">
                          <strong>{item.title}</strong>
                          <span>{item.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="is-actions-row">
                  <Link to="/patient/about" className="is-btn-primary">
                    <span>Learn More About Our Campus</span>
                    <span className="is-btn-arrow" aria-hidden="true">→</span>
                  </Link>

                  <Link to={bookVisitTo} className="is-btn-secondary">
                    <span>Book a Visit</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

