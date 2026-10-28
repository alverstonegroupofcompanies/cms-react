import { Link, useParams } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import { useAuth } from '../../context/AuthContext'
import { CLINIC } from '../../config/clinic'
import { usePageTitle } from '../../hooks/usePageTitle'
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFlask,
  IconHeart,
  IconPhone,
  IconPill,
  IconStethoscope,
} from '../../components/Icons'

export interface SpecialtyContent {
  slug: string
  name: string
  bookingDept: string
  kicker: string
  tagline: string
  heroImage: string
  heroImageAlt: string
  secondaryImage: string
  secondaryImageAlt: string
  heroQuote: {
    text: string
    author: string
    role: string
  }
  overview: string
  awarenessTitle: string
  awarenessLead: string
  warningSigns: string[]
  clinicalServices: {
    title: string
    detail: string
  }[]
  nutritionIntro: string
  foodsToEat: {
    name: string
    benefit: string
  }[]
  foodsToLimit: string[]
  healthHabits: {
    title: string
    practice: string
    cadence: string
  }[]
  secondaryQuotes: {
    quote: string
    context: string
  }[]
  specialistNote: {
    doctor: string
    credentials: string
    message: string
  }
}

export const SPECIALTIES_DATA: Record<string, SpecialtyContent> = {
  'general-medicine': {
    slug: 'general-medicine',
    name: 'General & Internal Medicine',
    bookingDept: 'General & Internal Medicine',
    kicker: 'Primary & Preventive Adult Medicine',
    tagline: 'Whole-body clinical evaluation, metabolic balance, and early disease prevention.',
    heroImage: '/images/specialties/general-medicine.jpg',
    heroImageAlt: 'Senior Indian internist consulting with a patient in a bright sunlit Kerala examination room',
    secondaryImage: '/images/roles/doctor.jpg',
    secondaryImageAlt: 'Sunlit internal medicine consultation desk with stethoscope',
    heroQuote: {
      text: 'The greatest medicine of all is teaching people how not to need it — through early awareness, balanced nourishment, and attentive primary care.',
      author: 'Hippocrates',
      role: 'Foundational Principle of Internal Medicine',
    },
    overview:
      'General & Internal Medicine serves as your first and most trusted point of clinical continuity at Alverstone Medcity. From acute seasonal fevers and respiratory infections to long-term management of diabetes, thyroid disorders, and hypertension, our internists look at how every organ system interacts rather than treating isolated symptoms.',
    awarenessTitle: 'Why Early Internal Medicine Awareness Matters',
    awarenessLead:
      'Many chronic conditions — including Type 2 diabetes, essential hypertension, fatty liver, and vitamin deficiencies — progress silently for years before causing noticeable discomfort. Routine annual evaluations allow our physicians to detect subtle metabolic shifts when they are still completely reversible through nutrition and lifestyle adjustments.',
    warningSigns: [
      'Unexplained persistent fatigue, afternoon energy crashes, or unrefreshing sleep',
      'Frequent thirst, unintended weight fluctuations, or slow-healing minor cuts',
      'Recurring headaches, dizziness upon standing, or borderline elevated blood pressure',
      'Prolonged low-grade fevers, lingering coughs, or seasonal viral syndromes lasting over 5 days',
      'Digestive irregularity, acid reflux, or recurring abdominal bloating after meals',
    ],
    clinicalServices: [
      {
        title: 'Comprehensive Adult & Metabolic Screening',
        detail: 'Complete blood pressure, glycemic (HbA1c), lipid, thyroid, hepatic, and renal baseline profiling.',
      },
      {
        title: 'Diabetes & Thyroid Continuity Care',
        detail: 'Individualized titration of medications paired with sustainable nutritional and glycemic coaching.',
      },
      {
        title: 'Acute Fever & Infectious Disease Evaluation',
        detail: 'Rapid differentiation of viral, dengue, typhoid, and respiratory infections with targeted therapy.',
      },
      {
        title: 'Preventive Adult Immunization & Travel Health',
        detail: 'Influenza, pneumococcal, hepatitis, and tetanus boosters tailored to age and medical history.',
      },
    ],
    nutritionIntro:
      'Internal medicine nutrition focuses on stabilizing blood glucose curves, reducing systemic inflammation, and supporting gut-liver metabolic harmony.',
    foodsToEat: [
      {
        name: 'Fiber-Rich Whole Grains & Millets (Ragi, Oats, Red Rice)',
        benefit: 'Slows glucose absorption, prevents post-meal insulin spikes, and nourishes beneficial gut flora.',
      },
      {
        name: 'Dark Leafy Greens & Cruciferous Vegetables (Spinach, Moringa, Broccoli)',
        benefit: 'Provides bioavailable magnesium, folate, and phytonutrients that support liver detoxification and vascular tone.',
      },
      {
        name: 'Plant & Lean Proteins (Lentils, Chickpeas, Sprouts, Eggs, Fish)',
        benefit: 'Preserves lean muscle mass, supports immune antibody synthesis, and promotes lasting satiety.',
      },
      {
        name: 'Fermented Probiotic Foods (Fresh Curd, Buttermilk) & Citrus Fruits',
        benefit: 'Strengthens mucosal immunity, improves micronutrient absorption, and supplies natural Vitamin C.',
      },
    ],
    foodsToLimit: [
      'Refined white sugars, sweetened beverages, and packaged bakery snacks that trigger glycemic volatility',
      'Deep-fried foods and reheated cooking oils high in pro-inflammatory trans fats',
      'Excessive table salt, pickles, and processed meats that elevate arterial pressure',
      'Late-night heavy meals within two hours of sleep that impair overnight metabolic recovery',
    ],
    healthHabits: [
      {
        title: '30-Minute Post-Meal & Daily Brisk Walk',
        practice: 'A 10–15 minute gentle walk after meals significantly blunts blood sugar spikes, while 150 minutes of weekly brisk walking improves insulin sensitivity.',
        cadence: 'Daily · 30 Mins',
      },
      {
        title: 'Structured Hydration Rhythm',
        practice: 'Drink 2.5 to 3 liters of water steadily across the day—starting with a warm glass upon waking—to support renal filtration and cellular energy.',
        cadence: 'Every 2 Hours',
      },
      {
        title: '7–8 Hours of Circadian Sleep Hygiene',
        practice: 'Keep a consistent sleep and wake window and dim screens 45 minutes before bed to regulate cortisol and overnight cellular repair.',
        cadence: 'Nightly',
      },
      {
        title: 'Annual Preventive Metabolic Checkup',
        practice: 'Track your CBC, fasting glucose, HbA1c, lipid panel, liver/kidney function, and Vitamin D/B12 levels once a year even when feeling well.',
        cadence: 'Every 12 Months',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'A good physician treats the disease; the great physician treats the patient who has the disease.',
        context: 'Sir William Osler · Father of Modern Internal Medicine',
      },
      {
        quote: 'Small daily choices on your plate and in your footsteps quietly write the story of your next decade of health.',
        context: 'Alverstone Medcity Preventive Medicine Charter',
      },
    ],
    specialistNote: {
      doctor: 'Dr. Sarah Sharma',
      credentials: 'MD (General Medicine), DNB · Senior Consultant Internist',
      message:
        'Never wait for a symptom to become disruptive before asking questions. A 20-minute preventive consultation today can spare years of complex medication tomorrow.',
    },
  },

  cardiology: {
    slug: 'cardiology',
    name: 'Cardiology & Heart Care',
    bookingDept: 'Cardiology & Heart Care',
    kicker: 'Preventive & Clinical Heart Center',
    tagline: 'Protecting every heartbeat through early risk detection, rhythm care, and vascular wellness.',
    heroImage: '/images/specialties/cardiology.jpg',
    heroImageAlt: 'Indian female cardiologist reviewing an ECG report and heart model with a patient',
    secondaryImage: '/images/doctors/doc-priya-cardiology.jpg',
    secondaryImageAlt: 'Dr. Priya Sharma, MD Cardiology in a bright hospital wing',
    heroQuote: {
      text: 'Guard your heart with quiet consistency — every calm breath, every unhurried walk, and every nourishing meal lightens the work of one hundred thousand beats a day.',
      author: 'Dr. Priya Sharma',
      role: 'Lead Cardiologist · Alverstone Medcity Heart Center',
    },
    overview:
      'Your heart beats roughly 100,000 times every day, circulating oxygen and nutrients through 60,000 miles of blood vessels. At Alverstone Medcity’s Cardiology & Heart Care department, we combine non-invasive cardiac diagnostics (ECG, Echocardiography, lipid and hypertension risk stratification) with compassionate lifestyle cardiology to prevent coronary artery disease before it starts.',
    awarenessTitle: 'Heart Health Awareness: Knowing Your Numbers & Signals',
    awarenessLead:
      'Cardiovascular disease remains the leading preventable health challenge in Kerala and across India, increasingly affecting adults in their 30s and 40s due to stress, sedentary work, and silent hypertension. Understanding your blood pressure, LDL cholesterol, resting heart rate, and family history empowers you to protect your arteries early.',
    warningSigns: [
      'Chest heaviness, tightness, or squeezing discomfort during brisk walking or climbing stairs',
      'Unexplained shortness of breath, unusual fatigue, or lightheadedness during routine activity',
      'Palpitations, fluttering sensations, or a racing/irregular heartbeat at rest',
      'Radiating discomfort toward the left shoulder, jaw, neck, or upper back',
      'Swelling around the ankles or feet accompanied by elevated blood pressure readings (>130/85 mmHg)',
    ],
    clinicalServices: [
      {
        title: '12-Lead Digital ECG & Rhythm Evaluation',
        detail: 'Immediate assessment of cardiac electrical conduction, arrhythmias, and ischemic changes.',
      },
      {
        title: 'Hypertension & Lipid Optimization Clinic',
        detail: 'Precision blood pressure control and cholesterol management to halt arterial plaque progression.',
      },
      {
        title: 'Preventive Cardiac Risk Stratification',
        detail: 'Comprehensive heart screening for patients with diabetes, smoking history, or family cardiac history.',
      },
      {
        title: 'Post-Cardiac Event Rehabilitation & Follow-Up',
        detail: 'Structured medication titration, exercise pacing, and dietary guidance after angioplasty or cardiac care.',
      },
    ],
    nutritionIntro:
      'A heart-protective Mediterranean and traditional South Indian coastal diet emphasizes omega-3 fatty acids, soluble fiber, potassium-rich produce, and antioxidant polyphenols.',
    foodsToEat: [
      {
        name: 'Omega-3 Rich Fish & Seeds (Sardines, Mackerel, Flaxseeds, Walnuts)',
        benefit: 'Lowers triglycerides, stabilizes arterial endothelium, and reduces vascular inflammation.',
      },
      {
        name: 'Soluble-Fiber Grains & Legumes (Rolled Oats, Barley, Black Gram, Lentils)',
        benefit: 'Binds dietary cholesterol in the digestive tract and helps lower LDL ("bad") cholesterol naturally.',
      },
      {
        name: 'Potassium & Nitrate-Rich Produce (Spinach, Beetroot, Pomegranate, Berries, Banana)',
        benefit: 'Promotes natural nitric oxide production to relax blood vessel walls and balance sodium levels.',
      },
      {
        name: 'Heart-Healthy Monounsaturated Oils (Cold-Pressed Olive, Mustard, or Moderate Groundnut Oil)',
        benefit: 'Supports healthy HDL cholesterol ratios when used in moderation without high-heat smoking.',
      },
    ],
    foodsToLimit: [
      'Excess sodium (< 5g salt/day): papads, salted snacks, canned soups, and heavy restaurant gravies',
      'Hydrogenated vanaspati, margarine, and commercially baked pastries containing trans fats',
      'Processed red meats and high-sugar sodas that accelerate endothelial stiffness',
      'Tobacco in any form and binge alcohol consumption, which directly trigger coronary spasm and arrhythmias',
    ],
    healthHabits: [
      {
        title: '150 Minutes of Zone-2 Aerobic Movement Weekly',
        practice: 'Sustained moderate brisk walking, cycling, or swimming strengthens the heart muscle and lowers resting heart rate.',
        cadence: '5 Days / Week',
      },
      {
        title: 'Home Blood Pressure & Pulse Logging',
        practice: 'Check blood pressure seated quietly after 5 minutes of rest; aim to keep readings consistently below 120/80 mmHg.',
        cadence: 'Weekly Check',
      },
      {
        title: 'Autonomic Stress Decompression',
        practice: 'Practice 10 minutes of slow diaphragmatic breathing (4-second inhale, 6-second exhale) to lower sympathetic adrenaline tone.',
        cadence: 'Daily · 10 Mins',
      },
      {
        title: 'Annual Lipid Profile, HbA1c & ECG Screening',
        practice: 'Every adult over 30 should know their ApoB/LDL cholesterol, fasting sugar, and baseline ECG trace.',
        cadence: 'Every 6–12 Months',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'Wherever the art of medicine is loved, there is also a love of humanity — and nowhere is that felt more deeply than in caring for the human heart.',
        context: 'Dr. René Favaloro · Pioneer of Coronary Care',
      },
      {
        quote: 'Your arteries remember every walk you take and every peaceful night of sleep you protect.',
        context: 'Alverstone Heart Wellness Guideline',
      },
    ],
    specialistNote: {
      doctor: 'Dr. Priya Sharma',
      credentials: 'MD, DM (Cardiology) · Senior Consultant Cardiologist',
      message:
        'Heart disease is largely preventable when caught early. Even if you feel completely energetic, knowing your blood pressure and cholesterol numbers in your 30s and 40s is the best gift you can give your family.',
    },
  },

  pediatrics: {
    slug: 'pediatrics',
    name: 'Pediatrics & Child Wellness',
    bookingDept: 'Pediatrics & Child Wellness',
    kicker: 'Neonatal, Child Growth & Immunization Center',
    tagline: 'Nurturing resilient immunity, joyful milestones, and healthy growth from infancy through adolescence.',
    heroImage: '/images/specialties/pediatrics.jpg',
    heroImageAlt: 'Indian pediatrician examining a smiling child with her mother in a bright clinic room',
    secondaryImage: '/images/patient-hero.jpg',
    secondaryImageAlt: 'Bright, calming pediatric and family consultation suite',
    heroQuote: {
      text: 'To nourish a child’s health in their earliest years is to build the foundation for a lifetime of curiosity, resilience, and strength.',
      author: 'Dr. Arun Kumar',
      role: 'Consultant Pediatrician · Alverstone Child Wellness Wing',
    },
    overview:
      'Children are not simply small adults — their physiology, immunity, nutritional needs, and developmental milestones evolve rapidly from month to month. Our Pediatrics & Child Wellness department provides gentle, unhurried care for newborns, infants, toddlers, and school-age children in a calm, reassuring environment for parents.',
    awarenessTitle: 'Child Health & Developmental Awareness for Parents',
    awarenessLead:
      'The first 1,000 days of life and the school-going years shape a child’s lifelong immune system, bone density, and cognitive potential. Tracking growth charts, staying on schedule with vaccinations, and avoiding unnecessary antibiotic use during simple viral colds are essential pillars of modern pediatric care.',
    warningSigns: [
      'High fever in infants under 3 months, or fever lasting more than 72 hours in older children',
      'Fast or labored breathing, chest indrawing, persistent wheezing, or barking cough',
      'Signs of dehydration during stomach flu: dry mouth, crying without tears, or fewer wet diapers',
      'Unusual lethargy, poor feeding, persistent vomiting, or a rash that does not fade when pressed',
      'Delayed speech, motor milestones, or poor weight/height gain across consecutive growth checks',
    ],
    clinicalServices: [
      {
        title: 'Newborn & Well-Baby Milestone Clinics',
        detail: 'Serial head-to-toe growth charting, breastfeeding support, and neuro-developmental screening.',
      },
      {
        title: 'IAP-Aligned Complete Immunization Schedule',
        detail: 'Cold-chain verified vaccines with gentle administration and digital vaccination tracking.',
      },
      {
        title: 'Pediatric Respiratory, Allergy & Asthma Care',
        detail: 'Child-friendly nebulization, wheeze management, and seasonal allergy prevention plans.',
      },
      {
        title: 'Childhood Nutrition & Anemia Prevention',
        detail: 'Assessment and correction of picky eating, iron/vitamin D deficiency, and adolescent growth spurts.',
      },
    ],
    nutritionIntro:
      'Growing bodies and developing brains need nutrient-dense, colorful whole foods rich in iron, calcium, essential fatty acids, and complete proteins—without artificial additives.',
    foodsToEat: [
      {
        name: 'Brain-Building Fats & Proteins (Eggs, Ghee in Moderation, Nuts/Nut Pastes, Lentils, Fish)',
        benefit: 'Supplies DHA, choline, and essential amino acids vital for myelination, memory, and steady growth.',
      },
      {
        name: 'Iron & Folate Powerhouses (Ragi Porridge, Spinach, Dates, Pomegranate, Drumstick Leaves)',
        benefit: 'Prevents childhood iron-deficiency anemia and supports oxygen delivery for active play and focus.',
      },
      {
        name: 'Calcium & Bone Builders (Milk, Fresh Curd, Paneer, Sesame/Til, Ragi)',
        benefit: 'Builds peak bone mineral density and healthy dental enamel during rapid skeletal growth.',
      },
      {
        name: 'Rainbow Fruits & Hydrating Vegetables (Papaya, Banana, Sweet Potato, Carrots, Oranges)',
        benefit: 'Provides beta-carotene for vision, Vitamin C for immunity, and natural prebiotic fiber for digestion.',
      },
    ],
    foodsToLimit: [
      'Packaged fruit juices, flavored sodas, and candies that cause dental caries and blunt natural appetite',
      'Ultra-processed instant noodles, chips, and snacks high in sodium, MSG, and artificial food dyes',
      'Caffeinated beverages or energy drinks in older children and adolescents',
      'Screen-time feeding (watching phones/TV during meals), which disrupts natural hunger and fullness cues',
    ],
    healthHabits: [
      {
        title: '60 Minutes of Outdoor Sunlight & Free Play',
        practice: 'Daily outdoor physical play builds motor coordination, stimulates natural Vitamin D synthesis, and reduces myopia (nearsightedness) risk.',
        cadence: 'Daily · 1 Hour',
      },
      {
        title: 'Age-Appropriate Restorative Sleep',
        practice: 'Toddlers need 11–14 hours and school-age children need 9–11 hours of uninterrupted sleep for growth hormone release and memory consolidation.',
        cadence: 'Every Night',
      },
      {
        title: 'Handwashing & Respiratory Hygiene',
        practice: 'Teach 20-second soap handwashing before meals and after school to cut seasonal viral and gastrointestinal infections in half.',
        cadence: 'Before Meals',
      },
      {
        title: 'Scheduled Growth & Immunization Visits',
        practice: 'Keep every scheduled well-child visit to plot height, weight, BMI percentile, vision, and booster vaccinations.',
        cadence: 'Per Age Chart',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'Play is the highest form of research — and a healthy, well-rested child learns with every leap and laugh.',
        context: 'Pediatric Developmental Principle',
      },
      {
        quote: 'Patience, reassurance, and listening to parents are half of every good pediatric diagnosis.',
        context: 'Alverstone Child Wellness Promise',
      },
    ],
    specialistNote: {
      doctor: 'Dr. Arun Kumar',
      credentials: 'DCH, MD (Pediatrics) · Senior Consultant Pediatrician',
      message:
        'Most childhood fevers are the immune system learning and growing stronger. We are here to help you know when to comfort at home and when prompt medical evaluation is needed.',
    },
  },

  geriatrics: {
    slug: 'geriatrics',
    name: 'Geriatrics & Elder Care',
    bookingDept: 'Geriatrics & Elder Care',
    kicker: 'Senior Wellness, Mobility & Continuity Care',
    tagline: 'Honoring our elders with unhurried consultations, medication harmony, and dignified independence.',
    heroImage: '/images/specialties/geriatrics.jpg',
    heroImageAlt: 'Indian doctor and nurse warmly assisting a smiling elderly gentleman in a sunlit corridor',
    secondaryImage: '/images/patient-banner-book.jpg',
    secondaryImageAlt: 'Sunlit appointment schedule and stethoscope for senior continuity care',
    heroQuote: {
      text: 'Growing older is not a diagnosis — our goal in geriatric medicine is not merely to add years to life, but to add comfort, clarity, and independence to every year.',
      author: 'Dr. Rajesh Menon',
      role: 'Senior Consultant in Internal & Geriatric Medicine',
    },
    overview:
      'Senior health requires a thoughtful, holistic lens. Older adults often juggle multiple prescriptions, subtle changes in balance or memory, and chronic conditions such as osteoarthritis, hypertension, or diabetes. Our Geriatrics & Elder Care wing focuses on preserving functional independence, preventing falls, simplifying complex medication regimens, and supporting family caregivers.',
    awarenessTitle: 'Healthy Aging Awareness: Preserving Strength, Memory & Balance',
    awarenessLead:
      'Many changes dismissed as "normal aging"—such as sudden confusion, unsteadiness, appetite loss, or low mood—are actually treatable medical conditions, vitamin deficiencies, or medication side effects. Proactive geriatric reviews keep seniors active, sharp, and confident at home.',
    warningSigns: [
      'Unexplained unsteadiness, near-falls, dizziness when rising from bed, or shuffling gait',
      'New memory lapses, sudden confusion (delirium), or withdrawal from family conversations',
      'Taking 5 or more daily medications without a recent clinical review for drug interactions',
      'Progressive loss of appetite, unintended weight loss, or difficulty chewing and swallowing',
      'Joint stiffness, chronic knee/back pain, or nighttime urinary frequency disrupting sleep',
    ],
    clinicalServices: [
      {
        title: 'Comprehensive Geriatric Assessment (CGA)',
        detail: 'Holistic review of mobility, cognition, vision/hearing, bone health, and cardiovascular stability.',
      },
      {
        title: 'Polypharmacy & Medication Reconciliation',
        detail: 'Careful auditing of all prescriptions and supplements to eliminate duplicate drugs and dizziness risks.',
      },
      {
        title: 'Bone Density, Arthritis & Fall Prevention Care',
        detail: 'Osteoporosis screening, calcium/Vitamin D optimization, and home balance safety guidance.',
      },
      {
        title: 'Memory, Sleep & Emotional Wellness Support',
        detail: 'Early cognitive screening and compassionate support for sleep architecture and caregiver guidance.',
      },
    ],
    nutritionIntro:
      'As we age, metabolic rate slows while the need for high-quality protein, calcium, Vitamin B12, Vitamin D, and gentle hydration actually increases to prevent muscle loss (sarcopenia).',
    foodsToEat: [
      {
        name: 'Easy-to-Digest Protein at Every Meal (Soft Dal, Steamed Fish, Eggs, Curd, Paneer, Soy)',
        benefit: 'Prevents age-related muscle wasting (sarcopenia), supports wound healing, and maintains leg strength.',
      },
      {
        name: 'Calcium, Vitamin D & B12 Sources (Fortified Milk, Buttermilk, Ragi, Eggs, Fish)',
        benefit: 'Protects against brittle bones, nerve tingling (neuropathy), and cognitive fatigue.',
      },
      {
        name: 'Warm, Cooked Fiber & Hydrating Soups (Oats, Vegetable Stews, Ash Gourd, Papaya)',
        benefit: 'Supports gentle bowel regularity without bloating and replenishes fluids when thirst sensation diminishes.',
      },
      {
        name: 'Anti-Inflammatory Spices & Healthy Fats (Turmeric, Ginger, Black Pepper, Soaked Almonds)',
        benefit: 'Soothes joint stiffness, supports brain circulation, and provides concentrated micronutrients.',
      },
    ],
    foodsToLimit: [
      'Dry, overly hard, or very spicy foods that irritate gastric mucosa or pose choking hazards',
      'High-sodium pickles and preserved foods that worsen blood pressure and ankle edema',
      'Excessive evening tea or coffee after 4:00 PM, which fragments deep sleep and increases nighttime urination',
      'Skipping meals or relying on tea-and-biscuit breakfasts, which accelerates muscle weakness and frailty',
    ],
    healthHabits: [
      {
        title: 'Daily Gentle Resistance & Balance Practice',
        practice: 'Chair rises, ankle flexes, light resistance bands, and 20-minute morning walks preserve muscle mass and prevent falls.',
        cadence: 'Daily · 20 Mins',
      },
      {
        title: 'Home Fall-Proofing & Lighting Check',
        practice: 'Ensure bright nightlights between bedroom and bathroom, non-slip bath mats, and supportive footwear indoors.',
        cadence: 'Home Safety',
      },
      {
        title: 'Cognitive & Social Engagement',
        practice: 'Reading, music, puzzles, temple/community visits, and lively family conversations actively build cognitive reserve.',
        cadence: 'Every Day',
      },
      {
        title: 'Biannual Medication & Vision/Hearing Review',
        practice: 'Bring all medicine strips to your physician every 6 months and keep spectacles and hearing aids updated.',
        cadence: 'Every 6 Months',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'Listening carefully to an elder’s story is the most accurate diagnostic instrument in medicine.',
        context: 'Alverstone Senior Care Philosophy',
      },
      {
        quote: 'Strength in later life is built on three quiet pillars: protein on the plate, movement in the morning, and warmth in the family.',
        context: 'Geriatric Wellness Charter',
      },
    ],
    specialistNote: {
      doctor: 'Dr. Rajesh Menon',
      credentials: 'MD, Fellowship in Geriatric Medicine · Senior Consultant',
      message:
        'Please bring every medication strip and supplement bottle your parent takes to their visit. Simplifying a senior’s prescription list often restores their energy and steadiness within weeks.',
    },
  },

  pathology: {
    slug: 'pathology',
    name: 'Pathology & Diagnostics',
    bookingDept: 'Pathology & Diagnostic Lab',
    kicker: 'NABL-Aligned Clinical Laboratory & Biochemistry',
    tagline: 'Precision blood chemistry, hematology, and verified digital reports that guide accurate treatment.',
    heroImage: '/images/specialties/pathology.jpg',
    heroImageAlt: 'Indian clinical pathologist working with a high-precision microscope and automated analyzers',
    secondaryImage: '/images/roles/lab.jpg',
    secondaryImageAlt: 'Bright clinical pathology microscope and diagnostic sample tubes',
    heroQuote: {
      text: 'Behind every confident clinical diagnosis stands a precise laboratory measurement — turning unseen cellular signals into clear answers.',
      author: 'Alverstone Diagnostic Board',
      role: 'Department of Clinical Pathology & Biochemistry',
    },
    overview:
      'Accurate treatment begins with accurate diagnosis. Nearly 70% of modern medical decisions rely on laboratory insights. Alverstone Medcity’s Pathology & Diagnostics wing operates 24/7 with automated hematology, clinical biochemistry, hormone immunoassays, and microbiology—delivering verified reports directly to your doctor’s worksheet and your online Patient Portal.',
    awarenessTitle: 'Diagnostic Awareness: How Preparation Shapes Accuracy',
    awarenessLead:
      'A laboratory value is only as reliable as the preparation before the sample is drawn. Knowing when to fast, staying properly hydrated, avoiding strenuous exercise before a blood draw, and tracking your trends over time help you and your physician interpret your reports with complete confidence.',
    warningSigns: [
      'Overdue for an annual baseline checkup (CBC, Fasting Glucose, HbA1c, Lipid Profile, TSH, Liver & Kidney panel)',
      'Monitoring ongoing treatment for diabetes, thyroid conditions, cholesterol, or hypertension',
      'Experiencing persistent fatigue, hair fall, pale skin, or muscle cramps suggestive of Iron, B12, or Vitamin D deficiency',
      'Fever lasting more than 48–72 hours requiring CBC, CRP, Dengue, or Urinalysis evaluation',
      'Family history of metabolic, renal, hepatic, or cardiovascular conditions requiring early baseline tracking',
    ],
    clinicalServices: [
      {
        title: 'Automated Hematology & Coagulation Panels',
        detail: 'Complete Blood Count (CBC), ESR, peripheral smears, and platelet/coagulation studies with rapid turnaround.',
      },
      {
        title: 'Metabolic, Diabetic & Cardiac Biochemistry',
        detail: 'Fasting/PP glucose, HbA1c, complete lipid profile, hs-CRP, and cardiac biomarker assays.',
      },
      {
        title: 'Endocrine, Thyroid & Vitamin Profiling',
        detail: 'High-sensitivity TSH, Free T3/T4, Vitamin D (25-OH), Vitamin B12, and ferritin levels.',
      },
      {
        title: 'Renal, Hepatic & Clinical Microbiology',
        detail: 'Liver function tests (LFT), kidney function & electrolytes (RFT), urine analysis, and culture sensitivity.',
      },
    ],
    nutritionIntro:
      'Proper pre-test nutrition and hydration ensure your blood sample reflects your true baseline physiology without artificial spikes or hemoconcentration.',
    foodsToEat: [
      {
        name: 'Plain Water During Fasting Windows (10–12 Hours Before Fasting Tests)',
        benefit: 'Keeps veins well-hydrated for a smooth, painless blood draw and prevents false concentration of lab values.',
      },
      {
        name: 'Balanced, Normal Home Dinner the Evening Before a Lab Draw',
        benefit: 'Eating a normal, light dinner by 8:00–9:00 PM ensures accurate 10–12 hour fasting glucose and triglyceride readings.',
      },
      {
        name: 'Iron & Vitamin C Pairings Post-Checkup (Dates, Greens, Citrus)',
        benefit: 'Replenishes iron stores naturally if your hematology panel reveals borderline low hemoglobin or ferritin.',
      },
      {
        name: 'Post-Draw Nourishment (Light Idli, Oats, Fruit, or Nuts Immediately After Sample Collection)',
        benefit: 'Restores blood sugar smoothly right after your fasting blood sample is collected.',
      },
    ],
    foodsToLimit: [
      'Morning tea, coffee (even black or sugar-free), milk, or chewing gum before a fasting blood draw',
      'Heavy, high-fat, or late-night restaurant meals the night before a Lipid Profile (which artificially elevates triglycerides)',
      'Alcohol within 48 hours of liver function (LFT) or triglyceride testing',
      'Biotin (hair/nail) supplements 48 hours before thyroid (TSH) immunoassays, unless prescribed',
    ],
    healthHabits: [
      {
        title: 'Observe the 10–12 Hour Fasting Window',
        practice: 'For Fasting Blood Sugar and Lipid Profiles, fast for 10–12 hours overnight (water is encouraged) and schedule your draw between 7:00 AM and 9:30 AM.',
        cadence: 'Pre-Test Prep',
      },
      {
        title: 'Rest Quietly for 10 Minutes Before Sample Collection',
        practice: 'Avoid heavy gym workouts on the morning of your test and sit calmly for 10 minutes before your sample is drawn.',
        cadence: 'Morning of Test',
      },
      {
        title: 'Compare Longitudinal Trends, Not Just Single Numbers',
        practice: 'Use your Alverstone Patient Portal to review how your HbA1c, cholesterol, or TSH changes across 6-month intervals.',
        cadence: 'Every Report',
      },
      {
        title: 'Always Review Results With Your Physician',
        practice: 'Reference ranges are statistical guides; your doctor interprets your numbers in the context of your age, symptoms, and history.',
        cadence: 'Post-Report',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'To measure is to know — and early knowledge is the calmest path to prevention.',
        context: 'Clinical Diagnostics Principle',
      },
      {
        quote: 'Every tube of blood represents a patient awaiting clarity; precision and speed are our highest duties.',
        context: 'Alverstone Pathology Quality Pledge',
      },
    ],
    specialistNote: {
      doctor: 'Alverstone Clinical Pathology Team',
      credentials: '24/7 NABL-Aligned Automated Diagnostic Wing · 1st Floor',
      message:
        'If you are unsure whether your prescribed test requires fasting, simply call our lab desk before breakfast. Drink plain water freely—it makes your sample collection quicker and more comfortable.',
    },
  },

  pharmacy: {
    slug: 'pharmacy',
    name: '24/7 Clinical Pharmacy',
    bookingDept: '24/7 Clinical Pharmacy',
    kicker: 'In-House Prescription Dispensing & Medication Safety',
    tagline: 'Verified medicines, clear dosage counseling, and round-the-clock availability synchronized with your doctor.',
    heroImage: '/images/specialties/pharmacy.jpg',
    heroImageAlt: 'Indian clinical pharmacist counseling a patient at the Alverstone Clinical Pharmacy counter',
    secondaryImage: '/images/roles/pharmacy.jpg',
    secondaryImageAlt: 'Bright, sunlit clinical pharmacy counter with organized medicine shelves',
    heroQuote: {
      text: 'A medicine is only as effective as the clarity, timing, and safety with which it is taken.',
      author: 'Alverstone Clinical Pharmacy Charter',
      role: '24/7 In-House Hospital Pharmacy',
    },
    overview:
      'At Alverstone Medcity, our 24/7 Clinical Pharmacy is directly integrated with every consulting room. The moment your physician finalizes your digital worksheet, your prescription arrives at our pharmacy counter with verified dosages, batch-tracked authentic formulations, and transparent billing—eliminating transcription errors and waiting delays.',
    awarenessTitle: 'Medication Safety & Adherence Awareness',
    awarenessLead:
      'Nearly half of treatment failures in chronic conditions happen because medications are stopped early, taken at the wrong time relative to meals, or mixed with interacting foods and over-the-counter painkillers. Understanding *why* and *how* to take each medicine protects both your recovery and your organs.',
    warningSigns: [
      'Stopping an antibiotic course early just because fever or throat pain has improved after 2 days',
      'Skipping blood pressure, thyroid, or diabetes tablets on days when you "feel normal"',
      'Taking frequent over-the-counter NSAID painkillers on an empty stomach, risking gastric ulcers or kidney strain',
      'Uncertainty about whether a tablet should be taken fasting (e.g., thyroxine) or after meals',
      'New skin rash, dizziness, dry cough, or stomach upset after starting a new prescription',
    ],
    clinicalServices: [
      {
        title: 'Direct E-Prescription Synchronization',
        detail: 'Zero-error digital prescription transmission directly from your Alverstone physician’s console.',
      },
      {
        title: 'Temperature-Controlled Cold Chain Storage',
        detail: 'Strict 2°C–8°C calibrated refrigeration for insulins, vaccines, biologicals, and pediatric drops.',
      },
      {
        title: 'Individualized Dosage & Timing Counseling',
        detail: 'Clear guidance on before/after food timing, course duration, and potential side effects.',
      },
      {
        title: '24/7 Emergency & Night Dispensing',
        detail: 'Round-the-clock availability of acute care, cardiac, respiratory, and pediatric formulations.',
      },
    ],
    nutritionIntro:
      'What you eat and drink around medication time directly affects how drugs are absorbed in the stomach and metabolized by the liver.',
    foodsToEat: [
      {
        name: 'A Full Glass of Plain Room-Temperature Water With Tablets',
        benefit: 'Ensures smooth esophageal passage and proper dissolution of tablets in the stomach.',
      },
      {
        name: 'Probiotic Curd or Buttermilk (2 Hours Apart From Antibiotics)',
        benefit: 'Helps replenish beneficial gut bacteria during and after a prescribed course of antibiotics.',
      },
      {
        name: 'Light Meal Cushion Before Gastric-Sensitive Medicines',
        benefit: 'Taking anti-inflammatory or iron supplements after a light meal (when advised) prevents nausea and acidity.',
      },
      {
        name: 'Consistent Leafy Green Intake (If on Blood Thinners)',
        benefit: 'Keeping Vitamin K intake steady from day to day helps maintain stable anticoagulation levels.',
      },
    ],
    foodsToLimit: [
      'Grapefruit and pomelo juices, which block liver enzymes (CYP3A4) and dangerously spike statin and blood pressure drug levels',
      'Milk, calcium, or iron supplements within 4 hours of thyroid hormone (levothyroxine) or certain antibiotics (fluoroquinolones/tetracyclines)',
      'Alcohol while taking any antibiotic (especially metronidazole), painkiller (paracetamol/NSAIDs), or sedative',
      'Swallowing capsules or tablets dry without water, which can cause esophageal irritation',
    ],
    healthHabits: [
      {
        title: 'Complete the Full Prescribed Course',
        practice: 'Always finish the exact number of antibiotic or anti-infective days prescribed to prevent resistant relapses.',
        cadence: 'Every Course',
      },
      {
        title: 'Anchor Daily Medicines to Fixed Routines',
        practice: 'Take thyroid tablets 45 minutes before breakfast with plain water, and link evening tablets to dinner time.',
        cadence: 'Daily Rhythm',
      },
      {
        title: 'Store Medicines in a Cool, Dry Cabinet',
        practice: 'Keep blister packs away from bathroom humidity, direct sunlight, and out of reach of young children.',
        cadence: 'Safe Storage',
      },
      {
        title: 'Check Your Digital Prescription Portal Anytime',
        practice: 'Use the Alverstone Patient Portal to verify your exact tablet names, strengths, and daily schedules.',
        cadence: '24/7 Access',
      },
    ],
    secondaryQuotes: [
      {
        quote: 'Right patient, right medicine, right dose, right time — safety is never an accident.',
        context: 'Clinical Pharmacology Standard',
      },
      {
        quote: 'Never hesitate to ask your pharmacist a question; five seconds of clarity prevents weeks of error.',
        context: 'Alverstone Pharmacy Care Desk',
      },
    ],
    specialistNote: {
      doctor: 'Chief Clinical Pharmacist',
      credentials: 'PharmD · Alverstone 24/7 Hospital Pharmacy',
      message:
        'Never share prescription medicines with family members who have similar symptoms. Every dose is calculated for your specific medical profile, kidney function, and current prescriptions.',
    },
  },
}

