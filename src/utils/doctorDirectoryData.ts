import type { Doctor, DoctorAvailability } from '../api/types'
import { formatWorkingDaysSummary } from './doctorAvailability'
import { getDoctorPhotoUrl } from './doctorPhoto'

export interface UnifiedDoctor {
  id: string | number
  dbId?: number
  slug: string
  name: string
  degree: string
  departmentId?: number
  departmentName: string
  departmentSlug: string
  specialization: string
  experienceYears: number
  experience: string
  image: string
  photoUrl?: string | null
  rating: number
  reviewsCount: number
  badge: string
  room: string
  daysSummary: string
  hoursSummary: string
  lunchBreak: string
  bio: string
  philosophy: string
  specializations: string[]
  education: string[]
  languages: string[]
  consultationFee?: number | null
  availability?: DoctorAvailability[]
}

export interface DepartmentMeta {
  id: string
  name: string
  slug: string
  tagline: string
  icon: 'medicine' | 'cardiology' | 'ortho' | 'pediatrics' | 'dental' | 'derma' | 'neuro' | 'geriatrics'
  description: string
}

export const CLINIC_DEPARTMENTS: DepartmentMeta[] = [
  {
    id: 'general-medicine',
    name: 'General & Internal Medicine',
    slug: 'general-medicine',
    tagline: 'Primary care, fevers, diabetes, hypertension & chronic wellness',
    icon: 'medicine',
    description:
      'Comprehensive adult evaluations, metabolic assessments, and preventive disease screenings by senior internists.',
  },
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Care',
    slug: 'cardiology',
    tagline: 'Non-invasive cardiac diagnostics, ECG, Echo & heart longevity',
    icon: 'cardiology',
    description:
      'Heart health evaluations, arrhythmia tracking, hypertension management, and preventative cardiology.',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Care',
    slug: 'orthopedics',
    tagline: 'Bone health, arthritis, sports rehabilitation & joint mobility',
    icon: 'ortho',
    description:
      'Restoring pain-free joint mobility, managing musculoskeletal conditions, and personalized bone wellness programs.',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Wellness',
    slug: 'pediatrics',
    tagline: 'Neonatal care, child milestones, growth tracking & vaccinations',
    icon: 'pediatrics',
    description:
      'Gentle, child-centered clinical care fostering healthy physical and emotional development from infancy through adolescence.',
  },
  {
    id: 'dental',
    name: 'Dental & Oral Health',
    slug: 'dental',
    tagline: 'Preventive dentistry, restorative dental care & oral surgery',
    icon: 'dental',
    description:
      'Advanced painless dental restorations, orthodontics, teeth alignment, and oral hygiene management for all ages.',
  },
  {
    id: 'dermatology',
    name: 'Dermatology & Skin Wellness',
    slug: 'dermatology',
    tagline: 'Clinical skincare, eczema, psoriasis, acne & allergy diagnosis',
    icon: 'derma',
    description:
      'Evidence-based dermatological therapies treating complex skin conditions, allergies, and clinical cosmetic concerns.',
  },
  {
    id: 'neurology',
    name: 'Neurology & Neurosciences',
    slug: 'neurology',
    tagline: 'Headache management, neuropathy, stroke prevention & epilepsy',
    icon: 'neuro',
    description:
      'Advanced neurological diagnostics, peripheral nerve assessments, and compassionate neurological care plans.',
  },
]

