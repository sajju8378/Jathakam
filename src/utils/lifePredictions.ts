import { BirthChartData } from '../types/astro';

export type PeriodStatus = 'past' | 'present' | 'future';

export interface LifeAgePeriod {
  id: string;
  ageStart: number;
  ageEnd: number;
  startYear: number;
  endYear: number;
  title: string;
  sanskritStage: string;
  status: PeriodStatus;
  isCurrent: boolean;
  mahadashasActive: string[];
  antardashasActive: string[];
  governingPlanets: Array<{
    name: string;
    role: string;
    dignity?: string;
    house?: number | null;
  }>;
  overview: string;
  careerAndStatus: string;
  wealthAndFinances: string;
  healthAndVitality: string;
  familyAndRelationships: string;
  spiritualAndPersonal: string;
  favorableYears: number[];
  cautionsAndRemedies: string[];
  recommendedMantra: string;
  luckyColor: string;
  luckyGem: string;
}

export interface DashaEraPeriod {
  lord: string;
  years: number;
  startYear: number;
  endYear: number;
  startDate: string;
  endDate: string;
  ageSpan: string;
  status: PeriodStatus;
  isCurrent: boolean;
  theme: string;
  prediction: string;
  careerImpact: string;
  healthImpact: string;
  remedy: string;
}

export interface CompleteLifePredictions {
  personName: string;
  birthDate: string;
  birthYear: number;
  currentAgeYears: number;
  currentAgeMonths: number;
  currentPhase: LifeAgePeriod;
  activeMahadashaLord: string;
  activeAntardashaLord: string;
  totalPeriodsCount: number;
  pastCount: number;
  futureCount: number;
  periods: LifeAgePeriod[];
  dashaEras: DashaEraPeriod[];
  lifeDestinySynthesis: string;
}

// Classical planetary archetypes and guidance
const PLANET_ARCHETYPES: Record<
  string,
  {
    element: string;
    nature: string;
    gem: string;
    color: string;
    mantra: string;
    careerKeywords: string[];
    healthKeywords: string[];
  }
