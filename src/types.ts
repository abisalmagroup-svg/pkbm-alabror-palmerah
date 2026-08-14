export type NavTab = 'beranda' | 'program' | 'ppdb' | 'portal';

export type UserRole = 'superadmin' | 'admin' | 'guru' | 'siswa';

export interface UserPermissions {
  canManagePPDB: boolean;
  canManageStudents: boolean;
  canManageFinance: boolean;
  canManageTeachers: boolean;
  canCustomizeWebsite: boolean;
  canManageUsers: boolean;
}

export interface UserAccount {
  id: string;
  username: string; // Email or NIS or NIP
  fullName: string;
  role: UserRole;
  password: string;
  status: 'Aktif' | 'Nonaktif';
  nisOrNip?: string;
  permissions: UserPermissions;
  createdAt: string;
}

export interface TeacherData {
  id: string;
  nip: string;
  name: string;
  subject: string;
  program: string;
  phone: string;
  status: 'Aktif' | 'Cuti';
}

export interface StudentData {
  id: string;
  nis: string;
  name: string;
  photoUrl?: string;
  nik?: string;
  gender?: 'L' | 'P';
  dob?: string;
  pob?: string;
  program: 'Paket A' | 'Paket B' | 'Paket C';
  classGrade: string;
  status: 'Aktif' | 'Alumni' | 'Cuti';
  studentType?: 'Siswa Baru' | 'Siswa Aktif' | 'Pindahan';
  parentName: string;
  parentPhone: string;
  registrationDate: string;
  customSppMonthly?: number;
  customReRegistrationFee?: number;
  scholarshipNotes?: string;
}

export interface PaymentBill {
  id: string;
  title: string;
  amount: number;
  period: string;
  category: FeeCategoryType | 'other';
  dueDate?: string;
  isChecked?: boolean;
  studentType?: 'Siswa Baru' | 'Siswa Aktif';
}

export interface PaymentHistoryItem {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: 'Lunas' | 'Tertunda' | 'Diproses';
  method: string;
  nis: string;
  studentName: string;
  referenceNo?: string;
}

export interface PPDBRegistration {
  id: string;
  regNumber: string;
  photoUrl?: string;

  // 1. Registrasi Pendaftaran (DAPODIK)
  jenisPendaftaran?: 'Siswa Baru' | 'Pindahan' | 'Kembali Belajar';
  program: 'paket_a' | 'paket_b' | 'paket_c';
  sekolahAsal?: string;
  npsnAsal?: string;
  noIjazahSkl?: string;
  citaCita?: string;
  hobi?: string;

  // 2. Data Pribadi Siswa (DAPODIK)
  fullName: string;
  gender: 'L' | 'P';
  nisn?: string;
  nik: string;
  pob: string;
  dob: string;
  religion?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya';
  kewarganegaraan?: 'WNI' | 'WNA';
  kebutuhanKhusus?: string;
  phone?: string;
  email?: string;

  // 3. Alamat Tempat Tinggal (DAPODIK)
  alamatJalan?: string;
  rtRw?: string;
  dusunKelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  kodePos?: string;
  tempatTinggal?: 'Bersama Orang Tua' | 'Wali' | 'Kos' | 'Asrama' | 'Lainnya';
  transportasi?: 'Jalan Kaki' | 'Sepeda' | 'Motor' | 'Mobil' | 'Angkutan Umum' | 'Lainnya';

  // 4. Data Orang Tua (Ayah & Ibu) & Wali (DAPODIK)
  // Ayah
  parentName: string; // Nama Ayah Kandung
  nikAyah?: string;
  tahunLahirAyah?: string;
  pendidikanAyah?: string;
  parentJob: string; // Pekerjaan Ayah
  penghasilanAyah?: string;

  // Ibu
  namaIbu?: string;
  nikIbu?: string;
  tahunLahirIbu?: string;
  pendidikanIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbu?: string;

  // Wali
  namaWali?: string;
  nikWali?: string;
  pekerjaanWali?: string;
  parentPhone: string; // No HP Orang Tua / Wali

  // 5. Data Periodik & Program Bantuan (DAPODIK)
  tinggiBadan?: number;
  beratBadan?: number;
  jarakSekolah?: string;
  waktuTempuh?: string;
  jumlahSaudara?: number;
  noKipKksPkh?: string;

  // 6. Dokumen
  documents: {
    kk?: string;
    akte?: string;
    ijazah?: string;
    pasFoto?: string;
    pasFotoUrl?: string;
    kip?: string;
  };