export const STATIC_DOCTORS: UnifiedDoctor[] = [
  {
    id: 'doc-sharma',
    dbId: 1,
    slug: 'dr-sarah-johnson',
    name: 'Dr. Sarah Johnson',
    degree: 'MBBS, MD (General Medicine), DNB',
    departmentName: 'General & Internal Medicine',
    departmentSlug: 'general-medicine',
    specialization: 'Senior Physician & Internist',
    experienceYears: 14,
    experience: '14+ Years Clinical Practice',
    image: '/images/doctors/doc-sharma-general.jpg',
    rating: 4.9,
    reviewsCount: 420,
    badge: 'Senior Consultant',
    room: 'OPD Suite 102',
    daysSummary: 'Mon – Sat',
    hoursSummary: '09:00 AM – 03:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Sarah Johnson is a distinguished internal medicine specialist who has spent over 14 years providing attentive adult primary care. She focuses on metabolic balance, early chronic disease detection, and sustainable lifestyle modifications that prevent long-term complications.',
    philosophy:
      'I believe in listening to the entire patient story rather than prescribing quick fixes. Thorough clinical assessment and patient education are the true foundations of enduring wellness.',
    specializations: [
      'Adult Preventive Medicine',
      'Type 2 Diabetes Reversal & Management',
      'Hypertension & Vascular Balance',
      'Infectious Fevers & Seasonal Illnesses',
      'Thyroid & Endocrine Screening',
      'Executive Health Health Checks',
    ],
    education: [
      'MBBS — Government Medical College, Trivandrum (Gold Medalist)',
      'MD in General Medicine — All India Institute of Medical Sciences',
      'Diplomate of National Board (DNB) in Internal Medicine',
      'Fellowship in Preventive Cardiology & Lifestyle Medicine',
    ],
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: 500,
  },
  {
    id: 'doc-ananya',
    dbId: 2,
    slug: 'dr-ananya-nair',
    name: 'Dr. Ananya Nair',
    degree: 'MBBS, DNB (Family Medicine), MRCGP (Int)',
    departmentName: 'General & Internal Medicine',
    departmentSlug: 'general-medicine',
    specialization: 'Family Medicine & Primary Care',
    experienceYears: 10,
    experience: '10+ Years Clinical Practice',
    image: '/images/doctors/doc-sharma-general.jpg',
    rating: 4.8,
    reviewsCount: 310,
    badge: 'Family Physician',
    room: 'OPD Suite 104',
    daysSummary: 'Mon, Wed, Fri',
    hoursSummary: '09:00 AM – 04:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Ananya Nair specializes in comprehensive family care across multiple generations. Her clinical interest lies in primary wellness, adolescent health, preventive immunizations, and community medicine.',
    philosophy:
      'A trusted family doctor provides continuity of care across life stages, ensuring every family member feels heard, comforted, and professionally guided.',
    specializations: [
      'Multigenerational Family Health',
      'Preventive Health Screenings',
      'Acute Respiratory & Viral Care',
      'Women’s Primary Wellness',
      'Nutritional & Wellness Counseling',
    ],
    education: [
      'MBBS — Kasturba Medical College, Manipal',
      'DNB in Family Medicine — National Board of Examinations',
      'Member of the Royal College of General Practitioners (MRCGP Int)',
    ],
    languages: ['English', 'Malayalam', 'Tamil'],
    consultationFee: 450,
  },
  {
    id: 'doc-rajesh',
    dbId: 3,
    slug: 'dr-rajesh-menon',
    name: 'Dr. Rajesh Menon',
    degree: 'MBBS, MD (Internal Medicine), Fellowship (Geriatrics)',
    departmentName: 'General & Internal Medicine',
    departmentSlug: 'general-medicine',
    specialization: 'Internal Medicine & Geriatric Care',
    experienceYears: 18,
    experience: '18+ Years Clinical Practice',
    image: '/images/doctors/doc-rajesh-internal.jpg',
    rating: 4.9,
    reviewsCount: 510,
    badge: 'Chief Diagnostician',
    room: 'OPD Suite 105',
    daysSummary: 'Tue, Thu, Sat',
    hoursSummary: '09:30 AM – 03:30 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Rajesh Menon brings over 18 years of clinical diagnostic mastery. He is known for solving complex multi-system clinical presentations, polypharmacy rationalization in elderly patients, and endocrine wellness.',
    philosophy:
      'In medicine, diagnostic precision comes from patience, keen clinical observation, and respecting the wisdom of elderly patients while gently guiding them back to strength.',
    specializations: [
      'Complex Diagnostic Workups',
      'Elderly Care & Fall Prevention',
      'Polypharmacy & Medication Review',
      'Metabolic Syndrome & Lipid Disorders',
      'Chronic Renal & Liver Monitoring',
    ],
    education: [
      'MBBS — Calicut Medical College',
      'MD in Internal Medicine — Christian Medical College, Vellore',
      'Fellowship in Geriatric Medicine — Edinburgh Royal Infirmary',
    ],
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: 600,
  },
  {
    id: 'doc-priya',
    dbId: 4,
    slug: 'dr-priya-sharma',
    name: 'Dr. Priya Sharma',
    degree: 'MBBS, MD, DM (Cardiology), FACC',
    departmentName: 'Cardiology & Heart Care',
    departmentSlug: 'cardiology',
    specialization: 'Consultant Cardiologist',
    experienceYears: 12,
    experience: '12+ Years Clinical Practice',
    image: '/images/doctors/doc-priya-cardiology.jpg',
    rating: 5.0,
    reviewsCount: 380,
    badge: 'Cardiologist',
    room: 'Cardio Suite 204',
    daysSummary: 'Mon, Tue, Thu',
    hoursSummary: '10:00 AM – 03:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Priya Sharma is a leading cardiologist renowned for her empathetic approach to cardiovascular prevention, non-invasive imaging, 2D Echocardiography, and early heart disease reversal.',
    philosophy:
      'Heart health begins years before symptoms ever appear. Through proactive screening and coronary calcium awareness, we protect the heart for a lifetime of vitality.',
    specializations: [
      '2D Echocardiography & Color Doppler',
      'Preventive Cardiology & Lipid Management',
      'Cardiac Arrhythmia & Palpitations',
      'Coronary Artery Disease Screening',
      'Hypertensive Heart Disease Care',
    ],
    education: [
      'MBBS — Madras Medical College, Chennai',
      'MD in General Medicine — PGI Chandigarh',
      'DM in Cardiology — Sri Chitra Tirunal Institute, Trivandrum',
      'Fellow of the American College of Cardiology (FACC)',
    ],
    languages: ['English', 'Malayalam', 'Hindi', 'Tamil'],
    consultationFee: 800,
  },
  {
    id: 'doc-arjun',
    dbId: 5,
    slug: 'dr-arjun-pillai',
    name: 'Dr. Arjun Pillai',
    degree: 'MBBS, MD, DM (Cardiology), FSCAI',
    departmentName: 'Cardiology & Heart Care',
    departmentSlug: 'cardiology',
    specialization: 'Interventional Cardiology & Vascular Care',
    experienceYears: 15,
    experience: '15+ Years Clinical Practice',
    image: '/images/doctors/doc-priya-cardiology.jpg',
    rating: 4.9,
    reviewsCount: 340,
    badge: 'Senior Cardiologist',
    room: 'Cardio Suite 206',
    daysSummary: 'Wed, Fri, Sat',
    hoursSummary: '09:00 AM – 02:30 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Arjun Pillai specializes in cardiovascular hemodynamics, peripheral arterial assessments, heart failure management, and comprehensive outpatient cardiac rehabilitation.',
    philosophy:
      'Every heartbeat is precious. We combine state-of-the-art diagnostic imaging with patient-centered counseling so families understand their cardiac journey with clarity and confidence.',
    specializations: [
      'Heart Failure & Cardiomyopathy',
      'Ambulatory BP & Holter Analysis',
      'Treadmill Stress Testing (TMT)',
      'Post-Angioplasty & Bypass Follow-up',
      'Cardiovascular Risk Stratification',
    ],
    education: [
      'MBBS — Government Medical College, Kottayam',
      'MD in Medicine — Stanley Medical College',
      'DM in Cardiology — Amrita Institute of Medical Sciences',
    ],
    languages: ['English', 'Malayalam'],
    consultationFee: 950,
  },
  {
    id: 'doc-meera',
    dbId: 6,
    slug: 'dr-meera-krishnan',
    name: 'Dr. Meera Krishnan',
    degree: 'MBBS, MS (Orthopedics), MCh (Joint Replacements)',
    departmentName: 'Orthopedics & Joint Care',
    departmentSlug: 'orthopedics',
    specialization: 'Orthopedic Consultant & Joint Specialist',
    experienceYears: 11,
    experience: '11+ Years Clinical Practice',
    image: '/images/doctors/doc-meera-ortho.jpg',
    rating: 4.8,
    reviewsCount: 290,
    badge: 'Orthopedic Surgeon',
    room: 'Ortho Suite 301',
    daysSummary: 'Mon, Wed, Thu, Fri',
    hoursSummary: '11:00 AM – 05:00 PM',
    lunchBreak: '01:30 PM – 02:30 PM',
    bio: 'Dr. Meera Krishnan has dedicated her orthopedic practice to restoring pain-free movement for patients suffering from knee arthritis, shoulder impingements, spine discomfort, and sports trauma.',
    philosophy:
      'Surgery is always the final resort. We explore advanced conservative rehabilitation, intra-articular therapies, and biomechanical alignment first to restore natural joint vitality.',
    specializations: [
      'Knee, Hip & Shoulder Osteoarthritis',
      'Arthroscopic Joint Preservation',
      'Sports Ligament & Tendon Injuries',
      'Cervical & Lumbar Spine Pain',
      'Osteoporosis & Bone Density Restoration',
    ],
    education: [
      'MBBS — Bangalore Medical College',
      'MS in Orthopedic Surgery — JIPMER, Pondicherry',
      'MCh in Joint Reconstruction — University of Dundee, UK',
    ],
    languages: ['English', 'Malayalam', 'Kannada'],
    consultationFee: 750,
  },
  {
    id: 'doc-vikram',
    dbId: 7,
    slug: 'dr-vikram-singh',
    name: 'Dr. Vikram Singh',
    degree: 'MBBS, MS (Orthopedics), DNB (Sports Medicine)',
    departmentName: 'Orthopedics & Joint Care',
    departmentSlug: 'orthopedics',
    specialization: 'Sports Medicine & Musculoskeletal Specialist',
    experienceYears: 13,
    experience: '13+ Years Clinical Practice',
    image: '/images/doctors/doc-meera-ortho.jpg',
    rating: 4.9,
    reviewsCount: 320,
    badge: 'Sports Medicine Specialist',
    room: 'Ortho Suite 303',
    daysSummary: 'Tue, Thu, Sat',
    hoursSummary: '09:00 AM – 03:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Vikram Singh specializes in athletic rehabilitation, tendon healing, fracture management, and ergonomic postural corrections for desk workers and competitive athletes alike.',
    philosophy:
      'Movement is life. Our clinical goal is to help every patient regain functional independence and athletic confidence without unnecessary medication.',
    specializations: [
      'Rotator Cuff & Shoulder Care',
      'Tennis Elbow & Repetitive Strain',
      'Foot & Ankle Biomechanics',
      'Pediatric Fracture Healing',
      'Ergonomic Spine Consultations',
    ],
    education: [
      'MBBS — Armed Forces Medical College (AFMC), Pune',
      'MS in Orthopedics — Post Graduate Institute of Medical Education & Research',
      'Fellowship in Sports Medicine — Australian Institute of Sport',
    ],
    languages: ['English', 'Hindi', 'Malayalam'],
    consultationFee: 700,
  },
  {
    id: 'doc-lisa',
    dbId: 8,
    slug: 'dr-lisa-thomas',
    name: 'Dr. Lisa Thomas',
    degree: 'BDS, MDS (Conservative Dentistry & Endodontics)',
    departmentName: 'Dental & Oral Health',
    departmentSlug: 'dental',
    specialization: 'Senior Dental Surgeon & Endodontist',
    experienceYears: 10,
    experience: '10+ Years Clinical Practice',
    image: '/images/doctors/doc-bennett-derma.jpg',
    rating: 4.9,
    reviewsCount: 260,
    badge: 'Dental Surgeon',
    room: 'Dental Suite 101',
    daysSummary: 'Mon, Tue, Wed, Fri',
    hoursSummary: '09:00 AM – 04:30 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Lisa Thomas offers painless root canal therapy, esthetic tooth restorations, crown prosthetics, and preventive dental check-ups in a calm, modern operatory equipped with low-radiation digital radiography.',
    philosophy:
      'A healthy, confident smile transforms your well-being. We prioritize patient comfort with gentle techniques that take the stress out of dental care.',
    specializations: [
      'Painless Single-Sitting Root Canals',
      'Cosmetic Ceramic Veneers & Crowns',
      'Preventive Dental Cleanings & Scaling',
      'Pediatric Cavity Prevention & Sealants',
      'Wisdom Tooth Pain Management',
    ],
    education: [
      'BDS — Government Dental College, Trivandrum',
      'MDS in Endodontics — Manipal College of Dental Sciences',
    ],
    languages: ['English', 'Malayalam'],
    consultationFee: 550,
  },
  {
    id: 'doc-suresh',
    dbId: 9,
    slug: 'dr-suresh-babu',
    name: 'Dr. Suresh Babu',
    degree: 'BDS, MDS (Orthodontics & Dentofacial Orthopedics)',
    departmentName: 'Dental & Oral Health',
    departmentSlug: 'dental',
    specialization: 'Orthodontist & Smile Architect',
    experienceYears: 14,
    experience: '14+ Years Clinical Practice',
    image: '/images/doctors/doc-david-neuro.jpg',
    rating: 4.8,
    reviewsCount: 215,
    badge: 'Orthodontist',
    room: 'Dental Suite 103',
    daysSummary: 'Tue, Thu, Sat',
    hoursSummary: '10:00 AM – 04:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Suresh Babu is an expert orthodontist specializing in clear aligners, ceramic braces, and pediatric jaw guidance. He helps children and adults achieve perfectly aligned, functional bites.',
    philosophy:
      'Proper alignment is not just about cosmetic beauty — it optimizes chewing mechanics, protects gums, and preserves natural teeth for decades to come.',
    specializations: [
      'Clear Invisible Aligners',
      'Modern Ceramic & Self-Ligating Braces',
      'Pediatric Habit Breakers & Space Maintainers',
      'TMJ Jaw Joint Discomfort',
      'Bite Correction & Facial Esthetics',
    ],
    education: [
      'BDS — Sri Ramachandra Dental College, Chennai',
      'MDS in Orthodontics — Rajiv Gandhi University of Health Sciences',
    ],
    languages: ['English', 'Malayalam', 'Tamil'],
    consultationFee: 650,
  },
  {
    id: 'doc-jenkins',
    slug: 'dr-sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    degree: 'MBBS, DNB, FAAP (Pediatrics & Neonatology)',
    departmentName: 'Pediatrics & Child Wellness',
    departmentSlug: 'pediatrics',
    specialization: 'Chief Pediatrician & Child Specialist',
    experienceYears: 11,
    experience: '11+ Years Clinical Practice',
    image: '/images/doctors/doc-jenkins-pediatrics.jpg',
    rating: 5.0,
    reviewsCount: 460,
    badge: 'Chief Pediatrician',
    room: 'Pediatric Wing 108',
    daysSummary: 'Mon – Fri',
    hoursSummary: '09:00 AM – 02:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. Sarah Jenkins creates a gentle, fear-free clinic space for children and parents. From newborn well-child evaluations to immunizations and pediatric respiratory allergies, her clinical focus is on child safety and warmth.',
    philosophy:
      'Children need more than medicine; they need patience, smiles, and an attentive ear that relieves anxiety for both the child and their parents.',
    specializations: [
      'Newborn & Infant Milestone Checks',
      'IAP Recommended Child Vaccinations',
      'Childhood Asthma & Allergic Bronchitis',
      'Childhood Nutrition & Weight Tracking',
      'Pediatric Acute Infections & Fever Clinic',
    ],
    education: [
      'MBBS — Christian Medical College, Vellore',
      'MD in Pediatrics — Lady Hardinge Medical College, New Delhi',
      'Fellow of the American Academy of Pediatrics (FAAP)',
    ],
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: 600,
  },
  {
    id: 'doc-bennett',
    slug: 'dr-a-bennett',
    name: 'Dr. A. Bennett',
    degree: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    departmentName: 'Dermatology & Skin Wellness',
    departmentSlug: 'dermatology',
    specialization: 'Senior Consultant Dermatologist',
    experienceYears: 15,
    experience: '15+ Years Clinical Practice',
    image: '/images/doctors/doc-bennett-derma.jpg',
    rating: 4.9,
    reviewsCount: 395,
    badge: 'Senior Dermatologist',
    room: 'Derma Suite 202',
    daysSummary: 'Tue, Wed, Fri',
    hoursSummary: '01:00 PM – 06:00 PM',
    lunchBreak: '03:00 PM – 03:30 PM',
    bio: 'Dr. A. Bennett provides evidence-based clinical dermatology, treating stubborn skin conditions including eczema, psoriasis, severe acne, fungal infections, and autoimmune hair loss.',
    philosophy:
      'Skin health reflects your internal biological harmony. We treat the underlying cause through scientific diagnostics, soothing topical therapies, and lifestyle care.',
    specializations: [
      'Atopic Dermatitis & Psoriasis Protocols',
      'Acne & Post-Acne Scarring Restoration',
      'Allergy Patch Testing & Eczema Relief',
      'Hair Loss (Alopecia) & Scalp Health',
      'Medical Dermatosurgery & Mole Screening',
    ],
    education: [
      'MBBS — Government Medical College, Trivandrum',
      'MD in Dermatology — Madras Medical College',
      'International Fellowship in Dermatosurgery (Singapore)',
    ],
    languages: ['English', 'Malayalam'],
    consultationFee: 700,
  },
  {
    id: 'doc-david',
    slug: 'dr-david-chen',
    name: 'Dr. David Chen',
    degree: 'MBBS, MD (Medicine), DM (Neurology)',
    departmentName: 'Neurology & Neurosciences',
    departmentSlug: 'neurology',
    specialization: 'Consultant Neurologist',
    experienceYears: 13,
    experience: '13+ Years Clinical Practice',
    image: '/images/doctors/doc-david-neuro.jpg',
    rating: 4.9,
    reviewsCount: 340,
    badge: 'Consultant Neurologist',
    room: 'Neuro Suite 210',
    daysSummary: 'Mon, Tue, Thu',
    hoursSummary: '10:00 AM – 04:00 PM',
    lunchBreak: '01:00 PM – 02:00 PM',
    bio: 'Dr. David Chen provides detailed neurological evaluations for chronic migraines, tension headaches, peripheral nerve disorders, tremors, memory changes, and post-stroke rehabilitation.',
    philosophy:
      'Neurology requires compassionate patience and methodical precision. We empower patients to take control of their neurological wellness with clarity and reassurance.',
    specializations: [
      'Refractory Migraine & Headache Protocols',
      'Peripheral Neuropathy & Numbness',
      'Stroke Prevention & Vascular Brain Health',
      'Tremor, Parkinsonism & Movement Disorders',
      'Epilepsy & Seizure Management',
    ],
    education: [
      'MBBS — National University of Singapore',
      'MD in General Medicine — PGI Chandigarh',
      'DM in Neurology — NIMHANS, Bangalore',
    ],
    languages: ['English', 'Malayalam', 'Mandarin'],
    consultationFee: 900,
  },
]