> = {
  Sun: {
    element: 'Fire (Agni)',
    nature: 'Royal, Authoritative & Dignified',
    gem: 'Ruby (Manikya)',
    color: 'Saffron & Gold',
    mantra: 'Om Suryaya Namaha (ॐ सूर्याय नमः)',
    careerKeywords: ['Leadership', 'Government', 'Administration', 'Executive Roles', 'Reputation'],
    healthKeywords: ['Heart', 'Eyes', 'Bone Strength', 'Vital Energy (Prana)'],
  },
  Moon: {
    element: 'Water (Jala)',
    nature: 'Nurturing, Intuitive & Mind-Centric',
    gem: 'Pearl (Moti)',
    color: 'Milky White & Silver',
    mantra: 'Om Somaya Namaha (ॐ सोमाय नमः)',
    careerKeywords: ['Public Dealing', 'Commerce', 'Creativity', 'Hospitality', 'Real Estate'],
    healthKeywords: ['Mental Peace', 'Sleep Cycles', 'Digestive Fluids', 'Lungs'],
  },
  Mars: {
    element: 'Fire (Agni)',
    nature: 'Courageous, Dynamic & Decisive',
    gem: 'Red Coral (Moonga)',
    color: 'Crimson Red',
    mantra: 'Om Angarakaya Namaha (ॐ अंगारकाय नमः)',
    careerKeywords: ['Engineering', 'Defense', 'Real Estate', 'Surgeon/Medical', 'Enterprises'],
    healthKeywords: ['Muscles', 'Blood Pressure', 'Inflammation', 'Physical Stamina'],
  },
  Mercury: {
    element: 'Earth (Prithvi)',
    nature: 'Intellectual, Analytical & Expressive',
    gem: 'Emerald (Panna)',
    color: 'Parrot Green',
    mantra: 'Om Budhaya Namaha (ॐ बुधाय नमः)',
    careerKeywords: ['Trading', 'Communications', 'Software', 'Writing', 'Finance & Accounting'],
    healthKeywords: ['Nervous System', 'Skin', 'Speech', 'Respiratory Tract'],
  },
  Jupiter: {
    element: 'Ether (Akasha)',
    nature: 'Expansive, Wise & Benevolent',
    gem: 'Yellow Sapphire (Pukhraj)',
    color: 'Bright Yellow & Gold',
    mantra: 'Om Brihaspataye Namaha (ॐ बृहस्पतये नमः)',
    careerKeywords: ['Advisory', 'Education', 'Judiciary', 'Consulting', 'Spiritual Leadership'],
    healthKeywords: ['Liver', 'Metabolism', 'Weight Balance', 'Arterial Circulation'],
  },
  Venus: {
    element: 'Water (Jala)',
    nature: 'Refined, Harmonious & Prosperous',
    gem: 'Diamond or White Zircon (Heera)',
    color: 'White & Pastel Pink',
    mantra: 'Om Shukraya Namaha (ॐ शुक्राय नमः)',
    careerKeywords: ['Arts & Media', 'Luxury Goods', 'Finance', 'Design & Architecture', 'Partnerships'],
    healthKeywords: ['Kidneys', 'Hormonal Balance', 'Throat', 'Reproductive Vitality'],
  },
  Saturn: {
    element: 'Air (Vayu)',
    nature: 'Disciplined, Karmic & Enduring',
    gem: 'Blue Sapphire or Amethyst (Neelam)',
    color: 'Midnight Blue & Black',
    mantra: 'Om Sham Shanaishcharaya Namaha (ॐ शं शनैश्चराय नमः)',
    careerKeywords: ['Long-term Industry', 'Law & Justice', 'Mining & Infrastructure', 'Public Service', 'Labor Leadership'],
    healthKeywords: ['Joints & Bones', 'Chronic Ailments', 'Dental Health', 'Longevity Management'],
  },
  Rahu: {
    element: 'Shadow (Chhaya)',
    nature: 'Ambitions, Unconventional & Transformational',
    gem: 'Hessonite Garnet (Gomed)',
    color: 'Smoky Grey & Ultra-Violet',
    mantra: 'Om Rahave Namaha (ॐ राहवे नमः)',
    careerKeywords: ['Foreign Affairs', 'Tech Innovation', 'Aviation', 'Modern Media', 'High-Risk Ventures'],
    healthKeywords: ['Psychosomatic balance', 'Allergies', 'Sudden Shifts', 'Immunity'],
  },
  Ketu: {
    element: 'Shadow (Chhaya)',
    nature: 'Spiritual, Detached & Introspective',
    gem: "Cat's Eye (Vaidurya)",
    color: 'Brown & Ochre',
    mantra: 'Om Ketave Namaha (ॐ केतवे नमः)',
    careerKeywords: ['Research & R&D', 'Data Analytics', 'Occult & Philosophy', 'Healing', 'Independent Projects'],
    healthKeywords: ['Subtle Energies', 'Digestive Prowess', 'Foot/Spine Care', 'Sleep Quality'],
  },
};

