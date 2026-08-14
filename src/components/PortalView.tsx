import React, { useState } from 'react';
import { UserRole, StudentData, PPDBRegistration, PPDBVerificationSettings, UserAccount, NavTab } from '../types';
import { INITIAL_STUDENTS, INITIAL_PPDB_REGISTRATIONS, INITIAL_PAYMENT_HISTORY, DEFAULT_PPDB_VERIFICATION_SETTINGS, INITIAL_USER_ACCOUNTS } from '../data/mockData';
import { getStoredSiteConfig } from '../data/siteConfig';
import { AdminGoogleSheetsSync } from './AdminGoogleSheetsSync';
import { SuperadminDashboard } from './SuperadminDashboard';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  Plus,
  BookOpen,
  Award,
  Calendar,
  Download,
  Search,
  ShieldAlert,
  X,
  CreditCard,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

interface PortalViewProps {
  ppdbList?: PPDBRegistration[];
  setPpdbList?: React.Dispatch<React.SetStateAction<PPDBRegistration[]>>;
  ppdbSettings?: PPDBVerificationSettings;
  setPpdbSettings?: React.Dispatch<React.SetStateAction<PPDBVerificationSettings>>;
  students?: StudentData[];
  setStudents?: React.Dispatch<React.SetStateAction<StudentData[]>>;
  userAccounts?: UserAccount[];
  setUserAccounts?: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  setActiveTab?: (tab: NavTab) => void;
}