/**
 * Normalizes any doctor string/slug/id into a lookup key.
 */
export function normalizeDoctorKey(str: string | number): string {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/^dr[\.\s_-]*/, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Returns a matching static doctor template by name or specialization.
 */
function findMatchingStaticProfile(name: string, spec: string): UnifiedDoctor | undefined {
  const normName = normalizeDoctorKey(name)
  const exact = STATIC_DOCTORS.find((s) => normalizeDoctorKey(s.name) === normName)
  if (exact) return exact

  // Partial name match
  const partial = STATIC_DOCTORS.find((s) => {
    const sNorm = normalizeDoctorKey(s.name)
    return normName.includes(sNorm) || sNorm.includes(normName)
  })
  if (partial) return partial

  // Department / spec match
  const specLower = (spec || '').toLowerCase()
  return STATIC_DOCTORS.find(
    (s) =>
      s.specialization.toLowerCase().includes(specLower) ||
      s.departmentName.toLowerCase().includes(specLower)
  )
}

/**
 * Converts a database Doctor model into a rich UnifiedDoctor.
 */
export function mapDbDoctorToUnified(dbDoc: Doctor): UnifiedDoctor {
  const matched = findMatchingStaticProfile(dbDoc.name, dbDoc.specialization)
  const validPhoto = getDoctorPhotoUrl(dbDoc.photo_url)
  const workingDays = formatWorkingDaysSummary(dbDoc.availability)

  return {
    id: dbDoc.id,
    dbId: dbDoc.id,
    slug: `dr-${dbDoc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: dbDoc.name,
    degree: matched?.degree || 'MBBS, MD',
    departmentId: dbDoc.department_id || dbDoc.department?.id,
    departmentName: dbDoc.department?.name || matched?.departmentName || 'General & Internal Medicine',
    departmentSlug:
      (dbDoc.department?.name || matched?.departmentName || 'general-medicine')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    specialization: dbDoc.specialization || matched?.specialization || 'Clinical Specialist',
    experienceYears: matched?.experienceYears || 12,
    experience: matched?.experience || '12+ Years Clinical Practice',
    image: validPhoto || matched?.image || '/images/doctors/doc-sharma-general.jpg',
    photoUrl: validPhoto,
    rating: matched?.rating || 4.9,
    reviewsCount: matched?.reviewsCount || 280,
    badge: matched?.badge || 'Consultant Specialist',
    room: dbDoc.room_number || matched?.room || `OPD Suite ${dbDoc.id}`,
    daysSummary: workingDays !== 'No schedule set' ? workingDays : (matched?.daysSummary || 'Mon – Sat'),
    hoursSummary: matched?.hoursSummary || '09:00 AM – 03:00 PM',
    lunchBreak: dbDoc.lunch_start && dbDoc.lunch_end
      ? `${dbDoc.lunch_start.slice(0, 5)} – ${dbDoc.lunch_end.slice(0, 5)}`
      : (matched?.lunchBreak || '01:00 PM – 02:00 PM'),
    bio:
      matched?.bio ||
      `${dbDoc.name} is a dedicated ${dbDoc.specialization} at Alverstone Medcity, committed to compassionate patient care and evidence-based diagnosis.`,
    philosophy:
      matched?.philosophy ||
      'Attentive clinical listening and clear patient communication ensure the most reassuring healthcare experience.',
    specializations: matched?.specializations || [
      dbDoc.specialization,
      'Preventive Health Care',
      'Clinical Diagnosis & Follow-up',
      'Patient Wellness Counseling',
    ],
    education: matched?.education || [
      'MBBS — Recognized Medical College',
      'Postgraduate Specialization & Board Certification',
      'Continuing Medical Education & Clinical Hospital Practice',
    ],
    languages: matched?.languages || ['English', 'Malayalam', 'Hindi'],
    consultationFee: dbDoc.consultation_fee ? Number(dbDoc.consultation_fee) : matched?.consultationFee,
    availability: dbDoc.availability,
  }
}

/**
 * Combines database doctors with static doctors so that even if the DB has fewer doctors,
 * patients get a full department-wise hospital directory!
 */
export function mergeUnifiedDoctors(dbDoctors: Doctor[]): UnifiedDoctor[] {
  if (!dbDoctors || dbDoctors.length === 0) {
    return STATIC_DOCTORS
  }

  const mappedDb = dbDoctors.map(mapDbDoctorToUnified)
  const mappedKeys = new Set(mappedDb.map((d) => normalizeDoctorKey(d.name)))

  // Append any static doctors that are not yet in the DB (like Pediatrics, Derma, Neuro)
  const additional = STATIC_DOCTORS.filter(
    (s) => !mappedKeys.has(normalizeDoctorKey(s.name))
  )

  return [...mappedDb, ...additional]
}

/**
 * Finds a doctor by ID (number), slug, or name key across DB doctors & static catalog.
 */
export function findDoctorBySlugOrId(
  idOrSlug: string | number | undefined,
  dbDoctors: Doctor[] = []
): UnifiedDoctor | undefined {
  if (!idOrSlug) return undefined

  const fullList = mergeUnifiedDoctors(dbDoctors)
  const target = String(idOrSlug).toLowerCase().trim()

  // 1. Direct ID match
  const byId = fullList.find((d) => String(d.id) === target || String(d.dbId) === target)
  if (byId) return byId

  // 2. Direct slug match
  const bySlug = fullList.find((d) => d.slug.toLowerCase() === target)
  if (bySlug) return bySlug

  // 3. Normalized key match
  const targetKey = normalizeDoctorKey(target)
  return fullList.find((d) => {
    const nameKey = normalizeDoctorKey(d.name)
    const slugKey = normalizeDoctorKey(d.slug)
    return nameKey === targetKey || slugKey === targetKey || nameKey.includes(targetKey) || targetKey.includes(nameKey)
  })
}
