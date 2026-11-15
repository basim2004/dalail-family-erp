export interface RawHistoricalEntry {
  studentShortName: 'Gafoor' | 'Basim' | 'Aslam' | 'Ayub' | 'Salih';
  date: string;
  place: string;
  amount: number;
}

export interface ReconstructedBreakdown {
  count500: number;
  count100: number;
  count50: number;
  balance: number;
}

export interface HistoricalStudentConfig {
  shortName: 'Gafoor' | 'Basim' | 'Aslam' | 'Ayub' | 'Salih';
  fullName: string;
  studentId: string; // e.g. "mem_5"
  memberCode: string; // e.g. "DKIF-REC-05"
  expectedDays: number;
  expectedTotal: number;
  expectedBreakdown: ReconstructedBreakdown;
}

export const HISTORICAL_STUDENTS: HistoricalStudentConfig[] = [
  {
    shortName: 'Gafoor',
    fullName: 'Abdul Gafoor',
    studentId: 'mem_5',
    memberCode: 'DKIF-REC-05',
    expectedDays: 21,
    expectedTotal: 62199.59,
    expectedBreakdown: { count500: 116, count100: 34, count50: 8, balance: 399.59 },
  },
  {
    shortName: 'Basim',
    fullName: 'Basim Aslam',
    studentId: 'mem_2',
    memberCode: 'DKIF-REC-02',
    expectedDays: 21,
    expectedTotal: 62199.58,
    expectedBreakdown: { count500: 116, count100: 34, count50: 8, balance: 399.58 },
  },
  {
    shortName: 'Aslam',
    fullName: 'Muhammed Aslam',
    studentId: 'mem_6',
    memberCode: 'DKIF-REC-06',
    expectedDays: 19,
    expectedTotal: 54750.58,
    expectedBreakdown: { count500: 102, count100: 31, count50: 6, balance: 350.58 },
  },
  {
    shortName: 'Ayub',
    fullName: 'Arshad Ayyoob',
    studentId: 'mem_4',
    memberCode: 'DKIF-REC-04',
    expectedDays: 15,
    expectedTotal: 38593.25,
    expectedBreakdown: { count500: 71, count100: 25, count50: 6, balance: 293.25 },
  },
  {
    shortName: 'Salih',
    fullName: 'Muhammed Salih',
    studentId: 'mem_7',
    memberCode: 'DKIF-REC-07',
    expectedDays: 13,
    expectedTotal: 33254.00,
    expectedBreakdown: { count500: 60, count100: 27, count50: 5, balance: 304.00 },
  },
];

/**
 * Greedy breakdown of amount into Rs.500, Rs.100, Rs.50 notes and balance below Rs.50.
 * DISPLAY/REPORT ONLY - NEVER STORE AS REAL RECEIPT RECORDS.
 */
export function calculateReconstructedBreakdown(amount: number): ReconstructedBreakdown {
  let rem = Math.round(amount * 100) / 100;
  const count500 = Math.floor(rem / 500);
  rem = Math.round((rem - count500 * 500) * 100) / 100;

  const count100 = Math.floor(rem / 100);
  rem = Math.round((rem - count100 * 100) * 100) / 100;

  const count50 = Math.floor(rem / 50);
  rem = Math.round((rem - count50 * 50) * 100) / 100;

  const balance = rem;

  return {
    count500,
    count100,
    count50,
    balance,
  };
}

/**
 * All 89 Historical per-student collection rows recorded from the 2026 notebook
 */
