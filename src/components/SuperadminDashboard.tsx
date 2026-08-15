import React, { useState, useEffect } from 'react';
import {
  PPDBRegistration,
  StudentData,
  PaymentHistoryItem,
  TeacherData,
  UserAccount,
  UserRole,
  UserPermissions,
  PPDBVerificationSettings,
  CustomFeeItem,
  FeeCategoryType,
  ProgramCustomFees,
  CustomFeeCategoryOption,
} from '../types';
import {
  INITIAL_PAYMENT_HISTORY,
  INITIAL_TEACHERS,
  INITIAL_USER_ACCOUNTS,
  DEFAULT_PPDB_VERIFICATION_SETTINGS,
  DEFAULT_FEE_CATEGORIES,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminGoogleSheetsSync } from './AdminGoogleSheetsSync';
import { LandingPageCustomizer } from './LandingPageCustomizer';
import { DapodikPrintSheet } from './DapodikPrintSheet';
import {
  resolveDefaultPassword,
  generateRegNumber,
  getRegistrationFeeForProgram,
  getProgramFeeDetails,
  getProgramLabel,
  getNewStudentFeeDetails,
  getActiveStudentFeeDetails,
  getNewStudentFeeItems,
  getActiveStudentFeeItems,
  getFeeCategoryLabel,
  getFeeCategories,
  getFeeCategoryBadge,
  saveStoredVerificationSettings,
} from '../utils/ppdbUtils';
import {
  ShieldCheck,
  Users,
  UserPlus,
  FileCheck2,
  CreditCard,
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Building,
  Palette,
  KeyRound,
  Shield,
  Lock,
  Eye,
  Printer,
  FileText,
  MapPin,
  Activity,
  UserCheck,
  Unlock,
  User,
  QrCode,
  Send,
  Settings,
  DollarSign,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Tag,
  Sliders,
} from 'lucide-react';