  // 7. Payment & Verification Flow for Portal Account
  paymentStatus?: 'Belum Bayar' | 'Menunggu Konfirmasi' | 'Lunas';
  paymentAmount?: number;
  paymentProof?: string;
  paymentDate?: string;
  paymentReference?: string;
  portalAccountCreated?: boolean;
  portalUsername?: string;
  portalPassword?: string;
  verificationNoticeSent?: boolean;
  date: string;
  status: 'Menunggu Verifikasi' | 'Lulus Verifikasi' | 'Ditolak';
  notes?: string;
}

export type FeeCategoryType =
  | 'pendaftaran'
  | 'gedung'
  | 'seragam'
  | 'spp'
  | 'daftar_ulang'
  | 'ujian'
  | 'kegiatan'
  | 'program_sekolah'
  | 'muatan_tambahan'
  | 'lainnya'
  | (string & {});

export interface CustomFeeCategoryOption {
  id: string;
  name: string;
  description?: string;
  badgeColor?: string;
  isSystem?: boolean;
}

export interface CustomFeeItem {
  id: string;
  name: string;              // Nama komponen pembayaran yang dapat dikostumisasi Superadmin
  category: FeeCategoryType; // Jenis / Kategori Pembayaran (Pendaftaran, Gedung, Seragam, SPP, Program Sekolah Paket, Muatan Tambahan, dll.)
  amount: number;            // Nominal (Rp)
  period?: string;           // Keterangan / Periode Tagihan
  isRequired?: boolean;      // Wajib dibayar atau opsional
  description?: string;      // Penjelasan rincian item
}

export interface ProgramCustomFees {
  newStudentItems: CustomFeeItem[];    // Rincian Komponen Tagihan PPDB (Siswa Baru)
  activeStudentItems: CustomFeeItem[]; // Rincian Komponen Tagihan Siswa Aktif
}

export interface ProgramFeeStructure {
  sppMonthly: number;        // Biaya SPP Perbulan
  registrationFee: number;  // Uang Pendaftaran / Formulir Masuk
  buildingFee: number;      // Uang Gedung & Sarana
  reRegistrationFee: number; // Uang Daftar Ulang Semester / Tahunan
  uniformModulFee?: number;  // Biaya Seragam & Modul Perdana
  examEvaluationFee?: number;// Biaya Ujian Modul & Asesmen
  activityFee?: number;      // Biaya Kegiatan & Praktikum
}

export interface NewStudentFeeStructure {
  registrationFee: number;   // Uang Formulir & Pendaftaran
  buildingFee: number;       // Uang Gedung & Sarana
  uniformModulFee: number;   // Biaya Seragam, Modul Perdana & Atribut
  initialSpp: number;        // Biaya SPP Bulan Pertama Masuk
}

export interface ActiveStudentFeeStructure {
  sppMonthly: number;        // Biaya SPP Bulanan Siswa Aktif
  reRegistrationFee: number; // Biaya Daftar Ulang / Heregistrasi Per-Semester
  examEvaluationFee: number; // Biaya Ujian Modul / Asesmen Nasional
  activityFee: number;       // Biaya Kegiatan Praktikum & Ekstrakurikuler
}

export interface PPDBVerificationSettings {
  regNumberPrefix: string;
  fees: {
    paket_a: number;
    paket_b: number;
    paket_c: number;
  };
  programFees?: {
    paket_a: ProgramFeeStructure;
    paket_b: ProgramFeeStructure;
    paket_c: ProgramFeeStructure;
  };
  newStudentFees?: {
    paket_a: NewStudentFeeStructure;
    paket_b: NewStudentFeeStructure;
    paket_c: NewStudentFeeStructure;
  };
  activeStudentFees?: {
    paket_a: ActiveStudentFeeStructure;
    paket_b: ActiveStudentFeeStructure;
    paket_c: ActiveStudentFeeStructure;
  };
  customFeeItems?: {
    paket_a?: ProgramCustomFees;
    paket_b?: ProgramCustomFees;
    paket_c?: ProgramCustomFees;
  };
  customCategories?: CustomFeeCategoryOption[]; // Katalog & Kustomisasi Jenis / Kategori Pembayaran oleh Superadmin
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrisInfo: string;
  };
  autoCreatePortalAccount: boolean;
  defaultPasswordPattern: string;
  waMessageTemplate: string;
  expiryHours: number;
}

export interface ProgramInfo {
  id: 'paket_a' | 'paket_b' | 'paket_c' | 'tahfidz' | 'english' | 'entrepreneur';
  title: string;
  equivalent: string;
  badgeColor: string;
  description: string;
  subjects: string[];
  features: string[];
  fees: {
    registration: number;
    monthly: number;
  };
  schedule: string;
}
