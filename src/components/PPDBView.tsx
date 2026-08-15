import React, { useState } from 'react';
import { NavTab, PPDBRegistration, PPDBVerificationSettings } from '../types';
import { DEFAULT_PPDB_VERIFICATION_SETTINGS, INITIAL_PPDB_REGISTRATIONS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { DapodikPrintSheet } from './DapodikPrintSheet';
import { generateRegNumber, resolveDefaultPassword, getRegistrationFeeForProgram, getProgramFeeDetails, getNewStudentFeeDetails, getActiveStudentFeeDetails, getProgramLabel } from '../utils/ppdbUtils';
import {
  User,
  GraduationCap,
  Users,
  Upload,
  Lock,
  Send,
  CheckCircle,
  FileText,
  Badge,
  Baby,
  FileCheck,
  ListOrdered,
  MessageCircle,
  X,
  Printer,
  ArrowRight,
  MapPin,
  HeartHandshake,
  Activity,
  Award,
  ChevronRight,
  ChevronLeft,
  Building,
  Image as ImageIcon,
  Check,
  Search,
  CreditCard,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  QrCode,
} from 'lucide-react';

interface PPDBViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenConsultation: () => void;
  ppdbList?: PPDBRegistration[];
  setPpdbList?: React.Dispatch<React.SetStateAction<PPDBRegistration[]>>;
  ppdbSettings?: PPDBVerificationSettings;
}

