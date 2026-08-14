import {
  PPDBVerificationSettings,
  ProgramFeeStructure,
  NewStudentFeeStructure,
  ActiveStudentFeeStructure,
  CustomFeeItem,
  FeeCategoryType,
  CustomFeeCategoryOption,
} from '../types';
import { DEFAULT_PPDB_VERIFICATION_SETTINGS, DEFAULT_FEE_CATEGORIES } from '../data/mockData';

/**
 * Normalizes any program string variant (e.g. 'paket_a', 'Paket A', 'Paket A (Setara SD)', 'sd', etc.)
 * into canonical keys: 'paket_a' | 'paket_b' | 'paket_c'
 */
export function normalizeProgramKey(prog: string | undefined): 'paket_a' | 'paket_b' | 'paket_c' {
  if (!prog) return 'paket_c';
  const lower = prog.toLowerCase().trim();
  if (lower.includes('paket_a') || lower.includes('paket a') || lower === 'sd' || lower.includes('setara sd')) {
    return 'paket_a';
  }
  if (lower.includes('paket_b') || lower.includes('paket b') || lower === 'smp' || lower.includes('setara smp')) {
    return 'paket_b';
  }
  if (lower.includes('paket_c') || lower.includes('paket c') || lower === 'sma' || lower.includes('setara sma')) {
    return 'paket_c';
  }
  return 'paket_c';
}

/**
 * Returns all active fee categories configured in settings or fallback defaults
 */
export function getFeeCategories(settings?: PPDBVerificationSettings): CustomFeeCategoryOption[] {
  if (settings?.customCategories && settings.customCategories.length > 0) {
    return settings.customCategories;
  }
  return DEFAULT_FEE_CATEGORIES;
}

/**
 * Returns human-readable label for a fee category (checks customized names if available)
 */
export function getFeeCategoryLabel(cat: FeeCategoryType | string, settings?: PPDBVerificationSettings): string {
  const categories = getFeeCategories(settings);
  const found = categories.find((c) => c.id === cat);
  if (found && found.name) {
    return found.name;
  }

  switch (cat) {
    case 'pendaftaran':
      return 'Pendaftaran / Formulir Masuk';
    case 'gedung':
      return 'Uang Gedung & Sarana Belajar';
    case 'seragam':
      return 'Seragam & Modul Perdana';
    case 'spp':
      return 'SPP Pokok Bulanan';
    case 'daftar_ulang':
      return 'Daftar Ulang / Heregistrasi Semester';
    case 'ujian':
      return 'Ujian Modul & Asesmen Nasional';
    case 'kegiatan':
      return 'Praktikum & Ekstrakurikuler';
    case 'program_sekolah':
      return 'Biaya Program Sekolah Paket';
    case 'muatan_tambahan':
      return 'Program Muatan Tambahan / Vokasi';
    case 'lainnya':
      return 'Lainnya / Tambahan Khusus';
    default:
      return cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Komponen Biaya';
  }
}

/**
 * Returns styling badge classes for a fee category
 */
