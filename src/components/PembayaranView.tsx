import React, { useState, useEffect } from 'react';
import { StudentData, PaymentBill, PaymentHistoryItem } from '../types';
import { INITIAL_STUDENTS, INITIAL_PAYMENT_HISTORY } from '../data/mockData';
import {
  getStoredVerificationSettings,
  getNewStudentFeeDetails,
  getActiveStudentFeeDetails,
  getNewStudentFeeItems,
  getActiveStudentFeeItems,
  normalizeProgramKey,
  getFeeCategoryBadge,
  getFeeCategoryLabel,
} from '../utils/ppdbUtils';
import {
  Search,
  Building2,
  QrCode,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Copy,
  X,
  CreditCard,
  AlertTriangle,
  UserCheck,
  Lock,
  ArrowRight,
  Filter,
  Receipt,
  FileSpreadsheet,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export interface OverdueBillItem {
  id: string;
  studentNis: string;
  studentName: string;
  program: string;
  billTitle: string;
  dueDate: string;
  amount: number;
  monthsOverdue: number;
  status: 'Menunggak' | 'Belum Lunas';
}

const INITIAL_OVERDUE_LIST: OverdueBillItem[] = [
  {
    id: 'ov_1',
    studentNis: '202400124',
    studentName: 'Siti Nurhaliza',
    program: 'Paket B (Setara SMP)',
    billTitle: 'SPP Bulan Oktober 2024',
    dueDate: '10 Okt 2024',
    amount: 250000,
    monthsOverdue: 1,
    status: 'Menunggak',
  },
  {
    id: 'ov_2',
    studentNis: '202400125',
    studentName: 'Budi Santoso',
    program: 'Paket A (Setara SD)',
    billTitle: 'Biaya Seragam & Atribut School Kit',
    dueDate: '15 Sep 2024',
    amount: 450000,
    monthsOverdue: 2,
    status: 'Belum Lunas',
  },
  {
    id: 'ov_3',
    studentNis: '202400123',
    studentName: 'Ahmad Fauzi',
    program: 'Paket C (Setara SMA)',
    billTitle: 'Biaya Modul Belajar & Ujian Semester 1',
    dueDate: '01 Okt 2024',
    amount: 300000,
    monthsOverdue: 1,
    status: 'Belum Lunas',
  },
];

export const PembayaranView: React.FC = () => {
  // Overdue List State
  const [overdueList, setOverdueList] = useState<OverdueBillItem[]>(INITIAL_OVERDUE_LIST);
  const [overdueFilter, setOverdueFilter] = useState<'all' | 'paket_a' | 'paket_b' | 'paket_c'>('all');

  // Active Student for Payment Target
  const [searchQuery, setSearchQuery] = useState('202400123');
  const [activeStudent, setActiveStudent] = useState<StudentData>(INITIAL_STUDENTS[0]);
  const [searchError, setSearchError] = useState('');

  // Bill Category: Active SPP vs PPDB New Student
  const [billCategory, setBillCategory] = useState<'active_spp' | 'ppdb_new'>('active_spp');

  // Settings
  const [settings, setSettings] = useState(getStoredVerificationSettings());

  // Listen or refresh settings
  useEffect(() => {
    setSettings(getStoredVerificationSettings());
  }, []);

  // Generate bills based on student and category
  const generateBillsForStudent = (student: StudentData, category: 'active_spp' | 'ppdb_new'): PaymentBill[] => {
    const currentSettings = getStoredVerificationSettings();
    const progKey = normalizeProgramKey(student.program);

    if (category === 'ppdb_new') {
      const { items } = getNewStudentFeeItems(progKey, currentSettings);
      return items.map((it, idx) => ({
        id: `ppdb_${it.id || idx}_${student.nis}`,
        title: `${it.name} (${student.program})`,
        amount: Number(it.amount) || 0,
        period: it.period || 'Satu Kali Saat Pendaftaran PPDB',
        category: it.category || 'other',
        isChecked: it.isRequired !== false,
      }));
    } else {
      const { items } = getActiveStudentFeeItems(progKey, currentSettings);
      return items.map((it, idx) => ({
        id: `act_${it.id || idx}_${student.nis}`,
        title: `${it.name} (${student.program})`,
        amount: Number(it.amount) || 0,
        period: it.period || 'Kewajiban Pembayaran Siswa Aktif',
        category: it.category || 'other',
        isChecked: it.category === 'spp' || it.isRequired === true,
      }));
    }
  };

  // Bills State
  const [bills, setBills] = useState<PaymentBill[]>(() =>
    generateBillsForStudent(INITIAL_STUDENTS[0], 'active_spp')
  );

  const [selectedMethod, setSelectedMethod] = useState<'va' | 'qris' | 'transfer'>('va');
  const [vaBank, setVaBank] = useState<'bca' | 'mandiri' | 'bri' | 'bni'>('bca');

  // Personal Payment Transactions (simulated private storage per student account)
  const [studentTransactions, setStudentTransactions] = useState<PaymentHistoryItem[]>(INITIAL_PAYMENT_HISTORY);

  // Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Handle Search Student Target Account
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError('');
    const query = searchQuery.trim().toLowerCase();
    const found = INITIAL_STUDENTS.find(
      (s) => s.nis.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );

    if (found) {
      setActiveStudent(found);
      setBills(generateBillsForStudent(found, billCategory));
    } else {
      setSearchError('Akun siswa tidak ditemukan. Silakan masukkan NIS yang valid (contoh: 202400123, 202400124, 202400125).');
    }
  };

  // Switch category
  const handleCategorySwitch = (cat: 'active_spp' | 'ppdb_new') => {
    setBillCategory(cat);
    setBills(generateBillsForStudent(activeStudent, cat));
  };

  // Select all / deselect all
  const setAllBillsChecked = (checked: boolean) => {
    setBills((prev) => prev.map((b) => ({ ...b, isChecked: checked })));
  };

  // Select Overdue Item to populate form directly
  const handleSelectOverdueToPay = (item: OverdueBillItem) => {
    const studentObj = INITIAL_STUDENTS.find((s) => s.nis === item.studentNis) || {
      id: `s_${item.studentNis}`,
      nis: item.studentNis,
      name: item.studentName,
      program: item.program as any,
      classGrade: 'Aktif',
      status: 'Aktif',
      parentName: 'Orang Tua',
      parentPhone: '081234567890',
      registrationDate: '2024-01-01',
    };

    setActiveStudent(studentObj);
    setSearchQuery(item.studentNis);
    setBillCategory('active_spp');

    // Create custom bill for this overdue item
    setBills([
      {
        id: `bill_${item.id}`,
        title: item.billTitle,
        amount: item.amount,
        period: item.dueDate,
        category: 'spp',
        isChecked: true,
      },
    ]);

    // Scroll to form smoothly
    const formEl = document.getElementById('formulir-pembayaran');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Bill Checkbox
  const toggleBill = (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isChecked: !b.isChecked } : b))
    );
  };

  // Calculate Total
  const selectedBills = bills.filter((b) => b.isChecked);
  const totalAmount = selectedBills.reduce((sum, b) => sum + b.amount, 0);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Simulate Payment Process Completion
  const handleSimulatePay = () => {
    if (selectedBills.length === 0) return;

    const refNo = `INV/${new Date().getFullYear()}/VA/${Math.floor(10000 + Math.random() * 90000)}`;

    const newHistoryItems: PaymentHistoryItem[] = selectedBills.map((b, idx) => ({
      id: `pay_${Date.now()}_${idx}`,
      title: b.title,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: b.amount,
      status: 'Lunas',
      method:
        selectedMethod === 'va'
          ? `Virtual Account ${vaBank.toUpperCase()}`
          : selectedMethod === 'qris'
          ? 'QRIS Instant'
          : 'Transfer Bank Mandiri',
      nis: activeStudent.nis,
      studentName: activeStudent.name,
      referenceNo: refNo,
    }));

    // Update transactions for student account
    setStudentTransactions((prev) => [...newHistoryItems, ...prev]);

    // Remove from public overdue list if matched
    setOverdueList((prev) => prev.filter((item) => item.studentNis !== activeStudent.nis));

    setPaymentSuccessMsg(
      `Pembayaran berhasil dikonfirmasi dan ditujukan langsung ke Akun Siswa: ${activeStudent.name} (${activeStudent.nis})`
    );

    // Reset bills state
    setBills((prev) =>
      prev.map((b) => (b.isChecked ? { ...b, isChecked: false } : b))
    );

    setTimeout(() => {
      setPaymentModalOpen(false);
      setPaymentSuccessMsg('');
    }, 2500);
  };

  // Filtered overdue list
  const filteredOverdue = overdueList.filter((item) => {
    if (overdueFilter === 'all') return true;
    if (overdueFilter === 'paket_a') return item.program.includes('Paket A');
    if (overdueFilter === 'paket_b') return item.program.includes('Paket B');
    if (overdueFilter === 'paket_c') return item.program.includes('Paket C');
    return true;
  });

  return (
    <div className="w-full pt-28 pb-20 px-4 md:px-12 bg-[#f9f9f9]">
      <div className="max-w-[1280px] mx-auto space-y-10">
        
        {/* Header Title & Privacy Policy Clarification */}
        <div className="bg-gradient-to-r from-[#000a1e] via-[#002147] to-[#000a1e] text-white p-6 md:p-8 rounded-2xl shadow-lg border border-[#002147] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#ffe088]/20 px-3 py-1 rounded-full border border-[#ffe088]/30">
              <Lock className="w-3.5 h-3.5 text-[#ffe088]" />
              <span className="text-[11px] font-bold text-[#ffe088] uppercase tracking-wider">
                Sistem Pembayaran Terhubung Akun Siswa
              </span>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold leading-tight">
              Formulir Pembayaran & Informasi Menunggak Siswa
            </h1>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              Seluruh riwayat pembayaran lunas merupakan privasi data dan langsung diperuntukkan ke <strong>Akun Portal Masing-masing Siswa</strong>. Di halaman publik ini, disajikan <strong>Formulir Transaksi ke Akun Siswa</strong> serta <strong>Daftar Tagihan Menunggak</strong> yang perlu segera diselesaikan.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center sm:text-right">
              <span className="text-[10px] text-blue-200 block uppercase font-semibold">Tunggakan Belum Lunas</span>
              <span className="font-headline text-2xl font-bold text-[#ffe088]">
                {overdueList.length} Siswa
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: DAFTAR SISWA MENUNGGAK (PUBLIK) */}
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#e2e2e2] space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#e2e2e2]">
            <div>
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" />
                Daftar Tagihan Belum Lunas (Public Notice)
              </div>
              <h2 className="font-headline text-2xl font-bold text-[#000a1e]">
                Informasi Tunggakan Biaya Pendidikan Siswa
              </h2>
              <p className="text-xs text-[#74777f]">
                Halaman publik khusus menampilkan daftar siswa yang memiliki kewajiban pembayaran menunggak untuk mempermudah wali murid atau siswa melakukan pelunasan secara rinci.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOverdueFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  overdueFilter === 'all'
                    ? 'bg-[#000a1e] text-white'
                    : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
                }`}
              >
                Semua ({overdueList.length})
              </button>
              <button
                onClick={() => setOverdueFilter('paket_a')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  overdueFilter === 'paket_a'
                    ? 'bg-[#000a1e] text-white'
                    : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
                }`}
              >
                Paket A
              </button>
              <button
                onClick={() => setOverdueFilter('paket_b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  overdueFilter === 'paket_b'
                    ? 'bg-[#000a1e] text-white'
                    : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
                }`}
              >
                Paket B
              </button>
              <button
                onClick={() => setOverdueFilter('paket_c')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  overdueFilter === 'paket_c'
                    ? 'bg-[#000a1e] text-white'
                    : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
                }`}
              >
                Paket C
              </button>
            </div>
          </div>

          {filteredOverdue.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-sm">Tidak Ada Tunggakan Tagihan Aktif</p>
              <p className="text-xs text-emerald-700">Seluruh kewajiban pembayaran siswa pada kategori ini telah diselesaikan dengan baik.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredOverdue.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fffdfa] border-2 border-rose-200 hover:border-rose-400 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.status} ({item.monthsOverdue} Bln)
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#735c00]">
                        NIS: {item.studentNis}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                        {item.studentName}
                      </h3>
                      <p className="text-xs font-medium text-[#74777f]">{item.program}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#e2e2e2] space-y-1">
                      <p className="font-semibold text-xs text-[#1a1c1c]">{item.billTitle}</p>
                      <p className="text-[11px] text-[#74777f]">Jatuh Tempo: {item.dueDate}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e2e2e2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#74777f] block">Nominal Tunggakan</span>
                      <span className="font-headline text-lg font-bold text-rose-700">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectOverdueToPay(item)}
                      className="bg-[#000a1e] hover:bg-[#735c00] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                    >
                      Bayar Sekarang
                      <ArrowRight className="w-3.5 h-3.5 text-[#ffe088]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: FORMULIR PEMBAYARAN DITUJUKAN KE AKUN SISWA */}
        <section id="formulir-pembayaran" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Payment Form (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step A: Search/Select Target Student Account */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#e2e2e2] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#735c00]" />
                  <h2 className="font-headline text-xl font-bold text-[#000a1e]">
                    1. Pilih / Cari Akun Siswa Tujuan Transaksi
                  </h2>
                </div>
                <span className="text-[10px] font-bold bg-[#f0f4f9] text-[#000a1e] px-2.5 py-1 rounded-full">
                  Target Account
                </span>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Masukkan NIS atau Nama Siswa (contoh: 202400123)..."
                  className="flex-grow rounded-xl border border-[#c4c6cf] px-4 py-2.5 focus:border-[#000a1e] focus:ring-2 focus:ring-[#000a1e]/20 outline-none text-xs md:text-sm bg-white"
                />
                <button
                  type="submit"
                  className="bg-[#000a1e] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#735c00] transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-2 shadow"
                >
                  <Search className="w-4 h-4" />
                  Cari Akun Siswa
                </button>
              </form>

              {searchError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-lg border border-rose-200">
                  {searchError}
                </p>
              )}

              {/* Display Target Student Account Box */}
              {activeStudent && (
                <div className="bg-[#f0f4f9] p-5 rounded-xl border border-[#c4c6cf] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#735c00] uppercase tracking-widest block mb-0.5">
                      AKUN SISWA TERVERIFIKASI
                    </span>
                    <h3 className="font-headline text-xl font-bold text-[#000a1e]">
                      {activeStudent.name}
                    </h3>
                    <p className="text-xs font-mono font-semibold text-[#002147] mt-0.5">
                      NIS: {activeStudent.nis} &bull; {activeStudent.program} ({activeStudent.classGrade})
                    </p>
                    <p className="text-[11px] text-[#74777f] mt-1">
                      Wali Murid: {activeStudent.parentName} ({activeStudent.parentPhone})
                    </p>
                  </div>

                  <div className="bg-white px-3.5 py-2 rounded-lg border border-[#e2e2e2] text-right shrink-0">
                    <span className="text-[10px] text-emerald-800 font-bold block uppercase">
                      Status Akun: Aktif
                    </span>
                    <span className="text-[10px] text-[#74777f] font-mono">
                      Data Terhubung ke Portal
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step B: Select Items / Bills to Pay */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#e2e2e2] space-y-5">
              <div className="pb-3 border-b border-[#e2e2e2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-headline text-xl font-bold text-[#000a1e]">
                    2. Pilih Tagihan / Komponen Pembayaran
                  </h2>
                  <p className="text-xs text-[#74777f] mt-0.5">
                    Kustomisasi tarif terpisah antara <strong>Tagihan SPP Siswa Aktif</strong> & <strong>Tagihan PPDB Siswa Baru</strong> ({activeStudent.program}).
                  </p>
                </div>

                {/* Category Switch Tabs */}
                <div className="flex bg-[#f0f4f9] p-1 rounded-xl border border-[#c4c6cf] gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCategorySwitch('active_spp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billCategory === 'active_spp'
                        ? 'bg-[#000a1e] text-white shadow-xs'
                        : 'text-[#44474e] hover:bg-[#e2e2e2]'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    SPP Siswa Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategorySwitch('ppdb_new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billCategory === 'ppdb_new'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'text-[#44474e] hover:bg-[#e2e2e2]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tagihan PPDB (Baru)
                  </button>
                </div>
              </div>

              {/* Quick Action bar */}
              <div className="flex justify-between items-center bg-[#f9f9f9] p-2.5 rounded-xl border border-[#e2e2e2] text-xs">
                <span className="text-[#44474e] font-medium">
                  {billCategory === 'ppdb_new'
                    ? 'Rincian Tagihan Awal Pendaftaran PPDB Siswa Baru:'
                    : 'Rincian Tagihan Rutin & SPP Siswa Aktif:'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllBillsChecked(true)}
                    className="text-[11px] font-bold text-[#002147] hover:underline cursor-pointer"
                  >
                    Pilih Semua (Total Penuh)
                  </button>
                  <span className="text-[#c4c6cf]">|</span>
                  <button
                    type="button"
                    onClick={() => setAllBillsChecked(false)}
                    className="text-[11px] font-bold text-[#74777f] hover:underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {bills.map((bill) => (
                  <label
                    key={bill.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      bill.isChecked
                        ? billCategory === 'ppdb_new'
                          ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/15'
                          : 'border-[#000a1e] bg-[#f9f9f9] ring-2 ring-[#000a1e]/10'
                        : 'border-[#e2e2e2] hover:bg-[#f3f3f3]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!bill.isChecked}
                      onChange={() => toggleBill(bill.id)}
                      className={`w-5 h-5 rounded border-[#c4c6cf] cursor-pointer ${
                        billCategory === 'ppdb_new'
                          ? 'text-amber-700 focus:ring-amber-600'
                          : 'text-[#000a1e] focus:ring-[#000a1e]'
                      }`}
                    />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#1a1c1c]">{bill.title}</p>
                        {(() => {
                          const badge = getFeeCategoryBadge(bill.category);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {getFeeCategoryLabel(bill.category, settings)}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-[#74777f] mt-0.5">{bill.period}</p>
                    </div>
                    <span className="font-bold text-sm text-[#000a1e]">
                      Rp {bill.amount.toLocaleString('id-ID')}
                    </span>
                  </label>
                ))}
              </div>

              {/* Total Calculation Banner */}
              <div className="flex justify-between items-center bg-[#000a1e] text-white p-5 rounded-xl border border-[#000a1e]">
                <div>
                  <span className="text-xs text-blue-200 block uppercase font-medium">Total Nominal Transfer</span>
                  <span className="text-[10px] text-[#ffe088]">
                    Ditujukan ke NIS {activeStudent.nis} ({activeStudent.name})
                  </span>
                </div>
                <span className="font-headline text-2xl md:text-3xl font-bold text-[#ffe088]">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Step C: Payment Methods */}
              <div className="pt-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-[#000a1e] mb-3">
                  3. Pilih Kanal Pembayaran Resmikan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {/* Virtual Account */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('va')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                      selectedMethod === 'va'
                        ? 'border-[#000a1e] ring-2 ring-[#000a1e] bg-[#f0f4f9] text-[#000a1e]'
                        : 'border-[#c4c6cf] hover:bg-[#f3f3f3] text-[#44474e]'
                    }`}
                  >
                    <Building2 className="w-7 h-7 text-[#000a1e]" />
                    <span className="text-xs font-bold">Virtual Account</span>
                  </button>

                  {/* QRIS */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('qris')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                      selectedMethod === 'qris'
                        ? 'border-[#000a1e] ring-2 ring-[#000a1e] bg-[#f0f4f9] text-[#000a1e]'
                        : 'border-[#c4c6cf] hover:bg-[#f3f3f3] text-[#44474e]'
                    }`}
                  >
                    <QrCode className="w-7 h-7 text-[#735c00]" />
                    <span className="text-xs font-bold">QRIS Instant</span>
                  </button>

                  {/* Transfer Bank */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('transfer')}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 cursor-pointer transition-all ${
                      selectedMethod === 'transfer'
                        ? 'border-[#000a1e] ring-2 ring-[#000a1e] bg-[#f0f4f9] text-[#000a1e]'
                        : 'border-[#c4c6cf] hover:bg-[#f3f3f3] text-[#44474e]'
                    }`}
                  >
                    <Wallet className="w-7 h-7 text-[#002147]" />
                    <span className="text-xs font-bold">Transfer Mandiri</span>
                  </button>
                </div>

                {/* Bank selection if VA */}
                {selectedMethod === 'va' && (
                  <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2] space-y-2 mb-4">
                    <p className="text-xs font-semibold text-[#1a1c1c]">Pilih Bank Virtual Account Tujuan:</p>
                    <div className="flex flex-wrap gap-2">
                      {(['bca', 'mandiri', 'bri', 'bni'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setVaBank(b)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg border uppercase transition-all ${
                            vaBank === b
                              ? 'bg-[#000a1e] text-white border-[#000a1e]'
                              : 'bg-white text-[#44474e] border-[#c4c6cf] hover:border-[#000a1e]'
                          }`}
                        >
                          Bank {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Payment Button */}
                <button
                  type="button"
                  disabled={selectedBills.length === 0}
                  onClick={() => setPaymentModalOpen(true)}
                  className={`w-full py-4 rounded-xl font-bold text-sm md:text-base transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    selectedBills.length > 0
                      ? 'bg-[#735c00] text-white hover:bg-[#574500]'
                      : 'bg-[#e2e2e2] text-[#74777f] cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#ffe088]" />
                  {selectedBills.length > 0
                    ? `Kirim Pembayaran Rp ${totalAmount.toLocaleString('id-ID')} ke Akun ${activeStudent.name}`
                    : 'Pilih Minimal 1 Komponen Tagihan'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Account Privacy Notice & Guidance (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Privacy Guarantee Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e2] space-y-4 border-t-4 border-t-[#000a1e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#000a1e] text-[#ffe088] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#000a1e]">
                    Garansi Keamanan Akun
                  </h3>
                  <p className="text-[11px] text-[#74777f]">Pencatatan Otomatis & Terenkripsi</p>
                </div>
              </div>

              <div className="text-xs text-[#44474e] space-y-2 border-t border-[#e2e2e2] pt-3 leading-relaxed">
                <p>
                  1. Setiap transaksi publik yang diselesaikan melalui formulir ini akan langsung masuk ke database akun siswa terkait.
                </p>
                <p>
                  2. Riwayat lengkap pembayaran lunas hanya dapat diakses setelah siswa/orang tua login ke Portal Akun Siswa.
                </p>
                <p>
                  3. Bukti kwitansi dan invoice digital akan diterbitkan otomatis dengan nomor referensi unik.
                </p>
              </div>
            </div>

            {/* Quick Access Portal Link */}
            <div className="bg-[#f0f4f9] p-6 rounded-2xl border border-[#c4c6cf] space-y-3 text-center">
              <Receipt className="w-8 h-8 text-[#002147] mx-auto" />
              <h4 className="font-headline text-base font-bold text-[#000a1e]">
                Ingin Cek Riwayat Pembayaran Pribadi?
              </h4>
              <p className="text-xs text-[#44474e]">
                Login ke Portal Siswa untuk melihat kartu pelajar digital, riwayat transaksi lunas, dan mengunduh kuitansi resmi.
              </p>
              <a
                href="#portal"
                onClick={() => {
                  const navPortal = document.querySelector('button[data-tab="portal"]') as HTMLElement;
                  if (navPortal) navPortal.click();
                }}
                className="inline-block w-full bg-[#000a1e] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#002147] transition-all"
              >
                Buka Portal Login Siswa
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Interactive Payment Gateway Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#e2e2e2] relative space-y-5">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-[#74777f] hover:text-[#1a1c1c]"
            >
              <X className="w-6 h-6" />
            </button>

            {paymentSuccessMsg ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#000a1e]">
                  Pembayaran Berhasil!
                </h3>
                <p className="text-xs text-[#44474e] leading-relaxed">{paymentSuccessMsg}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="bg-[#002147] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Konfirmasi Transaksi Akun Siswa
                  </span>
                  <h3 className="font-headline text-xl md:text-2xl font-bold text-[#000a1e] mt-2">
                    {selectedMethod === 'va'
                      ? `Virtual Account ${vaBank.toUpperCase()}`
                      : selectedMethod === 'qris'
                      ? 'Scan QRIS PKBM AL-ABROR'
                      : 'Transfer Bank Mandiri'}
                  </h3>
                  <p className="text-xs text-[#74777f] mt-0.5">
                    Ditujukan Ke Akun: <strong>{activeStudent.name}</strong> (NIS: {activeStudent.nis})
                  </p>
                </div>

                {/* Amount to pay */}
                <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] flex justify-between items-center">
                  <span className="text-xs text-[#44474e]">Total Transfer:</span>
                  <span className="font-headline text-xl font-bold text-[#735c00]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Method Details */}
                {selectedMethod === 'va' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#1a1c1c]">Nomor Virtual Account:</label>
                    <div className="flex items-center justify-between p-3 bg-[#eeeeee] rounded-xl border border-[#c4c6cf]">
                      <span className="font-mono text-base font-bold text-[#000a1e]">
                        88900{activeStudent.nis}
                      </span>
                      <button
                        onClick={() => handleCopy(`88900${activeStudent.nis}`)}
                        className="text-xs font-bold text-[#000a1e] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedText ? 'Tersalin!' : 'Salin Nomor'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedMethod === 'qris' && (
                  <div className="text-center space-y-2">
                    <div className="w-48 h-48 bg-white border-2 border-[#000a1e] rounded-xl mx-auto p-2 flex flex-col items-center justify-center shadow-inner">
                      <div className="w-full h-full bg-[#000a1e] p-2 rounded flex items-center justify-center text-white text-[10px] text-center font-mono">
                        [QRIS PKBM AL-ABROR]
                        <br />
                        NMID: ID10202499120
                        <br />
                        {activeStudent.name}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#74777f]">
                      Scan dengan GoPay, OVO, Dana, ShopeePay, atau m-Banking
                    </p>
                  </div>
                )}

                {selectedMethod === 'transfer' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] space-y-1">
                      <p className="font-bold text-[#000a1e]">Bank Mandiri - PKBM AL-ABROR</p>
                      <p className="font-mono text-sm text-[#735c00]">137-00-1234567-8</p>
                      <p className="text-[11px] text-[#74777f]">a.n YAYASAN AL-ABROR UTAMA</p>
                    </div>
                  </div>
                )}

                {/* Action simulation */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleSimulatePay}
                    className="w-full bg-[#000a1e] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#002147] transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#ffe088]" />
                    Simulasi Konfirmasi Transfer Berhasil
                  </button>
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="w-full text-xs font-semibold text-[#74777f] hover:text-[#1a1c1c] py-2 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
