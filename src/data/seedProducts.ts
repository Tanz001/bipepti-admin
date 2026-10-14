import { Product } from '../types/product';

// Clean SVG data URI for default peptide vial placeholder
export const VIAL_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EAF3FD" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <linearGradient id="liquid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12B8A6" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#1C7FDB" stop-opacity="0.9" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="16" fill="url(#bg)"/>
  <!-- Aluminum crimp cap -->
  <rect x="47" y="24" width="26" height="8" rx="2" fill="#94A3B8"/>
  <rect x="44" y="32" width="32" height="6" rx="1" fill="#64748B"/>
  <rect x="49" y="38" width="22" height="6" fill="#CBD5E1"/>
  <!-- Glass vial body -->
  <rect x="40" y="44" width="40" height="52" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <!-- Liquid / lyophilized cake -->
  <rect x="42" y="70" width="36" height="24" rx="4" fill="url(#liquid)"/>
  <!-- Label band -->
  <rect x="40" y="52" width="40" height="18" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
  <rect x="45" y="56" width="20" height="2.5" rx="1" fill="#0A2358"/>
  <rect x="45" y="61" width="14" height="2" rx="1" fill="#12B8A6"/>
  <!-- Glass shine reflection -->
  <path d="M44 48 L44 90" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
</svg>
`)}`;

