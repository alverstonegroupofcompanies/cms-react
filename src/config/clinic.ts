/** Shared clinic contact & about copy for the patient website. */
export const CLINIC = {
  name: 'Alverstone Medcity',
  tagline: 'Compassionate care, on your schedule — in Chandanathope, Kollam',
  address: 'Chandanathope, Kollam, Kerala 691014',
  phone: '+91 471 000 0000',
  email: 'care@alverstonemedcity.com',
  hours: [
    { day: 'Outpatient visits', time: 'Open 24 hours' },
    { day: 'Pharmacy & lab', time: '24 × 7' },
    { day: 'Reception desk', time: 'Always staffed' },
  ],
  doctorsNote:
    'Experienced specialists in general medicine, pediatrics, dermatology, and diagnostics — coordinated under one campus.',
  policies: [
    { title: 'Patient privacy', text: 'Your records stay confidential and are shared only with your care team.' },
    { title: 'Informed consent', text: 'We explain procedures and options clearly before any treatment begins.' },
    { title: 'Fair billing', text: 'Transparent charges for visits, pharmacy, and lab — no hidden add-ons.' },
    { title: 'Safe care', text: 'Hygiene standards, verified medicines, and quality-checked diagnostics.' },
  ],
  aboutShort:
    'Book your preferred doctor for a time that works for you — no queues, no guesswork. Consultation, pharmacy, and lab under one roof in Chandanathope, Kollam.',
  aboutIntro: [
    'We are a multi-specialty clinic serving families and professionals across Kollam and Chandanathope. No queues, no guesswork — book your preferred doctor for a time and day that works for you, and walk in knowing exactly when you’ll be seen.',
    'Our patient portal keeps bookings, queue status, prescriptions, and lab reports in one calm place — so you spend less time waiting and more time on what matters: your health.',
  ],
  aboutStory: [
    {
      step: '01',
      title: 'It started with one promise',
      text: 'Families in Kollam deserved care that respected their time. We built Alverstone Medcity so a visit feels planned — not like a long afternoon lost to waiting.',
      image: '/images/patient-about.jpg',
      imageAlt: 'Calm clinic corridor and waiting lounge',
    },
    {
      step: '02',
      title: 'Doctors you can book by name',
      text: 'Choose the specialist who fits your need, pick a slot that fits your day, and arrive when it is truly your turn. Reception guides you in; your doctor is ready.',
      image: '/images/roles/doctor.jpg',
      imageAlt: 'Consultation room ready for a patient visit',
    },
    {
      step: '03',
      title: 'Pharmacy and lab under one roof',
      text: 'After consultation, collect medicines or give samples without another trip across town. Reports land in your patient account as soon as they are ready.',
      image: '/images/patient-banner-labs.jpg',
      imageAlt: 'Diagnostics and lab care on campus',
    },
    {
      step: '04',
      title: 'Your health story, in one place',
      text: 'Bookings, prescriptions, and lab results stay with you online — so follow-ups are clearer and you always know the next step.',
      image: '/images/patient-footer-care.jpg',
      imageAlt: 'Doctor speaking with a patient',
    },
  ],
  healthFacts: [
    {
      stat: '7–8 hrs',
      label: 'Sleep that heals',
      text: 'Consistent night sleep supports immunity, mood, and blood pressure — as important as any medicine.',
      icon: 'clock' as const,
    },
    {
      stat: '30 min',
      label: 'Daily movement',
      text: 'A brisk walk most days lowers heart risk and eases stress. Small routines beat occasional intensity.',
      icon: 'heart' as const,
    },
    {
      stat: '2–3 L',
      label: 'Hydration habit',
      text: 'Steady water intake helps kidneys, skin, and energy. Sip through the day — not only when thirsty.',
      icon: 'droplet' as const,
    },
    {
      stat: 'Annual',
      label: 'Check-ups matter',
      text: 'Preventive visits catch issues early. Book a review before symptoms force an emergency visit.',
      icon: 'stethoscope' as const,
    },
  ],
  testimonials: [
    {
      quote: 'I booked my dermatologist for Saturday morning and was in and out without the usual wait. The portal made reports easy to find later.',
      name: 'Anjali R.',
      role: 'Patient · Kollam',
    },
    {
      quote: 'Pharmacy and lab on the same campus saved us a second trip with our toddler. Reception was kind and clear about every step.',
      name: 'Faisal & Meera',
      role: 'Parents · Chandanathope',
    },
    {
      quote: 'My father’s follow-up slots are always on time. Knowing the doctor and the slot in advance removes so much stress.',
      name: 'Sneha K.',
      role: 'Caregiver · Kollam',
    },
  ],
  faqs: [
    {
      q: 'Do I need an account to book a doctor?',
      a: 'Yes — a free patient account lets you choose your doctor, date, and time slot, then manage visits and reports in one place.',
    },
    {
      q: 'Is the clinic open overnight?',
      a: 'Outpatient visits, pharmacy, and lab run 24×7. Reception is always staffed so you can walk in or call anytime.',
    },
    {
      q: 'Can I get lab tests without a long wait?',
      a: 'Book a slot when possible, or request home sample collection through our enquiry form. Results appear in your portal when ready.',
    },
    {
      q: 'How do I see prescriptions and past visits?',
      a: 'Sign in to your patient account — prescriptions, visit history, and lab reports stay organised under your profile.',
    },
    {
      q: 'What if I need to reschedule?',
      a: 'Open My visits in the portal to manage upcoming appointments, or call reception and we will help you find another slot.',
    },
  ],
  aboutHighlights: [
    {
      title: 'No queue system',
      text: 'Skip the waiting room entirely. Real-time slot booking means you arrive right when it’s your turn.',
      icon: 'queue' as const,
    },
    {
      title: 'Book on your time',
      text: 'Choose your doctor, date, and time slot — appointments that fit your schedule, not the other way around.',
      icon: 'calendar' as const,
    },
    {
      title: 'Time-efficient care',
      text: 'From booking to consultation to reports, every step is designed to save your time and get you back to your day faster.',
      icon: 'clock' as const,
    },
    {
      title: 'Specialized doctors',
      text: 'A team of experienced specialists across medicine, cardiology, orthopedics, dental care, and more.',
      icon: 'stethoscope' as const,
    },
    {
      title: 'Doctors you can trust',
      text: 'Every doctor on our panel is vetted for expertise, experience, and a genuine commitment to patient care.',
      icon: 'shield' as const,
    },
    {
      title: 'Modern infrastructure',
      text: 'A well-equipped campus with consultation, pharmacy, and lab facilities — built for comfort and efficiency.',
      icon: 'building' as const,
    },
  ],
  /** @deprecated Prefer aboutHighlights — kept for older references */
  values: [
    { title: 'No queues, no waiting', text: 'Book your doctor for the exact time and day you want. Walk in, get seen, walk out — no long waits, no wasted afternoons.' },
    { title: 'Specialized, trustworthy doctors', text: 'Experienced specialists across medicine, cardiology, orthopedics, and dental care — chosen for both expertise and the trust our patients place in them.' },
    { title: 'Better infrastructure, better care', text: 'Modern facilities, a skilled and attentive staff, and consultation, pharmacy, and lab all under one roof.' },
  ],
  aboutLong:
    'We are a multi-specialty clinic serving families and professionals across Kollam and Chandanathope. No queues, no guesswork — book your preferred doctor for a time and day that works for you, and walk in knowing exactly when you’ll be seen.',
} as const