export const RAW_HISTORICAL_DATA: RawHistoricalEntry[] = [
  // GAFOOR (21 days)
  { studentShortName: 'Gafoor', date: '2026-02-19', place: 'Uchila', amount: 786.00 },
  { studentShortName: 'Gafoor', date: '2026-02-20', place: 'Uchila', amount: 891.80 },
  { studentShortName: 'Gafoor', date: '2026-02-22', place: 'Wayanad', amount: 2526.00 },
  { studentShortName: 'Gafoor', date: '2026-02-23', place: 'Wayanad Kalpetta', amount: 2429.00 },
  { studentShortName: 'Gafoor', date: '2026-02-24', place: 'Wayanad Kalpetta', amount: 2830.00 },
  { studentShortName: 'Gafoor', date: '2026-02-25', place: 'Wayanad Kalpetta', amount: 3106.20 },
  { studentShortName: 'Gafoor', date: '2026-02-26', place: 'Wayanad Kalpetta', amount: 2806.40 },
  { studentShortName: 'Gafoor', date: '2026-02-28', place: 'Wayanad Kalpetta', amount: 2076.20 },
  { studentShortName: 'Gafoor', date: '2026-03-02', place: 'Wayanad Mananthavadi', amount: 3500.00 },
  { studentShortName: 'Gafoor', date: '2026-03-03', place: 'Wayanad Mananthavadi', amount: 3554.25 },
  { studentShortName: 'Gafoor', date: '2026-03-04', place: 'Wayanad Mananthavadi', amount: 3410.80 },
  { studentShortName: 'Gafoor', date: '2026-03-05', place: 'Wayanad Mananthavadi', amount: 2460.40 },
  { studentShortName: 'Gafoor', date: '2026-03-07', place: 'Wayanad Mananthavadi', amount: 3671.20 },
  { studentShortName: 'Gafoor', date: '2026-03-08', place: 'Wayanad Mananthavadi', amount: 2520.00 },
  { studentShortName: 'Gafoor', date: '2026-03-10', place: 'Thoziyoor', amount: 3888.00 },
  { studentShortName: 'Gafoor', date: '2026-03-11', place: 'Kalloor', amount: 6007.34 },
  { studentShortName: 'Gafoor', date: '2026-03-12', place: 'Parur', amount: 3740.00 },
  { studentShortName: 'Gafoor', date: '2026-03-14', place: 'Kanichyoor', amount: 2602.66 },
  { studentShortName: 'Gafoor', date: '2026-03-15', place: 'Vadakkekad', amount: 3561.00 },
  { studentShortName: 'Gafoor', date: '2026-03-16', place: 'Vadakkekad', amount: 3807.34 },
  { studentShortName: 'Gafoor', date: '2026-03-18', place: 'Vadakkekad', amount: 2025.00 },

  // BASIM (21 days)
  { studentShortName: 'Basim', date: '2026-02-19', place: 'Uchila', amount: 786.00 },
  { studentShortName: 'Basim', date: '2026-02-20', place: 'Uchila', amount: 891.80 },
  { studentShortName: 'Basim', date: '2026-02-22', place: 'Wayanad', amount: 2526.00 },
  { studentShortName: 'Basim', date: '2026-02-23', place: 'Wayanad Kalpetta', amount: 2429.00 },
  { studentShortName: 'Basim', date: '2026-02-24', place: 'Wayanad Kalpetta', amount: 2830.00 },
  { studentShortName: 'Basim', date: '2026-02-25', place: 'Wayanad Kalpetta', amount: 3106.20 },
  { studentShortName: 'Basim', date: '2026-02-26', place: 'Wayanad Kalpetta', amount: 2806.40 },
  { studentShortName: 'Basim', date: '2026-02-28', place: 'Wayanad Kalpetta', amount: 2076.20 },
  { studentShortName: 'Basim', date: '2026-03-02', place: 'Wayanad Mananthavadi', amount: 3500.00 },
  { studentShortName: 'Basim', date: '2026-03-03', place: 'Wayanad Mananthavadi', amount: 3554.25 },
  { studentShortName: 'Basim', date: '2026-03-04', place: 'Wayanad Mananthavadi', amount: 3410.80 },
  { studentShortName: 'Basim', date: '2026-03-05', place: 'Wayanad Mananthavadi', amount: 2460.40 },
  { studentShortName: 'Basim', date: '2026-03-07', place: 'Wayanad Mananthavadi', amount: 3671.20 },
  { studentShortName: 'Basim', date: '2026-03-08', place: 'Wayanad Mananthavadi', amount: 2520.00 },
  { studentShortName: 'Basim', date: '2026-03-10', place: 'Ayinichode', amount: 3888.00 },
  { studentShortName: 'Basim', date: '2026-03-11', place: 'Manthadam', amount: 6007.33 },
  { studentShortName: 'Basim', date: '2026-03-12', place: 'Kokkur', amount: 3740.00 },
  { studentShortName: 'Basim', date: '2026-03-14', place: 'Ayinichode', amount: 2602.67 },
  { studentShortName: 'Basim', date: '2026-03-15', place: 'Kuttipuram', amount: 3561.00 },
  { studentShortName: 'Basim', date: '2026-03-16', place: 'Chavakkad', amount: 3807.33 },
  { studentShortName: 'Basim', date: '2026-03-18', place: 'Kuttipuram', amount: 2025.00 },

  // ASLAM (19 days)
  { studentShortName: 'Aslam', date: '2026-02-19', place: 'Uchila', amount: 786.00 },
  { studentShortName: 'Aslam', date: '2026-02-20', place: 'Uchila', amount: 891.80 },
  { studentShortName: 'Aslam', date: '2026-02-22', place: 'Wayanad', amount: 2526.00 },
  { studentShortName: 'Aslam', date: '2026-02-23', place: 'Wayanad Kalpetta', amount: 2429.00 },
  { studentShortName: 'Aslam', date: '2026-02-24', place: 'Wayanad Kalpetta', amount: 2830.00 },
  { studentShortName: 'Aslam', date: '2026-02-25', place: 'Wayanad Kalpetta', amount: 3106.20 },
  { studentShortName: 'Aslam', date: '2026-02-26', place: 'Wayanad Kalpetta', amount: 2806.40 },
  { studentShortName: 'Aslam', date: '2026-02-28', place: 'Wayanad Kalpetta', amount: 2076.20 },
  { studentShortName: 'Aslam', date: '2026-03-02', place: 'Wayanad Mananthavadi', amount: 3500.00 },
  { studentShortName: 'Aslam', date: '2026-03-03', place: 'Wayanad Mananthavadi', amount: 3554.25 },
  { studentShortName: 'Aslam', date: '2026-03-04', place: 'Wayanad Mananthavadi', amount: 3410.80 },
  { studentShortName: 'Aslam', date: '2026-03-05', place: 'Wayanad Mananthavadi', amount: 2460.40 },
  { studentShortName: 'Aslam', date: '2026-03-07', place: 'Wayanad Mananthavadi', amount: 3671.20 },
  { studentShortName: 'Aslam', date: '2026-03-08', place: 'Wayanad Mananthavadi', amount: 2520.00 },
  { studentShortName: 'Aslam', date: '2026-03-11', place: 'Mukkaala', amount: 6007.33 },
  { studentShortName: 'Aslam', date: '2026-03-12', place: 'Kozikara', amount: 3740.00 },
  { studentShortName: 'Aslam', date: '2026-03-14', place: 'Kanichyoor', amount: 2602.67 },
  { studentShortName: 'Aslam', date: '2026-03-16', place: 'Chavakkad', amount: 3807.33 },
  { studentShortName: 'Aslam', date: '2026-03-18', place: 'Vadakkekad', amount: 2025.00 },

  // AYUB (15 days)
  { studentShortName: 'Ayub', date: '2026-02-19', place: 'Uchila', amount: 786.00 },
  { studentShortName: 'Ayub', date: '2026-02-20', place: 'Uchila', amount: 891.80 },
  { studentShortName: 'Ayub', date: '2026-02-22', place: 'Wayanad', amount: 2526.00 },
  { studentShortName: 'Ayub', date: '2026-02-23', place: 'Wayanad Kalpetta', amount: 2429.00 },
  { studentShortName: 'Ayub', date: '2026-02-24', place: 'Wayanad Kalpetta', amount: 2830.00 },
  { studentShortName: 'Ayub', date: '2026-02-25', place: 'Wayanad Kalpetta', amount: 3106.20 },
  { studentShortName: 'Ayub', date: '2026-02-26', place: 'Wayanad Kalpetta', amount: 2806.40 },
  { studentShortName: 'Ayub', date: '2026-02-28', place: 'Wayanad Kalpetta', amount: 2076.20 },
  { studentShortName: 'Ayub', date: '2026-03-02', place: 'Wayanad Mananthavadi', amount: 3500.00 },
  { studentShortName: 'Ayub', date: '2026-03-03', place: 'Wayanad Mananthavadi', amount: 3554.25 },
  { studentShortName: 'Ayub', date: '2026-03-04', place: 'Wayanad Mananthavadi', amount: 3410.80 },
  { studentShortName: 'Ayub', date: '2026-03-05', place: 'Wayanad Mananthavadi', amount: 2460.40 },
  { studentShortName: 'Ayub', date: '2026-03-07', place: 'Wayanad Mananthavadi', amount: 3671.20 },
  { studentShortName: 'Ayub', date: '2026-03-08', place: 'Wayanad Mananthavadi', amount: 2520.00 },
  { studentShortName: 'Ayub', date: '2026-03-18', place: 'Vadakkekad', amount: 2025.00 },

  // SALIH (13 days)
  { studentShortName: 'Salih', date: '2026-02-19', place: 'Uchila', amount: 786.00 },
  { studentShortName: 'Salih', date: '2026-02-20', place: 'Uchila', amount: 891.80 },
  { studentShortName: 'Salih', date: '2026-02-22', place: 'Wayanad', amount: 2526.00 },
  { studentShortName: 'Salih', date: '2026-02-23', place: 'Wayanad Kalpetta', amount: 2429.00 },
  { studentShortName: 'Salih', date: '2026-02-24', place: 'Wayanad Kalpetta', amount: 2830.00 },
  { studentShortName: 'Salih', date: '2026-02-25', place: 'Wayanad Kalpetta', amount: 3106.20 },
  { studentShortName: 'Salih', date: '2026-02-26', place: 'Wayanad Kalpetta', amount: 2806.40 },
  { studentShortName: 'Salih', date: '2026-02-28', place: 'Wayanad Kalpetta', amount: 2076.20 },
  { studentShortName: 'Salih', date: '2026-03-04', place: 'Wayanad Mananthavadi', amount: 3410.80 },
  { studentShortName: 'Salih', date: '2026-03-05', place: 'Wayanad Mananthavadi', amount: 2460.40 },
  { studentShortName: 'Salih', date: '2026-03-07', place: 'Wayanad Mananthavadi', amount: 3671.20 },
  { studentShortName: 'Salih', date: '2026-03-08', place: 'Wayanad Mananthavadi', amount: 2520.00 },
  { studentShortName: 'Salih', date: '2026-03-12', place: 'Kokkur', amount: 3740.00 },
];