export const SPECIALTIES_LIST: SpecialtyContent[] = [
  SPECIALTIES_DATA['general-medicine'],
  SPECIALTIES_DATA['cardiology'],
  SPECIALTIES_DATA['pediatrics'],
  SPECIALTIES_DATA['geriatrics'],
  SPECIALTIES_DATA['pathology'],
  SPECIALTIES_DATA['pharmacy'],
]

function renderDeptIcon(slug: string, size = 22) {
  switch (slug) {
    case 'cardiology':
      return <IconHeart size={size} />
    case 'pathology':
      return <IconFlask size={size} />
    case 'pharmacy':
      return <IconPill size={size} />
    case 'geriatrics':
      return <IconClock size={size} />
    case 'pediatrics':
    case 'general-medicine':
    default:
      return <IconStethoscope size={size} />
  }
}

export default function SpecialtyPage() {
  const { slug } = useParams<{ slug?: string }>()
  const { user } = useAuth()
  const isPatient = user?.role === 'patient'

  const activeSpecialty = (slug && SPECIALTIES_DATA[slug]) || SPECIALTIES_DATA['general-medicine']
  usePageTitle(activeSpecialty.name, 'Clinical Specialties')

  const bookUrl = isPatient
    ? `/patient/book?dept=${encodeURIComponent(activeSpecialty.bookingDept)}`
    : `/patient/login?redirect=${encodeURIComponent(`/patient/book?dept=${encodeURIComponent(activeSpecialty.bookingDept)}`)}`

  return (
    <PatientSiteLayout>
      <div className="sp-page">
        {/* ==================================================================
            1. BRIGHT SUNLIT EDITORIAL HERO WITH UNTINTED DEPARTMENT PHOTO
            ================================================================== */}
        <section className="sp-hero">
          <div className="sp-hero-inner">
            {/* Specialty Switcher Strip at Top of Hero */}
            <nav className="sp-switcher" aria-label="Switch clinical department">
              {SPECIALTIES_LIST.map((item) => {
                const active = item.slug === activeSpecialty.slug
                return (
                  <Link
                    key={item.slug}
                    to={`/specialties/${item.slug}`}
                    className={`sp-switcher-pill ${active ? 'is-active' : ''}`}
                  >
                    {renderDeptIcon(item.slug, 14)}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="sp-hero-grid">
              <div className="sp-hero-main">
                <span className="sp-kicker">
                  <span className="sp-kicker-dot" />
                  <span>{activeSpecialty.kicker}</span>
                </span>

                <h1 className="sp-title">{activeSpecialty.name}</h1>
                <p className="sp-tagline">{activeSpecialty.tagline}</p>
                <p className="sp-overview">{activeSpecialty.overview}</p>

                {/* Department Featured Quote Lockup */}
                <blockquote className="sp-hero-quote">
                  <p>“{activeSpecialty.heroQuote.text}”</p>
                  <footer>
                    <strong>{activeSpecialty.heroQuote.author}</strong>
                    <span>{activeSpecialty.heroQuote.role}</span>
                  </footer>
                </blockquote>

                <div className="sp-hero-actions">
                  <Link to={bookUrl} className="sp-btn-primary">
                    <IconCalendar size={16} />
                    <span>Book Consultation in {activeSpecialty.name.split('&')[0].trim()}</span>
                  </Link>
                  <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="sp-btn-ghost">
                    <IconPhone size={15} />
                    <span>24/7 Care Desk: {CLINIC.phone}</span>
                  </a>
                </div>
              </div>

              {/* Right: Bright, Untinted Department Photograph */}
              <figure className="sp-hero-visual">
                <div className="sp-hero-photo-frame">
                  <img
                    key={activeSpecialty.heroImage}
                    src={activeSpecialty.heroImage}
                    alt={activeSpecialty.heroImageAlt}
                    className="sp-hero-photo"
                  />
                </div>
                <figcaption className="sp-hero-caption">
                  <span>{activeSpecialty.name}</span>
                  <strong>Alverstone Medcity · Chandanathope Campus</strong>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. DEPARTMENT AWARENESS, EARLY SIGNS & CLINICAL SERVICES
            ================================================================== */}
        <div className="sp-canvas">
          <section className="sp-awareness-section">
            <div className="sp-section-head">
              <span className="sp-eyebrow">Clinical Awareness & Early Action</span>
              <h2>{activeSpecialty.awarenessTitle}</h2>
              <p>{activeSpecialty.awarenessLead}</p>
            </div>

            <div className="sp-awareness-split">
              {/* Left: Early Warning Signs to Watch For */}
              <div className="sp-signs-col">
                <h3 className="sp-subhead">
                  <IconStethoscope size={18} />
                  <span>When to Seek a Timely Consultation</span>
                </h3>
                <ul className="sp-signs-list">
                  {activeSpecialty.warningSigns.map((sign) => (
                    <li key={sign}>
                      <span className="sp-sign-check" aria-hidden="true">
                        <IconCheck size={13} />
                      </span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Clinical Services & Capabilities */}
              <div className="sp-services-col">
                <h3 className="sp-subhead">
                  {renderDeptIcon(activeSpecialty.slug, 18)}
                  <span>Department Capabilities & Screenings</span>
                </h3>
                <div className="sp-services-list">
                  {activeSpecialty.clinicalServices.map((srv, idx) => (
                    <div key={srv.title} className="sp-service-row">
                      <span className="sp-service-num">0{idx + 1}</span>
                      <div>
                        <h4>{srv.title}</h4>
                        <p>{srv.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <hr className="sp-divider" />

          {/* ==================================================================
              3. NUTRITION & DIETARY GUIDANCE (WHAT TO EAT & WHAT TO LIMIT)
              ================================================================== */}
          <section className="sp-nutrition-section">
            <div className="sp-section-head">
              <span className="sp-eyebrow">Clinical Nutrition & Daily Plate</span>
              <h2>What to Eat & How to Nourish Your Body</h2>
              <p>{activeSpecialty.nutritionIntro}</p>
            </div>

            <div className="sp-nutrition-split">
              {/* Nourishing Foods to Embrace */}
              <div className="sp-eat-col">
                <h3 className="sp-subhead is-positive">
                  <IconCheck size={18} />
                  <span>Nourishing Foods to Embrace</span>
                </h3>
                <div className="sp-eat-list">
                  {activeSpecialty.foodsToEat.map((food) => (
                    <article key={food.name} className="sp-eat-item">
                      <h4>{food.name}</h4>
                      <p>{food.benefit}</p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Foods & Habits to Limit */}
              <div className="sp-limit-col">
                <h3 className="sp-subhead is-caution">
                  <IconClock size={18} />
                  <span>Foods & Habits to Moderate or Avoid</span>
                </h3>
                <ul className="sp-limit-list">
                  {activeSpecialty.foodsToLimit.map((item) => (
                    <li key={item}>
                      <span className="sp-limit-dot" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Bright Untinted Secondary Department Feature Photo + Specialist Note */}
                <div className="sp-secondary-visual">
                  <img
                    key={activeSpecialty.secondaryImage}
                    src={activeSpecialty.secondaryImage}
                    alt={activeSpecialty.secondaryImageAlt}
                    className="sp-secondary-photo"
                    loading="lazy"
                  />
                </div>

                {/* Specialist Clinical Note */}
                <div className="sp-specialist-note">
                  <span className="sp-eyebrow">Physician’s Guidance</span>
                  <p>“{activeSpecialty.specialistNote.message}”</p>
                  <div className="sp-specialist-meta">
                    <strong>{activeSpecialty.specialistNote.doctor}</strong>
                    <span>{activeSpecialty.specialistNote.credentials}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="sp-divider" />

          {/* ==================================================================
              4. DAILY HEALTH MAINTENANCE BLUEPRINT & WELLNESS QUOTES
              ================================================================== */}
          <section className="sp-habits-section">
            <div className="sp-section-head">
              <span className="sp-eyebrow">Preventive Lifestyle Blueprint</span>
              <h2>Daily Practices to Maintain Long-Term Health</h2>
            </div>

            <div className="sp-habits-rows">
              {activeSpecialty.healthHabits.map((habit, i) => (
                <div key={habit.title} className="sp-habit-row">
                  <span className="sp-habit-index">0{i + 1}</span>
                  <div className="sp-habit-main">
                    <h3>{habit.title}</h3>
                    <p>{habit.practice}</p>
                  </div>
                  <span className="sp-habit-cadence">{habit.cadence}</span>
                </div>
              ))}
            </div>

            {/* Dual Editorial Quotes Banner */}
            <div className="sp-quotes-strip">
              {activeSpecialty.secondaryQuotes.map((q) => (
                <blockquote key={q.quote} className="sp-quote-item">
                  <p>“{q.quote}”</p>
                  <cite>{q.context}</cite>
                </blockquote>
              ))}
            </div>
          </section>

          <hr className="sp-divider" />

          {/* ==================================================================
              5. EXPLORE OTHER CLINICAL SPECIALTIES DIRECTORY
              ================================================================== */}
          <section className="sp-directory-section">
            <div className="sp-directory-head">
              <div>
                <span className="sp-eyebrow">Alverstone Medcity Centers of Care</span>
                <h2>Explore All Clinical Specialties</h2>
              </div>
              <Link to={bookUrl} className="sp-btn-dark">
                <IconCalendar size={15} />
                <span>Schedule a Visit</span>
              </Link>
            </div>

            <div className="sp-directory-rows">
              {SPECIALTIES_LIST.map((item) => {
                const isCurrent = item.slug === activeSpecialty.slug
                return (
                  <Link
                    key={item.slug}
                    to={`/specialties/${item.slug}`}
                    className={`sp-directory-row ${isCurrent ? 'is-current' : ''}`}
                  >
                    <span className="sp-directory-ico">{renderDeptIcon(item.slug, 18)}</span>
                    <div className="sp-directory-copy">
                      <strong>{item.name}</strong>
                      <span>{item.tagline}</span>
                    </div>
                    <span className="sp-directory-tag">
                      {isCurrent ? 'Viewing Now' : 'Read Guide →'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </PatientSiteLayout>
  )
}