export function generateLifePredictions(chart: BirthChartData): CompleteLifePredictions {
  const dobParts = chart.subject.dob.split('-').map(Number);
  const birthYear = dobParts[0] || 1990;
  const birthMonth = dobParts[1] || 1;
  const birthDay = dobParts[2] || 1;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  let currentAgeYears = currentYear - birthYear;
  let currentAgeMonths = currentMonth - birthMonth;
  if (currentAgeMonths < 0) {
    currentAgeYears -= 1;
    currentAgeMonths += 12;
  }

  const ascendantSign = chart.ascendant?.sign_en || 'Capricorn';
  const moonSign = chart.moon.sign_en || 'Libra';
  const moonNakshatra = chart.moon.nakshatra_name || 'Swati';
  const sunSign = chart.sun.sign_en || 'Taurus';
  const mahadashas = chart.vimshottari_dasha.mahadashas || [];

  // Decades template definitions
  const decadeTemplates = [
    {
      ageStart: 0,
      ageEnd: 10,
      title: 'Age 0 – 10: Early Childhood, Vitality & Foundation Years',
      sanskritStage: 'Bala Avastha (Infancy & Vidya Arambha)',
      theme: 'Physical foundation, parental bonding, primary health immunization, and the initial awakening of intellect.',
    },
    {
      ageStart: 10,
      ageEnd: 20,
      title: 'Age 10 – 20: Adolescence, Education & Skill Mastery',
      sanskritStage: 'Kaumara & Brahmacharya (Learning & Discipline)',
      theme: 'Academic achievements, shaping of individuality, friendships, exam milestones, and discovering natural inclinations.',
    },
    {
      ageStart: 20,
      ageEnd: 30,
      title: 'Age 20 – 30: Career Launch, Independence & Marriage Milestones',
      sanskritStage: 'Karma Arambha & Grihastha Pravesha',
      theme: 'First career steps, financial independence, establishing relationships, marriage prospects, and establishing life roots.',
    },
    {
      ageStart: 30,
      ageEnd: 40,
      title: 'Age 30 – 40: Professional Ascent, Property & Family Growth',
      sanskritStage: 'Artha & Dharma Sthapana (Consolidation)',
      theme: 'Major career promotions, asset acquisition (home/land), raising children, social prestige, and steady asset compounding.',
    },
    {
      ageStart: 40,
      ageEnd: 50,
      title: 'Age 40 – 50: Peak Authority, Mid-Life Maturation & Leadership',
      sanskritStage: 'Kirti & Karma Siddhi (Prime Executive Era)',
      theme: 'Holding authoritative responsibilities, balancing family aspirations, expanding business or professional stature, and philosophical awakening.',
    },
    {
      ageStart: 50,
      ageEnd: 60,
      title: 'Age 50 – 60: Mastery, Wealth Consolidation & Mentorship',
      sanskritStage: 'Labha & Margadarshana (Legacy Building)',
      theme: 'Substantial wealth preservation, guiding the next generation, seeing children achieve self-reliance, and elevating social respect.',
    },
    {
      ageStart: 60,
      ageEnd: 70,
      title: 'Age 60 – 70: Senior Fulfillment, Transition & Spiritual Reflection',
      sanskritStage: 'Vanaprastha & Swadhyaya (Spiritual Focus)',
      theme: 'Graceful transition from routine labor to advisory roles, philanthropic pursuits, deep pilgrimages, and inner tranquility.',
    },
    {
      ageStart: 70,
      ageEnd: 80,
      title: 'Age 70 – 80: Golden Years, Family Legacy & Meditative Peace',
      sanskritStage: 'Gyana Yoga & Shanti (Serenity of Mind)',
      theme: 'Cherishing grandchildren, enjoying the fruits of lifelong karmas, spiritual recitation, and living as a venerable pillar of guidance.',
    },
    {
      ageStart: 80,
      ageEnd: 90,
      title: 'Age 80 – 90: Elder Statesmanship & Sacred Detachment',
      sanskritStage: 'Tattva Bodha (Philosophical Illumination)',
      theme: 'Spiritual liberation, unconditional blessings to the family, inner stillness, and complete harmonization with divine will.',
    },
    {
      ageStart: 90,
      ageEnd: 100,
      title: 'Age 90 – 100+: Centennial Longevity & Final Liberation',
      sanskritStage: 'Param Pada & Moksha Marga',
      theme: 'A rare century of fulfilled life, revered elder status, transcendence of worldly ties, and blessed karmic completion.',
    },
  ];

  // Helper to find which mahadashas overlap with a given year range
  const getOverlappingDashas = (startCalYear: number, endCalYear: number) => {
    return mahadashas.filter((md) => {
      const mdStartYear = new Date(md.start_date).getFullYear();
      const mdEndYear = new Date(md.end_date).getFullYear();
      return mdStartYear <= endCalYear && mdEndYear >= startCalYear;
    });
  };

  const periods: LifeAgePeriod[] = decadeTemplates.map((template) => {
    const startYear = birthYear + template.ageStart;
    const endYear = birthYear + template.ageEnd;

    let status: PeriodStatus = 'past';
    let isCurrent = false;

    if (endYear < currentYear) {
      status = 'past';
    } else if (startYear > currentYear) {
      status = 'future';
    } else {
      status = 'present';
      isCurrent = true;
    }

    const overlapping = getOverlappingDashas(startYear, endYear);
    const mdNames = overlapping.map((m) => m.lord);
    if (mdNames.length === 0) {
      mdNames.push(mahadashas[0]?.lord || 'Jupiter');
    }

    // Determine primary governing planet for this decade
    const primaryLord = mdNames[0] || 'Jupiter';
    const planetPos = chart.planets[primaryLord] || chart.planets.Jupiter;
    const arch = PLANET_ARCHETYPES[primaryLord] || PLANET_ARCHETYPES.Jupiter;

    // Favorable years within this decade (e.g. midpoint and planetary harmonics)
    const favorableYears = [
      startYear + 1,
      startYear + 3,
      startYear + 6,
      startYear + 8,
    ].filter((y) => y <= endYear);

    // Build specific predictions based on Lagna, Moon, and Dasha Lord
    const overview = `${template.theme} Influenced significantly by the divine vibrations of ${primaryLord} (${arch.nature}), residing in ${planetPos.sign_en || 'a favorable sign'} in House ${planetPos.house || 1} of your birth chart.`;

    const careerAndStatus =
      template.ageStart < 20
        ? `Focus on strong scholastic discipline and acquiring intellectual mastery. ${primaryLord}'s influence promotes focus in ${arch.careerKeywords.slice(0, 3).join(', ')}.`
        : template.ageStart < 60
        ? `Strong vocational momentum. Favorable periods for advancements in ${arch.careerKeywords.join(', ')}. Professional responsibilities expand steadily with commendable social reputation.`
        : `Mentorship, advisory standing, and enjoying the dividends of past professional accomplishments. Respect from junior colleagues and institutions.`;

    const wealthAndFinances =
      template.ageStart < 20
        ? `Financial security supported through parental blessings and educational scholarships. Early foundation for financial prudence and budgeting.`
        : template.ageStart < 60
        ? `Wealth accumulation through persistent industry, asset creation (vehicles, land, or structured savings), and lucrative opportunities during favorable sub-periods.`
        : `Stable income through accumulated assets, rental yields, pensions, and conservative investments. Generous contributions toward charity and children's welfare.`;

    const healthAndVitality =
      `Planetary emphasis advises attention to ${arch.healthKeywords.join(', ')}. ` +
      (status === 'present'
        ? `Maintain a balanced sattvic regimen, stay hydrated, and practice morning pranayama to sustain optimal vitality.`
        : `Routine wellness checks, seasonal dietary discipline, and regular yogic stretches ensure longevity and robust constitution.`);

    const familyAndRelationships =
      template.ageStart < 20
        ? `Harmonious ties with parents and siblings. Guidance from experienced mentors shaping character.`
        : template.ageStart < 50
        ? `Key marital milestones, harmonious domestic atmosphere, and joyful celebrations surrounding children's education and auspicious family events.`
        : `Revered standing as head of the family. Peaceful coexistence, visits from extended family, and auspicious celebrations.`;

    const spiritualAndPersonal =
      `Deepening inclination toward Vedic wisdom, pilgrimage, meditation, and philanthropy. Connection with the divine principles of ${arch.mantra.split(' ')[1] || 'Ishwara'}.`;

    const cautionsAndRemedies = [
      `Chant ${arch.mantra} regularly during sunrise or evening twilight.`,
      `Wear or surround yourself with favorable tones of ${arch.color}.`,
      `Perform charitable donations (Dana) on ${primaryLord === 'Saturn' ? 'Saturdays' : primaryLord === 'Jupiter' ? 'Thursdays' : 'Tuesdays/Sundays'}.`,
      `Maintain equanimity during volatile planetary transits through regular dhyana (meditation).`,
    ];

    return {
      id: `period-${template.ageStart}-${template.ageEnd}`,
      ageStart: template.ageStart,
      ageEnd: template.ageEnd,
      startYear,
      endYear,
      title: template.title,
      sanskritStage: template.sanskritStage,
      status,
      isCurrent,
      mahadashasActive: mdNames,
      antardashasActive: overlapping.flatMap((m) =>
        m.antardashas.filter((a) => a.is_active).map((a) => `${m.lord}-${a.lord}`)
      ),
      governingPlanets: [
        {
          name: primaryLord,
          role: 'Primary Dasha Lord',
          dignity: planetPos.dignity,
          house: planetPos.house,
        },
        {
          name: chart.ascendant?.nakshatra_lord || 'Saturn',
          role: 'Ascendant Ruler',
          house: chart.planets[chart.ascendant?.nakshatra_lord || 'Saturn']?.house,
        },
      ],
      overview,
      careerAndStatus,
      wealthAndFinances,
      healthAndVitality,
      familyAndRelationships,
      spiritualAndPersonal,
      favorableYears,
      cautionsAndRemedies,
      recommendedMantra: arch.mantra,
      luckyColor: arch.color,
      luckyGem: arch.gem,
    };
  });

  // Current active period (fallback to index 4 if not resolved)
  const currentPhase = periods.find((p) => p.isCurrent) || periods[Math.min(Math.floor(currentAgeYears / 10), periods.length - 1)];

  // Vimshottari Mahadasha Eras mapped to life calendar
  const dashaEras: DashaEraPeriod[] = mahadashas.map((md) => {
    const sYear = new Date(md.start_date).getFullYear();
    const eYear = new Date(md.end_date).getFullYear();
    const sAge = Math.max(0, sYear - birthYear);
    const eAge = Math.max(0, eYear - birthYear);

    let status: PeriodStatus = 'past';
    if (eYear < currentYear) status = 'past';
    else if (sYear > currentYear) status = 'future';
    else status = 'present';

    const pArch = PLANET_ARCHETYPES[md.lord] || PLANET_ARCHETYPES.Jupiter;
    const pPos = chart.planets[md.lord] || chart.planets.Jupiter;

    return {
      lord: md.lord,
      years: md.duration_years,
      startYear: sYear,
      endYear: eYear,
      startDate: md.start_date,
      endDate: md.end_date,
      ageSpan: `Age ${sAge} to ${eAge}`,
      status,
      isCurrent: status === 'present',
      theme: `${md.lord} Mahadasha (${md.duration_years} Years Cycle) — Focus on ${pArch.element} energy and ${pArch.careerKeywords[0]}`,
      prediction: `During this extensive ${md.duration_years}-year cycle of ${md.lord}, situated in ${pPos.sign_en} (House ${pPos.house || 1}), the native experiences pivotal transformations aligned with ${pArch.nature.toLowerCase()}.`,
      careerImpact: `Fosters growth in ${pArch.careerKeywords.join(', ')}. Professional responsibilities require dedication and ethical vigilance.`,
      healthImpact: `Prudence advised regarding ${pArch.healthKeywords.join(', ')}. Engage in active preventative wellness.`,
      remedy: `Recite ${pArch.mantra} and wear ${pArch.gem} after consulting qualified astrological guidance.`,
    };
  });

  const pastCount = periods.filter((p) => p.status === 'past').length;
  const futureCount = periods.filter((p) => p.status === 'future').length;

  const lifeDestinySynthesis =
    `With Lagna in ${ascendantSign}, Chandra (Moon) in ${moonSign} (${moonNakshatra}), and Surya (Sun) in ${sunSign}, ` +
    `your life journey is blessed with enduring resilience, pragmatic foresight, and profound spiritual equilibrium. ` +
    `Currently traversing Age ${currentAgeYears} under the protective auspices of the ${currentPhase.title.split(':')[0]}, ` +
    `the cosmic alignment encourages bold consolidation of your life's work while preserving bodily vitality and inner peace.`;

  return {
    personName: chart.subject.name || 'Native',
    birthDate: chart.subject.dob,
    birthYear,
    currentAgeYears,
    currentAgeMonths,
    currentPhase,
    activeMahadashaLord: chart.vimshottari_dasha.active_dasha.mahadasha || 'Jupiter',
    activeAntardashaLord: chart.vimshottari_dasha.active_dasha.antardasha || 'Venus',
    totalPeriodsCount: periods.length,
    pastCount,
    futureCount,
    periods,
    dashaEras,
    lifeDestinySynthesis,
  };
}