export const PortalView: React.FC<PortalViewProps> = ({
  ppdbList: propPpdbList,
  setPpdbList: propSetPpdbList,
  ppdbSettings: propPpdbSettings,
  setPpdbSettings: propSetPpdbSettings,
  students: propStudents,
  setStudents: propSetStudents,
  userAccounts: propUserAccounts,
  setUserAccounts: propSetUserAccounts,
  setActiveTab,
}) => {
  // Fallback Internal State if Props Not Supplied
  const [internalStudents, setInternalStudents] = useState<StudentData[]>(INITIAL_STUDENTS);
  const [internalPpdbList, setInternalPpdbList] = useState<PPDBRegistration[]>(INITIAL_PPDB_REGISTRATIONS);
  const [internalPpdbSettings, setInternalPpdbSettings] = useState<PPDBVerificationSettings>(DEFAULT_PPDB_VERIFICATION_SETTINGS);
  const [internalUserAccounts, setInternalUserAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);

  const students = propStudents || internalStudents;
  const setStudents = propSetStudents || setInternalStudents;
  const ppdbList = propPpdbList || internalPpdbList;
  const setPpdbList = propSetPpdbList || setInternalPpdbList;
  const ppdbSettings = propPpdbSettings || internalPpdbSettings;
  const setPpdbSettings = propSetPpdbSettings || setInternalPpdbSettings;
  const userAccounts = propUserAccounts || internalUserAccounts;
  const setUserAccounts = propSetUserAccounts || setInternalUserAccounts;

  // Login State
  const [selectedRole, setSelectedRole] = useState<UserRole>('superadmin');
  const [username, setUsername] = useState('superadmin@pkbmalabror.sch.id');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUserRole, setActiveUserRole] = useState<UserRole>('superadmin');
  const [adminSubTab, setAdminSubTab] = useState<'ppdb' | 'siswa' | 'sheets'>('ppdb');
  
  // New Student Modal
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newNis, setNewNis] = useState('202400126');
  const [newName, setNewName] = useState('');
  const [newProgram, setNewProgram] = useState<'Paket A' | 'Paket B' | 'Paket C'>('Paket C');

  // Auto-fill shortcut
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'superadmin') {
      setUsername('superadmin@pkbmalabror.sch.id');
      setPassword('superadmin123');
    } else if (role === 'admin') {
      setUsername('admin@pkbmalabror.sch.id');
      setPassword('admin123');
    } else if (role === 'guru') {
      setUsername('guru.fauzan@pkbmalabror.sch.id');
      setPassword('guru123');
    } else {
      setUsername('202400123');
      setPassword('siswa123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveUserRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // PPDB Approval Actions
  const handleApprovePPDB = (id: string) => {
    setPpdbList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Lulus Verifikasi' } : item
      )
    );
  };

  const handleRejectPPDB = (id: string) => {
    setPpdbList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Ditolak' } : item
      )
    );
  };

  // Add Student Action
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const newS: StudentData = {
      id: `s_${Date.now()}`,
      nis: newNis,
      name: newName,
      program: newProgram,
      classGrade: 'Kelas 10',
      status: 'Aktif',
      parentName: 'Orang Tua ' + newName,
      parentPhone: '081234567890',
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [newS, ...prev]);
    setAddStudentModalOpen(false);
    setNewName('');
  };

  return (
    <div className="w-full min-h-[85vh] pt-24 pb-20 px-4 md:px-12 bg-[#000a1e]/95 relative flex items-center justify-center">
      {/* Background Library Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQqYvE_HAt1f0l4yD7f5Z8qZ_7s5W1s_6vY4t5U_5_U6q_6vY4t5U_5_U6q_6vY4t5U_5_U6q_6vY4t5U_5_U6"
          alt="Library Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[#000a1e]/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1280px]">
        {!isLoggedIn ? (
          /* Login Card View */
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-[#e2e2e2] overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-[#002147] text-white p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#735c00] text-white flex items-center justify-center mx-auto mb-3 shadow">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="font-headline text-2xl font-bold">Portal Management</h1>
              <p className="text-xs text-blue-100 mt-1">PKBM AL-ABROR Academic Portal</p>
            </div>

            {/* Role Tabs */}
            <div className="flex border-b border-[#e2e2e2] bg-[#f9f9f9]">
              {(['superadmin', 'admin', 'guru', 'siswa'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleTabChange(role)}
                  className={`flex-1 py-3 text-[11px] md:text-xs font-bold capitalize transition-colors cursor-pointer border-b-2 ${
                    selectedRole === role
                      ? 'border-[#000a1e] text-[#000a1e] bg-white'
                      : 'border-transparent text-[#74777f] hover:text-[#1a1c1c]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                  {selectedRole === 'siswa' ? 'NIS (Nomor Induk Siswa)' : 'Email / Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#74777f] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#c4c6cf] text-sm focus:border-[#000a1e] focus:ring-1 focus:ring-[#000a1e] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#74777f] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[#c4c6cf] text-sm focus:border-[#000a1e] focus:ring-1 focus:ring-[#000a1e] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#74777f] hover:text-[#1a1c1c]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#44474e]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#000a1e] focus:ring-[#000a1e]"
                  />
                  <span>Ingat Saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Fitur reset password telah dikirim ke email panitia.')}
                  className="text-[#735c00] hover:underline font-semibold"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#000a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#002147] transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Masuk ke Dashboard
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#74777f] block">
                  Uji coba cepat: Klik tab di atas untuk autofill kredensial demo.
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* Dashboard Views when logged in */
          <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e2e2] overflow-hidden p-6 md:p-8 animate-fadeIn text-[#1a1c1c]">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#e2e2e2] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#002147] text-white flex items-center justify-center font-bold text-lg shadow">
                  {activeUserRole.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-bold text-[#000a1e]">
                    Dashboard {activeUserRole.toUpperCase()}
                  </h2>
                  <p className="text-xs text-[#74777f]">
                    Selamat datang kembali, {username}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-[#f3f3f3] hover:bg-red-50 text-red-700 px-4 py-2 rounded-lg text-xs font-semibold border border-red-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar Portal
              </button>
            </div>

            {/* Role Specific Content */}
            {activeUserRole === 'superadmin' && (
              <SuperadminDashboard
                ppdbList={ppdbList}
                setPpdbList={setPpdbList}
                students={students}
                setStudents={setStudents}
                ppdbSettings={ppdbSettings}
                setPpdbSettings={setPpdbSettings}
                userAccounts={userAccounts}
                setUserAccounts={setUserAccounts}
                isAuthenticated={isLoggedIn}
                userRole={activeUserRole}
              />
            )}

            {activeUserRole === 'admin' && (
              <div className="space-y-8">
                {/* Superadmin Quick Access Banner */}
                <div className="bg-[#002147]/5 p-4 rounded-xl border border-[#002147]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#735c00]" />
                    <div>
                      <p className="text-xs font-bold text-[#000a1e]">Superadmin Data Control Center Tersedia</p>
                      <p className="text-[11px] text-[#74777f]">Akses fitur pengolahan data langsung (PPDB, Siswa, Keuangan SPP, Guru & Sync Sheets).</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveUserRole('superadmin')}
                    className="bg-[#000a1e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#002147] transition-all shrink-0 cursor-pointer"
                  >
                    Buka Dashboard Superadmin
                  </button>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2]">
                    <span className="text-xs text-[#74777f] block">Total Siswa Aktif</span>
                    <span className="font-headline text-2xl font-bold text-[#000a1e]">1,240</span>
                  </div>
                  <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2]">
                    <span className="text-xs text-[#74777f] block">PPDB Menunggu</span>
                    <span className="font-headline text-2xl font-bold text-[#735c00]">
                      {ppdbList.filter((p) => p.status === 'Menunggu Verifikasi').length}
                    </span>
                  </div>
                  <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2]">
                    <span className="text-xs text-[#74777f] block">Pembayaran Terverifikasi</span>
                    <span className="font-headline text-2xl font-bold text-emerald-700">Rp 42.5M</span>
                  </div>
                  <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2]">
                    <span className="text-xs text-[#74777f] block">Jumlah Rombel/Kelas</span>
                    <span className="font-headline text-2xl font-bold text-[#000a1e]">12 Kelas</span>
                  </div>
                </div>

                {/* Sub Navigation */}
                <div className="flex border-b border-[#e2e2e2] gap-6 overflow-x-auto">
                  <button
                    onClick={() => setAdminSubTab('ppdb')}
                    className={`pb-2 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'ppdb'
                        ? 'border-[#000a1e] text-[#000a1e]'
                        : 'border-transparent text-[#74777f]'
                    }`}
                  >
                    Verifikasi PPDB Baru ({ppdbList.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('siswa')}
                    className={`pb-2 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'siswa'
                        ? 'border-[#000a1e] text-[#000a1e]'
                        : 'border-transparent text-[#74777f]'
                    }`}
                  >
                    Kelola Data Siswa ({students.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('sheets')}
                    className={`pb-2 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      adminSubTab === 'sheets'
                        ? 'border-[#735c00] text-[#735c00]'
                        : 'border-transparent text-[#74777f]'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#735c00]" />
                    Backend Google Sheets
                  </button>
                </div>

                {/* Sub Tab Content */}
                {adminSubTab === 'ppdb' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#f3f3f3] text-[#000a1e] uppercase font-bold">
                        <tr>
                          <th className="p-3">No Reg</th>
                          <th className="p-3">Nama Pendaftar</th>
                          <th className="p-3">Program</th>
                          <th className="p-3">Orang Tua</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e2e2]">
                        {ppdbList.map((p) => (
                          <tr key={p.id} className="hover:bg-[#f9f9f9]">
                            <td className="p-3 font-mono font-bold">{p.regNumber}</td>
                            <td className="p-3 font-semibold">{p.fullName}</td>
                            <td className="p-3 uppercase">{p.program.replace('_', ' ')}</td>
                            <td className="p-3">{p.parentName} ({p.parentPhone})</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  p.status === 'Lulus Verifikasi'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.status === 'Ditolak'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {p.status === 'Menunggu Verifikasi' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePPDB(p.id)}
                                    className="bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-emerald-800"
                                  >
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleRejectPPDB(p.id)}
                                    className="bg-red-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-red-700"
                                  >
                                    Tolak
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : adminSubTab === 'siswa' ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-base text-[#000a1e]">Daftar Siswa Terdaftar</h3>
                      <button
                        onClick={() => setAddStudentModalOpen(true)}
                        className="bg-[#000a1e] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#002147] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Tambah Siswa Baru
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#f3f3f3] text-[#000a1e] uppercase font-bold">
                          <tr>
                            <th className="p-3">NIS</th>
                            <th className="p-3">Nama Siswa</th>
                            <th className="p-3">Program</th>
                            <th className="p-3">Kelas</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e2e2]">
                          {students.map((s) => (
                            <tr key={s.id} className="hover:bg-[#f9f9f9]">
                              <td className="p-3 font-mono font-bold">{s.nis}</td>
                              <td className="p-3 font-semibold">{s.name}</td>
                              <td className="p-3">{s.program}</td>
                              <td className="p-3">{s.classGrade}</td>
                              <td className="p-3">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <AdminGoogleSheetsSync ppdbList={ppdbList} studentsList={students} />
                )}
              </div>
            )}

            {activeUserRole === 'guru' && (
              <div className="space-y-6">
                <div className="bg-[#f9f9f9] p-6 rounded-xl border border-[#e2e2e2]">
                  <h3 className="font-headline text-xl font-bold text-[#000a1e] mb-2">
                    Jadwal Mengajar Hari Ini
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-[#e2e2e2] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-[#000a1e]">Bahasa Indonesia (Paket C - Kelas 10)</span>
                        <p className="text-xs text-[#74777f]">13.00 - 15.00 WIB | Ruang A-1</p>
                      </div>
                      <button className="bg-[#735c00] text-white px-3 py-1.5 rounded text-xs font-semibold">
                        Input Absensi
                      </button>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#e2e2e2] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-[#000a1e]">English British Conversation</span>
                        <p className="text-xs text-[#74777f]">15.30 - 17.00 WIB | Lab Bahasa / Zoom</p>
                      </div>
                      <button className="bg-[#000a1e] text-white px-3 py-1.5 rounded text-xs font-semibold">
                        Buka E-Learning
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeUserRole === 'siswa' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kartu Pelajar Digital */}
                  {(() => {
                    const currentConfig = getStoredSiteConfig();
                    return (
                      <div className="bg-gradient-to-br from-[#000a1e] via-[#002147] to-[#000a1e] text-white p-6 rounded-2xl shadow-lg border border-[#e2e2e2] relative overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-2.5">
                              {currentConfig.logoUrl ? (
                                <img
                                  src={currentConfig.logoUrl}
                                  alt={currentConfig.schoolName}
                                  className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-amber-300 shrink-0"
                                />
                              ) : (
                                <GraduationCap className="w-8 h-8 text-[#ffe088] shrink-0" />
                              )}
                              <div>
                                <span className="text-[9px] text-[#ffe088] font-bold uppercase tracking-widest block">
                                  KARTU PELAJAR DIGITAL
                                </span>
                                <h4 className="font-headline text-sm font-bold leading-tight">{currentConfig.schoolName}</h4>
                              </div>
                            </div>
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-400/30">
                              KTS DIGITAL
                            </span>
                          </div>

                          <div className="flex gap-4 items-center mb-4">
                            <div className="w-16 h-20 bg-slate-800 rounded-lg overflow-hidden border-2 border-[#ffe088] shrink-0 shadow flex items-center justify-center">
                              <img
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
                                alt="Ahmad Fauzi"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-headline text-lg font-bold text-white leading-tight">Ahmad Fauzi</p>
                              <p className="text-xs text-amber-300 font-mono font-bold">NIS: 202400123</p>
                              <p className="text-[11px] text-blue-100">Paket C (Setara SMA)</p>
                              <span className="inline-block text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded font-semibold">
                                ✓ Siswa Aktif
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="pt-3 border-t border-white/20 flex justify-between items-center text-[10px] text-blue-200 mb-3">
                            <span>{currentConfig.npsn ? `NPSN: ${currentConfig.npsn}` : 'Terakreditasi B'}</span>
                            <span>TA 2024/2025</span>
                          </div>
                          <button
                            onClick={() => alert('Mengunduh Rapor Digital Paket C...')}
                            className="w-full bg-[#735c00] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#574500] transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                          >
                            <Download className="w-3.5 h-3.5 text-[#ffe088]" /> Unduh Rapor Digital
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Personal Student Payment Account Dashboard */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#e2e2e2] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#735c00]" />
                        <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                          Akun Keuangan & Riwayat Pembayaran Saya
                        </h3>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        Terverifikasi Lunas
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-[#74777f]">
                        Riwayat Transaksi Resmi (Khusus Akun NIS 202400123):
                      </div>

                      <div className="space-y-2">
                        {INITIAL_PAYMENT_HISTORY.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 bg-[#f9f9f9] rounded-xl border border-[#e2e2e2] flex justify-between items-center gap-3 hover:border-[#000a1e] transition-all"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-[#1a1c1c]">{p.title}</span>
                                <span className="text-[10px] font-mono text-[#735c00] font-bold">
                                  {p.referenceNo}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#74777f] mt-0.5">
                                {p.date} &bull; Via {p.method}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-headline font-bold text-sm text-[#000a1e] block">
                                Rp {p.amount.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-right">
                        <button
                          onClick={() => alert('Mencetak kuitansi resmi pembayaran...')}
                          className="text-xs text-[#000a1e] font-bold hover:underline flex items-center justify-end gap-1"
                        >
                          <Download className="w-3.5 h-3.5 text-[#735c00]" />
                          Cetak Kwitansi Pembayaran Resmi (PDF)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-[#e2e2e2] text-[#1a1c1c]">
            <button
              onClick={() => setAddStudentModalOpen(false)}
              className="absolute top-4 right-4 text-[#74777f]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-headline text-xl font-bold text-[#000a1e] mb-4">
              Tambah Siswa Baru
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">NIS</label>
                <input
                  type="text"
                  required
                  value={newNis}
                  onChange={(e) => setNewNis(e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg bg-[#f9f9f9]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama Siswa"
                  className="w-full p-2 text-sm border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Program</label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value as any)}
                  className="w-full p-2 text-sm border rounded-lg bg-white"
                >
                  <option value="Paket A">Paket A (Setara SD)</option>
                  <option value="Paket B">Paket B (Setara SMP)</option>
                  <option value="Paket C">Paket C (Setara SMA)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#000a1e] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002147]"
              >
                Simpan Siswa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
