export interface ExamPreset {
  name: string;
  category: string;
  code: string;
  targetMonthsAhead: number;
  officialWebsite: string;
  stages: { name: string; status: 'UPCOMING' | 'ONGOING' | 'CLEARED' | 'NOT_CLEARED' }[];
  syllabus: {
    id: string;
    name: string;
    chapters: {
      id: string;
      name: string;
      topics: {
        id: string;
        name: string;
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVISED_1X' | 'REVISED_2X' | 'REVISED_3X' | 'MASTERED';
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        lastRevised: null;
        notes: string;
      }[];
    }[];
  }[];
}

export const EXAM_PRESETS: ExamPreset[] = [
  {
    name: 'UPSC Civil Services Examination',
    category: 'Civil Services',
    code: 'UPSC-CSE',
    targetMonthsAhead: 4,
    officialWebsite: 'https://upsc.gov.in',
    stages: [
      { name: 'Preliminary Examination (GS + CSAT)', status: 'UPCOMING' },
      { name: 'Mains Written Examination (9 Papers)', status: 'UPCOMING' },
      { name: 'Personality Test (Interview)', status: 'UPCOMING' },
    ],
    syllabus: [
      {
        id: 'upsc-gs1',
        name: 'General Studies I',
        chapters: [
          {
            id: 'upsc-hist',
            name: 'Modern Indian History & Freedom Struggle',
            topics: [
              { id: 'u-h-1', name: 'Advent of European Powers & British Expansion', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Focus on Carnatic & Mysore wars' },
              { id: 'u-h-2', name: 'Revolt of 1857 & Early Resistance', status: 'REVISED_2X', priority: 'HIGH', lastRevised: null, notes: 'Causes and consequences' },
              { id: 'u-h-3', name: 'Indian National Congress & Moderate Phase', status: 'REVISED_1X', priority: 'MEDIUM', lastRevised: null, notes: '' },
              { id: 'u-h-4', name: 'Gandhian Era & Mass Movements (1919-1947)', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Non-cooperation, Civil disobedience, Quit India' },
              { id: 'u-h-5', name: 'Post-Independence Consolidation & Reorganization', status: 'NOT_STARTED', priority: 'MEDIUM', lastRevised: null, notes: '' },
            ],
          },
          {
            id: 'upsc-pol',
            name: 'Indian Polity & Constitution',
            topics: [
              { id: 'u-p-1', name: 'Preamble & Fundamental Rights (Part III)', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Articles 14, 19, 21 case laws' },
              { id: 'u-p-2', name: 'Directive Principles of State Policy & Duties', status: 'REVISED_1X', priority: 'MEDIUM', lastRevised: null, notes: '' },
              { id: 'u-p-3', name: 'Parliament & State Legislatures', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Bills, Parliamentary committees, budget' },
              { id: 'u-p-4', name: 'Supreme Court, High Courts & Judicial Review', status: 'NOT_STARTED', priority: 'HIGH', lastRevised: null, notes: 'Collegium system & basic structure' },
            ],
          },
          {
            id: 'upsc-geo',
            name: 'Physical & Human Geography',
            topics: [
              { id: 'u-g-1', name: 'Geomorphology & Plate Tectonics', status: 'REVISED_1X', priority: 'HIGH', lastRevised: null, notes: 'Earthquakes, volcanoes, rock cycles' },
              { id: 'u-g-2', name: 'Climatology & Indian Monsoon Mechanisms', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'El Niño, La Niña, IOD' },
              { id: 'u-g-3', name: 'Oceanography & Marine Resources', status: 'NOT_STARTED', priority: 'MEDIUM', lastRevised: null, notes: '' },
            ],
          },
        ],
      },
      {
        id: 'upsc-csat',
        name: 'CSAT (Paper II)',
        chapters: [
          {
            id: 'upsc-apt',
            name: 'Quantitative Aptitude & Reasoning',
            topics: [
              { id: 'u-c-1', name: 'Number System & Divisibility Rules', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Frequently asked patterns' },
              { id: 'u-c-2', name: 'Percentages, Profit & Loss, Ratios', status: 'REVISED_2X', priority: 'MEDIUM', lastRevised: null, notes: '' },
              { id: 'u-c-3', name: 'Reading Comprehension & Critical Inferences', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Practice 5 passages daily' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'JEE Advanced & Main',
    category: 'Engineering',
    code: 'JEE-ADV',
    targetMonthsAhead: 3,
    officialWebsite: 'https://jeeadv.ac.in',
    stages: [
      { name: 'JEE Main Session 1', status: 'CLEARED' },
      { name: 'JEE Main Session 2', status: 'CLEARED' },
      { name: 'JEE Advanced', status: 'UPCOMING' },
    ],
    syllabus: [
      {
        id: 'jee-phy',
        name: 'Physics',
        chapters: [
          {
            id: 'jee-p-mech',
            name: 'Classical Mechanics',
            topics: [
              { id: 'j-p-1', name: 'Kinematics & Projectile Motion', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Relative velocity problems' },
              { id: 'j-p-2', name: 'Newton Laws of Motion & Friction', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Free body diagrams' },
              { id: 'j-p-3', name: 'Rotational Dynamics & Moment of Inertia', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Rolling without slipping' },
            ],
          },
          {
            id: 'jee-p-em',
            name: 'Electrodynamics & Magnetism',
            topics: [
              { id: 'j-p-4', name: 'Electrostatics & Gauss Law', status: 'REVISED_2X', priority: 'HIGH', lastRevised: null, notes: 'Field due to continuous charges' },
              { id: 'j-p-5', name: 'Electromagnetic Induction & Alternating Current', status: 'NOT_STARTED', priority: 'HIGH', lastRevised: null, notes: 'Lenz law, RLC circuits' },
            ],
          },
        ],
      },
      {
        id: 'jee-chem',
        name: 'Chemistry',
        chapters: [
          {
            id: 'jee-c-org',
            name: 'Organic Chemistry',
            topics: [
              { id: 'j-c-1', name: 'General Organic Chemistry (GOC) & Isomerism', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Carbocation stability, resonance' },
              { id: 'j-c-2', name: 'Reaction Mechanisms (SN1, SN2, E1, E2)', status: 'REVISED_1X', priority: 'HIGH', lastRevised: null, notes: 'Nucleophilic substitution' },
              { id: 'j-c-3', name: 'Aldehydes, Ketones & Carboxylic Acids', status: 'NOT_STARTED', priority: 'HIGH', lastRevised: null, notes: 'Name reactions: Aldol, Cannizzaro' },
            ],
          },
        ],
      },
      {
        id: 'jee-math',
        name: 'Mathematics',
        chapters: [
          {
            id: 'jee-m-calc',
            name: 'Calculus',
            topics: [
              { id: 'j-m-1', name: 'Limits, Continuity & Differentiability', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'L Hospital & Taylor series basics' },
              { id: 'j-m-2', name: 'Definite & Indefinite Integration', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'King property & reduction formulas' },
              { id: 'j-m-3', name: 'Differential Equations', status: 'NOT_STARTED', priority: 'MEDIUM', lastRevised: null, notes: 'Integrating factor method' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'GATE Computer Science & IT',
    category: 'Engineering',
    code: 'GATE-CS',
    targetMonthsAhead: 5,
    officialWebsite: 'https://gate.iitk.ac.in',
    stages: [
      { name: 'Computer Based Test (Single Stage)', status: 'UPCOMING' },
    ],
    syllabus: [
      {
        id: 'gate-dsa',
        name: 'Data Structures & Algorithms',
        chapters: [
          {
            id: 'gate-algos',
            name: 'Algorithms',
            topics: [
              { id: 'g-a-1', name: 'Asymptotic Notation & Recurrence Relations', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Master Theorem edge cases' },
              { id: 'g-a-2', name: 'Graph Algorithms (BFS, DFS, Dijkstra, Bellman-Ford)', status: 'REVISED_2X', priority: 'HIGH', lastRevised: null, notes: 'Shortest path & MST' },
              { id: 'g-a-3', name: 'Dynamic Programming & Greedy Techniques', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Knapsack, LCS, Matrix Chain' },
            ],
          },
        ],
      },
      {
        id: 'gate-os',
        name: 'Operating Systems',
        chapters: [
          {
            id: 'gate-sys',
            name: 'Process & Memory Management',
            topics: [
              { id: 'g-o-1', name: 'CPU Scheduling & Semaphores', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Deadlock Banker algorithm' },
              { id: 'g-o-2', name: 'Virtual Memory, Paging & Page Replacement', status: 'REVISED_1X', priority: 'HIGH', lastRevised: null, notes: 'LRU, FIFO, TLB hit ratio math' },
            ],
          },
        ],
      },
      {
        id: 'gate-db',
        name: 'Databases & Computer Networks',
        chapters: [
          {
            id: 'gate-db-net',
            name: 'DBMS & CN Core',
            topics: [
              { id: 'g-d-1', name: 'Normalization (1NF, 2NF, 3NF, BCNF) & SQL', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Lossless join & dependency preservation' },
              { id: 'g-d-2', name: 'TCP/IP, Congestion Control & Subnetting', status: 'NOT_STARTED', priority: 'HIGH', lastRevised: null, notes: 'CIDR calculation & sliding window protocols' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'CAT (Common Admission Test)',
    category: 'Management',
    code: 'CAT-IIM',
    targetMonthsAhead: 6,
    officialWebsite: 'https://iimcat.ac.in',
    stages: [
      { name: 'Common Admission Test (CBT)', status: 'UPCOMING' },
      { name: 'WAT / GD & Personal Interview', status: 'UPCOMING' },
    ],
    syllabus: [
      {
        id: 'cat-varc',
        name: 'Verbal Ability & Reading Comprehension',
        chapters: [
          {
            id: 'cat-rc',
            name: 'Reading Comprehension',
            topics: [
              { id: 'c-v-1', name: 'Philosophy & Sociology Reading Passages', status: 'IN_PROGRESS', priority: 'HIGH', lastRevised: null, notes: 'Tone & inference identification' },
              { id: 'c-v-2', name: 'Para Jumbles & Sentence Odd One Out', status: 'REVISED_1X', priority: 'MEDIUM', lastRevised: null, notes: 'Look for mandatory pairs' },
            ],
          },
        ],
      },
      {
        id: 'cat-qa',
        name: 'Quantitative Aptitude',
        chapters: [
          {
            id: 'cat-quant',
            name: 'Arithmetic & Algebra',
            topics: [
              { id: 'c-q-1', name: 'Time, Speed, Distance & Work', status: 'MASTERED', priority: 'HIGH', lastRevised: null, notes: 'Relative speed & circular tracks' },
              { id: 'c-q-2', name: 'Quadratic Equations & Polynomials', status: 'REVISED_1X', priority: 'HIGH', lastRevised: null, notes: 'Maxima/minima and roots' },
            ],
          },
        ],
      },
    ],
  },
];