/**
 * Original Notebook Daily Camp Totals
 */
export const NOTEBOOK_DAILY_CAMP_TOTALS: { date: string; places: string; campTotal: number }[] = [
  { date: '2026-02-19', places: 'Uchila', campTotal: 3930 },
  { date: '2026-02-20', places: 'Uchila', campTotal: 4459 },
  { date: '2026-02-22', places: 'Wayanad', campTotal: 12630 },
  { date: '2026-02-23', places: 'Wayanad Kalpetta', campTotal: 12145 },
  { date: '2026-02-24', places: 'Wayanad Kalpetta', campTotal: 14150 },
  { date: '2026-02-25', places: 'Wayanad Kalpetta', campTotal: 15531 },
  { date: '2026-02-26', places: 'Wayanad Kalpetta', campTotal: 14032 },
  { date: '2026-02-28', places: 'Wayanad Kalpetta', campTotal: 10381 },
  { date: '2026-03-02', places: 'Wayanad Mananthavadi', campTotal: 14000 },
  { date: '2026-03-03', places: 'Wayanad Mananthavadi', campTotal: 14217 },
  { date: '2026-03-04', places: 'Wayanad Mananthavadi', campTotal: 17054 },
  { date: '2026-03-05', places: 'Wayanad Mananthavadi', campTotal: 12302 },
  { date: '2026-03-07', places: 'Wayanad Mananthavadi', campTotal: 18356 },
  { date: '2026-03-08', places: 'Wayanad Mananthavadi', campTotal: 12600 },
  { date: '2026-03-10', places: 'Ayinichode, Thoziyoor', campTotal: 7776 },
  { date: '2026-03-11', places: 'Manthadam, Kalloor, Mukkaala', campTotal: 18022 },
  { date: '2026-03-12', places: 'Kokkur, Kozikara, Parur', campTotal: 14960 },
  { date: '2026-03-14', places: 'Ayinichode, Kanichyoor', campTotal: 7808 },
  { date: '2026-03-15', places: 'Kuttipuram, Vadakkekad', campTotal: 7122 },
  { date: '2026-03-16', places: 'Chavakkad, Vadakkekad', campTotal: 11422 },
  { date: '2026-03-18', places: 'Kuttipuram, Vadakkekad', campTotal: 8100 },
];