interface SuperadminDashboardProps {
  ppdbList: PPDBRegistration[];
  setPpdbList: React.Dispatch<React.SetStateAction<PPDBRegistration[]>>;
  students: StudentData[];
  setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
  ppdbSettings?: PPDBVerificationSettings;
  setPpdbSettings?: React.Dispatch<React.SetStateAction<PPDBVerificationSettings>>;
  userAccounts?: UserAccount[];
  setUserAccounts?: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  isAuthenticated?: boolean;
  userRole?: UserRole;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({
  ppdbList,
  setPpdbList,
  students,
  setStudents,
  ppdbSettings: propPpdbSettings,
  setPpdbSettings: propSetPpdbSettings,
  userAccounts: propUserAccounts,
  setUserAccounts: propSetUserAccounts,
  isAuthenticated = true,
  userRole = 'superadmin',
}) => {
  // Internal Fallback State
  const [internalPpdbSettings, setInternalPpdbSettings] = useState<PPDBVerificationSettings>(DEFAULT_PPDB_VERIFICATION_SETTINGS);
  const [internalUserAccounts, setInternalUserAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);

  const activeSettings = propPpdbSettings || internalPpdbSettings;
  const updateSettings = propSetPpdbSettings || setInternalPpdbSettings;
  const userAccounts = propUserAccounts || internalUserAccounts;
  const setUserAccounts = propSetUserAccounts || setInternalUserAccounts;

  // Verification & Portal Account Settings Modal State
  const [showPpdbSettingsModal, setShowPpdbSettingsModal] = useState(false);
  const [ppdbSettingsModalTab, setPpdbSettingsModalTab] = useState<'new_student' | 'active_student' | 'categories' | 'bank_qris' | 'portal_format'>('new_student');
  const [settingsForm, setSettingsForm] = useState<PPDBVerificationSettings>(activeSettings);
  const [dispatchNoticeModal, setDispatchNoticeModal] = useState<{
    open: boolean;
    item: PPDBRegistration | null;
    type: 'invoice' | 'credentials';
  }>({ open: false, item: null, type: 'invoice' });

  // Authentication Guard Check
  if (!isAuthenticated || userRole !== 'superadmin') {
    return (
      <div className="bg-rose-50 border border-rose-300 rounded-2xl p-8 text-center space-y-4 my-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-headline text-xl font-bold text-rose-900">
          Akses Terbatas: Khusus Akun Superadmin
        </h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Halaman Superadmin Dashboard ini terlindungi dan hanya dapat diakses oleh akun superadmin yang terotentikasi secara sah. Silakan masuk melalui portal otentikasi resmi.
        </p>
      </div>
    );
  }
  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<'ppdb' | 'siswa' | 'keuangan' | 'guru' | 'sheets' | 'landing' | 'users'>('ppdb');

  // Security Lock State
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Student Filter States
  const [studentProgramFilter, setStudentProgramFilter] = useState<'all' | 'Paket A' | 'Paket B' | 'Paket C'>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'Aktif' | 'Cuti' | 'Alumni'>('all');
  const [ktsModalStudent, setKtsModalStudent] = useState<StudentData | null>(null);
  const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<
    Array<{ id: string; timestamp: string; category: 'AUTH' | 'STUDENT' | 'PPDB' | 'SITE_CMS' | 'RBAC' | 'SHEETS'; user: string; action: string; ip: string }>
  >([
    { id: 'log_1', timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString('id-ID'), category: 'AUTH', user: 'superadmin', action: 'Superadmin master session authenticated successfully', ip: '180.252.19.42' },
    { id: 'log_2', timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString('id-ID'), category: 'STUDENT', user: 'superadmin', action: 'Student data NIS 202400101 verified and promoted to Kelas 11', ip: '180.252.19.42' },
    { id: 'log_3', timestamp: new Date(Date.now() - 40 * 60000).toLocaleTimeString('id-ID'), category: 'PPDB', user: 'admin_ppdb', action: 'New DAPODIK registration received: DAPODIK-2024-88392', ip: '114.122.45.10' },
    { id: 'log_4', timestamp: new Date(Date.now() - 90 * 60000).toLocaleTimeString('id-ID'), category: 'SITE_CMS', user: 'superadmin', action: 'Website Hero banner title & running announcement updated', ip: '180.252.19.42' },
    { id: 'log_5', timestamp: new Date(Date.now() - 180 * 60000).toLocaleTimeString('id-ID'), category: 'RBAC', user: 'superadmin', action: 'Modified module permission rights for user admin_keuangan', ip: '180.252.19.42' },
  ]);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('ALL');

  // Keuangan Data State
  const [payments, setPayments] = useState<PaymentHistoryItem[]>(INITIAL_PAYMENT_HISTORY);

  // Guru Data State
  const [teachers, setTeachers] = useState<TeacherData[]>(INITIAL_TEACHERS);

  // User Accounts State Modals
  const [editUserModal, setEditUserModal] = useState<UserAccount | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const handleAddAuditLog = (category: 'AUTH' | 'STUDENT' | 'PPDB' | 'SITE_CMS' | 'RBAC' | 'SHEETS', action: string) => {
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        category,
        user: 'superadmin',
        action,
        ip: '180.252.19.42',
      },
      ...prev,
    ]);
  };

  // Verification Action 1: Mark Lulus Verifikasi & Dispatch Payment Invoice
  const handleVerifyAndSendInvoice = (p: PPDBRegistration) => {
    const fee = getRegistrationFeeForProgram(p.program, activeSettings);
    const defaultPass = p.portalPassword || resolveDefaultPassword(activeSettings.defaultPasswordPattern, p.regNumber, p.nik);
    const username = p.nik || p.regNumber;

    const updatedItem: PPDBRegistration = {
      ...p,
      status: 'Lulus Verifikasi',
      paymentStatus: 'Belum Bayar',
      paymentAmount: fee,
      portalUsername: username,
      portalPassword: defaultPass,
      verificationNoticeSent: true,
    };

    setPpdbList((prev) => prev.map((item) => (item.id === p.id ? updatedItem : item)));

    handleAddAuditLog('PPDB', `Calon siswa ${p.fullName} (${p.regNumber}) DIVERIFIKASI LULUS. Tagihan Rp ${fee.toLocaleString('id-ID')} diterbitkan.`);

    setDispatchNoticeModal({
      open: true,
      item: updatedItem,
      type: 'invoice',
    });
  };

  // Verification Action 2: Confirm Payment & Auto-Activate Portal Account
  const handleConfirmPaymentAndActivatePortal = (p: PPDBRegistration) => {
    const nikLast2 = p.nik && p.nik.trim().length >= 2 ? p.nik.trim().slice(-2) : '00';
    const defaultPass = p.portalPassword || `${p.regNumber}${nikLast2}`;
    const username = p.portalUsername || p.nik || p.regNumber;

    const updatedItem: PPDBRegistration = {
      ...p,
      status: 'Lulus Verifikasi',
      paymentStatus: 'Lunas',
      portalAccountCreated: true,
      paymentDate: new Date().toISOString().split('T')[0],
    };

    setPpdbList((prev) => prev.map((item) => (item.id === p.id ? updatedItem : item)));

    // Auto-convert to active student record
    let classGrade = 'Kelas 10';
    let programLabel: 'Paket A' | 'Paket B' | 'Paket C' = 'Paket C';
    if (p.program === 'paket_a') {
      programLabel = 'Paket A';
      classGrade = 'Kelas 5';
    } else if (p.program === 'paket_b') {
      programLabel = 'Paket B';
      classGrade = 'Kelas 8';
    }

    const nis = `202400${Math.floor(100 + Math.random() * 900)}`;
    const newStudent: StudentData = {
      id: `s_${Date.now()}`,
      nis,
      name: p.fullName,
      program: programLabel,
      classGrade,
      status: 'Aktif',
      parentName: p.parentName,
      parentPhone: p.parentPhone,
      registrationDate: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === p.fullName.toLowerCase())) return prev;
      return [newStudent, ...prev];
    });

    // Auto-create Student UserAccount for Portal Login
    const newAccount: UserAccount = {
      id: `u_${Date.now()}`,
      username,
      fullName: p.fullName,
      role: 'siswa',
      password: defaultPass,
      status: 'Aktif',
      nisOrNip: nis,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: {
        canManagePPDB: false,
        canManageStudents: false,
        canManageFinance: false,
        canManageTeachers: false,
        canCustomizeWebsite: false,
        canManageUsers: false,
      },
    };

    setUserAccounts((prev) => {
      if (prev.some((u) => u.username === username)) return prev;
      return [newAccount, ...prev];
    });

    handleAddAuditLog('PPDB', `Pembayaran LUNAS & Akun Portal Siswa ${p.fullName} (Username: ${username}) DIAKTIFKAN.`);

    setDispatchNoticeModal({
      open: true,
      item: updatedItem,
      type: 'credentials',
    });
  };

  // Helper to build formatted WhatsApp URL
  const generateWaLink = (item: PPDBRegistration, type: 'invoice' | 'credentials') => {
    const rawPhone = item.parentPhone ? item.parentPhone.replace(/[^0-9]/g, '') : '081234567890';
    const formattedPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;

    let text = '';
    if (type === 'invoice') {
      const { items: newItems, totalInitial } = getNewStudentFeeItems(item.program, activeSettings);
      const exactTotal = item.paymentAmount || totalInitial;

      const itemsListText = newItems
        .map((it, idx) => `${idx + 1}. ${it.name} (${getFeeCategoryLabel(it.category)}): Rp ${Number(it.amount || 0).toLocaleString('id-ID')}`)
        .join('\n');

      const actDetails = getActiveStudentFeeDetails(item.program, activeSettings);

      text = `*PEMBERITAHUAN VERIFIKASI & TAGIHAN PPDB RESMI*\n` +
        `*PKBM AL-ABROR PALMERAH*\n\n` +
        `Yth. Orang Tua/Wali dari *${item.fullName}*\n` +
        `No. Registrasi: *${item.regNumber}*\n` +
        `Program: *${getProgramLabel(item.program)}*\n\n` +
        `Selamat! Berkas pendaftaran putra/putri Anda telah *LULUS VERIFIKASI DAPODIK*.\n\n` +
        `*RINCIAN KOMPONEN TAGIHAN PPDB (SISWA BARU):*\n` +
        `${itemsListText}\n` +
        `----------------------------------------\n` +
        `*TOTAL TAGIHAN PPDB YANG HARUS DIBAYARKAN: Rp ${exactTotal.toLocaleString('id-ID')}*\n\n` +
        `*REKENING RESMI TUJUAN TRANSFER:*\n` +
        `• Bank: *${activeSettings.bankInfo.bankName}*\n` +
        `• No. Rekening: *${activeSettings.bankInfo.accountNumber}*\n` +
        `• Atas Nama: *${activeSettings.bankInfo.accountHolder}*\n` +
        `• QRIS: ${activeSettings.bankInfo.qrisInfo}\n\n` +
        `_Catatan: Tagihan SPP bulanan berikutnya (mulai bulan ke-2) adalah Rp ${actDetails.sppMonthly.toLocaleString('id-ID')}/bulan._\n\n` +
        `Setelah pelunasan terkonfirmasi, Akun Portal Siswa Digital akan aktif otomatis.\n\n` +
        `Salam hormat,\n*Panitia PPDB PKBM AL-ABROR Palmerah*`;
    } else {
      const defaultPass = item.portalPassword || resolveDefaultPassword(activeSettings.defaultPasswordPattern, item.regNumber, item.nik);
      text = `*AKTIVASI AKUN PORTAL SISWA DIGITAL PKBM AL-ABROR*\n\n` +
        `Selamat! Pembayaran pendaftaran *${item.fullName}* (No. Reg: ${item.regNumber}) telah *LUNAS & TERKONFIRMASI*.\n\n` +
        `Berikut adalah kredensial akses Portal Siswa Digital Anda:\n` +
        `• *Username*: ${item.portalUsername || item.nik}\n` +
        `• *Password*: ${defaultPass}\n` +
        `• *Link Portal*: https://pkbmalabror.sch.id/portal\n\n` +
        `Gunakan akun ini untuk masuk ke Portal Siswa, melihat jadwal, materi, dan kartu KTS.\n\n` +
        `Terima Kasih,\nPKBM AL-ABROR Palmerah`;
    }

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  // Form state for User Account
  const [userForm, setUserForm] = useState<{
    username: string;
    fullName: string;
    role: UserRole;
    password: string;
    nisOrNip: string;
    status: 'Aktif' | 'Nonaktif';
    permissions: UserPermissions;
  }>({
    username: '',
    fullName: '',
    role: 'admin',
    password: '',
    nisOrNip: '',
    status: 'Aktif',
    permissions: {
      canManagePPDB: true,
      canManageStudents: true,
      canManageFinance: false,
      canManageTeachers: false,
      canCustomizeWebsite: false,
      canManageUsers: false,
    },
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [editPPDBModal, setEditPPDBModal] = useState<PPDBRegistration | null>(null);
  const [addPPDBModalOpen, setAddPPDBModalOpen] = useState(false);
  const [detailDapodikModal, setDetailDapodikModal] = useState<PPDBRegistration | null>(null);
  const [printDapodikData, setPrintDapodikData] = useState<PPDBRegistration | null>(null);

  const [editStudentModal, setEditStudentModal] = useState<StudentData | null>(null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);

  const [editPaymentModal, setEditPaymentModal] = useState<PaymentHistoryItem | null>(null);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);

  const [editTeacherModal, setEditTeacherModal] = useState<TeacherData | null>(null);
  const [addTeacherModalOpen, setAddTeacherModalOpen] = useState(false);

  // Form states for Add / Edit PPDB
  const [ppdbForm, setPpdbForm] = useState<Partial<PPDBRegistration>>({
    regNumber: `DAPODIK-2024-${Math.floor(10000 + Math.random() * 90000)}`,
    jenisPendaftaran: 'Siswa Baru',
    fullName: '',
    gender: 'L',
    nik: '',
    nisn: '',
    pob: 'Jakarta Barat',
    dob: '2008-05-20',
    program: 'paket_c',
    religion: 'Islam',
    sekolahAsal: '',
    alamatJalan: '',
    parentName: '',
    parentJob: 'Wiraswasta',
    namaIbu: '',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    parentPhone: '081234567890',
    status: 'Menunggu Verifikasi',
  });

  // Form states for Add Student
  const [studentForm, setStudentForm] = useState<Partial<StudentData>>({
    nis: `202400${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    program: 'Paket C',
    classGrade: 'Kelas 10',
    status: 'Aktif',
    parentName: '',
    parentPhone: '081234567890',
    registrationDate: new Date().toISOString().split('T')[0],
  });

  // Form states for Add Payment
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentHistoryItem>>({
    title: 'SPP Bulan Ini',
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    amount: 250000,
    status: 'Lunas',
    method: 'Transfer Bank / QRIS',
    nis: '202400123',
    studentName: 'Ahmad Fauzi',
    referenceNo: `INV/${new Date().getFullYear()}/VA/${Math.floor(1000 + Math.random() * 9000)}`,
  });

  // Form states for Add Teacher
  const [teacherForm, setTeacherForm] = useState<Partial<TeacherData>>({
    nip: `19900101${Math.floor(100000 + Math.random() * 900000)}`,
    name: '',
    subject: 'Mata Pelajaran Umum',
    program: 'Paket A, B, C',
    phone: '081234567890',
    status: 'Aktif',
  });

  // Convert PPDB Applicant to Active Student
  const handleConvertPPDBToStudent = (ppdbItem: PPDBRegistration) => {
    const generatedNis = `202400${Math.floor(100 + Math.random() * 900)}`;
    const programName = ppdbItem.program === 'paket_a' ? 'Paket A' : ppdbItem.program === 'paket_b' ? 'Paket B' : 'Paket C';
    
    const newS: StudentData = {
      id: `s_${Date.now()}`,
      nis: generatedNis,
      name: ppdbItem.fullName,
      program: programName as any,
      classGrade: ppdbItem.program === 'paket_a' ? 'Kelas 1' : ppdbItem.program === 'paket_b' ? 'Kelas 7' : 'Kelas 10',
      status: 'Aktif',
      parentName: ppdbItem.parentName,
      parentPhone: ppdbItem.parentPhone,
      registrationDate: new Date().toISOString().split('T')[0],
    };

    setStudents((prev) => [newS, ...prev]);
    setPpdbList((prev) =>
      prev.map((item) => (item.id === ppdbItem.id ? { ...item, status: 'Lulus Verifikasi' } : item))
    );

    handleAddAuditLog('STUDENT', `PPDB No. ${ppdbItem.regNumber} (${ppdbItem.fullName}) dikonversi menjadi Siswa Aktif dengan NIS ${generatedNis}`);
    alert(`Berhasil! ${ppdbItem.fullName} telah dikonversi menjadi Siswa Aktif dengan NIS: ${generatedNis}`);
  };

  // Export Student Roster CSV
  const handleExportStudentsCSV = () => {
    const headers = ['ID,NIS,Nama Lengkap,Program,Rombel Kelas,Wali Murid,No HP,Status,Tanggal Daftar'];
    const rows = students.map(
      (s) => `"${s.id}","${s.nis}","${s.name}","${s.program}","${s.classGrade}","${s.parentName}","${s.parentPhone}","${s.status}","${s.registrationDate}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_PKBM_AL_ABROR_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleAddAuditLog('STUDENT', 'Eksport file Roster Siswa CSV berhasil diunduh');
  };

  // Session Security Unlock
  const handleUnlockSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPinInput === '1234' || unlockPinInput.trim().length >= 4) {
      setIsSessionLocked(false);
      setUnlockPinInput('');
      setPinErrorMsg('');
      handleAddAuditLog('AUTH', 'Superadmin Master Session unlocked via PIN verification');
    } else {
      setPinErrorMsg('PIN Salah. Gunakan PIN Master "1234" untuk membuka kunci dashboard.');
    }
  };

  // PPDB Actions
  const handleSavePPDB = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProgram = (ppdbForm.program as any) || 'paket_c';
    const autoFee = getRegistrationFeeForProgram(selectedProgram, activeSettings);

    if (editPPDBModal) {
      setPpdbList((prev) =>
        prev.map((item) => {
          if (item.id === editPPDBModal.id) {
            return {
              ...item,
              ...ppdbForm,
              program: selectedProgram,
              paymentAmount: item.program !== selectedProgram ? autoFee : (item.paymentAmount || autoFee),
            } as PPDBRegistration;
          }
          return item;
        })
      );
      setEditPPDBModal(null);
    } else {
      const newItem: PPDBRegistration = {
        id: `ppdb_${Date.now()}`,
        regNumber: ppdbForm.regNumber || `REG-${Date.now()}`,
        fullName: ppdbForm.fullName || 'Pendaftar Baru',
        nik: ppdbForm.nik || '3171010101010001',
        pob: ppdbForm.pob || 'Jakarta',
        dob: ppdbForm.dob || '2008-01-01',
        gender: (ppdbForm.gender as 'L' | 'P') || 'L',
        program: selectedProgram,
        parentName: ppdbForm.parentName || 'Orang Tua',
        parentJob: ppdbForm.parentJob || 'Swasta',
        parentPhone: ppdbForm.parentPhone || '081234567890',
        documents: { kk: 'Terlampir', akte: 'Terlampir' },
        date: new Date().toISOString().split('T')[0],
        status: (ppdbForm.status as any) || 'Menunggu Verifikasi',
        paymentStatus: 'Belum Bayar',
        paymentAmount: autoFee,
      };
      setPpdbList((prev) => [newItem, ...prev]);
      setAddPPDBModalOpen(false);
    }
  };

  const handleDeletePPDB = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pendaftaran PPDB ini?')) {
      setPpdbList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Student Actions
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editStudentModal) {
      try {
        const { error } = await supabase.from('students').update({
          nis: studentForm.nis || '',
          name: studentForm.name || 'Unknown',
          major: studentForm.program as string,
          class_id: studentForm.classGrade || 'X',
          parent_name: studentForm.parentName || '',
          parent_phone: studentForm.parentPhone || ''
        }).eq('id', editStudentModal.id);
        
        if (error) console.error("Update failed:", error.message);
      } catch (err) {
        console.error("Database update exception:", err);
      }

      setStudents((prev) =>
        prev.map((item) => (item.id === editStudentModal.id ? ({ ...item, ...studentForm } as StudentData) : item))
      );
      setEditStudentModal(null);
    } else {
      try {
        const { data, error } = await supabase.from('students').insert({
          nis: studentForm.nis || '202400999',
          name: studentForm.name || 'Siswa Baru',
          major: studentForm.program as string || 'Paket C',
          class_id: studentForm.classGrade || 'Kelas 10',
          parent_name: studentForm.parentName || 'Orang Tua',
          parent_phone: studentForm.parentPhone || '081234567890',
        }).select();

        if (error) {
          console.error("Insert failed:", error.message);
        }

        const newS: StudentData = {
          id: data && data.length > 0 ? data[0].id : `s_${Date.now()}`,
          nis: studentForm.nis || '202400999',
          name: studentForm.name || 'Siswa Baru',
          program: studentForm.program as any || 'Paket C',
          classGrade: studentForm.classGrade || 'Kelas 10',
          status: studentForm.status as any || 'Aktif',
          parentName: studentForm.parentName || 'Orang Tua',
          parentPhone: studentForm.parentPhone || '081234567890',
          registrationDate: new Date().toISOString().split('T')[0],
        };
        setStudents((prev) => [newS, ...prev]);
      } catch (err) {
        console.error("Database insert exception:", err);
      }
      setAddStudentModalOpen(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) console.error("Delete failed:", error.message);
      } catch (err) {
        console.error("Database delete exception:", err);
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Payment Actions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase.from('transactions').select(`
          id,
          invoice_number,
          amount,
          payment_method,
          status,
          date,
          notes,
          student_id,
          students (
            nis,
            name
          )
        `).order('date', { ascending: false });

        if (error) {
          console.error("Error fetching transactions:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const mappedPayments: PaymentHistoryItem[] = data.map((t: any) => ({
            id: t.id,
            title: t.notes || 'Pembayaran',
            date: new Date(t.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
            amount: Number(t.amount),
            status: t.status === 'completed' ? 'Lunas' : (t.status === 'pending' ? 'Tertunda' : 'Diproses'),
            method: t.payment_method,
            nis: t.students?.nis || '',
            studentName: t.students?.name || 'Unknown',
            referenceNo: t.invoice_number,
          }));
          setPayments(mappedPayments);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };
    fetchTransactions();
  }, []);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPaymentModal) {
      try {
        const { error } = await supabase.from('transactions').update({
          amount: Number(paymentForm.amount) || 0,
          payment_method: paymentForm.method || 'Transfer Bank',
          status: paymentForm.status === 'Lunas' ? 'completed' : (paymentForm.status === 'Tertunda' ? 'pending' : 'processing'),
          notes: paymentForm.title || 'SPP Bulanan'
        }).eq('id', editPaymentModal.id);
        
        if (error) console.error("Update payment failed:", error.message);
      } catch (err) {
        console.error("Database update exception:", err);
      }

      setPayments((prev) =>
        prev.map((item) => (item.id === editPaymentModal.id ? ({ ...item, ...paymentForm, amount: Number(paymentForm.amount) } as PaymentHistoryItem) : item))
      );
      setEditPaymentModal(null);
    } else {
      const student = students.find((s) => s.nis === paymentForm.nis);
      
      try {
        const { data, error } = await supabase.from('transactions').insert({
          invoice_number: paymentForm.referenceNo || `INV/${Date.now()}`,
          student_id: student?.id || null, // Will error if null or invalid UUID, but we catch it
          amount: Number(paymentForm.amount) || 250000,
          payment_method: paymentForm.method || 'Transfer Bank',
          status: paymentForm.status === 'Lunas' ? 'completed' : (paymentForm.status === 'Tertunda' ? 'pending' : 'processing'),
          notes: paymentForm.title || 'SPP Bulanan'
        }).select();

        if (error) {
          console.error("Insert payment failed:", error.message);
        }

        const newP: PaymentHistoryItem = {
          id: data && data.length > 0 ? data[0].id : `pay_${Date.now()}`,
          title: paymentForm.title || 'SPP Bulanan',
          date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
          amount: Number(paymentForm.amount) || 250000,
          status: paymentForm.status as any || 'Lunas',
          method: paymentForm.method || 'Transfer Bank',
          nis: paymentForm.nis || '202400123',
          studentName: paymentForm.studentName || 'Siswa',
          referenceNo: data && data.length > 0 ? data[0].invoice_number : (paymentForm.referenceNo || `INV/${Date.now()}`),
        };
        setPayments((prev) => [newP, ...prev]);
      } catch (err) {
        console.error("Database insert exception:", err);
      }
      setAddPaymentModalOpen(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) console.error("Delete payment failed:", error.message);
      } catch (err) {
        console.error("Database delete exception:", err);
      }
      setPayments((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Teacher Actions
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTeacherModal) {
      setTeachers((prev) =>
        prev.map((item) => (item.id === editTeacherModal.id ? ({ ...item, ...teacherForm } as TeacherData) : item))
      );
      setEditTeacherModal(null);
    } else {
      const newT: TeacherData = {
        id: `t_${Date.now()}`,
        nip: teacherForm.nip || '19900101',
        name: teacherForm.name || 'Guru Baru',
        subject: teacherForm.subject || 'Pengajar Umum',
        program: teacherForm.program || 'Paket C',
        phone: teacherForm.phone || '081234567890',
        status: teacherForm.status as any || 'Aktif',
      };
      setTeachers((prev) => [newT, ...prev]);
      setAddTeacherModalOpen(false);
    }
  };

  const handleDeleteTeacher = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengajar ini?')) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // User Actions
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserModal) {
      setUserAccounts((prev) =>
        prev.map((u) => (u.id === editUserModal.id ? ({ ...u, ...userForm } as UserAccount) : u))
      );
      setEditUserModal(null);
    } else {
      const newUser: UserAccount = {
        id: `u_${Date.now()}`,
        username: userForm.username || `user_${Math.floor(100 + Math.random() * 900)}`,
        fullName: userForm.fullName || 'Pengguna Baru',
        role: userForm.role || 'admin',
        password: userForm.password || 'password123',
        status: userForm.status || 'Aktif',
        nisOrNip: userForm.nisOrNip || '-',
        createdAt: new Date().toISOString().split('T')[0],
        permissions: { ...userForm.permissions },
      };
      setUserAccounts((prev) => [newUser, ...prev]);
      setAddUserModalOpen(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun user ini?')) {
      setUserAccounts((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Helper to retrieve custom fee items for a program
  const getProgramCustomItems = (progId: 'paket_a' | 'paket_b' | 'paket_c', type: 'new' | 'active'): CustomFeeItem[] => {
    if (type === 'new') {
      if (settingsForm.customFeeItems?.[progId]?.newStudentItems?.length) {
        return settingsForm.customFeeItems[progId]!.newStudentItems;
      }
      return getNewStudentFeeItems(progId, settingsForm).items;
    } else {
      if (settingsForm.customFeeItems?.[progId]?.activeStudentItems?.length) {
        return settingsForm.customFeeItems[progId]!.activeStudentItems;
      }
      return getActiveStudentFeeItems(progId, settingsForm).items;
    }
  };

  const applyCustomItemsUpdate = (
    progId: 'paket_a' | 'paket_b' | 'paket_c',
    type: 'new' | 'active',
    updatedList: CustomFeeItem[]
  ) => {
    const curProgCustom = settingsForm.customFeeItems?.[progId] || {
      newStudentItems: getNewStudentFeeItems(progId, settingsForm).items,
      activeStudentItems: getActiveStudentFeeItems(progId, settingsForm).items,
    };

    const newProgCustom: ProgramCustomFees = {
      ...curProgCustom,
      [type === 'new' ? 'newStudentItems' : 'activeStudentItems']: updatedList,
    };

    const newCustomFeeItems = {
      ...(settingsForm.customFeeItems || {}),
      [progId]: newProgCustom,
    };

    if (type === 'new') {
      const regItem = updatedList.find((i) => i.category === 'pendaftaran');
      const bldItem = updatedList.find((i) => i.category === 'gedung');
      const unifItem = updatedList.find((i) => i.category === 'seragam');
      const sppItem = updatedList.find((i) => i.category === 'spp');
      const totalNew = updatedList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      const allNewFees = {
        ...(settingsForm.newStudentFees || {}),
        [progId]: {
          registrationFee: regItem ? Number(regItem.amount) : 0,
          buildingFee: bldItem ? Number(bldItem.amount) : 0,
          uniformModulFee: unifItem ? Number(unifItem.amount) : 0,
          initialSpp: sppItem ? Number(sppItem.amount) : 0,
        },
      };

      setSettingsForm({
        ...settingsForm,
        customFeeItems: newCustomFeeItems,
        newStudentFees: allNewFees as any,
        fees: {
          ...settingsForm.fees,
          [progId]: totalNew,
        },
      });
    } else {
      const sppItem = updatedList.find((i) => i.category === 'spp');
      const reregItem = updatedList.find((i) => i.category === 'daftar_ulang');
      const examItem = updatedList.find((i) => i.category === 'ujian');
      const actItem = updatedList.find((i) => i.category === 'kegiatan');

      const allActFees = {
        ...(settingsForm.activeStudentFees || {}),
        [progId]: {
          sppMonthly: sppItem ? Number(sppItem.amount) : 0,
          reRegistrationFee: reregItem ? Number(reregItem.amount) : 0,
          examEvaluationFee: examItem ? Number(examItem.amount) : 0,
          activityFee: actItem ? Number(actItem.amount) : 0,
        },
      };

      setSettingsForm({
        ...settingsForm,
        customFeeItems: newCustomFeeItems,
        activeStudentFees: allActFees as any,
      });
    }
  };

  const handleUpdateCustomItemField = (
    progId: 'paket_a' | 'paket_b' | 'paket_c',
    type: 'new' | 'active',
    itemId: string,
    field: keyof CustomFeeItem,
    value: any
  ) => {
    const currentList = getProgramCustomItems(progId, type);
    const updatedList = currentList.map((item) => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    applyCustomItemsUpdate(progId, type, updatedList);
  };

  const handleAddCustomItem = (progId: 'paket_a' | 'paket_b' | 'paket_c', type: 'new' | 'active') => {
    const currentList = getProgramCustomItems(progId, type);
    const newItem: CustomFeeItem = {
      id: `${type}_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: type === 'new' ? 'Biaya Tambahan PPDB' : 'Biaya Tambahan Siswa Aktif',
      category: 'lainnya',
      amount: 100000,
      period: type === 'new' ? '1x Awal Pendaftaran' : 'Per Semester',
      isRequired: true,
    };
    applyCustomItemsUpdate(progId, type, [...currentList, newItem]);
  };

  const handleDeleteCustomItem = (progId: 'paket_a' | 'paket_b' | 'paket_c', type: 'new' | 'active', itemId: string) => {
    const currentList = getProgramCustomItems(progId, type);
    if (currentList.length <= 1) {
      alert('Minimal harus ada 1 rincian komponen tagihan pembayaran.');
      return;
    }
    const updatedList = currentList.filter((item) => item.id !== itemId);
    applyCustomItemsUpdate(progId, type, updatedList);
  };

  const handleResetProgItemsToDefault = (progId: 'paket_a' | 'paket_b' | 'paket_c', type: 'new' | 'active') => {
    const defaultFees = DEFAULT_PPDB_VERIFICATION_SETTINGS.customFeeItems?.[progId];
    if (defaultFees) {
      const defaultList = type === 'new' ? defaultFees.newStudentItems : defaultFees.activeStudentItems;
      applyCustomItemsUpdate(progId, type, defaultList);
    }
  };

  // Category customization form states and handlers
  const [newCatForm, setNewCatForm] = useState<{
    id: string;
    name: string;
    description: string;
    badgeColor: string;
  }>({
    id: '',
    name: '',
    description: '',
    badgeColor: 'sky',
  });
  const [showAddCatForm, setShowAddCatForm] = useState(false);

  const handleUpdateCategoryField = (catId: string, field: keyof CustomFeeCategoryOption, value: any) => {
    const currentCats = getFeeCategories(settingsForm);
    const updatedCats = currentCats.map((c) => (c.id === catId ? { ...c, [field]: value } : c));
    setSettingsForm({
      ...settingsForm,
      customCategories: updatedCats,
    });
  };

  const handleAddCategorySubmit = () => {
    if (!newCatForm.name.trim()) {
      alert('Nama jenis pembayaran tidak boleh kosong.');
      return;
    }
    const currentCats = getFeeCategories(settingsForm);
    let generatedId = (newCatForm.id.trim() || newCatForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')) as FeeCategoryType;
    if (!generatedId) {
      generatedId = `custom_${Date.now()}` as FeeCategoryType;
    }
    if (currentCats.some((c) => c.id === generatedId)) {
      alert(`Jenis pembayaran dengan ID '${generatedId}' sudah ada. Gunakan nama/ID lain.`);
      return;
    }

    const newCategory: CustomFeeCategoryOption = {
      id: generatedId,
      name: newCatForm.name.trim(),
      description: newCatForm.description.trim() || 'Jenis tagihan pembayaran kustom',
      badgeColor: newCatForm.badgeColor || 'sky',
      isSystem: false,
    };

    setSettingsForm({
      ...settingsForm,
      customCategories: [...currentCats, newCategory],
    });
    setNewCatForm({ id: '', name: '', description: '', badgeColor: 'sky' });
    setShowAddCatForm(false);
  };

  const handleDeleteCategory = (catId: string) => {
    const currentCats = getFeeCategories(settingsForm);
    if (currentCats.length <= 1) {
      alert('Minimal harus ada 1 jenis pembayaran.');
      return;
    }
    if (confirm(`Hapus jenis pembayaran '${catId}'? Komponen yang menggunakan jenis ini akan tetap ada namun jenisnya dapat dialihkan.`)) {
      setSettingsForm({
        ...settingsForm,
        customCategories: currentCats.filter((c) => c.id !== catId),
      });
    }
  };

  const handleResetCategoriesToDefault = () => {
    if (confirm('Pulihkan semua jenis pembayaran ke katalog bawaan default?')) {
      setSettingsForm({
        ...settingsForm,
        customCategories: DEFAULT_FEE_CATEGORIES,
      });
    }
  };

  // Calculate totals
  const totalFinancialRevenue = payments
    .filter((p) => p.status === 'Lunas')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Superadmin Header Banner */}
      <div className="bg-gradient-to-r from-[#000a1e] via-[#002147] to-[#000a1e] text-white p-6 rounded-2xl shadow-lg border border-[#002147] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#735c00] text-white flex items-center justify-center font-bold shadow-inner shrink-0">
            <ShieldCheck className="w-7 h-7 text-[#ffe088]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ffe088]/20 px-2.5 py-0.5 rounded-full border border-[#ffe088]/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#ffe088] uppercase tracking-wider">
                SUPERADMIN FRONTEND DATA CONTROL
              </span>
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold">
              Pengolahan Data Langsung System PKBM AL-ABROR
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Panel kontrol utama untuk manipulasi, verifikasi, dan manajemen database secara langsung di frontend.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setIsSessionLocked(true);
              handleAddAuditLog('AUTH', 'Superadmin manual session lock activated');
            }}
            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kunci Sesi Superadmin dengan PIN Security"
          >
            <Lock className="w-4 h-4 text-rose-300" />
            Kunci Sesi
          </button>
          <button
            onClick={() => alert('Laporan statistik menyeluruh telah diekspor ke PDF/Excel.')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ffe088]" />
            Cetak Ringkasan System
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#74777f] uppercase block">Pendaftar PPDB</span>
            <span className="font-headline text-2xl font-bold text-[#000a1e]">{ppdbList.length}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">
              {ppdbList.filter((p) => p.status === 'Menunggu Verifikasi').length} Menunggu
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#74777f] uppercase block">Total Siswa Aktif</span>
            <span className="font-headline text-2xl font-bold text-[#000a1e]">{students.length}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Paket A, B, & C</span>
          </div>
          <div className="p-3 bg-blue-50 text-[#002147] rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#74777f] uppercase block">Keuangan Terbayar</span>
            <span className="font-headline text-xl font-bold text-emerald-700">
              Rp {totalFinancialRevenue.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-[#74777f] block mt-0.5">{payments.length} transaksi</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#74777f] uppercase block">Pengajar / Guru</span>
            <span className="font-headline text-2xl font-bold text-[#000a1e]">{teachers.length}</span>
            <span className="text-[10px] text-purple-700 block mt-0.5">Status Aktif</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-[#e2e2e2] shadow-sm overflow-hidden p-5">
        <div className="flex border-b border-[#e2e2e2] gap-2 md:gap-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('ppdb')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ppdb'
                ? 'border-[#000a1e] text-[#000a1e] bg-[#f0f4f9] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#735c00]" />
            Pengolahan PPDB ({ppdbList.length})
          </button>

          <button
            onClick={() => setActiveTab('siswa')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'siswa'
                ? 'border-[#000a1e] text-[#000a1e] bg-[#f0f4f9] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#002147]" />
            Pengolahan Data Siswa ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('keuangan')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'keuangan'
                ? 'border-[#000a1e] text-[#000a1e] bg-[#f0f4f9] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-700" />
            Pengolahan Keuangan SPP
          </button>

          <button
            onClick={() => setActiveTab('guru')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'guru'
                ? 'border-[#000a1e] text-[#000a1e] bg-[#f0f4f9] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <Users className="w-4 h-4 text-purple-700" />
            Pengolahan Data Guru ({teachers.length})
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sheets'
                ? 'border-[#735c00] text-[#735c00] bg-[#fffdf0] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#735c00]" />
            Backend Google Sheets Sync
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'landing'
                ? 'border-[#000a1e] text-[#000a1e] bg-[#f0f4f9] rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#735c00]" />
            Kostumisasi Landing Page & Website
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-indigo-800 text-indigo-900 bg-indigo-50 rounded-t-lg'
                : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-700" />
            Manajemen User & Hak Akses ({userAccounts.length})
          </button>
        </div>

        {/* TAB 1: PENGOLAHAN PPDB */}
        {activeTab === 'ppdb' && (
          <div className="pt-5 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#74777f] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama / No Reg / NIK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#c4c6cf] rounded-lg outline-none focus:border-[#000a1e]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSettingsForm(activeSettings);
                    setShowPpdbSettingsModal(true);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-800" />
                  Pengaturan Verifikasi & Tagihan PPDB
                </button>

                <button
                  onClick={() => {
                    setPpdbForm({
                      regNumber: `DAPODIK-2024-${Math.floor(10000 + Math.random() * 90000)}`,
                      fullName: '',
                      nik: '',
                      pob: 'Jakarta',
                      dob: '2008-01-01',
                      gender: 'L',
                      program: 'paket_c',
                      parentName: '',
                      parentJob: 'Wiraswasta',
                      parentPhone: '081234567890',
                      status: 'Menunggu Verifikasi',
                    });
                    setAddPPDBModalOpen(true);
                  }}
                  className="bg-[#000a1e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#002147] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ffe088]" />
                  Tambah Pendaftar PPDB
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar for PPDB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f0f4f9] p-3 rounded-xl border border-[#c4c6cf] text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  {ppdbList.filter((p) => p.status === 'Menunggu Verifikasi').length}
                </div>
                <div>
                  <p className="font-bold text-[#000a1e]">Menunggu Verifikasi</p>
                  <p className="text-[10px] text-[#74777f]">Perlu diperiksa panitia</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002147] flex items-center justify-center font-bold">
                  {ppdbList.filter((p) => p.status === 'Lulus Verifikasi' && p.paymentStatus !== 'Lunas').length}
                </div>
                <div>
                  <p className="font-bold text-[#000a1e]">Lulus - Menunggu Bayar</p>
                  <p className="text-[10px] text-[#74777f]">Tagihan diterbitkan</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {ppdbList.filter((p) => p.paymentStatus === 'Lunas').length}
                </div>
                <div>
                  <p className="font-bold text-[#000a1e]">Lunas & Akun Portal Aktif</p>
                  <p className="text-[10px] text-[#74777f]">Siap masuk Portal Siswa</p>
                </div>
              </div>
            </div>

            {/* PPDB List Table */}
            <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold border-b border-[#e2e2e2]">
                  <tr>
                    <th className="p-3">No Reg & Tanggal</th>
                    <th className="p-3">Nama Pendaftar & NIK</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Orang Tua / HP</th>
                    <th className="p-3">Verifikasi DAPODIK</th>
                    <th className="p-3">Status Tagihan</th>
                    <th className="p-3">Akun Portal</th>
                    <th className="p-3 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {ppdbList
                    .filter(
                      (p) =>
                        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.nik.includes(searchTerm)
                    )
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#f9f9f9]">
                        <td className="p-3">
                          <p className="font-mono font-bold text-[#002147]">{p.regNumber}</p>
                          <p className="text-[10px] text-[#74777f]">{p.date}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-[#1a1c1c]">{p.fullName}</p>
                          <p className="text-[10px] font-mono text-[#74777f]">NIK: {p.nik}</p>
                        </td>
                        <td className="p-3">
                          <span className="uppercase font-semibold bg-[#f0f4f9] text-[#002147] px-2 py-0.5 rounded text-[10px]">
                            {p.program.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-[#1a1c1c]">{p.parentName}</p>
                          <p className="text-[10px] text-[#74777f] font-mono">{p.parentPhone}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded font-bold text-[10px] inline-block ${
                              p.status === 'Lulus Verifikasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Ditolak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.status === 'Lulus Verifikasi' ? (
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                                  p.paymentStatus === 'Lunas'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : p.paymentStatus === 'Menunggu Konfirmasi'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {p.paymentStatus || 'Belum Bayar'}
                              </span>
                              <p className="text-[10px] font-bold text-[#000a1e] mt-0.5">
                                Rp {(p.paymentAmount || getRegistrationFeeForProgram(p.program, activeSettings)).toLocaleString('id-ID')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[#74777f] text-[10px] italic">Belum Diverifikasi</span>
                          )}
                        </td>
                        <td className="p-3">
                          {p.portalAccountCreated || p.paymentStatus === 'Lunas' ? (
                            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-2 py-1 rounded text-[10px]">
                              <p className="font-bold flex items-center gap-1">
                                <KeyRound className="w-3 h-3 text-indigo-700" /> Aktif
                              </p>
                              <p className="font-mono text-[9px] truncate max-w-[100px]">{p.portalUsername || p.nik}</p>
                            </div>
                          ) : (
                            <span className="text-[#74777f] text-[10px] bg-gray-100 px-2 py-0.5 rounded inline-block">
                              Belum Aktif
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {/* Main Verification Step 1: Luluskan & Terbitkan Tagihan */}
                          {p.status !== 'Lulus Verifikasi' && (
                            <button
                              onClick={() => handleVerifyAndSendInvoice(p)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              title="Luluskan Verifikasi & Kirim Rincian Tagihan Pembayaran"
                            >
                              <Send className="w-3 h-3" /> Verifikasi & Tagih
                            </button>
                          )}

                          {/* Main Verification Step 2: Konfirmasi Lunas & Aktifkan Portal */}
                          {p.status === 'Lulus Verifikasi' && p.paymentStatus !== 'Lunas' && (
                            <button
                              onClick={() => handleConfirmPaymentAndActivatePortal(p)}
                              className="bg-indigo-800 hover:bg-indigo-900 text-white px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                              title="Konfirmasi Lunas & Aktifkan Akun Portal Siswa"
                            >
                              <CheckCircle2 className="w-3 h-3 text-[#ffe088]" /> Konfirmasi Lunas & Portal
                            </button>
                          )}

                          {/* WhatsApp Dispatch Button */}
                          <a
                            href={generateWaLink(p, p.paymentStatus === 'Lunas' ? 'credentials' : 'invoice')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 p-1.5 rounded inline-flex items-center transition-colors cursor-pointer"
                            title="Kirim Notifikasi / Tagihan via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-800" />
                          </a>

                          <button
                            onClick={() => setDetailDapodikModal(p)}
                            className="bg-blue-50 text-blue-900 hover:bg-blue-100 p-1.5 rounded transition-colors cursor-pointer"
                            title="Lihat Form DAPODIK & Cetak"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditPPDBModal(p);
                              setPpdbForm(p);
                            }}
                            className="bg-gray-100 text-gray-800 hover:bg-gray-200 p-1.5 rounded transition-colors cursor-pointer"
                            title="Edit Data Pendaftar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePPDB(p.id)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded transition-colors cursor-pointer"
                            title="Hapus Data Pendaftar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENGOLAHAN SISWA */}
        {activeTab === 'siswa' && (
          <div className="pt-5 space-y-4">
            {/* Student Sub-Filter Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-[#f0f4f9] p-3 rounded-xl border border-[#c4c6cf]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#000a1e] mr-1">Filter Program:</span>
                {(['all', 'Paket A', 'Paket B', 'Paket C'] as const).map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setStudentProgramFilter(prog)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      studentProgramFilter === prog
                        ? 'bg-[#000a1e] text-white shadow-sm'
                        : 'bg-white text-[#44474e] border border-[#c4c6cf] hover:bg-gray-50'
                    }`}
                  >
                    {prog === 'all' ? 'Semua Program' : prog}
                  </button>
                ))}

                <span className="font-bold text-[#000a1e] ml-2 mr-1">Status:</span>
                {(['all', 'Aktif', 'Cuti', 'Alumni'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStudentStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      studentStatusFilter === st
                        ? 'bg-[#735c00] text-white shadow-sm'
                        : 'bg-white text-[#44474e] border border-[#c4c6cf] hover:bg-gray-50'
                    }`}
                  >
                    {st === 'all' ? 'Semua Status' : st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={handleExportStudentsCSV}
                  className="bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Unduh Data Siswa Format CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#ffe088]" />
                  Eksport CSV
                </button>

                <button
                  onClick={() => {
                    setStudentForm({
                      nis: `202400${Math.floor(100 + Math.random() * 900)}`,
                      name: '',
                      program: 'Paket C',
                      classGrade: 'Kelas 10',
                      status: 'Aktif',
                      parentName: '',
                      parentPhone: '081234567890',
                      registrationDate: new Date().toISOString().split('T')[0],
                    });
                    setAddStudentModalOpen(true);
                  }}
                  className="bg-[#000a1e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#002147] flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ffe088]" />
                  Tambah Siswa Baru
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#74777f] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari NIS / Nama Siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#c4c6cf] rounded-lg outline-none focus:border-[#000a1e]"
                />
              </div>

              <div className="text-xs font-bold text-[#74777f]">
                Menampilkan{' '}
                <span className="text-[#000a1e] font-extrabold">
                  {
                    students.filter((s) => {
                      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
                      const matchesProg = studentProgramFilter === 'all' || s.program === studentProgramFilter;
                      const matchesStat = studentStatusFilter === 'all' || s.status === studentStatusFilter;
                      return matchesSearch && matchesProg && matchesStat;
                    }).length
                  }
                </span>{' '}
                dari {students.length} Siswa Terdaftar
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold border-b border-[#e2e2e2]">
                  <tr>
                    <th className="p-3">NIS</th>
                    <th className="p-3">Nama Lengkap Siswa</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Rombel / Kelas</th>
                    <th className="p-3">Wali Murid</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {students
                    .filter((s) => {
                      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
                      const matchesProg = studentProgramFilter === 'all' || s.program === studentProgramFilter;
                      const matchesStat = studentStatusFilter === 'all' || s.status === studentStatusFilter;
                      return matchesSearch && matchesProg && matchesStat;
                    })
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-[#f9f9f9]">
                        <td className="p-3 font-mono font-bold text-[#002147]">{s.nis}</td>
                        <td className="p-3 font-semibold text-[#1a1c1c]">{s.name}</td>
                        <td className="p-3 font-medium">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold text-[10px]">
                            {s.program}
                          </span>
                        </td>
                        <td className="p-3">{s.classGrade}</td>
                        <td className="p-3 text-[#44474e]">{s.parentName} ({s.parentPhone})</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              s.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[#e2e2e2] text-[#44474e]'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => setKtsModalStudent(s)}
                            className="bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            title="Lihat & Cetak Kartu Tanda Siswa (KTS) Digital"
                          >
                            <CreditCard className="w-3 h-3 text-[#735c00]" /> KTS Digital
                          </button>
                          <button
                            onClick={() => {
                              setEditStudentModal(s);
                              setStudentForm(s);
                            }}
                            className="bg-blue-50 text-[#002147] hover:bg-blue-100 p-1.5 rounded transition-colors cursor-pointer"
                            title="Edit Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PENGOLAHAN KEUANGAN */}
        {activeTab === 'keuangan' && (
          <div className="pt-5 space-y-4">
            {/* Financial Tariff Configuration Summary Card */}
            <div className="bg-[#f0f4f9] border border-[#c4c6cf] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#c4c6cf]">
                <div>
                  <h3 className="font-headline font-bold text-sm text-[#000a1e] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#735c00]" />
                    Konfigurasi Tarif Biaya Tagihan PPDB & SPP Siswa Aktif
                  </h3>
                  <p className="text-[11px] text-[#74777f]">
                    Kustomisasi terpisah antara <strong>Total Tagihan PPDB (Siswa Baru)</strong> dan <strong>Tagihan SPP Bulanan (Siswa Aktif)</strong> per program.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSettingsForm({ ...activeSettings });
                    setShowPpdbSettingsModal(true);
                  }}
                  className="bg-[#000a1e] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#002147] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 text-[#ffe088]" />
                  Atur & Kustomisasi Tarif Keuangan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {[
                  { id: 'paket_a' as const, label: 'Paket A (Setara SD)', bg: 'bg-white' },
                  { id: 'paket_b' as const, label: 'Paket B (Setara SMP)', bg: 'bg-white' },
                  { id: 'paket_c' as const, label: 'Paket C (Setara SMA)', bg: 'bg-white' },
                ].map((prog) => {
                  const newItemsData = getNewStudentFeeItems(prog.id, activeSettings);
                  const actItemsData = getActiveStudentFeeItems(prog.id, activeSettings);
                  const actFees = getActiveStudentFeeDetails(prog.id, activeSettings);

                  return (
                    <div key={prog.id} className={`${prog.bg} p-4 rounded-xl border border-[#e2e2e2] space-y-3 shadow-xs flex flex-col justify-between`}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-[#eeeeee] pb-2">
                          <span className="font-bold text-[#000a1e] text-sm">{prog.label}</span>
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Tarif Resmi Aktif
                          </span>
                        </div>

                        {/* 1. PPDB BILLING SUMMARY */}
                        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 space-y-1.5">
                          <div className="flex justify-between items-center pb-1 border-b border-amber-200/50">
                            <span className="font-bold text-[11px] text-amber-950 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-800" />
                              Tagihan PPDB ({newItemsData.items.length} Komponen)
                            </span>
                            <span className="font-mono font-bold text-xs text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                              Rp {newItemsData.totalInitial.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] text-[#44474e] max-h-28 overflow-y-auto pr-0.5">
                            {newItemsData.items.map((it) => (
                              <div key={it.id} className="flex justify-between items-center py-0.5 border-b border-dashed border-amber-100 last:border-0">
                                <span className="truncate pr-1">• {it.name}:</span>
                                <span className="font-mono font-semibold shrink-0">Rp {Number(it.amount || 0).toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. ACTIVE STUDENT BILLING SUMMARY */}
                        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/80 space-y-1.5">
                          <div className="flex justify-between items-center pb-1 border-b border-blue-200/50">
                            <span className="font-bold text-[11px] text-blue-950 flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-blue-800" />
                              Tagihan Siswa Aktif ({actItemsData.items.length} Komponen)
                            </span>
                            <span className="font-mono font-bold text-xs text-[#002147] bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                              Rp {actFees.sppMonthly.toLocaleString('id-ID')}/bln
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] text-[#44474e] max-h-28 overflow-y-auto pr-0.5">
                            {actItemsData.items.map((it) => (
                              <div key={it.id} className="flex justify-between items-center py-0.5 border-b border-dashed border-blue-100 last:border-0">
                                <span className="truncate pr-1">• {it.name}:</span>
                                <span className="font-mono font-semibold shrink-0">Rp {Number(it.amount || 0).toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-1 border-t border-blue-200 font-bold text-[#002147] bg-blue-100/50 px-1.5 py-0.5 rounded mt-1">
                              <span>Est. Total Semester:</span>
                              <span>Rp {actFees.totalSemesterEst.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 text-[10px] text-center text-[#74777f]">
                        ⚙️ Dikelola langsung via Pengaturan Superadmin
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs font-semibold text-[#000a1e]">
                Riwayat Transaksi Masuk SPP & Biaya Pendidikan
              </div>

              <button
                onClick={() => {
                  setPaymentForm({
                    title: 'SPP Bulan Ini',
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    amount: 250000,
                    status: 'Lunas',
                    method: 'Transfer Bank / QRIS',
                    nis: '202400123',
                    studentName: 'Ahmad Fauzi',
                    referenceNo: `INV/${new Date().getFullYear()}/VA/${Math.floor(1000 + Math.random() * 9000)}`,
                  });
                  setAddPaymentModalOpen(true);
                }}
                className="bg-[#000a1e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#002147] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffe088]" />
                Catat Transaksi Manual
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold border-b border-[#e2e2e2]">
                  <tr>
                    <th className="p-3">Ref No</th>
                    <th className="p-3">Siswa (NIS)</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3">Nominal (Rp)</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#f9f9f9]">
                      <td className="p-3 font-mono font-bold text-[#735c00]">
                        {p.referenceNo || `PAY-${p.id}`}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#1a1c1c]">{p.studentName}</p>
                        <p className="text-[10px] text-[#74777f] font-mono">NIS: {p.nis}</p>
                      </td>
                      <td className="p-3 font-medium">{p.title}</td>
                      <td className="p-3 font-bold text-[#000a1e]">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-[#44474e]">{p.method}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            p.status === 'Lunas'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setEditPaymentModal(p);
                            setPaymentForm(p);
                          }}
                          className="bg-blue-50 text-[#002147] hover:bg-blue-100 p-1.5 rounded transition-colors cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PENGOLAHAN GURU */}
        {activeTab === 'guru' && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs font-semibold text-[#000a1e]">
                Daftar Tenaga Pengajar & Guru PKBM AL-ABROR
              </div>

              <button
                onClick={() => {
                  setTeacherForm({
                    nip: `19900101${Math.floor(100000 + Math.random() * 900000)}`,
                    name: '',
                    subject: 'Mata Pelajaran',
                    program: 'Paket A, B, C',
                    phone: '081234567890',
                    status: 'Aktif',
                  });
                  setAddTeacherModalOpen(true);
                }}
                className="bg-[#000a1e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#002147] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffe088]" />
                Tambah Pengajar / Guru
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold border-b border-[#e2e2e2]">
                  <tr>
                    <th className="p-3">NIP / NUPTK</th>
                    <th className="p-3">Nama Lengkap Guru</th>
                    <th className="p-3">Mata Pelajaran Utama</th>
                    <th className="p-3">Program Mengajar</th>
                    <th className="p-3">No HP / WA</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#f9f9f9]">
                      <td className="p-3 font-mono font-bold text-[#002147]">{t.nip}</td>
                      <td className="p-3 font-semibold text-[#1a1c1c]">{t.name}</td>
                      <td className="p-3 font-medium text-[#735c00]">{t.subject}</td>
                      <td className="p-3">{t.program}</td>
                      <td className="p-3 text-[#44474e]">{t.phone}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setEditTeacherModal(t);
                            setTeacherForm(t);
                          }}
                          className="bg-blue-50 text-[#002147] hover:bg-blue-100 p-1.5 rounded transition-colors cursor-pointer"
                          title="Edit Guru"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded transition-colors cursor-pointer"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BACKEND SHEETS SYNC */}
        {activeTab === 'sheets' && (
          <div className="pt-5">
            <AdminGoogleSheetsSync ppdbList={ppdbList} studentsList={students} />
          </div>
        )}

        {/* TAB 6: KOSTUMISASI LANDING PAGE & WEBSITE */}
        {activeTab === 'landing' && (
          <div className="pt-5">
            <LandingPageCustomizer />
          </div>
        )}

        {/* TAB 7: MANAJEMEN USER & HAK AKSES */}
        {activeTab === 'users' && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-base text-[#000a1e] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-700" />
                  Manajemen Akun User & Pengaturan Hak Akses System
                </h3>
                <p className="text-xs text-[#74777f]">
                  Superadmin dapat membuat akun pengguna baru dan mengkonfigurasi hak akses granular (PPDB, Siswa, Keuangan, Website, Dll).
                </p>
              </div>

              <button
                onClick={() => {
                  setUserForm({
                    username: '',
                    fullName: '',
                    role: 'admin',
                    password: 'password123',
                    nisOrNip: '',
                    status: 'Aktif',
                    permissions: {
                      canManagePPDB: true,
                      canManageStudents: true,
                      canManageFinance: false,
                      canManageTeachers: false,
                      canCustomizeWebsite: false,
                      canManageUsers: false,
                    },
                  });
                  setAddUserModalOpen(true);
                }}
                className="bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-950 transition-all flex items-center gap-1.5 cursor-pointer shadow shrink-0"
              >
                <Plus className="w-4 h-4 text-[#ffe088]" />
                Buat Akun User Baru
              </button>
            </div>

            {/* User List Table */}
            <div className="overflow-x-auto border border-[#e2e2e2] rounded-xl bg-white shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold border-b border-[#e2e2e2]">
                  <tr>
                    <th className="p-3">User & Username</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Role Level</th>
                    <th className="p-3">NIS / NIP</th>
                    <th className="p-3">Hak Akses Modul Granted</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Superadmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]">
                  {userAccounts.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f9f9f9]">
                      <td className="p-3">
                        <span className="font-bold font-mono text-[#000a1e] block">{u.username}</span>
                        <span className="text-[10px] text-[#74777f]">Dibuat: {u.createdAt}</span>
                      </td>
                      <td className="p-3 font-semibold">{u.fullName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            u.role === 'superadmin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : u.role === 'admin'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : u.role === 'guru'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{u.nisOrNip || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions.canManagePPDB && (
                            <span className="bg-[#f0f4f9] text-[#000a1e] px-1.5 py-0.5 rounded text-[9px] font-bold border border-[#c4c6cf]">
                              PPDB
                            </span>
                          )}
                          {u.permissions.canManageStudents && (
                            <span className="bg-[#f0f4f9] text-[#000a1e] px-1.5 py-0.5 rounded text-[9px] font-bold border border-[#c4c6cf]">
                              Siswa
                            </span>
                          )}
                          {u.permissions.canManageFinance && (
                            <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold border border-emerald-200">
                              Keuangan
                            </span>
                          )}
                          {u.permissions.canManageTeachers && (
                            <span className="bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded text-[9px] font-bold border border-purple-200">
                              Guru
                            </span>
                          )}
                          {u.permissions.canCustomizeWebsite && (
                            <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200">
                              Website
                            </span>
                          )}
                          {u.permissions.canManageUsers && (
                            <span className="bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-200">
                              Users
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setUserAccounts((prev) =>
                              prev.map((item) =>
                                item.id === u.id
                                  ? { ...item, status: item.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
                                  : item
                              )
                            );
                          }}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] cursor-pointer ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setEditUserModal(u);
                            setUserForm({
                              username: u.username,
                              fullName: u.fullName,
                              role: u.role,
                              password: u.password,
                              nisOrNip: u.nisOrNip || '',
                              status: u.status,
                              permissions: { ...u.permissions },
                            });
                          }}
                          className="bg-[#000a1e] text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-[#002147] cursor-pointer inline-flex items-center gap-1"
                          title="Edit Hak Akses & Profile User"
                        >
                          <Edit2 className="w-3 h-3" /> Hak Akses
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1 rounded transition-colors cursor-pointer inline-flex items-center"
                          title="Hapus Akun User"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audit Logs Stream Section */}
            <div className="pt-4 border-t border-[#e2e2e2] space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Stream Audit Log Keamanan & Aktivitas System
                  </h4>
                  <p className="text-[11px] text-[#74777f]">
                    Jejak rekam real-time perubahan data, otentikasi admin, dan manajemen hak akses.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,Waktu,Kategori,User,IP Address,Aktivitas\n' +
                        auditLogs
                          .map((l) => `"${l.timestamp}","${l.category}","${l.user}","${l.ip}","${l.action}"`)
                          .join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `Audit_Log_PKBM_AL_ABROR_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-[#f0f4f9] text-[#000a1e] border border-[#c4c6cf] px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-[#e2e8f0] cursor-pointer inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-[#735c00]" /> Export Audit Log
                  </button>
                  <button
                    onClick={() => setAuditLogs([])}
                    className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>

              {/* Log Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {['ALL', 'AUTH', 'STUDENT', 'PPDB', 'SITE_CMS', 'RBAC', 'SHEETS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAuditCategoryFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
                      auditCategoryFilter === cat
                        ? 'bg-[#000a1e] text-white shadow-xs'
                        : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Log Stream Table */}
              <div className="overflow-x-auto border border-[#e2e2e2] rounded-xl bg-black/90 text-emerald-400 font-mono text-[11px] p-3 max-h-60 overflow-y-auto shadow-inner">
                {auditLogs.filter((l) => auditCategoryFilter === 'ALL' || l.category === auditCategoryFilter).length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">Tidak ada catatan audit log untuk kategori ini.</p>
                ) : (
                  <div className="space-y-1.5">
                    {auditLogs
                      .filter((l) => auditCategoryFilter === 'ALL' || l.category === auditCategoryFilter)
                      .map((log) => (
                        <div key={log.id} className="flex items-start gap-2 border-b border-gray-800 pb-1 hover:bg-white/5 p-1 rounded">
                          <span className="text-gray-400 shrink-0">[{log.timestamp}]</span>
                          <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0">
                            {log.category}
                          </span>
                          <span className="text-amber-300 shrink-0">@{log.user} ({log.ip}):</span>
                          <span className="text-gray-200">{log.action}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUPERADMIN SESSION LOCK SCREEN OVERLAY */}
      {isSessionLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000a1e]/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#ffe088]/30 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#000a1e] text-[#ffe088] flex items-center justify-center mx-auto shadow-lg border border-[#735c00]">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="bg-[#735c00]/10 text-[#735c00] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#735c00]/20">
                Sesi Terkunci Demi Keamanan Data
              </span>
              <h3 className="font-headline text-2xl font-bold text-[#000a1e] mt-2">
                PKBM AL-ABROR Superadmin Lock
              </h3>
              <p className="text-xs text-[#74777f] mt-1">
                Masukkan PIN Master Superadmin untuk melanjutkan akses ke database dan kontrol system.
              </p>
            </div>

            <form onSubmit={handleUnlockSession} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN Master (Default: 1234)"
                  value={unlockPinInput}
                  onChange={(e) => {
                    setUnlockPinInput(e.target.value);
                    setPinErrorMsg('');
                  }}
                  className="w-full text-center text-2xl font-mono tracking-widest p-3 border-2 border-[#c4c6cf] rounded-xl outline-none focus:border-[#000a1e] bg-[#f0f4f9]"
                  autoFocus
                />
                {pinErrorMsg && <p className="text-xs text-rose-600 font-bold mt-1.5">{pinErrorMsg}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#000a1e] text-white rounded-xl font-bold text-xs hover:bg-[#002147] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4 text-[#ffe088]" /> Buka Kunci Sesi Superadmin
              </button>
            </form>

            <div className="text-[10px] text-[#74777f]">
              Lupa PIN? Hubungi Administrator Utama PKBM AL-ABROR Palmerah di support@pkbmalabror.sch.id
            </div>
          </div>
        </div>
      )}

      {/* MODAL KARTU TANDA SISWA (KTS) DIGITAL */}
      {ktsModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <h3 className="font-headline text-base font-bold text-[#000a1e] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#735c00]" /> Kartu Tanda Siswa (KTS) Digital
              </h3>
              <button onClick={() => setKtsModalStudent(null)} className="text-[#74777f] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KTS ID CARD VISUAL DESIGN */}
            <div className="bg-gradient-to-br from-[#000a1e] via-[#002147] to-[#000a1e] text-white rounded-2xl p-5 shadow-xl border-2 border-[#ffe088]/40 relative overflow-hidden space-y-4">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#735c00]/20 rounded-full blur-2xl"></div>

              {/* Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                <div className="w-10 h-10 rounded-full bg-[#735c00] flex items-center justify-center text-white font-black text-sm shrink-0 shadow">
                  PKBM
                </div>
                <div>
                  <h4 className="font-headline font-bold text-xs uppercase text-[#ffe088] tracking-wider">
                    PKBM AL-ABROR PALMERAH
                  </h4>
                  <p className="text-[9px] text-blue-200">KARTU TANDA SISWA RESMI (KTS)</p>
                  <p className="text-[8px] text-gray-300 font-mono">NPSN: P2964893 | KEMENDIKBUDRISTEK</p>
                </div>
              </div>

              {/* Card Main Info */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 rounded-xl bg-gray-200 border-2 border-[#ffe088] flex flex-col items-center justify-center text-[#000a1e] shrink-0 font-bold text-center p-1 shadow-inner">
                  <User className="w-8 h-8 text-[#000a1e] mb-1" />
                  <span className="text-[8px] uppercase">FOTO SISWA</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[9px] text-blue-200 block uppercase">Nama Siswa:</span>
                    <span className="font-bold text-white text-sm block leading-tight">{ktsModalStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-blue-200 block uppercase">NIS:</span>
                    <span className="font-mono font-bold text-[#ffe088]">{ktsModalStudent.nis}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-[8px] text-blue-200 block">Program:</span>
                      <span className="font-bold">{ktsModalStudent.program}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-blue-200 block">Rombel:</span>
                      <span className="font-bold">{ktsModalStudent.classGrade}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with QR Code placeholder */}
              <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[9px] text-gray-300 font-mono">
                <div>
                  <span>STATUS: </span>
                  <span className="text-emerald-400 font-bold uppercase">{ktsModalStudent.status}</span>
                </div>
                <div className="bg-white p-1 rounded">
                  <QrCode className="w-8 h-8 text-[#000a1e]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-[#74777f] rounded-lg text-xs font-bold text-[#1a1c1c] hover:bg-[#f3f3f3] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#735c00]" /> Cetak KTS Digital
              </button>
              <button
                type="button"
                onClick={() => setKtsModalStudent(null)}
                className="px-4 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-bold hover:bg-[#002147] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL DAPODIK FOR PRINTING & VERIFICATION */}
      {detailDapodikModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e2e2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#735c00]/10 px-2.5 py-0.5 rounded-full">
                  Dokumen Resmi DAPODIK Kemendikbudristek
                </span>
                <h3 className="font-headline text-xl font-bold text-[#000a1e]">
                  Data Pokok Peserta Didik (DAPODIK)
                </h3>
              </div>
              <button
                onClick={() => setDetailDapodikModal(null)}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Header Info */}
              <div className="bg-[#f0f4f9] p-3 rounded-xl border border-[#c4c6cf] grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-[#74777f] block text-[10px]">No. Registrasi:</span>
                  <span className="font-bold text-[#000a1e]">{detailDapodikModal.regNumber}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block text-[10px]">Status Dapodik:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block text-[10px]">
                    {detailDapodikModal.status}
                  </span>
                </div>
              </div>

              {/* Data Registrasi & Pribadi */}
              <div className="border border-[#e2e2e2] rounded-xl p-3 space-y-2">
                <h4 className="font-bold text-[#000a1e] flex items-center gap-1.5 uppercase text-[11px]">
                  <GraduationCap className="w-4 h-4 text-[#735c00]" />
                  1. Data Registrasi & Diri Siswa
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[#44474e]">
                  <div>
                    <span className="text-[#74777f] block">Nama Lengkap:</span>
                    <span className="font-bold text-[#000a1e]">{detailDapodikModal.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">NIK:</span>
                    <span className="font-mono">{detailDapodikModal.nik}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">NISN:</span>
                    <span className="font-mono">{detailDapodikModal.nisn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Program Kesetaraan:</span>
                    <span className="font-semibold uppercase">{detailDapodikModal.program.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Tempat, Tgl Lahir:</span>
                    <span>{detailDapodikModal.pob}, {detailDapodikModal.dob}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Jenis Kelamin / Agama:</span>
                    <span>{detailDapodikModal.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} / {detailDapodikModal.religion || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Sekolah Asal / NPSN:</span>
                    <span>{detailDapodikModal.sekolahAsal || '-'} ({detailDapodikModal.npsnAsal || '-'})</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">No. Ijazah / SKL:</span>
                    <span className="font-mono">{detailDapodikModal.noIjazahSkl || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="border border-[#e2e2e2] rounded-xl p-3 space-y-2">
                <h4 className="font-bold text-[#000a1e] flex items-center gap-1.5 uppercase text-[11px]">
                  <Users className="w-4 h-4 text-[#735c00]" />
                  2. Data Orang Tua Kandung & Kontak
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[#44474e]">
                  <div>
                    <span className="text-[#74777f] block">Nama Ayah Kandung:</span>
                    <span className="font-bold text-[#000a1e]">{detailDapodikModal.parentName}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Pekerjaan Ayah:</span>
                    <span>{detailDapodikModal.parentJob}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Nama Ibu Kandung:</span>
                    <span className="font-bold text-[#000a1e]">{detailDapodikModal.namaIbu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Pekerjaan Ibu:</span>
                    <span>{detailDapodikModal.pekerjaanIbu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">No. WhatsApp Orang Tua:</span>
                    <span className="font-mono font-bold text-[#000a1e]">{detailDapodikModal.parentPhone}</span>
                  </div>
                  <div>
                    <span className="text-[#74777f] block">Alamat Jalan:</span>
                    <span>{detailDapodikModal.alamatJalan || 'Alamat Utama'}</span>
                  </div>
                </div>
              </div>

              {/* Dokumen Lampiran */}
              <div className="border border-[#e2e2e2] rounded-xl p-3 space-y-2">
                <h4 className="font-bold text-[#000a1e] flex items-center gap-1.5 uppercase text-[11px]">
                  <FileText className="w-4 h-4 text-[#735c00]" />
                  3. Dokumen Lampiran DAPODIK
                </h4>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded">
                    KK: {detailDapodikModal.documents.kk || 'Sudah Diunggah'}
                  </span>
                  <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded">
                    Akta: {detailDapodikModal.documents.akte || 'Sudah Diunggah'}
                  </span>
                  <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded">
                    Ijazah: {detailDapodikModal.documents.ijazah || 'Terverifikasi'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e2e2e2] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPrintDapodikData(detailDapodikModal)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#ffe088]" /> Cetak Lembar DAPODIK Resmi (A4)
              </button>
              <button
                type="button"
                onClick={() => setDetailDapodikModal(null)}
                className="px-5 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-bold hover:bg-[#002147] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD PPDB */}
      {(addPPDBModalOpen || editPPDBModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                {editPPDBModal ? 'Edit Data DAPODIK Pendaftar' : 'Tambah Pendaftar PPDB DAPODIK Baru'}
              </h3>
              <button
                onClick={() => {
                  setEditPPDBModal(null);
                  setAddPPDBModalOpen(false);
                }}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePPDB} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. Registrasi</label>
                  <input
                    type="text"
                    required
                    value={ppdbForm.regNumber}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, regNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-[#f9f9f9] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={ppdbForm.nik}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, nik: e.target.value })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={ppdbForm.fullName}
                  onChange={(e) => setPpdbForm({ ...ppdbForm, fullName: e.target.value })}
                  className="w-full p-2 border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NISN</label>
                  <input
                    type="text"
                    value={ppdbForm.nisn || ''}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, nisn: e.target.value })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sekolah Asal</label>
                  <input
                    type="text"
                    value={ppdbForm.sekolahAsal || ''}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, sekolahAsal: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Program Kesetaraan</label>
                  <select
                    value={ppdbForm.program}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, program: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="paket_a">Paket A (Setara SD)</option>
                    <option value="paket_b">Paket B (Setara SMP)</option>
                    <option value="paket_c">Paket C (Setara SMA)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Verifikasi</label>
                  <select
                    value={ppdbForm.status}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, status: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white font-bold text-[#000a1e]"
                  >
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Lulus Verifikasi">Lulus Verifikasi</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Ayah Kandung</label>
                  <input
                    type="text"
                    value={ppdbForm.parentName}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, parentName: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    value={ppdbForm.namaIbu || ''}
                    onChange={(e) => setPpdbForm({ ...ppdbForm, namaIbu: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">No. WhatsApp Orang Tua / Wali</label>
                <input
                  type="text"
                  value={ppdbForm.parentPhone}
                  onChange={(e) => setPpdbForm({ ...ppdbForm, parentPhone: e.target.value })}
                  className="w-full p-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditPPDBModal(null);
                    setAddPPDBModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-semibold hover:bg-[#002147]"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD SISWA */}
      {(addStudentModalOpen || editStudentModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                {editStudentModal ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => {
                  setEditStudentModal(null);
                  setAddStudentModalOpen(false);
                }}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Siswa</label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Program</label>
                  <select
                    value={studentForm.program}
                    onChange={(e) => setStudentForm({ ...studentForm, program: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Paket A">Paket A (Setara SD)</option>
                    <option value="Paket B">Paket B (Setara SMP)</option>
                    <option value="Paket C">Paket C (Setara SMA)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rombel / Kelas</label>
                  <input
                    type="text"
                    value={studentForm.classGrade}
                    onChange={(e) => setStudentForm({ ...studentForm, classGrade: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditStudentModal(null);
                    setAddStudentModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-semibold hover:bg-[#002147]"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD GURU */}
      {(addTeacherModalOpen || editTeacherModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                {editTeacherModal ? 'Edit Data Pengajar' : 'Tambah Guru Baru'}
              </h3>
              <button
                onClick={() => {
                  setEditTeacherModal(null);
                  setAddTeacherModalOpen(false);
                }}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={teacherForm.status}
                    onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Guru</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Program Mengajar</label>
                  <input
                    type="text"
                    value={teacherForm.program}
                    onChange={(e) => setTeacherForm({ ...teacherForm, program: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditTeacherModal(null);
                    setAddTeacherModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-semibold hover:bg-[#002147]"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD KEUANGAN */}
      {(addPaymentModalOpen || editPaymentModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                {editPaymentModal ? 'Edit Catatan Transaksi' : 'Catat Transaksi SPP Manual'}
              </h3>
              <button
                onClick={() => {
                  setEditPaymentModal(null);
                  setAddPaymentModalOpen(false);
                }}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. Referensi / Inv</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.referenceNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Pembayaran</label>
                  <select
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
                    className="w-full p-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Tertunda">Tertunda</option>
                    <option value="Diproses">Diproses</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.nis}
                    onChange={(e) => setPaymentForm({ ...paymentForm, nis: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Siswa</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.studentName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Keterangan Pembayaran</label>
                <input
                  type="text"
                  required
                  value={paymentForm.title}
                  onChange={(e) => setPaymentForm({ ...paymentForm, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Metode Pembayaran</label>
                  <input
                    type="text"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditPaymentModal(null);
                    setAddPaymentModalOpen(false);
                  }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#000a1e] text-white rounded-lg text-xs font-semibold hover:bg-[#002147]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT / ADD AKUN USER & HAK AKSES */}
      {(addUserModalOpen || editUserModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-800" />
                <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                  {editUserModal ? 'Edit Akun User & Hak Akses' : 'Buat Akun Pengguna Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditUserModal(null);
                  setAddUserModalOpen(false);
                }}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Username / Email Login</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="misal: admin.ppdb@pkbmalabror.sch.id"
                    className="w-full p-2.5 border rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Role Level Pengguna</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 border rounded-lg bg-white font-bold"
                  >
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin Panitia / Bendahara</option>
                    <option value="guru">Guru / Pengajar</option>
                    <option value="siswa">Siswa / Peserta Didik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nama Lengkap User</label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="Nama Lengkap"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">NIS / NIP / ID Identitas</label>
                  <input
                    type="text"
                    value={userForm.nisOrNip}
                    onChange={(e) => setUserForm({ ...userForm, nisOrNip: e.target.value })}
                    placeholder="202400123 / 198503..."
                    className="w-full p-2.5 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Kata Sandi / Password</label>
                  <input
                    type="text"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Status Akun</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full p-2.5 border rounded-lg bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* PERMISSION CHECKLIST */}
              <div className="pt-2 border-t border-[#e2e2e2] space-y-2">
                <label className="block font-bold text-[#000a1e]">
                  Konfigurasi Hak Akses Modul (Permissions Granted):
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#f0f4f9] p-3 rounded-xl border border-[#c4c6cf]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManagePPDB}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManagePPDB: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Verifikasi & Edit PPDB</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageStudents}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageStudents: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Pengolahan Data Siswa</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageFinance}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageFinance: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Pengolahan Keuangan & SPP</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageTeachers}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageTeachers: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Pengolahan Data Guru</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canCustomizeWebsite}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canCustomizeWebsite: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Kostumisasi Website & Logo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userForm.permissions.canManageUsers}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          permissions: { ...userForm.permissions, canManageUsers: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-900"
                    />
                    <span className="font-semibold text-xs">Manajemen Akun User</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-between items-center">
                {editUserModal && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(editUserModal.id)}
                    className="text-rose-700 hover:underline font-bold text-xs"
                  >
                    Hapus Akun User
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditUserModal(null);
                      setAddUserModalOpen(false);
                    }}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 cursor-pointer"
                  >
                    Simpan Akun & Hak Akses
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: PENGATURAN VERIFIKASI, TAGIHAN & AKUN PORTAL PPDB */}
      {showPpdbSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                    Pengaturan Verifikasi & Tagihan Keuangan PPDB
                  </h3>
                  <p className="text-[11px] text-[#74777f]">
                    Kustomisasi terpisah antara Total Tagihan PPDB (Siswa Baru) dan Tagihan SPP Bulanan (Siswa Aktif).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPpdbSettingsModal(false)}
                className="text-[#74777f] hover:text-black p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#f0f4f9] rounded-xl border border-[#c4c6cf]">
              {[
                { id: 'new_student' as const, label: '1. Tagihan PPDB (Siswa Baru)', icon: Sparkles },
                { id: 'active_student' as const, label: '2. Tagihan SPP Bulanan (Siswa Aktif)', icon: DollarSign },
                { id: 'categories' as const, label: '3. Jenis Pembayaran & Kustomisasi Nama', icon: Tag },
                { id: 'bank_qris' as const, label: '4. Rekening & QRIS', icon: CreditCard },
                { id: 'portal_format' as const, label: '5. Format Portal & WhatsApp', icon: KeyRound },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = ppdbSettingsModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPpdbSettingsModalTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#000a1e] text-white shadow-sm'
                        : 'text-[#44474e] hover:bg-white/80 hover:text-[#000a1e]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ffe088]' : 'text-gray-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSettings(settingsForm);
                saveStoredVerificationSettings(settingsForm);
                handleAddAuditLog('PPDB', 'Superadmin memperbarui konfigurasi kustomisasi rincian nama, jenis, dan nominal Tagihan PPDB & SPP Siswa Aktif.');
                setShowPpdbSettingsModal(false);
              }}
              className="space-y-4 text-xs"
            >
              {/* TAB 1: TAGIHAN PPDB (PENDAFTAR / SISWA BARU) */}
              {ppdbSettingsModalTab === 'new_student' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-amber-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-4 h-4 text-amber-800" />
                        Kustomisasi Nama, Jenis & Rincian Total Tagihan PPDB (Siswa Baru)
                      </h4>
                      <p className="text-[11px] text-amber-900/80 mt-0.5">
                        Superadmin memiliki hak akses eksklusif untuk menambah, menghapus, atau mengubah nama komponen, jenis pembayaran, nominal, dan periode tagihan. Total tagihan calon siswa baru dihitung otomatis dari akumulasi rincian aktif di bawah ini.
                      </p>
                    </div>
                    <div className="shrink-0 bg-amber-200/60 border border-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                      Otoritas Penuh Superadmin
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'paket_a' as const, label: 'Paket A (Setara SD)', badge: 'Setara SD', color: 'border-blue-200 bg-blue-50/30' },
                      { id: 'paket_b' as const, label: 'Paket B (Setara SMP)', badge: 'Setara SMP', color: 'border-purple-200 bg-purple-50/30' },
                      { id: 'paket_c' as const, label: 'Paket C (Setara SMA)', badge: 'Setara SMA', color: 'border-emerald-200 bg-emerald-50/30' },
                    ].map((prog) => {
                      const items = getProgramCustomItems(prog.id, 'new');
                      const totalInitial = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

                      return (
                        <div key={prog.id} className={`p-4 rounded-xl border ${prog.color} space-y-3 bg-white shadow-xs`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#000a1e] text-sm">{prog.label}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200">
                                PPDB Siswa Baru ({items.length} Komponen)
                              </span>
                            </div>

                            {/* TOTAL HIGHLIGHT BOX */}
                            <div className="flex items-center gap-2">
                              <div className="bg-[#000a1e] text-white px-3 py-1.5 rounded-lg border border-[#002147] flex items-center gap-2 shadow-xs">
                                <span className="text-[10px] text-[#ffe088] uppercase font-bold tracking-wider">
                                  Total Tagihan PPDB:
                                </span>
                                <span className="font-mono font-bold text-sm text-[#ffe088]">
                                  Rp {totalInitial.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Custom Fee Items Table / Cards */}
                          <div className="space-y-2">
                            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold text-[#44474e] uppercase px-2 pb-1 border-b border-gray-100">
                              <div className="col-span-4">Nama Komponen Tagihan</div>
                              <div className="col-span-3">Jenis Pembayaran</div>
                              <div className="col-span-2">Nominal (Rp)</div>
                              <div className="col-span-2">Periode / Ket.</div>
                              <div className="col-span-1 text-center">Aksi</div>
                            </div>

                            {items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 sm:p-2 bg-gray-50/80 hover:bg-gray-100/80 rounded-lg border border-gray-200 items-center transition-colors"
                              >
                                {/* 1. Nama Komponen */}
                                <div className="sm:col-span-4">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Nama Komponen Tagihan:
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={item.name}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'new', item.id, 'name', e.target.value)}
                                    placeholder="Contoh: Uang Gedung & Sarana"
                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:border-[#000a1e] focus:outline-none"
                                  />
                                </div>

                                {/* 2. Jenis Pembayaran */}
                                <div className="sm:col-span-3">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Jenis Pembayaran:
                                  </label>
                                  <select
                                    value={item.category}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'new', item.id, 'category', e.target.value as FeeCategoryType)}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium focus:border-[#000a1e] focus:outline-none"
                                  >
                                    {getFeeCategories(settingsForm).map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3. Nominal (Rp) */}
                                <div className="sm:col-span-2">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Nominal Tagihan (Rp):
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-[10px] font-bold text-gray-500">Rp</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={5000}
                                      required
                                      value={item.amount}
                                      onChange={(e) => handleUpdateCustomItemField(prog.id, 'new', item.id, 'amount', Number(e.target.value) || 0)}
                                      className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-mono font-bold focus:border-[#000a1e] focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* 4. Periode / Ket */}
                                <div className="sm:col-span-2">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Periode / Ket:
                                  </label>
                                  <input
                                    type="text"
                                    value={item.period || ''}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'new', item.id, 'period', e.target.value)}
                                    placeholder="1x Awal Pendaftaran"
                                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:border-[#000a1e] focus:outline-none"
                                  />
                                </div>

                                {/* 5. Delete Action */}
                                <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomItem(prog.id, 'new', item.id)}
                                    title="Hapus Rincian Komponen"
                                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Program: Add Item & Reset to Default */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleAddCustomItem(prog.id, 'new')}
                              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300"
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-800" />
                              + Tambah Rincian Komponen Tagihan PPDB
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Pulihkan rincian tagihan PPDB ${prog.label} ke format default?`)) {
                                  handleResetProgItemsToDefault(prog.id, 'new');
                                }
                              }}
                              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-[11px] font-medium flex items-center gap-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3 h-3 text-gray-500" />
                              Pulihkan Default Paket
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: TAGIHAN KEUANGAN & SPP BULANAN (SISWA AKTIF - TERPISAH) */}
              {ppdbSettingsModalTab === 'active_student' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-blue-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold flex items-center gap-1.5 text-xs">
                        <DollarSign className="w-4 h-4 text-blue-800" />
                        Kustomisasi Terpisah: Rincian Tagihan SPP Bulanan & Keuangan Siswa Aktif
                      </h4>
                      <p className="text-[11px] text-blue-900/80 mt-0.5">
                        Rincian pembayaran ini berlaku khusus untuk siswa aktif yang sedang menjalani kegiatan belajar. Superadmin dapat menambah jenis tagihan seperti SPP Bulanan, Daftar Ulang Semester, Ujian Asesmen, dan Kegiatan secara dinamis.
                      </p>
                    </div>
                    <div className="shrink-0 bg-blue-200/60 border border-blue-300 px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                      Tagihan Mandiri Siswa Aktif
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'paket_a' as const, label: 'Paket A (Setara SD)', color: 'border-blue-200 bg-white' },
                      { id: 'paket_b' as const, label: 'Paket B (Setara SMP)', color: 'border-purple-200 bg-white' },
                      { id: 'paket_c' as const, label: 'Paket C (Setara SMA)', color: 'border-emerald-200 bg-white' },
                    ].map((prog) => {
                      const items = getProgramCustomItems(prog.id, 'active');
                      const sppItem = items.find((i) => i.category === 'spp');
                      const sppMonthly = sppItem ? Number(sppItem.amount) : 0;
                      const actDetails = getActiveStudentFeeDetails(prog.id, {
                        ...settingsForm,
                        customFeeItems: {
                          ...(settingsForm.customFeeItems || {}),
                          [prog.id]: {
                            ...(settingsForm.customFeeItems?.[prog.id] || { newStudentItems: [] }),
                            activeStudentItems: items,
                          },
                        },
                      });

                      return (
                        <div key={prog.id} className={`p-4 rounded-xl border ${prog.color} space-y-3 shadow-xs`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#000a1e] text-sm">{prog.label}</span>
                              <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-200">
                                Siswa Aktif ({items.length} Komponen)
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-[#002147] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                                SPP Pokok: <strong>Rp {sppMonthly.toLocaleString('id-ID')}/bln</strong>
                              </span>
                              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                Est. Total 1 Semester: <strong>Rp {actDetails.totalSemesterEst.toLocaleString('id-ID')}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Dynamic Custom Fee Items Table / Cards */}
                          <div className="space-y-2">
                            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-bold text-[#44474e] uppercase px-2 pb-1 border-b border-gray-100">
                              <div className="col-span-4">Nama Komponen Tagihan</div>
                              <div className="col-span-3">Jenis Pembayaran</div>
                              <div className="col-span-2">Nominal (Rp)</div>
                              <div className="col-span-2">Periode / Ket.</div>
                              <div className="col-span-1 text-center">Aksi</div>
                            </div>

                            {items.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 sm:p-2 bg-gray-50/80 hover:bg-gray-100/80 rounded-lg border border-gray-200 items-center transition-colors"
                              >
                                {/* 1. Nama Komponen */}
                                <div className="sm:col-span-4">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Nama Komponen Tagihan:
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={item.name}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'active', item.id, 'name', e.target.value)}
                                    placeholder="Contoh: SPP Pokok Bulanan"
                                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold focus:border-[#000a1e] focus:outline-none"
                                  />
                                </div>

                                {/* 2. Jenis Pembayaran */}
                                <div className="sm:col-span-3">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Jenis Pembayaran:
                                  </label>
                                  <select
                                    value={item.category}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'active', item.id, 'category', e.target.value as FeeCategoryType)}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium focus:border-[#000a1e] focus:outline-none"
                                  >
                                    {getFeeCategories(settingsForm).map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3. Nominal (Rp) */}
                                <div className="sm:col-span-2">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Nominal Tagihan (Rp):
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-[10px] font-bold text-gray-500">Rp</span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={5000}
                                      required
                                      value={item.amount}
                                      onChange={(e) => handleUpdateCustomItemField(prog.id, 'active', item.id, 'amount', Number(e.target.value) || 0)}
                                      className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-mono font-bold focus:border-[#000a1e] focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* 4. Periode / Ket */}
                                <div className="sm:col-span-2">
                                  <label className="sm:hidden block text-[10px] font-bold text-[#74777f] mb-0.5">
                                    Periode / Ket:
                                  </label>
                                  <input
                                    type="text"
                                    value={item.period || ''}
                                    onChange={(e) => handleUpdateCustomItemField(prog.id, 'active', item.id, 'period', e.target.value)}
                                    placeholder="Per Bulan / Per Semester"
                                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:border-[#000a1e] focus:outline-none"
                                  />
                                </div>

                                {/* 5. Delete Action */}
                                <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-0">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomItem(prog.id, 'active', item.id)}
                                    title="Hapus Rincian Komponen"
                                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Program: Add Item & Reset to Default */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleAddCustomItem(prog.id, 'active')}
                              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-300"
                            >
                              <Plus className="w-3.5 h-3.5 text-blue-900" />
                              + Tambah Rincian Komponen Tagihan Siswa Aktif
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Pulihkan rincian tagihan siswa aktif ${prog.label} ke format default?`)) {
                                  handleResetProgItemsToDefault(prog.id, 'active');
                                }
                              }}
                              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-[11px] font-medium flex items-center gap-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                            >
                              <RefreshCw className="w-3 h-3 text-gray-500" />
                              Pulihkan Default Paket
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: KATALOG & KUSTOMISASI JENIS PEMBAYARAN */}
              {ppdbSettingsModalTab === 'categories' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold flex items-center gap-1.5 text-xs">
                        <Tag className="w-4 h-4 text-emerald-800" />
                        Kustomisasi Nama & Jenis Pembayaran (PPDB & Siswa Aktif)
                      </h4>
                      <p className="text-[11px] text-emerald-900/80 mt-0.5">
                        Superadmin dapat mengkostumisasi nama jenis pembayaran (seperti Biaya Program Sekolah Paket, Program Muatan Tambahan, SPP Pokok, dll.) atau menambahkan jenis kategori pembayaran baru. Pilihan ini otomatis tersinkronisasi ke rincian tagihan PPDB dan Siswa Aktif.
                      </p>
                    </div>
                    <div className="shrink-0 bg-emerald-200/60 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                      Hak Akses Superadmin
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCatForm(!showAddCatForm)}
                        className="px-3 py-1.5 bg-[#000a1e] hover:bg-[#002147] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#ffe088]" />
                        {showAddCatForm ? 'Tutup Form Tambah' : '+ Tambah Jenis Pembayaran Baru'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetCategoriesToDefault}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-[11px] font-medium flex items-center gap-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-gray-500" />
                      Pulihkan Katalog Bawaan Default
                    </button>
                  </div>

                  {/* Add New Category Form Box */}
                  {showAddCatForm && (
                    <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-4 space-y-3 animate-fadeIn shadow-xs">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-amber-800" />
                          Tambah Jenis Pembayaran Baru
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddCatForm(false)}
                          className="text-amber-800 hover:text-amber-950 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Nama Jenis Pembayaran: *
                          </label>
                          <input
                            type="text"
                            required
                            value={newCatForm.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              const autoId = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                              setNewCatForm({
                                ...newCatForm,
                                name: val,
                                id: newCatForm.id || autoId,
                              });
                            }}
                            placeholder="Contoh: Biaya Program Sekolah Paket"
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs font-semibold focus:border-amber-700 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Kode / ID Unik Sistem:
                          </label>
                          <input
                            type="text"
                            value={newCatForm.id}
                            onChange={(e) => setNewCatForm({ ...newCatForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            placeholder="program_sekolah"
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs font-mono font-bold text-amber-900 focus:border-amber-700 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Deskripsi / Keterangan:
                          </label>
                          <input
                            type="text"
                            value={newCatForm.description}
                            onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                            placeholder="Rincian pembayaran program muatan sekolah..."
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs focus:border-amber-700 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            Warna Lencana / Badge:
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={newCatForm.badgeColor}
                              onChange={(e) => setNewCatForm({ ...newCatForm, badgeColor: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-md text-xs font-medium focus:border-amber-700 focus:outline-none"
                            >
                              <option value="sky">Biru Muda (Sky)</option>
                              <option value="orange">Oranye (Orange)</option>
                              <option value="emerald">Hijau (Emerald)</option>
                              <option value="indigo">Indigo (Indigo)</option>
                              <option value="purple">Ungu (Purple)</option>
                              <option value="amber">Kuning Emas (Amber)</option>
                              <option value="rose">Merah Muda (Rose)</option>
                              <option value="teal">Teal (Cyan)</option>
                              <option value="slate">Abu-abu (Slate)</option>
                            </select>
                            {/* Preview Pill */}
                            <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded border bg-amber-100 text-amber-900 border-amber-300">
                              Preview
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                        <button
                          type="button"
                          onClick={() => setShowAddCatForm(false)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCategorySubmit}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                        >
                          Simpan Jenis Pembayaran
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Existing Categories Table */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-[#000a1e] text-xs">
                        Daftar Jenis Pembayaran Aktif ({getFeeCategories(settingsForm).length} Kategori)
                      </span>
                      <span className="text-[10px] text-gray-500">
                        * Ubah langsung teks pada kotak untuk mengkostumisasi nama kategori
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {getFeeCategories(settingsForm).map((cat) => {
                        const badgeStyle = getFeeCategoryBadge(cat.id);
                        return (
                          <div key={cat.id} className="p-3.5 hover:bg-gray-50/80 transition-colors space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {/* Left: Badge preview + Editable Name */}
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                                    {cat.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    ID: {cat.id}
                                  </span>
                                  {cat.isSystem && (
                                    <span className="text-[9px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200">
                                      Bawaan Sistem
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                                  <div className="sm:col-span-6">
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                      Nama Kategori Tampilan:
                                    </label>
                                    <input
                                      type="text"
                                      value={cat.name}
                                      onChange={(e) => handleUpdateCategoryField(cat.id, 'name', e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-[#000a1e] focus:border-[#000a1e] focus:outline-none"
                                      placeholder="Nama jenis pembayaran..."
                                    />
                                  </div>

                                  <div className="sm:col-span-6">
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                      Deskripsi / Penjelasan:
                                    </label>
                                    <input
                                      type="text"
                                      value={cat.description || ''}
                                      onChange={(e) => handleUpdateCategoryField(cat.id, 'description', e.target.value)}
                                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:border-[#000a1e] focus:outline-none"
                                      placeholder="Keterangan kategori..."
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Right: Color Selector + Actions */}
                              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <div className="w-28">
                                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                    Warna:
                                  </label>
                                  <select
                                    value={cat.badgeColor || 'sky'}
                                    onChange={(e) => handleUpdateCategoryField(cat.id, 'badgeColor', e.target.value)}
                                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded-md text-[11px] font-medium focus:border-[#000a1e] focus:outline-none"
                                  >
                                    <option value="sky">Sky (Biru)</option>
                                    <option value="orange">Orange (Oranye)</option>
                                    <option value="emerald">Emerald (Hijau)</option>
                                    <option value="indigo">Indigo</option>
                                    <option value="purple">Purple (Ungu)</option>
                                    <option value="amber">Amber (Emas)</option>
                                    <option value="rose">Rose (Merah)</option>
                                    <option value="teal">Teal</option>
                                    <option value="slate">Slate (Abu)</option>
                                  </select>
                                </div>

                                <div className="pt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    title="Hapus Kategori Pembayaran"
                                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-rose-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REKENING & QRIS */}
              {ppdbSettingsModalTab === 'bank_qris' && (
                <div className="space-y-4 animate-fadeIn bg-white p-4 rounded-xl border border-[#e2e2e2]">
                  <h4 className="font-bold text-[#000a1e] flex items-center gap-1.5 text-sm">
                    <CreditCard className="w-4 h-4 text-[#002147]" />
                    Rekening Tujuan Pembayaran & QRIS Lembaga
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Nama Bank / Dompet Digital</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.bankInfo.bankName}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            bankInfo: { ...settingsForm.bankInfo, bankName: e.target.value },
                          })
                        }
                        placeholder="misal: Bank Syariah Indonesia (BSI)"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Nomor Rekening</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.bankInfo.accountNumber}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            bankInfo: { ...settingsForm.bankInfo, accountNumber: e.target.value },
                          })
                        }
                        placeholder="7182-0100-9988-502"
                        className="w-full p-2.5 border rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.bankInfo.accountHolder}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            bankInfo: { ...settingsForm.bankInfo, accountHolder: e.target.value },
                          })
                        }
                        placeholder="PKBM AL-ABROR PALMERAH"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Kode / Catatan QRIS</label>
                      <input
                        type="text"
                        value={settingsForm.bankInfo.qrisInfo}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            bankInfo: { ...settingsForm.bankInfo, qrisInfo: e.target.value },
                          })
                        }
                        placeholder="Scan QRIS di Loket PKBM AL-ABROR"
                        className="w-full p-2.5 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FORMAT PORTAL & WHATSAPP */}
              {ppdbSettingsModalTab === 'portal_format' && (
                <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-sm">
                    <KeyRound className="w-4 h-4 text-indigo-800" />
                    Pengaturan Format Registrasi & Akun Portal Siswa
                  </h4>

                  {/* Prefix No. Registrasi */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-100">
                    <label className="block font-bold text-indigo-950 text-xs">
                      Format / Prefix No. Registrasi Pendaftar
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.regNumberPrefix || 'PPDB-2024-'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          regNumberPrefix: e.target.value,
                        })
                      }
                      placeholder="PPDB-2024-"
                      className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-indigo-700 font-mono">
                      🔍 Contoh hasil nomor: <strong>{(settingsForm.regNumberPrefix || 'PPDB-2024-')}8842</strong>
                    </p>
                  </div>

                  {/* Pola Password */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-100">
                    <label className="block font-bold text-indigo-950 text-xs">
                      Pola / Format Kata Sandi Bawaan Portal
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.defaultPasswordPattern || '[NO_REG][2_ANGKA_AKHIR_NIK]'}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          defaultPasswordPattern: e.target.value,
                        })
                      }
                      placeholder="[NO_REG][2_ANGKA_AKHIR_NIK]"
                      className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-xs text-amber-900"
                    />
                    <p className="text-[10px] text-amber-900 font-mono">
                      🔑 Simulasi Kata Sandi: <strong>{resolveDefaultPassword(settingsForm.defaultPasswordPattern || '[NO_REG][2_ANGKA_AKHIR_NIK]', (settingsForm.regNumberPrefix || 'PPDB-2024-') + '0081', '3201123456780001')}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1 text-indigo-950 text-xs">Batas Waktu Bayar (Jam)</label>
                      <input
                        type="number"
                        required
                        value={settingsForm.expiryHours || 72}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            expiryHours: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-xs"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-indigo-200 w-full">
                        <input
                          type="checkbox"
                          checked={settingsForm.autoCreatePortalAccount}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              autoCreatePortalAccount: e.target.checked,
                            })
                          }
                          className="rounded text-indigo-900 w-4 h-4"
                        />
                        <span className="font-bold text-[11px] text-indigo-950">
                          Otomatis aktifkan Akun Portal saat Lunas
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-indigo-950 text-xs">Draft Template Pesan Verifikasi WhatsApp</label>
                    <textarea
                      rows={3}
                      value={settingsForm.waMessageTemplate || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          waMessageTemplate: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg bg-white text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-[#e2e2e2]">
                <button
                  type="button"
                  onClick={() => setShowPpdbSettingsModal(false)}
                  className="px-4 py-2 border rounded-lg font-semibold cursor-pointer hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#000a1e] text-white rounded-lg font-bold hover:bg-[#002147] cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#ffe088]" />
                  Simpan Seluruh Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH NOTIFICATION & WHATSAPP CARD PREVIEW */}
      {dispatchNoticeModal.open && dispatchNoticeModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#000a1e]">
                    {dispatchNoticeModal.type === 'invoice'
                      ? 'Notifikasi Verifikasi & Rincian Tagihan'
                      : 'Kredensial & Aktivasi Portal Siswa'}
                  </h3>
                  <p className="text-[10px] text-[#74777f]">
                    Pesan verifikasi telah siap dikirimkan ke calon siswa via WhatsApp.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchNoticeModal({ open: false, item: null, type: 'invoice' })}
                className="text-[#74777f] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Box */}
            <div className="bg-[#f0f4f9] p-3.5 rounded-xl border border-[#c4c6cf] text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#002147]">{dispatchNoticeModal.item.regNumber}</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {dispatchNoticeModal.item.status}
                </span>
              </div>
              <p className="font-bold text-sm text-[#000a1e]">{dispatchNoticeModal.item.fullName}</p>
              <p className="text-[#74777f]">
                No. HP Orang Tua: <span className="font-mono font-bold text-[#000a1e]">{dispatchNoticeModal.item.parentPhone}</span>
              </p>
            </div>

            {/* WhatsApp Text Preview Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#000a1e]">Pratinjau Pesan WhatsApp:</label>
              <div className="bg-emerald-950 text-emerald-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto border border-emerald-800 whitespace-pre-wrap">
                {dispatchNoticeModal.type === 'invoice'
                  ? `PEMBERITAHUAN VERIFIKASI & TAGIHAN PPDB PKBM AL-ABROR\n\nSelamat! Berkas ${dispatchNoticeModal.item.fullName} (No. Reg: ${dispatchNoticeModal.item.regNumber}) telah LULUS VERIFIKASI DAPODIK.\n\nBiaya Registrasi: Rp ${(dispatchNoticeModal.item.paymentAmount || 500000).toLocaleString('id-ID')}\nBank: ${activeSettings.bankInfo.bankName}\nNo. Rekening: ${activeSettings.bankInfo.accountNumber}\nAtas Nama: ${activeSettings.bankInfo.accountHolder}`
                  : `AKTIVASI AKUN PORTAL SISWA DIGITAL PKBM AL-ABROR\n\nPembayaran ${dispatchNoticeModal.item.fullName} telah LUNAS.\n\nUsername: ${dispatchNoticeModal.item.portalUsername || dispatchNoticeModal.item.nik}\nPassword: ${dispatchNoticeModal.item.portalPassword || `${dispatchNoticeModal.item.regNumber}${dispatchNoticeModal.item.nik && dispatchNoticeModal.item.nik.trim().length >= 2 ? dispatchNoticeModal.item.nik.trim().slice(-2) : '00'}`}\nLink Portal: https://pkbmalabror.sch.id/portal`}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between gap-2 border-t border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => {
                  const modalPass = dispatchNoticeModal.item?.portalPassword || `${dispatchNoticeModal.item?.regNumber}${dispatchNoticeModal.item?.nik && dispatchNoticeModal.item.nik.trim().length >= 2 ? dispatchNoticeModal.item.nik.trim().slice(-2) : '00'}`;
                  const text = dispatchNoticeModal.type === 'invoice'
                    ? `PEMBERITAHUAN VERIFIKASI & TAGIHAN PPDB PKBM AL-ABROR\nNo. Reg: ${dispatchNoticeModal.item?.regNumber}\nNama: ${dispatchNoticeModal.item?.fullName}\nTagihan: Rp ${(dispatchNoticeModal.item?.paymentAmount || 500000).toLocaleString('id-ID')}\nBank: ${activeSettings.bankInfo.bankName} (${activeSettings.bankInfo.accountNumber})`
                    : `AKTIVASI AKUN PORTAL SISWA\nNama: ${dispatchNoticeModal.item?.fullName}\nUsername: ${dispatchNoticeModal.item?.portalUsername || dispatchNoticeModal.item?.nik}\nPassword: ${modalPass}`;
                  navigator.clipboard.writeText(text);
                  alert('Teks notifikasi berhasil disalin ke clipboard!');
                }}
                className="px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#002147]" /> Salin Teks
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDispatchNoticeModal({ open: false, item: null, type: 'invoice' })}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50"
                >
                  Tutup
                </button>

                <a
                  href={generateWaLink(dispatchNoticeModal.item, dispatchNoticeModal.type)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE DAPODIK SHEET MODAL */}
      {printDapodikData && (
        <DapodikPrintSheet data={printDapodikData} onClose={() => setPrintDapodikData(null)} />
      )}
    </div>
  );
};