export function getFeeCategoryBadge(cat: FeeCategoryType | string): { bg: string; text: string; border: string } {
  switch (cat) {
    case 'pendaftaran':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'gedung':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'seragam':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'spp':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'daftar_ulang':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'ujian':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'kegiatan':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'program_sekolah':
      return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' };
    case 'muatan_tambahan':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
    case 'lainnya':
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

/**
 * Returns human-readable label for a program key
 */
export function getProgramLabel(prog: string | undefined): string {
  const key = normalizeProgramKey(prog);
  switch (key) {
    case 'paket_a':
      return 'Paket A (Setara SD)';
    case 'paket_b':
      return 'Paket B (Setara SMP)';
    case 'paket_c':
      return 'Paket C (Setara SMA)';
  }
}

/**
 * Returns the customized itemized list of fee components for New Students (PPDB)
 * Configured exclusively by Superadmin
 */
export function getNewStudentFeeItems(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): { items: CustomFeeItem[]; totalInitial: number } {
  const key = normalizeProgramKey(prog);
  const customItems = settings?.customFeeItems?.[key]?.newStudentItems;

  if (customItems && customItems.length > 0) {
    const totalInitial = customItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return { items: customItems, totalInitial };
  }

  // Fallback default custom items from DEFAULT_PPDB_VERIFICATION_SETTINGS
  const defaultItems = DEFAULT_PPDB_VERIFICATION_SETTINGS.customFeeItems?.[key]?.newStudentItems || [];
  if (defaultItems.length > 0) {
    const totalInitial = defaultItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return { items: defaultItems, totalInitial };
  }

  // Fallback to structured object
  const struct = getNewStudentFeeDetails(prog, settings);
  const fallbackItems: CustomFeeItem[] = [
    { id: `ppdb_reg_${key}`, name: 'Uang Formulir & Pendaftaran', category: 'pendaftaran', amount: struct.registrationFee, period: '1x Saat Pendaftaran PPDB', isRequired: true },
    { id: `ppdb_bld_${key}`, name: 'Uang Gedung & Sarana Belajar', category: 'gedung', amount: struct.buildingFee, period: '1x Awal Masuk', isRequired: true },
    { id: `ppdb_unif_${key}`, name: 'Seragam Lengkap & Modul Perdana', category: 'seragam', amount: struct.uniformModulFee, period: 'Paket Perlengkapan Awal', isRequired: true },
    { id: `ppdb_spp1_${key}`, name: 'SPP Bulan Pertama Masuk', category: 'spp', amount: struct.initialSpp, period: 'Bulan Ke-1 Pembelajaran', isRequired: true },
  ];
  return { items: fallbackItems, totalInitial: struct.totalInitial };
}

/**
 * Returns the customized itemized list of fee components for Active Students (SPP Siswa Aktif)
 * Configured exclusively by Superadmin
 */
export function getActiveStudentFeeItems(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): {
  items: CustomFeeItem[];
  sppMonthly: number;
  totalSemesterEst: number;
  totalAnnualEst: number;
} {
  const key = normalizeProgramKey(prog);
  const customItems = settings?.customFeeItems?.[key]?.activeStudentItems;

  if (customItems && customItems.length > 0) {
    const sppItem = customItems.find((i) => i.category === 'spp');
    const sppMonthly = sppItem ? Number(sppItem.amount) : (settings?.activeStudentFees?.[key]?.sppMonthly || 200000);
    const nonSppTotal = customItems
      .filter((i) => i.category !== 'spp')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSemesterEst = (sppMonthly * 6) + nonSppTotal;
    const totalAnnualEst = (sppMonthly * 12) + (nonSppTotal * 2);

    return {
      items: customItems,
      sppMonthly,
      totalSemesterEst,
      totalAnnualEst,
    };
  }

  const defaultItems = DEFAULT_PPDB_VERIFICATION_SETTINGS.customFeeItems?.[key]?.activeStudentItems || [];
  if (defaultItems.length > 0) {
    const sppItem = defaultItems.find((i) => i.category === 'spp');
    const sppMonthly = sppItem ? Number(sppItem.amount) : 200000;
    const nonSppTotal = defaultItems
      .filter((i) => i.category !== 'spp')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSemesterEst = (sppMonthly * 6) + nonSppTotal;
    const totalAnnualEst = (sppMonthly * 12) + (nonSppTotal * 2);

    return {
      items: defaultItems,
      sppMonthly,
      totalSemesterEst,
      totalAnnualEst,
    };
  }

  const struct = getActiveStudentFeeDetails(prog, settings);
  const fallbackItems: CustomFeeItem[] = [
    { id: `act_spp_${key}`, name: 'SPP Bulanan Siswa Aktif', category: 'spp', amount: struct.sppMonthly, period: 'Per Bulan', isRequired: true },
    { id: `act_rereg_${key}`, name: 'Daftar Ulang / Heregistrasi Semester', category: 'daftar_ulang', amount: struct.reRegistrationFee, period: 'Per Semester', isRequired: false },
    { id: `act_exam_${key}`, name: 'Biaya Ujian Modul & Asesmen', category: 'ujian', amount: struct.examEvaluationFee, period: 'Evaluasi Modul', isRequired: false },
    { id: `act_act_${key}`, name: 'Biaya Praktikum & Ekstrakurikuler', category: 'kegiatan', amount: struct.activityFee, period: 'Per Semester', isRequired: false },
  ];

  return {
    items: fallbackItems,
    sppMonthly: struct.sppMonthly,
    totalSemesterEst: struct.totalSemesterEst,
    totalAnnualEst: struct.totalAnnualEst,
  };
}

/**
 * Returns the fee structure specifically for New Applicants / Siswa Pendaftar Baru (Tagihan PPDB)
 * Calculates the exact Total Tagihan PPDB from the customized items.
 */
export function getNewStudentFeeDetails(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): NewStudentFeeStructure & { totalInitial: number } {
  const key = normalizeProgramKey(prog);

  // If custom items exist, calculate directly
  if (settings?.customFeeItems?.[key]?.newStudentItems?.length) {
    const items = settings.customFeeItems[key]!.newStudentItems;
    const regItem = items.find((i) => i.category === 'pendaftaran');
    const bldItem = items.find((i) => i.category === 'gedung');
    const unifItem = items.find((i) => i.category === 'seragam');
    const sppItem = items.find((i) => i.category === 'spp');
    const total = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      registrationFee: regItem ? Number(regItem.amount) : 0,
      buildingFee: bldItem ? Number(bldItem.amount) : 0,
      uniformModulFee: unifItem ? Number(unifItem.amount) : 0,
      initialSpp: sppItem ? Number(sppItem.amount) : 0,
      totalInitial: total,
    };
  }

  if (settings?.newStudentFees?.[key]) {
    const s = settings.newStudentFees[key];
    const totalInitial = (s.registrationFee || 0) + (s.buildingFee || 0) + (s.uniformModulFee || 0) + (s.initialSpp || 0);
    return { ...s, totalInitial };
  }

  // Fallback from programFees or default defaults
  const progFees = settings?.programFees?.[key];
  const regFee = progFees?.registrationFee ?? (settings?.fees?.[key] ?? (key === 'paket_a' ? 250000 : key === 'paket_b' ? 350000 : 500000));
  const buildFee = progFees?.buildingFee ?? (key === 'paket_a' ? 500000 : key === 'paket_b' ? 750000 : 1000000);
  const uniformFee = progFees?.uniformModulFee ?? (key === 'paket_a' ? 350000 : key === 'paket_b' ? 400000 : 450000);
  const initSpp = progFees?.sppMonthly ?? (key === 'paket_a' ? 150000 : key === 'paket_b' ? 200000 : 250000);

  return {
    registrationFee: regFee,
    buildingFee: buildFee,
    uniformModulFee: uniformFee,
    initialSpp: initSpp,
    totalInitial: regFee + buildFee + uniformFee + initSpp,
  };
}

/**
 * Returns the fee structure specifically for Active Students / Siswa Aktif (Tagihan SPP & Keuangan Berjalan)
 * Provides separate breakdown and distinct calculations for monthly, semester, and annual totals.
 */
export function getActiveStudentFeeDetails(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): ActiveStudentFeeStructure & {
  totalMonthlySpp: number;
  totalSemesterEst: number;
  totalAnnualEst: number;
} {
  const key = normalizeProgramKey(prog);

  if (settings?.customFeeItems?.[key]?.activeStudentItems?.length) {
    const items = settings.customFeeItems[key]!.activeStudentItems;
    const sppItem = items.find((i) => i.category === 'spp');
    const reregItem = items.find((i) => i.category === 'daftar_ulang');
    const examItem = items.find((i) => i.category === 'ujian');
    const actItem = items.find((i) => i.category === 'kegiatan');

    const spp = sppItem ? Number(sppItem.amount) : 0;
    const rereg = reregItem ? Number(reregItem.amount) : 0;
    const exam = examItem ? Number(examItem.amount) : 0;
    const act = actItem ? Number(actItem.amount) : 0;
    const otherSum = items
      .filter((i) => i.category !== 'spp')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      sppMonthly: spp,
      reRegistrationFee: rereg,
      examEvaluationFee: exam,
      activityFee: act,
      totalMonthlySpp: spp,
      totalSemesterEst: (spp * 6) + otherSum,
      totalAnnualEst: (spp * 12) + (otherSum * 2),
    };
  }

  if (settings?.activeStudentFees?.[key]) {
    const s = settings.activeStudentFees[key];
    const spp = s.sppMonthly || 0;
    const reReg = s.reRegistrationFee || 0;
    const exam = s.examEvaluationFee || 0;
    const act = s.activityFee || 0;
    const totalSemesterEst = (spp * 6) + reReg + exam + act;
    const totalAnnualEst = (spp * 12) + (reReg * 2) + (exam * 2) + (act * 2);
    return {
      ...s,
      totalMonthlySpp: spp,
      totalSemesterEst,
      totalAnnualEst,
    };
  }

  const progFees = settings?.programFees?.[key];
  const spp = progFees?.sppMonthly ?? (key === 'paket_a' ? 150000 : key === 'paket_b' ? 200000 : 250000);
  const reReg = progFees?.reRegistrationFee ?? (key === 'paket_a' ? 150000 : key === 'paket_b' ? 200000 : 250000);
  const exam = progFees?.examEvaluationFee ?? (key === 'paket_a' ? 150000 : key === 'paket_b' ? 200000 : 250000);
  const act = progFees?.activityFee ?? (key === 'paket_a' ? 100000 : key === 'paket_b' ? 150000 : 200000);

  return {
    sppMonthly: spp,
    reRegistrationFee: reReg,
    examEvaluationFee: exam,
    activityFee: act,
    totalMonthlySpp: spp,
    totalSemesterEst: (spp * 6) + reReg + exam + act,
    totalAnnualEst: (spp * 12) + (reReg * 2) + (exam * 2) + (act * 2),
  };
}