export const PPDBView: React.FC<PPDBViewProps> = ({
  setActiveTab,
  onOpenConsultation,
  ppdbList: propPpdbList,
  setPpdbList: propSetPpdbList,
  ppdbSettings: propPpdbSettings,
}) => {
  const [internalPpdbList, setInternalPpdbList] = useState<PPDBRegistration[]>(INITIAL_PPDB_REGISTRATIONS);
  const activePpdbList = propPpdbList || internalPpdbList;
  const updatePpdbList = propSetPpdbList || setInternalPpdbList;
  const activeSettings = propPpdbSettings || DEFAULT_PPDB_VERIFICATION_SETTINGS;

  // View Switch: 'form' (Form DAPODIK) vs 'status' (Cek Status Verifikasi & Payment Realtime)
  const [viewMode, setViewMode] = useState<'form' | 'status'>('form');
  const [printDapodikData, setPrintDapodikData] = useState<PPDBRegistration | null>(null);

  // Realtime Status Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<PPDBRegistration | null>(null);
  const [paymentProofRef, setPaymentProofRef] = useState('');
  const [uploadedReceiptName, setUploadedReceiptName] = useState('');
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // Active Form Tab / Step Index (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // 1. REGISTRASI & PROGRAM
  const [jenisPendaftaran, setJenisPendaftaran] = useState<'Siswa Baru' | 'Pindahan' | 'Kembali Belajar'>('Siswa Baru');
  const [program, setProgram] = useState<'paket_a' | 'paket_b' | 'paket_c' | ''>('');
  const [sekolahAsal, setSekolahAsal] = useState('');
  const [npsnAsal, setNpsnAsal] = useState('');
  const [noIjazahSkl, setNoIjazahSkl] = useState('');
  const [citaCita, setCitaCita] = useState('');
  const [hobi, setHobi] = useState('');

  // 2. DATA PRIBADI SISWA
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [nisn, setNisn] = useState('');
  const [nik, setNik] = useState('');
  const [pob, setPob] = useState('');
  const [dob, setDob] = useState('');
  const [religion, setReligion] = useState<'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya'>('Islam');
  const [kewarganegaraan, setKewarganegaraan] = useState<'WNI' | 'WNA'>('WNI');
  const [kebutuhanKhusus, setKebutuhanKhusus] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 3. ALAMAT TEMPAT TINGGAL
  const [alamatJalan, setAlamatJalan] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [dusunKelurahan, setDusunKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupatenKota, setKabupatenKota] = useState('');
  const [provinsi, setProvinsi] = useState('Jawa Barat');
  const [kodePos, setKodePos] = useState('');
  const [tempatTinggal, setTempatTinggal] = useState<'Bersama Orang Tua' | 'Wali' | 'Kos' | 'Asrama' | 'Lainnya'>('Bersama Orang Tua');
  const [transportasi, setTransportasi] = useState<'Jalan Kaki' | 'Sepeda' | 'Motor' | 'Mobil' | 'Angkutan Umum' | 'Lainnya'>('Motor');

  // 4. DATA ORANG TUA & WALI
  // Ayah
  const [parentName, setParentName] = useState(''); // Nama Ayah
  const [nikAyah, setNikAyah] = useState('');
  const [tahunLahirAyah, setTahunLahirAyah] = useState('');
  const [pendidikanAyah, setPendidikanAyah] = useState('SMA / Sederajat');
  const [parentJob, setParentJob] = useState(''); // Pekerjaan Ayah
  const [penghasilanAyah, setPenghasilanAyah] = useState('Rp 1.000.000 - Rp 3.000.000');

  // Ibu
  const [namaIbu, setNamaIbu] = useState('');
  const [nikIbu, setNikIbu] = useState('');
  const [tahunLahirIbu, setTahunLahirIbu] = useState('');
  const [pendidikanIbu, setPendidikanIbu] = useState('SMA / Sederajat');
  const [pekerjaanIbu, setPekerjaanIbu] = useState('Ibu Rumah Tangga');
  const [penghasilanIbu, setPenghasilanIbu] = useState('Tidak Berpenghasilan');

  // Wali & Kontak
  const [namaWali, setNamaWali] = useState('');
  const [nikWali, setNikWali] = useState('');
  const [pekerjaanWali, setPekerjaanWali] = useState('');
  const [parentPhone, setParentPhone] = useState(''); // Kontak HP WA

  // 5. DATA PERIODIK & PROGRAM BANTUAN
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [jarakSekolah, setJarakSekolah] = useState('1 - 5 km');
  const [waktuTempuh, setWaktuTempuh] = useState('15 - 30 menit');
  const [jumlahSaudara, setJumlahSaudara] = useState('2');
  const [noKipKksPkh, setNoKipKksPkh] = useState('');

  // 6. UNGGAH BERKAS DOKUMEN
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [akteFile, setAkteFile] = useState<File | null>(null);
  const [ijazahFile, setIjazahFile] = useState<File | null>(null);
  const [pasFotoFile, setPasFotoFile] = useState<File | null>(null);
  const [pasFotoDataUrl, setPasFotoDataUrl] = useState<string>('');
  const [kipFile, setKipFile] = useState<File | null>(null);

  // Modal Bukti Pendaftaran
  const [submittedData, setSubmittedData] = useState<PPDBRegistration | null>(null);

  const stepsList = [
    { id: 1, label: 'Registrasi & Program', icon: GraduationCap },
    { id: 2, label: 'Data Pribadi Siswa', icon: User },
    { id: 3, label: 'Alamat Tempat Tinggal', icon: MapPin },
    { id: 4, label: 'Data Orang Tua & Wali', icon: Users },
    { id: 5, label: 'Data Periodik & Bantuan', icon: Activity },
    { id: 6, label: 'Unggah Berkas DAPODIK', icon: Upload },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nik || !program || !parentName || !parentPhone || !namaIbu) {
      alert('Mohon melengkapi kolom utama: Nama Lengkap Siswa, NIK, Program Pilihan, Nama Ayah & Ibu, serta No. HP WA Kontak.');
      return;
    }

    const regPrefix = activeSettings.regNumberPrefix || 'PPDB-2024-';
    const regNum = generateRegNumber(regPrefix);
    const newReg: PPDBRegistration = {
      id: `ppdb_${Date.now()}`,
      regNumber: regNum,
      photoUrl: pasFotoDataUrl || undefined,
      jenisPendaftaran,
      program: program || 'paket_c',
      sekolahAsal,
      npsnAsal,
      noIjazahSkl,
      citaCita,
      hobi,

      fullName,
      gender,
      nisn,
      nik,
      pob,
      dob,
      religion,
      kewarganegaraan,
      kebutuhanKhusus,
      phone,
      email,

      alamatJalan,
      rtRw,
      dusunKelurahan,
      kecamatan,
      kabupatenKota,
      provinsi,
      kodePos,
      tempatTinggal,
      transportasi,

      parentName,
      nikAyah,
      tahunLahirAyah,
      pendidikanAyah,
      parentJob,
      penghasilanAyah,

      namaIbu,
      nikIbu,
      tahunLahirIbu,
      pendidikanIbu,
      pekerjaanIbu,
      penghasilanIbu,

      namaWali,
      nikWali,
      pekerjaanWali,
      parentPhone,

      tinggiBadan: tinggiBadan ? parseInt(tinggiBadan) : undefined,
      beratBadan: beratBadan ? parseInt(beratBadan) : undefined,
      jarakSekolah,
      waktuTempuh,
      jumlahSaudara: jumlahSaudara ? parseInt(jumlahSaudara) : undefined,
      noKipKksPkh,

      documents: {
        kk: kkFile ? kkFile.name : undefined,
        akte: akteFile ? akteFile.name : undefined,
        ijazah: ijazahFile ? ijazahFile.name : undefined,
        pasFoto: pasFotoFile ? pasFotoFile.name : undefined,
        pasFotoUrl: pasFotoDataUrl || undefined,
        kip: kipFile ? kipFile.name : undefined,
      },
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Menunggu Verifikasi',
      paymentStatus: 'Belum Bayar',
      paymentAmount: getRegistrationFeeForProgram(program, activeSettings),
    };

    setSubmittedData(newReg);
    updatePpdbList((prev) => [newReg, ...prev]);

    try {
      const classIdMap: Record<string, string> = {
        'paket_a': 'SD',
        'paket_b': 'SMP',
        'paket_c': 'SMA'
      };
      
      const { error } = await supabase.from('students').insert({
        nis: regNum,
        name: fullName,
        class_id: classIdMap[program || 'paket_c'] || 'X',
        major: program === 'paket_c' ? 'IPS' : (program === 'paket_b' ? 'Paket B' : 'Paket A'),
        phone: phone || parentPhone,
        email: email || '',
        parent_name: parentName,
        parent_phone: parentPhone,
        address: `${alamatJalan || ''} ${dusunKelurahan || ''} ${kecamatan || ''}`.trim()
      });

      if (error) {
        console.error("Gagal menyimpan pendaftar ke Supabase:", error.message);
      }
    } catch (err) {
      console.error("Database exception:", err);
    }
  };

  const getProgramLabel = (p: string) => {
    switch (p) {
      case 'paket_a': return 'Paket A (Setara SD)';
      case 'paket_b': return 'Paket B (Setara SMP)';
      case 'paket_c': return 'Paket C (Setara SMA)';
      default: return p;
    }
  };

  return (
    <div className="w-full pt-28 pb-20 px-4 md:px-12 bg-[#f9f9f9]">
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <div className="mb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-[#002147] rounded-full text-xs font-bold mb-2">
              <Building className="w-4 h-4 text-[#735c00]" />
              Formulir Pendaftaran Peserta Didik Standar DAPODIK Kemendikbudristek RI
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-[#000a1e] leading-tight">
              Pendaftaran PPDB & Data Pokok Pendidikan (DAPODIK)
            </h1>
            <p className="text-sm text-[#44474e] max-w-3xl mt-1 leading-relaxed">
              Silakan isi formulir resmi pendaftaran berikut dengan data yang valid sesuai dengan dokumen resmi (Akta Kelahiran, Kartu Keluarga, Ijazah Terakhir) untuk proses sinkronisasi NISN dan Dapodik Nasional.
            </p>
          </div>

          <div className="bg-white border border-[#e2e2e2] px-4 py-3 rounded-xl shadow-sm text-xs space-y-1 self-stretch md:self-auto shrink-0">
            <p className="font-bold text-[#000a1e] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#735c00]" />
              Status Akreditasi Lembaga
            </p>
            <p className="text-[#74777f]">Terakreditasi BAN PDM & Terdaftar Kemendikbud</p>
          </div>
        </div>

        {/* SUBTAB MODE SWITCHER: FORM DAPODIK vs CEK STATUS VERIFIKASI & TAGIHAN REALTIME */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-[#e2e2e2] shadow-sm mb-8 max-w-2xl mx-auto md:mx-0">
          <button
            onClick={() => setViewMode('form')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'form'
                ? 'bg-[#000a1e] text-white shadow-md'
                : 'text-[#74777f] hover:text-[#1a1c1c] hover:bg-gray-50'
            }`}
          >
            <FileText className={`w-4 h-4 ${viewMode === 'form' ? 'text-[#ffe088]' : 'text-gray-500'}`} />
            1. Formulir Pendaftaran DAPODIK
          </button>

          <button
            onClick={() => setViewMode('status')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'status'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-[#74777f] hover:text-[#1a1c1c] hover:bg-gray-50'
            }`}
          >
            <Search className={`w-4 h-4 ${viewMode === 'status' ? 'text-[#ffe088]' : 'text-emerald-700'}`} />
            2. Cek Status Verifikasi & Payment Realtime
          </button>
        </div>

        {/* VIEW MODE 2: CEK STATUS VERIFIKASI & PEMBAYARAN REALTIME */}
        {viewMode === 'status' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Search Input Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#e2e2e2] shadow-sm space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="font-headline text-2xl font-bold text-[#000a1e]">
                  Cek Status Verifikasi Data & Tagihan PPDB
                </h2>
                <p className="text-xs text-[#74777f]">
                  Masukkan Nomor Registrasi (DAPODIK-xxxx) atau NIK atau Nama Lengkap calon peserta didik untuk memeriksa hasil verifikasi secara realtime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-[#74777f] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: DAPODIK-2024-88392 atau NIK 320701..."
                    className="w-full pl-11 pr-4 py-2.5 text-sm border border-[#c4c6cf] rounded-xl outline-none focus:border-[#000a1e] font-mono"
                  />
                </div>
              </div>

              {/* Sample Quick Chips for Testing */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#74777f]">
                <span className="font-bold text-[11px] text-[#000a1e]">Pencarian Cepat:</span>
                {activePpdbList.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSearchQuery(p.regNumber);
                      setSelectedCandidate(p);
                    }}
                    className="bg-[#f0f4f9] hover:bg-emerald-100 hover:text-emerald-900 border border-[#c4c6cf] px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    {p.regNumber} ({p.fullName})
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Result Cards */}
            {(() => {
              const matched = activePpdbList.filter(
                (p) =>
                  p.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.nik.includes(searchQuery) ||
                  p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery.trim() !== '' && matched.length === 0) {
                return (
                  <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <h3 className="font-bold text-base text-rose-900">Data Pendaftaran Tidak Ditemukan</h3>
                    <p className="text-xs text-[#74777f] max-w-md mx-auto">
                      Pastikan Nomor Registrasi atau NIK yang Anda masukkan sudah benar. Jika belum mendaftar, silakan isi Formulir Pendaftaran DAPODIK terlebih dahulu.
                    </p>
                    <button
                      onClick={() => setViewMode('form')}
                      className="px-4 py-2 bg-[#000a1e] text-white rounded-xl text-xs font-bold hover:bg-[#002147] cursor-pointer"
                    >
                      Isi Formulir DAPODIK Sekarang
                    </button>
                  </div>
                );
              }

              const candidateListToDisplay = searchQuery.trim() !== '' ? matched : activePpdbList;

              return (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-[#000a1e] flex items-center justify-between">
                    <span>Hasil Data Pendaftaran ({candidateListToDisplay.length})</span>
                    <span className="text-xs font-normal text-[#74777f]">Pembaruan Otomatis Realtime</span>
                  </h3>

                  {candidateListToDisplay.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#e2e2e2] shadow-sm overflow-hidden p-6 space-y-5"
                    >
                      {/* Header Info */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#e2e2e2]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-[#002147]">{item.regNumber}</span>
                            <span className="text-xs text-[#74777f]">• {item.date}</span>
                          </div>
                          <h4 className="font-headline text-lg font-bold text-[#000a1e]">{item.fullName}</h4>
                          <p className="text-xs text-[#74777f]">
                            Program: <span className="font-bold uppercase text-[#002147]">{item.program.replace('_', ' ')}</span> | NIK: <span className="font-mono">{item.nik}</span>
                          </p>
                        </div>

                        {/* Realtime Status Badge & Print Action */}
                        <div className="text-left sm:text-right flex flex-wrap items-center sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPrintDapodikData(item)}
                            className="px-3 py-1 bg-[#000a1e] hover:bg-[#002147] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#ffe088]" />
                            Cetak DAPODIK (A4)
                          </button>
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow-sm ${
                              item.status === 'Lulus Verifikasi'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : item.status === 'Ditolak'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            }`}
                          >
                            {item.status === 'Lulus Verifikasi' ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-700" /> LULUS VERIFIKASI
                              </>
                            ) : item.status === 'Ditolak' ? (
                              <>
                                <X className="w-4 h-4 text-rose-700" /> VERIFIKASI DITOLAK
                              </>
                            ) : (
                              <>
                                <Activity className="w-4 h-4 text-amber-700" /> MENUNGGU VERIFIKASI
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* STATUS 1: MENUNGGU VERIFIKASI */}
                      {item.status === 'Menunggu Verifikasi' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-900">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-700" />
                            Berkas Pendaftaran Dalam Proses Pemeriksaan Operator
                          </p>
                          <p className="leading-relaxed">
                            Data pendaftaran Anda sedang diproses dan diverifikasi oleh Panitia PPDB PKBM AL-ABROR PALMERAH. Hasil verifikasi & Rincian Tagihan akan muncul secara otomatis di halaman ini setelah disetujui.
                          </p>
                        </div>
                      )}

                      {/* STATUS 2: LULUS VERIFIKASI & RINCIAN TAGIHAN */}
                      {item.status === 'Lulus Verifikasi' && (
                        <div className="space-y-4">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 text-emerald-950">
                            <p className="font-bold text-sm flex items-center gap-2 text-emerald-900">
                              <CheckCircle className="w-5 h-5 text-emerald-700" />
                              Selamat! Berkas DAPODIK Anda Telah Disetujui & Dinyatakan Lulus Verifikasi
                            </p>
                            <p className="leading-relaxed text-emerald-800">
                              Silakan selesaikan pembayaran registrasi awal untuk mengaktifkan Akun Portal Siswa Digital secara langsung.
                            </p>
                          </div>

                          {/* INVOICE & PAYMENT DETAILS GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card A: Rincian Biaya */}
                            {(() => {
                              const programFees = getProgramFeeDetails(item.program, activeSettings);
                              const totalFee = item.paymentAmount || programFees.registrationFee;
                              return (
                                <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-3">
                                  <div className="flex justify-between items-center pb-2 border-b border-[#c4c6cf]">
                                    <div>
                                      <span className="font-bold text-xs text-[#000a1e] block">
                                        Biaya Pendaftaran ({getProgramLabel(item.program)}):
                                      </span>
                                      <span className="text-[10px] text-[#74777f]">Tagihan Registrasi Awal</span>
                                    </div>
                                    <span className="font-mono font-bold text-base text-emerald-800">
                                      Rp {totalFee.toLocaleString('id-ID')}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-[#74777f]">Status Pembayaran:</span>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                        item.paymentStatus === 'Lunas'
                                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                          : item.paymentStatus === 'Menunggu Konfirmasi'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                                      }`}
                                    >
                                      {item.paymentStatus || 'Belum Bayar'}
                                    </span>
                                  </div>

                                  <div className="text-[10px] text-[#44474e] bg-white p-2.5 rounded-lg border border-[#e2e2e2] space-y-1">
                                    <p className="font-bold text-[#000a1e] pb-1 border-b border-[#eeeeee]">
                                      Informasi Tarif Program ({getProgramLabel(item.program)}):
                                    </p>
                                    <div className="flex justify-between">
                                      <span>• Biaya SPP Perbulan:</span>
                                      <span className="font-bold">Rp {programFees.sppMonthly.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Uang Gedung & Sarana:</span>
                                      <span className="font-bold">Rp {programFees.buildingFee.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>• Uang Daftar Ulang:</span>
                                      <span className="font-bold">Rp {programFees.reRegistrationFee.toLocaleString('id-ID')}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Card B: Tujuan Transfer Bank & QRIS */}
                            <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] space-y-2 text-xs">
                              <p className="font-bold text-[#000a1e] flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-[#002147]" />
                                Rekening Resmi Tujuan Pembayaran
                              </p>
                              <div className="bg-gray-50 p-2.5 rounded-lg font-mono space-y-1">
                                <p className="font-bold text-[#002147] text-xs">{activeSettings.bankInfo.bankName}</p>
                                <p className="font-bold text-base text-[#000a1e] tracking-wider">
                                  {activeSettings.bankInfo.accountNumber}
                                </p>
                                <p className="text-[10px] text-[#74777f]">a.n. {activeSettings.bankInfo.accountHolder}</p>
                              </div>
                              <p className="text-[10px] text-[#74777f] italic">
                                * QRIS: {activeSettings.bankInfo.qrisInfo}
                              </p>
                            </div>
                          </div>

                          {/* UPLOAD PROOF OF PAYMENT FORM */}
                          {item.paymentStatus !== 'Lunas' && (
                            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                              <h5 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                                <Upload className="w-4 h-4 text-amber-800" />
                                Konfirmasi & Upload Bukti Pembayaran
                              </h5>

                              {uploadSuccessAlert && (
                                <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                                  Bukti pembayaran berhasil dikirimkan! Panitia akan segera mengonfirmasi status Anda.
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-amber-950 mb-1">
                                    Upload Foto Struk / Tangkapan Layar
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setUploadedReceiptName(e.target.files[0].name);
                                      }
                                    }}
                                    className="w-full text-xs p-1.5 bg-white border rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-amber-950 mb-1">
                                    Nomor Referensi / Catatan Pengirim
                                  </label>
                                  <input
                                    type="text"
                                    value={paymentProofRef}
                                    onChange={(e) => setPaymentProofRef(e.target.value)}
                                    placeholder="Contoh: Transfer BSI an Ahmad..."
                                    className="w-full text-xs p-2 bg-white border rounded-lg"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  updatePpdbList((prev) =>
                                    prev.map((p) =>
                                      p.id === item.id
                                        ? { ...p, paymentStatus: 'Menunggu Konfirmasi', paymentProof: uploadedReceiptName || 'Struk_Pembayaran.jpg' }
                                        : p
                                    )
                                  );
                                  setUploadSuccessAlert(true);
                                  setTimeout(() => setUploadSuccessAlert(false), 5000);
                                }}
                                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5 text-[#ffe088]" />
                                Kirim Konfirmasi Pembayaran Ke Panitia
                              </button>
                            </div>
                          )}

                          {/* PORTAL CREDENTIALS CARD (WHEN LUNAS / PORTAL ACCOUNT CREATED) */}
                          {(item.paymentStatus === 'Lunas' || item.portalAccountCreated) && (
                            <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-indigo-700">
                                <div className="flex items-center gap-2">
                                  <KeyRound className="w-5 h-5 text-[#ffe088]" />
                                  <h5 className="font-headline font-bold text-sm text-[#ffe088]">
                                    Akun Portal Siswa Digital Anda Telah Aktif!
                                  </h5>
                                </div>
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                  AKUN AKTIF
                                </span>
                              </div>

                              <p className="text-xs text-indigo-100">
                                Pembayaran Anda telah terkonfirmasi LUNAS. Gunakan kredensial di bawah ini untuk masuk ke Portal Siswa Digital:
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-950 p-3.5 rounded-xl border border-indigo-700 text-xs font-mono">
                                <div>
                                  <span className="text-indigo-400 block text-[10px]">USERNAME / NIK:</span>
                                  <span className="font-bold text-white text-sm">{item.portalUsername || item.nik}</span>
                                </div>
                                <div>
                                  <span className="text-indigo-400 block text-[10px]">KATA SANDI / PASSWORD:</span>
                                  <span className="font-bold text-amber-300 text-sm">
                                    {item.portalPassword || `${item.regNumber}${item.nik && item.nik.trim().length >= 2 ? item.nik.trim().slice(-2) : '00'}`}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => setActiveTab('portal')}
                                className="w-full py-3 bg-[#ffe088] text-[#000a1e] hover:bg-yellow-300 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                              >
                                🚀 Masuk ke Portal Siswa Digital Sekarang
                                <ArrowRight className="w-4 h-4 text-[#000a1e]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW MODE 1: FORMULIR PENDAFTARAN DAPODIK (Existing Stepper) */}
        {viewMode === 'form' && (
          <div>
            {/* STEPPER NAVIGATOR TABS */}
        <div className="bg-white rounded-2xl border border-[#e2e2e2] shadow-sm p-3 mb-8 overflow-x-auto">
          <div className="flex items-center min-w-[700px] justify-between gap-2">
            {stepsList.map((st) => {
              const Icon = st.icon;
              const isActive = activeStep === st.id;
              const isCompleted = activeStep > st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStep(st.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-1 justify-center ${
                    isActive
                      ? 'bg-[#000a1e] text-white shadow'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-[#f0f4f9] text-[#74777f] hover:bg-[#e2e2e2]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#ffe088] text-[#000a1e]'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#c4c6cf] text-white'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.id}
                  </div>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffe088]' : ''}`} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Area (8 columns) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#e2e2e2] p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: REGISTRASI & PROGRAM */}
              {activeStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-[#735c00]" />
                      Bagian 1: Jenis Registrasi & Pilihan Program (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 1 dari 6
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Jenis Pendaftaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jenisPendaftaran}
                        onChange={(e) => setJenisPendaftaran(e.target.value as any)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none focus:border-[#000a1e]"
                      >
                        <option value="Siswa Baru">Siswa Baru</option>
                        <option value="Pindahan">Pindahan dari Sekolah/PKBM Lain</option>
                        <option value="Kembali Belajar">Kembali Belajar (Drop Out / Putus Sekolah)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Program Pendidikan Kesetaraan <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={program}
                        onChange={(e) => setProgram(e.target.value as any)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none focus:border-[#000a1e]"
                      >
                        <option value="">-- Pilih Program Paket Kesetaraan --</option>
                        <option value="paket_a">Paket A (Setara Sekolah Dasar / SD)</option>
                        <option value="paket_b">Paket B (Setara Sekolah Menengah Pertama / SMP)</option>
                        <option value="paket_c">Paket C (Setara Sekolah Menengah Atas / SMA)</option>
                      </select>
                    </div>

                    {program && (() => {
                      const newFees = getNewStudentFeeDetails(program, activeSettings);
                      const activeFees = getActiveStudentFeeDetails(program, activeSettings);
                      return (
                        <div className="md:col-span-2 bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-3 text-xs animate-fadeIn">
                          <div className="flex justify-between items-center pb-2 border-b border-[#c4c6cf]">
                            <span className="font-bold text-[#000a1e] flex items-center gap-1.5 text-sm">
                              <DollarSign className="w-4 h-4 text-[#735c00]" />
                              Struktur Tarif Resmi: {getProgramLabel(program)}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded">
                              ✓ Disesuaikan oleh Superadmin
                            </span>
                          </div>

                          {/* DUA KATEGORI: SISWA BARU vs SISWA AKTIF */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Pendaftar Baru */}
                            <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1.5 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                                  🌟 Tagihan Pendaftar / Siswa Baru:
                                </span>
                                <span className="font-mono font-bold text-emerald-800 text-xs">
                                  Total: Rp {newFees.totalInitial.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                                <div>• Pendaftaran: <span className="font-mono font-semibold text-gray-900">Rp {newFees.registrationFee.toLocaleString('id-ID')}</span></div>
                                <div>• Gedung & Sarana: <span className="font-mono font-semibold text-gray-900">Rp {newFees.buildingFee.toLocaleString('id-ID')}</span></div>
                                <div>• Seragam & Modul: <span className="font-mono font-semibold text-gray-900">Rp {newFees.uniformModulFee.toLocaleString('id-ID')}</span></div>
                                <div>• SPP Bulan Ke-1: <span className="font-mono font-semibold text-gray-900">Rp {newFees.initialSpp.toLocaleString('id-ID')}</span></div>
                              </div>
                            </div>

                            {/* Siswa Aktif */}
                            <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-1.5 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                                  🎓 Tagihan Siswa Aktif / Berjalan:
                                </span>
                                <span className="font-mono font-bold text-blue-800 text-xs">
                                  SPP: Rp {activeFees.sppMonthly.toLocaleString('id-ID')}/bln
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                                <div>• SPP Bulanan: <span className="font-mono font-semibold text-gray-900">Rp {activeFees.sppMonthly.toLocaleString('id-ID')}</span></div>
                                <div>• Daftar Ulang Smt: <span className="font-mono font-semibold text-gray-900">Rp {activeFees.reRegistrationFee.toLocaleString('id-ID')}</span></div>
                                <div>• Ujian / Evaluasi: <span className="font-mono font-semibold text-gray-900">Rp {activeFees.examEvaluationFee.toLocaleString('id-ID')}</span></div>
                                <div>• Praktikum/Kegiatan: <span className="font-mono font-semibold text-gray-900">Rp {activeFees.activityFee.toLocaleString('id-ID')}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        Nama Sekolah / Lembaga Asal (Sebelumnya)
                      </label>
                      <input
                        type="text"
                        value={sekolahAsal}
                        onChange={(e) => setSekolahAsal(e.target.value)}
                        placeholder="Contoh: SMP Negeri 89 Jakarta / SD IT Al-Azhar"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        NPSN Sekolah Asal (Jika Ada)
                      </label>
                      <input
                        type="text"
                        value={npsnAsal}
                        onChange={(e) => setNpsnAsal(e.target.value)}
                        placeholder="8 digit NPSN Sekolah Asal"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        Nomor Ijazah / SKL Terakhir
                      </label>
                      <input
                        type="text"
                        value={noIjazahSkl}
                        onChange={(e) => setNoIjazahSkl(e.target.value)}
                        placeholder="DN-01/D-SD/13/0012345"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Cita-Cita</label>
                        <input
                          type="text"
                          value={citaCita}
                          onChange={(e) => setCitaCita(e.target.value)}
                          placeholder="Wirausahawan, PNS, Dll"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Hobi</label>
                        <input
                          type="text"
                          value={hobi}
                          onChange={(e) => setHobi(e.target.value)}
                          placeholder="Membaca, Olahraga, Dll"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATA PRIBADI SISWA */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <User className="w-6 h-6 text-[#735c00]" />
                      Bagian 2: Data Identitas Diri Peserta Didik (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 2 dari 6
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Nama Lengkap Siswa (Sesuai Akta Kelahiran / KK) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tuliskan nama lengkap tanpa gelar"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none focus:border-[#000a1e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                          <input
                            type="radio"
                            name="gender"
                            value="L"
                            checked={gender === 'L'}
                            onChange={() => setGender('L')}
                            className="w-4 h-4 text-[#000a1e]"
                          />
                          Laki-Laki
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                          <input
                            type="radio"
                            name="gender"
                            value="P"
                            checked={gender === 'P'}
                            onChange={() => setGender('P')}
                            className="w-4 h-4 text-[#000a1e]"
                          />
                          Perempuan
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        NISN (Nomor Induk Siswa Nasional) - Jika Ada
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        placeholder="10 digit NISN dari sekolah asal"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        NIK / No. KTP Peserta Didik (16 Digit) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        placeholder="Lihat di Kartu Keluarga (16 digit NIK)"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono font-bold p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Tempat Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pob}
                        onChange={(e) => setPob(e.target.value)}
                        placeholder="Kota / Kabupaten Kelahiran"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">Agama & Kepercayaan</label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value as any)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        Kebutuhan Khusus / ABK (Jika Ada)
                      </label>
                      <input
                        type="text"
                        value={kebutuhanKhusus}
                        onChange={(e) => setKebutuhanKhusus(e.target.value)}
                        placeholder="Tidak ada / Tunanetra / Tunarungu / Dll"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">No. HP / WhatsApp Siswa</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Email Aktif Siswa</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="siswa@gmail.com"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ALAMAT TEMPAT TINGGAL */}
              {activeStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-[#735c00]" />
                      Bagian 3: Alamat Lengkap Tempat Tinggal Siswa (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 3 dari 6
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Alamat Jalan / Kampung / Dusun / Komplek <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={alamatJalan}
                        onChange={(e) => setAlamatJalan(e.target.value)}
                        placeholder="Jl. Merdeka No. 45 / Kampung Sukamaju"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">RT / RW</label>
                      <input
                        type="text"
                        value={rtRw}
                        onChange={(e) => setRtRw(e.target.value)}
                        placeholder="002 / 005"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Desa / Kelurahan</label>
                      <input
                        type="text"
                        value={dusunKelurahan}
                        onChange={(e) => setDusunKelurahan(e.target.value)}
                        placeholder="Kelurahan Palmerah"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Kecamatan</label>
                      <input
                        type="text"
                        value={kecamatan}
                        onChange={(e) => setKecamatan(e.target.value)}
                        placeholder="Kecamatan Palmerah"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Kabupaten / Kota</label>
                      <input
                        type="text"
                        value={kabupatenKota}
                        onChange={(e) => setKabupatenKota(e.target.value)}
                        placeholder="Kota Jakarta Barat"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Provinsi</label>
                      <input
                        type="text"
                        value={provinsi}
                        onChange={(e) => setProvinsi(e.target.value)}
                        placeholder="Jawa Barat"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Kode Pos</label>
                      <input
                        type="text"
                        value={kodePos}
                        onChange={(e) => setKodePos(e.target.value)}
                        placeholder="46211"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Status Tempat Tinggal</label>
                      <select
                        value={tempatTinggal}
                        onChange={(e) => setTempatTinggal(e.target.value as any)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none"
                      >
                        <option value="Bersama Orang Tua">Bersama Orang Tua Kandung</option>
                        <option value="Wali">Bersama Wali / Kerabat</option>
                        <option value="Kos">Kos / Sewa</option>
                        <option value="Asrama">Asrama / Pesantren</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Moda Transportasi</label>
                      <select
                        value={transportasi}
                        onChange={(e) => setTransportasi(e.target.value as any)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none"
                      >
                        <option value="Motor">Sepeda Motor</option>
                        <option value="Jalan Kaki">Jalan Kaki</option>
                        <option value="Sepeda">Sepeda</option>
                        <option value="Mobil">Mobil Pribadi</option>
                        <option value="Angkutan Umum">Angkutan Umum / Bus</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DATA ORANG TUA & WALI */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#735c00]" />
                      Bagian 4: Data Orang Tua Kandung & Wali (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 4 dari 6
                    </span>
                  </div>

                  {/* DATA AYAH */}
                  <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-3">
                    <h3 className="font-bold text-xs text-[#000a1e] flex items-center gap-1.5 uppercase tracking-wide">
                      <User className="w-4 h-4 text-indigo-800" />
                      1. Data Ayah Kandung
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#000a1e] mb-1">
                          Nama Ayah Kandung <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          placeholder="Nama lengkap Ayah"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-bold p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">NIK Ayah (16 Digit)</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={nikAyah}
                          onChange={(e) => setNikAyah(e.target.value)}
                          placeholder="NIK Ayah di KK"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-mono p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Tahun Lahir Ayah</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={tahunLahirAyah}
                          onChange={(e) => setTahunLahirAyah(e.target.value)}
                          placeholder="misal: 1978"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-mono p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Pekerjaan Ayah</label>
                        <input
                          type="text"
                          value={parentJob}
                          onChange={(e) => setParentJob(e.target.value)}
                          placeholder="Wiraswasta / Karyawan Swasta / PNS"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Pendidikan Terakhir Ayah</label>
                        <select
                          value={pendidikanAyah}
                          onChange={(e) => setPendidikanAyah(e.target.value)}
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs p-2.5 outline-none"
                        >
                          <option value="SD / Sederajat">SD / Sederajat</option>
                          <option value="SMP / Sederajat">SMP / Sederajat</option>
                          <option value="SMA / Sederajat">SMA / Sederajat</option>
                          <option value="D1 / D2 / D3">D1 / D2 / D3</option>
                          <option value="S1 / D4">S1 / D4</option>
                          <option value="S2 / S3">S2 / S3</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Penghasilan Bulanan Ayah</label>
                        <select
                          value={penghasilanAyah}
                          onChange={(e) => setPenghasilanAyah(e.target.value)}
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs p-2.5 outline-none"
                        >
                          <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
                          <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
                          <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                          <option value="Lebih dari Rp 5.000.000">Lebih dari Rp 5.000.000</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* DATA IBU */}
                  <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-3">
                    <h3 className="font-bold text-xs text-[#000a1e] flex items-center gap-1.5 uppercase tracking-wide">
                      <User className="w-4 h-4 text-purple-800" />
                      2. Data Ibu Kandung
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#000a1e] mb-1">
                          Nama Ibu Kandung <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={namaIbu}
                          onChange={(e) => setNamaIbu(e.target.value)}
                          placeholder="Nama lengkap Ibu Kandung"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-bold p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">NIK Ibu (16 Digit)</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={nikIbu}
                          onChange={(e) => setNikIbu(e.target.value)}
                          placeholder="NIK Ibu di KK"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-mono p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Tahun Lahir Ibu</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={tahunLahirIbu}
                          onChange={(e) => setTahunLahirIbu(e.target.value)}
                          placeholder="misal: 1982"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs font-mono p-2.5 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Pekerjaan Ibu</label>
                        <input
                          type="text"
                          value={pekerjaanIbu}
                          onChange={(e) => setPekerjaanIbu(e.target.value)}
                          placeholder="Ibu Rumah Tangga / Pedagang / PNS"
                          className="w-full rounded-lg border border-[#c4c6cf] bg-white text-xs p-2.5 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WALI & KONTAK */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Nama Wali (Jika Ada)</label>
                      <input
                        type="text"
                        value={namaWali}
                        onChange={(e) => setNamaWali(e.target.value)}
                        placeholder="Nama Paman / Kakek / Wali"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#000a1e] mb-1">
                        Nomor Telepon / WhatsApp Kontak Orang Tua/Wali <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="081234567890 (Aktif WA untuk informasi)"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono font-bold p-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: DATA PERIODIK & BANTUAN */}
              {activeStep === 5 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <Activity className="w-6 h-6 text-[#735c00]" />
                      Bagian 5: Data Periodik & Program Bantuan Kesejahteraan (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 5 dari 6
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Tinggi Badan (cm)</label>
                      <input
                        type="number"
                        value={tinggiBadan}
                        onChange={(e) => setTinggiBadan(e.target.value)}
                        placeholder="165"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Berat Badan (kg)</label>
                      <input
                        type="number"
                        value={beratBadan}
                        onChange={(e) => setBeratBadan(e.target.value)}
                        placeholder="55"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Jumlah Saudara Kandung</label>
                      <input
                        type="number"
                        value={jumlahSaudara}
                        onChange={(e) => setJumlahSaudara(e.target.value)}
                        placeholder="2"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Jarak Rumah ke Sekolah</label>
                      <select
                        value={jarakSekolah}
                        onChange={(e) => setJarakSekolah(e.target.value)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none"
                      >
                        <option value="Kurang dari 1 km">Kurang dari 1 km</option>
                        <option value="1 - 5 km">1 - 5 km</option>
                        <option value="5 - 10 km">5 - 10 km</option>
                        <option value="Lebih dari 10 km">Lebih dari 10 km</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Waktu Tempuh Ke Sekolah</label>
                      <select
                        value={waktuTempuh}
                        onChange={(e) => setWaktuTempuh(e.target.value)}
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-bold p-2.5 outline-none"
                      >
                        <option value="< 15 menit">Kurang dari 15 menit</option>
                        <option value="15 - 30 menit">15 - 30 menit</option>
                        <option value="30 - 60 menit">30 - 60 menit</option>
                        <option value="> 1 jam">Lebih dari 1 jam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                        No. KIP / KKS / PKH (Jika Memiliki Bantuan)
                      </label>
                      <input
                        type="text"
                        value={noKipKksPkh}
                        onChange={(e) => setNoKipKksPkh(e.target.value)}
                        placeholder="Nomor Kartu KIP / KKS / PKH"
                        className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs font-mono p-2.5 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: UNGGAH BERKAS DOKUMEN DAPODIK */}
              {activeStep === 6 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-[#e2e2e2] pb-3 flex items-center justify-between">
                    <h2 className="font-headline text-xl font-bold text-[#000a1e] flex items-center gap-2">
                      <Upload className="w-6 h-6 text-[#735c00]" />
                      Bagian 6: Unggah Berkas Dokumen Persyaratan (DAPODIK)
                    </h2>
                    <span className="text-xs font-mono font-bold bg-[#f0f4f9] px-2.5 py-1 rounded-lg text-[#000a1e]">
                      Langkah 6 dari 6
                    </span>
                  </div>

                  <p className="text-xs text-[#44474e]">
                    Unggah hasil scan/foto dokumen berikut (Format JPG, PNG, atau PDF). Berkas ini akan digunakan untuk proses verifikasi oleh Tim Verifikator Dinas Pendidikan.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* KK */}
                    <div className="border-2 border-dashed border-[#c4c6cf] rounded-xl p-4 text-center hover:border-[#000a1e] transition-all relative flex flex-col items-center justify-center min-h-[120px] bg-[#f9f9f9]">
                      <input
                        type="file"
                        accept=".jpg,.png,.pdf"
                        onChange={(e) => setKkFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Badge className="w-8 h-8 text-[#002147] mb-1" />
                      <p className="font-bold text-xs text-[#1a1c1c]">1. Kartu Keluarga (KK)</p>
                      <p className="text-[11px] text-[#74777f]">
                        {kkFile ? `✓ ${kkFile.name}` : 'Klik unggah berkas'}
                      </p>
                    </div>

                    {/* Akte */}
                    <div className="border-2 border-dashed border-[#c4c6cf] rounded-xl p-4 text-center hover:border-[#000a1e] transition-all relative flex flex-col items-center justify-center min-h-[120px] bg-[#f9f9f9]">
                      <input
                        type="file"
                        accept=".jpg,.png,.pdf"
                        onChange={(e) => setAkteFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Baby className="w-8 h-8 text-[#002147] mb-1" />
                      <p className="font-bold text-xs text-[#1a1c1c]">2. Akta Kelahiran</p>
                      <p className="text-[11px] text-[#74777f]">
                        {akteFile ? `✓ ${akteFile.name}` : 'Klik unggah berkas'}
                      </p>
                    </div>

                    {/* Ijazah */}
                    <div className="border-2 border-dashed border-[#c4c6cf] rounded-xl p-4 text-center hover:border-[#000a1e] transition-all relative flex flex-col items-center justify-center min-h-[120px] bg-[#f9f9f9]">
                      <input
                        type="file"
                        accept=".jpg,.png,.pdf"
                        onChange={(e) => setIjazahFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileCheck className="w-8 h-8 text-[#002147] mb-1" />
                      <p className="font-bold text-xs text-[#1a1c1c]">3. Ijazah / SKL Terakhir</p>
                      <p className="text-[11px] text-[#74777f]">
                        {ijazahFile ? `✓ ${ijazahFile.name}` : 'Klik unggah berkas'}
                      </p>
                    </div>

                    {/* Pas Foto */}
                    <div className="border-2 border-dashed border-[#c4c6cf] rounded-xl p-4 text-center hover:border-[#000a1e] transition-all relative flex flex-col items-center justify-center min-h-[120px] bg-[#f9f9f9]">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPasFotoFile(file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setPasFotoDataUrl(ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setPasFotoDataUrl('');
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {pasFotoDataUrl ? (
                        <div className="flex flex-col items-center gap-1">
                          <img
                            src={pasFotoDataUrl}
                            alt="Pas Foto Preview"
                            className="w-12 h-14 object-cover rounded border border-emerald-500 shadow-sm"
                          />
                          <p className="font-bold text-[11px] text-emerald-800">✓ Foto Siap Terpasang</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-[#002147] mb-1" />
                          <p className="font-bold text-xs text-[#1a1c1c]">4. Pas Foto Formal 3x4</p>
                          <p className="text-[11px] text-[#74777f]">
                            {pasFotoFile ? `✓ ${pasFotoFile.name}` : 'Klik unggah pas foto (JPG/PNG)'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* KIP / KKS / PKH */}
                    <div className="border-2 border-dashed border-[#c4c6cf] rounded-xl p-4 text-center hover:border-[#000a1e] transition-all relative flex flex-col items-center justify-center min-h-[120px] bg-[#f9f9f9]">
                      <input
                        type="file"
                        accept=".jpg,.png,.pdf"
                        onChange={(e) => setKipFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <HeartHandshake className="w-8 h-8 text-[#002147] mb-1" />
                      <p className="font-bold text-xs text-[#1a1c1c]">5. Kartu KIP / KKS / PKH (Jika Memiliki)</p>
                      <p className="text-[11px] text-[#74777f]">
                        {kipFile ? `✓ ${kipFile.name}` : 'Klik unggah berkas'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION CONTROL BUTTONS */}
              <div className="pt-6 border-t border-[#e2e2e2] flex flex-col sm:flex-row justify-between items-center gap-3">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                    className="w-full sm:w-auto px-5 py-2.5 border border-[#c4c6cf] text-[#000a1e] rounded-xl font-bold text-xs hover:bg-[#f0f4f9] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Langkah Sebelumnya
                  </button>
                ) : (
                  <div></div>
                )}

                {activeStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#000a1e] text-white rounded-xl font-bold text-xs hover:bg-[#002147] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    Lanjut Ke Langkah {activeStep + 1}
                    <ChevronRight className="w-4 h-4 text-[#ffe088]" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Send className="w-4 h-4 text-[#ffe088]" />
                    Kirim Formulir DAPODIK Resmi
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar Guidelines Column (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#002147] text-white rounded-2xl shadow-md p-6 relative overflow-hidden">
              <h3 className="font-headline text-lg font-bold text-[#ffe088] mb-3 pb-2 border-b border-white/20 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ffe088]" />
                Petunjuk Pengisian DAPODIK
              </h3>
              <ul className="space-y-2.5 text-xs text-blue-100 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ffe088] shrink-0 mt-0.5" />
                  <span>Isikan NIK & Nama Sesuai Kartu Keluarga (KK) tanpa gelar akademik.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ffe088] shrink-0 mt-0.5" />
                  <span>Pastikan nomor telepon WhatsApp aktif untuk pengiriman NISN.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ffe088] shrink-0 mt-0.5" />
                  <span>Bagi lulusan Paket A/B atau sekolah formal, cantumkan Nomor Ijazah.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-[#e2e2e2] rounded-2xl shadow-sm p-5 space-y-3">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#735c00]" />
                Alur Verifikasi Dapodik
              </h4>
              <div className="space-y-3 text-xs text-[#44474e]">
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#000a1e] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <p>Pengisian formulir online lengkap oleh calon peserta didik.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#f0f4f9] text-[#000a1e] flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <p>Verifikasi data & dokumen oleh Petugas Operator Dapodik Sekolah.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#f0f4f9] text-[#000a1e] flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <p>Penerbitan Bukti Pendaftaran & Penjadwalan Tes Penempatan.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#f0f4f9] text-[#000a1e] flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <p>Sinkronisasi Server Dapodik Kemendikbudristek RI.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
              <p className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-800" />
                Konsultasi & Bantuan Operator
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Kendala pengisian Dapodik atau NIK tidak terbaca? Hubungi Sekretariat PPDB PKBM AL-ABROR.
              </p>
              <button
                onClick={onOpenConsultation}
                className="w-full py-2 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#ffe088]" />
                WhatsApp Operator PPDB
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* REGISTRATION BUKTI TANDA TERIMA FORM DAPODIK MODAL */}
      {submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#e2e2e2] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSubmittedData(null)}
              className="absolute top-4 right-4 text-[#74777f] hover:text-[#1a1c1c]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="bg-[#735c00]/10 text-[#735c00] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Formulir Dapodik Berhasil Disimpan
              </span>
              <h3 className="font-headline text-2xl font-bold text-[#000a1e]">
                Tanda Terima Pendaftaran PPDB DAPODIK
              </h3>
              <p className="text-xs text-[#44474e]">
                Simpan atau cetak nomor registrasi ini untuk verifikasi berkas fisik dan pendaftaran ulang.
              </p>
            </div>

            <div className="bg-[#f0f4f9] border border-[#c4c6cf] rounded-xl p-4 space-y-3 text-xs mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-[#c4c6cf]">
                <span className="text-[#74777f] font-bold">Nomor Registrasi DAPODIK:</span>
                <span className="font-mono font-bold text-base text-[#000a1e]">
                  {submittedData.regNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-[#74777f] block">Nama Lengkap:</span>
                  <span className="font-bold text-[#000a1e]">{submittedData.fullName}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">NIK:</span>
                  <span className="font-mono font-semibold">{submittedData.nik}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">Program Kesetaraan:</span>
                  <span className="font-semibold">{getProgramLabel(submittedData.program)}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">Tempat, Tgl Lahir:</span>
                  <span className="font-semibold">{submittedData.pob}, {submittedData.dob}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">Nama Ayah Kandung:</span>
                  <span className="font-semibold">{submittedData.parentName}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">Nama Ibu Kandung:</span>
                  <span className="font-semibold">{submittedData.namaIbu || '-'}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">No. HP WA Orang Tua:</span>
                  <span className="font-mono font-semibold">{submittedData.parentPhone}</span>
                </div>
                <div>
                  <span className="text-[#74777f] block">Status Verifikasi:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded inline-block">
                    {submittedData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPrintDapodikData(submittedData)}
                className="flex-1 bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-[#ffe088]" /> Cetak Lembar DAPODIK Resmi (A4)
              </button>
              <button
                onClick={() => {
                  setSubmittedData(null);
                  setActiveTab('portal');
                }}
                className="flex-1 bg-[#000a1e] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#002147] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Masuk Portal Siswa
                <ArrowRight className="w-4 h-4 text-[#ffe088]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE DAPODIK FORM MODAL */}
      {printDapodikData && (
        <DapodikPrintSheet data={printDapodikData} onClose={() => setPrintDapodikData(null)} />
      )}
      </div>
    </div>
  );
};
