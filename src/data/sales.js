/*
  Sample business data for Halden Outfitters, a fictional outdoor clothing retailer
  with 18 stores in 5 US regions. Everything here is made up.

  Only raw facts are stored (monthly revenue, quarterly targets). Every total,
  percentage and comparison is calculated in metrics.js, so the numbers on the
  chat, dashboard and drill-down screens always agree with each other.
*/

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

export const PERIODS = [
  { id: 'q1', label: 'Q1 2026', months: [0, 1, 2], quarters: ['q1'], previous: null },
  { id: 'q2', label: 'Q2 2026', months: [3, 4, 5], quarters: ['q2'], previous: 'q1' },
  { id: 'q3', label: 'Q3 2026', months: [6, 7, 8], quarters: ['q3'], previous: 'q2' },
  { id: 'ytd', label: 'Year to date', months: [0, 1, 2, 3, 4, 5, 6, 7, 8], quarters: ['q1', 'q2', 'q3'], previous: null },
]

/**
 * Region shape:
 * {
 *   id, name, code,                 // code matches region_code in the sales_orders table
 *   revenue: number[9],             // monthly revenue in USD, Jan..Sep 2026
 *   targets: { q1, q2, q3 },        // quarterly revenue targets (from the Finance Excel file)
 *   avgOrderValue: number,          // USD, used to derive order counts
 *   returnRate: { q1, q2, q3 },     // share of orders returned
 *   stores: [{ name, share }],      // share of the region's revenue
 *   categoryMix: { [categoryId]: share }
 * }
 */
export const REGIONS = [
  {
    id: 'north',
    name: 'North',
    code: 'NTH',
    revenue: [1102410, 1048960, 1231775, 1256300, 1301845, 1322190, 1342560, 1377905, 1461875],
    targets: { q1: 3300000, q2: 3800000, q3: 3950000 },
    avgOrderValue: 92.15,
    returnRate: { q1: 0.064, q2: 0.066, q3: 0.068 },
    stores: [
      { name: 'Minneapolis Uptown', share: 0.31 },
      { name: 'Duluth Canal Park', share: 0.18 },
      { name: 'Fargo Broadway', share: 0.16 },
      { name: 'Madison State Street', share: 0.35 },
    ],
    categoryMix: { outerwear: 0.39, footwear: 0.22, knitwear: 0.19, baselayers: 0.12, accessories: 0.08 },
  },
  {
    id: 'south',
    name: 'South',
    code: 'STH',
    revenue: [921340, 889205, 1014660, 1050115, 1098430, 1141980, 1152870, 1187445, 1277590],
    targets: { q1: 2900000, q2: 3250000, q3: 3400000 },
    avgOrderValue: 81.4,
    returnRate: { q1: 0.075, q2: 0.077, q3: 0.079 },
    stores: [
      { name: 'Austin South Congress', share: 0.38 },
      { name: 'Nashville Gulch', share: 0.27 },
      { name: 'Asheville Downtown', share: 0.2 },
      { name: 'Chattanooga Northshore', share: 0.15 },
    ],
    categoryMix: { outerwear: 0.24, footwear: 0.31, knitwear: 0.11, baselayers: 0.17, accessories: 0.17 },
  },
  {
    id: 'east',
    name: 'East',
    code: 'EST',
    revenue: [1060220, 1012875, 1148390, 1201560, 1236040, 1259815, 1248300, 1296455, 1349365],
    targets: { q1: 3200000, q2: 3700000, q3: 3800000 },
    avgOrderValue: 88.7,
    returnRate: { q1: 0.059, q2: 0.06, q3: 0.062 },
    stores: [
      { name: 'Burlington Church Street', share: 0.24 },
      { name: 'Portland Old Port', share: 0.21 },
      { name: 'Boston Back Bay', share: 0.41 },
      { name: 'Albany Lark Street', share: 0.14 },
    ],
    categoryMix: { outerwear: 0.36, footwear: 0.23, knitwear: 0.2, baselayers: 0.11, accessories: 0.1 },
  },
  {
    id: 'west',
    name: 'West',
    code: 'WST',
    // Declining since May: the story behind the missed target
    revenue: [1040515, 998730, 1087240, 1094880, 1061325, 1032410, 1009635, 978240, 973605],
    targets: { q1: 3100000, q2: 3300000, q3: 3350000 },
    avgOrderValue: 95.3,
    returnRate: { q1: 0.083, q2: 0.088, q3: 0.094 },
    stores: [
      { name: 'Seattle Ballard', share: 0.34 },
      { name: 'Bend Old Mill', share: 0.19 },
      { name: 'Boise Downtown', share: 0.2 },
      { name: 'Sacramento Midtown', share: 0.27 },
    ],
    categoryMix: { outerwear: 0.33, footwear: 0.27, knitwear: 0.14, baselayers: 0.15, accessories: 0.11 },
  },
  {
    id: 'central',
    name: 'Central',
    code: 'CTL',
    revenue: [802940, 776115, 851630, 838205, 852770, 819345, 821460, 790885, 796430],
    targets: { q1: 2400000, q2: 2550000, q3: 2600000 },
    avgOrderValue: 78.65,
    returnRate: { q1: 0.077, q2: 0.079, q3: 0.081 },
    stores: [
      { name: 'Denver Highlands', share: 0.58 },
      { name: 'Omaha Old Market', share: 0.42 },
    ],
    categoryMix: { outerwear: 0.31, footwear: 0.26, knitwear: 0.16, baselayers: 0.14, accessories: 0.13 },
  },
]

export const CATEGORIES = [
  { id: 'outerwear', name: 'Outerwear' },
  { id: 'footwear', name: 'Footwear' },
  { id: 'knitwear', name: 'Knitwear' },
  { id: 'baselayers', name: 'Base layers' },
  { id: 'accessories', name: 'Accessories' },
]

// Weeks of stock cover by category, from the Inventory levels pipeline.
// Under 4 weeks risks running out; over 10 ties up cash.
export const STOCK_COVER = [
  { category: 'Outerwear', weeks: 6.2 },
  { category: 'Footwear', weeks: 4.1 },
  { category: 'Knitwear', weeks: 8.7 },
  { category: 'Base layers', weeks: 3.4 },
  { category: 'Accessories', weeks: 11.3 },
]