/**
 * Returns the full combined structure of fees for backwards compatibility.
 */
export function getProgramFeeDetails(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): ProgramFeeStructure {
  const key = normalizeProgramKey(prog);

  if (settings?.programFees?.[key]) {
    return settings.programFees[key];
  }

  const newFees = getNewStudentFeeDetails(key, settings);
  const actFees = getActiveStudentFeeDetails(key, settings);

  return {
    sppMonthly: actFees.sppMonthly,
    registrationFee: newFees.registrationFee,
    buildingFee: newFees.buildingFee,
    reRegistrationFee: actFees.reRegistrationFee,
    uniformModulFee: newFees.uniformModulFee,
    examEvaluationFee: actFees.examEvaluationFee,
    activityFee: actFees.activityFee,
  };
}

/**
 * Returns the exact Total Tagihan PPDB (Pendaftaran Masuk) that must be paid for a program
 */
export function getRegistrationFeeForProgram(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): number {
  return getNewStudentFeeDetails(prog, settings).totalInitial;
}

/**
 * Returns the exact SPP Bulanan for a program
 */
export function getMonthlySppForProgram(
  prog: string | undefined,
  settings?: PPDBVerificationSettings
): number {
  return getActiveStudentFeeDetails(prog, settings).sppMonthly;
}