export const CATEGORIES = [
  'GLP-1 & Metabolic',
  'Growth Hormone Secretagogues',
  'Tissue Repair & Recovery',
  'Longevity & Mitochondrial',
  'Neuro & Cognitive',
  'Cosmetic & Copper Peptides',
  'Specialty Research',
] as const;

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'AOD960',
    name: 'AOD9604',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Modified fragment of human growth hormone (hGH 176-191) C-terminal region. Lyophilized cake for lab research synthesis.',
    purity: 99.4,
    variants: [
      {
        id: 'prod-001-v',
        strength: '5mg',
        price: 101,
        stock: 'in_stock',
        sku: 'AOD5',
      },
      {
        id: 'prod-002-v',
        strength: '10mg',
        price: 135,
        stock: 'in_stock',
        sku: 'AOD10',
      },
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'prod-002',
    sku: 'ADIPOT',
    name: 'Adipotide',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Peptidomimetic targeting prohibitin and vascular supply in adipose tissues. High stability lyophilized powder.',
    purity: 99.2,
    variants: [
      {
        id: 'prod-003-v',
        strength: '2mg',
        price: 80,
        stock: 'in_stock',
        sku: 'AP2',
      },
      {
        id: 'prod-004-v',
        strength: '5mg',
        price: 135,
        stock: 'low',
        sku: 'AP5',
      },
      {
        id: 'prod-005-v',
        strength: '10mg',
        price: 200,
        stock: 'out_of_stock',
        sku: 'AP10',
      },
    ],
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
  },
  {
    id: 'prod-003',
    sku: 'CAGRIL',
    name: 'Cagrilintide',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Long-acting amylin analogue peptide researched in combination with GLP-1 receptor modulators.',
    purity: 99.3,
    variants: [
      {
        id: 'prod-006-v',
        strength: '5mg',
        price: 105,
        stock: 'in_stock',
        sku: 'CGL5',
      },
      {
        id: 'prod-007-v',
        strength: '10mg',
        price: 180,
        stock: 'in_stock',
        sku: 'CGL10',
      },
    ],
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-10-10T17:40:00Z',
  },
  {
    id: 'prod-004',
    sku: 'BPC157',
    name: 'BPC-157',
    category: 'Tissue Repair & Recovery',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Body Protection Compound 157 pentadecapeptide. Ultra-pure lyophilized cake, free from TFA contaminants.',
    purity: 99.7,
    variants: [
      {
        id: 'prod-008-v',
        strength: '5mg',
        price: 58,
        stock: 'in_stock',
        sku: 'BPC5',
      },
      {
        id: 'prod-009-v',
        strength: '10mg',
        price: 95,
        stock: 'in_stock',
        sku: 'BPC10',
      },
    ],
    createdAt: '2026-09-04T08:30:00Z',
    updatedAt: '2026-10-13T06:10:00Z',
  },
  {
    id: 'prod-005',
    sku: 'TB500',
    name: 'TB-500',
    category: 'Tissue Repair & Recovery',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Synthetic peptide of the active region of Thymosin Beta-4. Promotes actin regulation and cell migration.',
    purity: 99.5,
    variants: [
      {
        id: 'prod-010-v',
        strength: '5mg',
        price: 72,
        stock: 'in_stock',
        sku: 'TB5',
      },
      {
        id: 'prod-011-v',
        strength: '10mg',
        price: 120,
        stock: 'in_stock',
        sku: 'TB10',
      },
    ],
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
  },
  {
    id: 'prod-006',
    sku: 'TIRZEP',
    name: 'Tirzepatide',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Dual GIP and GLP-1 receptor agonist peptide. Synthesized via solid-phase methodology, lyophilized with mannitol.',
    purity: 99.7,
    variants: [
      {
        id: 'prod-012-v',
        strength: '10mg',
        price: 140,
        stock: 'in_stock',
        sku: 'TRZ10',
      },
      {
        id: 'prod-013-v',
        strength: '15mg',
        price: 190,
        stock: 'in_stock',
        sku: 'TRZ15',
      },
      {
        id: 'prod-014-v',
        strength: '30mg',
        price: 320,
        stock: 'low',
        sku: 'TRZ30',
      },
    ],
    createdAt: '2026-09-06T12:00:00Z',
    updatedAt: '2026-10-13T07:10:00Z',
  },
  {
    id: 'prod-007',
    sku: 'SEMAGL',
    name: 'Semaglutide',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Selective glucagon-like peptide-1 (GLP-1) receptor agonist with C18 diacid acyl chain spacer.',
    purity: 99.6,
    variants: [
      {
        id: 'prod-015-v',
        strength: '5mg',
        price: 110,
        stock: 'in_stock',
        sku: 'SMG5',
      },
      {
        id: 'prod-016-v',
        strength: '10mg',
        price: 175,
        stock: 'in_stock',
        sku: 'SMG10',
      },
    ],
    createdAt: '2026-09-07T09:00:00Z',
    updatedAt: '2026-10-12T14:40:00Z',
  },
  {
    id: 'prod-008',
    sku: 'RETATR',
    name: 'Retatrutide',
    category: 'GLP-1 & Metabolic',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Triple GIP, GLP-1, and glucagon receptor agonist (GGG tri-agonist). Highest precision peptide synthesis.',
    purity: 99.8,
    variants: [
      {
        id: 'prod-017-v',
        strength: '10mg',
        price: 210,
        stock: 'in_stock',
        sku: 'RTT10',
      },
      {
        id: 'prod-018-v',
        strength: '20mg',
        price: 360,
        stock: 'low',
        sku: 'RTT20',
      },
    ],
    createdAt: '2026-09-08T10:00:00Z',
    updatedAt: '2026-10-13T05:00:00Z',
  },
  {
    id: 'prod-009',
    sku: 'IPAMOR',
    name: 'Ipamorelin',
    category: 'Growth Hormone Secretagogues',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Pentapeptide growth hormone secretagogue receptor (GHSR) agonist with zero significant effect on cortisol or prolactin.',
    purity: 99.4,
    variants: [
      {
        id: 'prod-019-v',
        strength: '5mg',
        price: 55,
        stock: 'in_stock',
        sku: 'IPM5',
      },
      {
        id: 'prod-020-v',
        strength: '10mg',
        price: 90,
        stock: 'in_stock',
        sku: 'IPM10',
      },
    ],
    createdAt: '2026-09-09T08:00:00Z',
    updatedAt: '2026-10-10T10:30:00Z',
  },
  {
    id: 'prod-010',
    sku: 'CJCNOD',
    name: 'CJC-1295 no DAC',
    category: 'Growth Hormone Secretagogues',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Modified GRF (1-29) tetrasubstituted peptide analogue without Drug Affinity Complex. Synergistic pulsatile profile.',
    purity: 99.5,
    variants: [
      {
        id: 'prod-021-v',
        strength: '5mg',
        price: 65,
        stock: 'in_stock',
        sku: 'CJC5',
      },
    ],
    createdAt: '2026-09-10T11:00:00Z',
    updatedAt: '2026-10-11T13:40:00Z',
  },
  {
    id: 'prod-011',
    sku: 'CJCDAC',
    name: 'CJC-1295 with DAC',
    category: 'Growth Hormone Secretagogues',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Long half-life GHRH analog bioconjugate with maleimidopropionic acid moiety for covalent albumin binding.',
    purity: 99.3,
    variants: [
      {
        id: 'prod-022-v',
        strength: '5mg',
        price: 88,
        stock: 'in_stock',
        sku: 'CJCD5',
      },
    ],
    createdAt: '2026-09-10T11:30:00Z',
    updatedAt: '2026-10-09T14:10:00Z',
  },
  {
    id: 'prod-012',
    sku: 'MOTSC',
    name: 'MOTS-c',
    category: 'Longevity & Mitochondrial',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Mitochondrial-derived peptide encoded from 12S rRNA region. Researched in cellular energetic homeostasis and AMPK pathways.',
    purity: 99.5,
    variants: [
      {
        id: 'prod-023-v',
        strength: '10mg',
        price: 115,
        stock: 'in_stock',
        sku: 'MTS10',
      },
    ],
    createdAt: '2026-09-11T09:00:00Z',
    updatedAt: '2026-10-12T17:00:00Z',
  },
  {
    id: 'prod-013',
    sku: 'EPITHA',
    name: 'Epithalon',
    category: 'Longevity & Mitochondrial',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on pineal gland epithalamin. Researched in telomerase activation models.',
    purity: 99.7,
    variants: [
      {
        id: 'prod-024-v',
        strength: '10mg',
        price: 78,
        stock: 'in_stock',
        sku: 'EPT10',
      },
      {
        id: 'prod-025-v',
        strength: '50mg',
        price: 240,
        stock: 'in_stock',
        sku: 'EPT50',
      },
    ],
    createdAt: '2026-09-12T14:00:00Z',
    updatedAt: '2026-10-11T10:20:00Z',
  },
  {
    id: 'prod-014',
    sku: 'GHKCU',
    name: 'GHK-Cu',
    category: 'Cosmetic & Copper Peptides',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Glycyl-L-histidyl-L-lysine copper complex. Deep royal blue crystalline powder with proven collagen synthesis kinetics.',
    purity: 99.5,
    variants: [
      {
        id: 'prod-026-v',
        strength: '50mg',
        price: 62,
        stock: 'in_stock',
        sku: 'GHK50',
      },
      {
        id: 'prod-027-v',
        strength: '100mg',
        price: 98,
        stock: 'in_stock',
        sku: 'GHK100',
      },
    ],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-10-13T02:15:00Z',
  },
  {
    id: 'prod-015',
    sku: 'NAD',
    name: 'NAD+',
    category: 'Longevity & Mitochondrial',
    status: 'active',
    featured: true,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Nicotinamide Adenine Dinucleotide oxidized coenzyme. Certified lyophilized purity for cellular redox enzyme assays.',
    purity: 99.6,
    variants: [
      {
        id: 'prod-028-v',
        strength: '500mg',
        price: 85,
        stock: 'in_stock',
        sku: 'NAD500',
      },
    ],
    createdAt: '2026-09-14T09:00:00Z',
    updatedAt: '2026-10-12T13:10:00Z',
  },
  {
    id: 'prod-016',
    sku: 'PT141',
    name: 'PT-141',
    category: 'Specialty Research',
    status: 'active',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Bremelanotide melanocortin receptor agonist (MC3R & MC4R). Cyclic heptapeptide for central nervous receptor affinity tests.',
    purity: 99.4,
    variants: [
      {
        id: 'prod-029-v',
        strength: '10mg',
        price: 75,
        stock: 'low',
        sku: 'PT10',
      },
    ],
    createdAt: '2026-09-15T15:00:00Z',
    updatedAt: '2026-10-09T11:20:00Z',
  },
  {
    id: 'prod-017',
    sku: 'SELANK',
    name: 'Selank',
    category: 'Neuro & Cognitive',
    status: 'draft',
    featured: false,
    image: VIAL_PLACEHOLDER_SVG,
    description: 'Heptapeptide analog of endogenous tuftsin with C-terminal Pro-Gly-Pro. Researched in GABAergic neuromodulation.',
    purity: 99.5,
    variants: [
      {
        id: 'prod-030-v',
        strength: '5mg',
        price: 68,
        stock: 'out_of_stock',
        sku: 'SLK5',
      },
    ],
    createdAt: '2026-09-16T12:00:00Z',
    updatedAt: '2026-10-07T16:05:00Z',
  },
];