/**
 * Resolves the default password dynamically based on pattern and applicant data.
 * Supported placeholders:
 * - [NO_REG] -> Full registration number (e.g., PPDB-2024-0081)
 * - [2_ANGKA_AKHIR_NIK] -> Last 2 digits of NIK (e.g., 01)
 * - [NIK] -> Full 16-digit NIK
 */
export function resolveDefaultPassword(pattern: string, regNumber: string, nik?: string): string {
  if (!pattern) {
    const nikLast2 = nik && nik.trim().length >= 2 ? nik.trim().slice(-2) : '00';
    return `${regNumber}${nikLast2}`;
  }

  let result = pattern;
  const nikLast2 = nik && nik.trim().length >= 2 ? nik.trim().slice(-2) : '00';
  const fullNik = nik && nik.trim() ? nik.trim() : '0000000000000000';

  result = result.replace(/\[NO_REG\]/g, regNumber);
  result = result.replace(/\[2_ANGKA_AKHIR_NIK\]/g, nikLast2);
  result = result.replace(/\[NIK\]/g, fullNik);

  return result;
}

/**
 * Generates a new registration number using a prefix set by Superadmin
 */
export function generateRegNumber(prefix: string = 'PPDB-2024-'): string {
  const cleanPrefix = prefix ? prefix.trim() : 'PPDB-2024-';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanPrefix}${randomNum}`;
}

export { DEFAULT_PPDB_VERIFICATION_SETTINGS };

const STORAGE_KEY = 'pkbm_ppdb_verification_settings';

export function getStoredVerificationSettings(): PPDBVerificationSettings {
  if (typeof window === 'undefined') return DEFAULT_PPDB_VERIFICATION_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load PPDB settings from storage:', err);
  }
  return DEFAULT_PPDB_VERIFICATION_SETTINGS;
}

export function saveStoredVerificationSettings(settings: PPDBVerificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save PPDB settings to storage:', err);
  }
}


