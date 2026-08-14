import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../lib/googleAuth';
import {
  listUserSpreadsheets,
  createPKBMSpreadsheet,
  getSpreadsheetMeta,
  readSheetRange,
  appendSheetRows,
  DriveFile,
  SheetMeta,
} from '../lib/googleSheets';
import { PPDBRegistration, StudentData } from '../types';
import { INITIAL_PAYMENT_HISTORY } from '../data/mockData';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  Table,
  CheckCircle2,
  AlertCircle,
  Database,
  UploadCloud,
  LogOut,
  UserCheck,
  Layers,
  Code,
  Copy,
  Check,
  BookOpen,
  Info,
  ChevronRight,
  ShieldCheck,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  Activity,
} from 'lucide-react';

interface AdminGoogleSheetsSyncProps {
  ppdbList: PPDBRegistration[];
  studentsList: StudentData[];
}

export const AdminGoogleSheetsSync: React.FC<AdminGoogleSheetsSyncProps> = ({
  ppdbList,
  studentsList,
}) => {
  // Navigation Sub-Tab State
  const [subTab, setSubTab] = useState<'sync' | 'structure' | 'script'>('sync');

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(getAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets state
  const [spreadsheets, setSpreadsheets] = useState<DriveFile[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(
    localStorage.getItem('pkbm_selected_backend_sheet_id') || ''
  );
  const [activeMeta, setActiveMeta] = useState<SheetMeta | null>(null);
  const [activeTabName, setActiveTabName] = useState<string>('PPDB Registrations');
  const [sheetData, setSheetData] = useState<any[][]>([]);

  // Loading & status states
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHeaderTab, setCopiedHeaderTab] = useState<string | null>(null);

  // Selected Sheet Tab Schema for Structure Inspector
  const [inspectTab, setInspectTab] = useState<string>('ppdb');

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Init Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setToken(token);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Drive Spreadsheets on token change
  useEffect(() => {
    if (accessToken) {
      loadDriveSpreadsheets(accessToken);
    }
  }, [accessToken]);

  // Fetch Spreadsheet Meta when selection changes
  useEffect(() => {
    if (accessToken && selectedSheetId) {
      localStorage.setItem('pkbm_selected_backend_sheet_id', selectedSheetId);
      loadSheetDetails(accessToken, selectedSheetId);
    }
  }, [accessToken, selectedSheetId]);

  // Fetch Sheet Rows when tab changes
  useEffect(() => {
    if (accessToken && selectedSheetId && activeTabName) {
      loadSheetRows(accessToken, selectedSheetId, activeTabName);
    }
  }, [accessToken, selectedSheetId, activeTabName]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Berhasil tersambung sebagai Admin Google: ${res.user.displayName || res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Gagal menyambungkan akun Google Admin.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setSpreadsheets([]);
    setSelectedSheetId('');
    setActiveMeta(null);
    setSheetData([]);
    setStatusMessage({ type: 'info', text: 'Telah keluar dari akun Google Admin.' });
  };

  const loadDriveSpreadsheets = async (token: string) => {
    setIsLoadingDrive(true);
    try {
      const files = await listUserSpreadsheets(token);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSheetId) {
        setSelectedSheetId(files[0].id);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal memuat Drive: ${err.message}` });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCreateNewBackendSheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    try {
      const meta = await createPKBMSpreadsheet(
        accessToken,
        `Backend Database PKBM AL-ABROR (${new Date().toLocaleDateString('id-ID')})`
      );
      setStatusMessage({
        type: 'success',
        text: `Backend Google Sheet "${meta.properties.title}" (7 Tab Modul Lengkap) berhasil dibuat di Google Drive Admin!`,
      });
      await loadDriveSpreadsheets(accessToken);
      setSelectedSheetId(meta.spreadsheetId);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal membuat Google Sheet: ${err.message}` });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const loadSheetDetails = async (token: string, sheetId: string) => {
    setIsLoadingData(true);
    try {
      const meta = await getSpreadsheetMeta(token, sheetId);
      setActiveMeta(meta);
      if (meta.sheets.length > 0) {
        setActiveTabName(meta.sheets[0].properties.title);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal memuat detail sheet: ${err.message}` });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadSheetRows = async (token: string, sheetId: string, tabName: string) => {
    setIsLoadingData(true);
    try {
      const rows = await readSheetRange(token, sheetId, `'${tabName}'!A1:AD100`);
      setSheetData(rows);
    } catch (err: any) {
      console.error('Error loading sheet rows:', err);
      setSheetData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Sync PPDB DAPODIK (30 Fields)
  const requestSyncPPDB = () => {
    if (!selectedSheetId) {
      alert('Pilih backend spreadsheet terlebih dahulu.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Sync Data PPDB DAPODIK ke Google Sheet',
      description: `Apakah Anda yakin ingin mengekspor ${ppdbList.length} pendaftaran PPDB DAPODIK (30 kolom lengkap) ke lembar 'PPDB Registrations' pada Google Sheet "${activeMeta?.properties.title || 'Aktif'}"?`,
      onConfirm: executeSyncPPDB,
    });
  };

  const executeSyncPPDB = async () => {
    if (!accessToken || !selectedSheetId) return;
    setIsSyncing(true);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const values = ppdbList.map((r) => [
        r.regNumber,
        r.jenisPendaftaran || 'Siswa Baru',
        r.program === 'paket_a'
          ? 'Paket A (SD)'
          : r.program === 'paket_b'
          ? 'Paket B (SMP)'
          : 'Paket C (SMA)',
        r.fullName,
        "'" + r.nik,
        "'" + (r.nisn || '-'),
        r.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
        r.pob,
        r.dob,
        r.religion || 'Islam',
        r.sekolahAsal || '-',
        r.noIjazahSkl || '-',
        r.alamatJalan || 'Alamat Utama',
        r.rtRw || '-',
        r.dusunKelurahan || '-',
        r.kecamatan || 'Palmerah',
        r.kabupatenKota || 'Jakarta Barat',
        r.provinsi || 'DKI Jakarta',
        r.kodePos || '11480',
        r.parentName,
        r.parentJob,
        r.namaIbu || '-',
        r.pekerjaanIbu || '-',
        "'" + r.parentPhone,
        r.tinggiBadan || 165,
        r.beratBadan || 55,
        r.jumlahSaudara || 1,
        r.noKipKksPkh || '-',
        r.status,
        r.date,
      ]);

      await appendSheetRows(accessToken, selectedSheetId, "'PPDB Registrations'!A:AD", values);
      setStatusMessage({
        type: 'success',
        text: `Berhasil mensinkronkan ${values.length} data PPDB DAPODIK lengkap (30 Kolom) ke backend Google Sheet!`,
      });
      await loadSheetRows(accessToken, selectedSheetId, activeTabName);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal sync PPDB DAPODIK: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Master Siswa
  const requestSyncStudents = () => {
    if (!selectedSheetId) {
      alert('Pilih backend spreadsheet terlebih dahulu.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Sync Master Data Siswa Aktif',
      description: `Apakah Anda yakin ingin mengekspor ${studentsList.length} data siswa aktif ke lembar 'Siswa Aktif'?`,
      onConfirm: executeSyncStudents,
    });
  };

  const executeSyncStudents = async () => {
    if (!accessToken || !selectedSheetId) return;
    setIsSyncing(true);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const values = studentsList.map((s) => [
        s.id,
        "'" + s.nis,
        s.name,
        s.program,
        s.classGrade,
        s.status,
        s.parentName,
        "'" + s.parentPhone,
        s.registrationDate,
        'Registrasi Akademik',
      ]);

      await appendSheetRows(accessToken, selectedSheetId, "'Siswa Aktif'!A:J", values);
      setStatusMessage({
        type: 'success',
        text: `Berhasil mensinkronkan ${values.length} data Siswa Aktif ke backend Google Sheet!`,
      });
      await loadSheetRows(accessToken, selectedSheetId, activeTabName);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal sync Siswa: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync Payments
  const requestSyncPayments = () => {
    if (!selectedSheetId) {
      alert('Pilih backend spreadsheet terlebih dahulu.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Sync Data Keuangan ke Google Sheet',
      description: `Apakah Anda yakin ingin mengekspor ${INITIAL_PAYMENT_HISTORY.length} riwayat transaksi pembayaran ke lembar 'Pembayaran SPP'?`,
      onConfirm: executeSyncPayments,
    });
  };

  const executeSyncPayments = async () => {
    if (!accessToken || !selectedSheetId) return;
    setIsSyncing(true);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const values = INITIAL_PAYMENT_HISTORY.map((p) => [
        p.referenceNo || `PAY-${p.id}`,
        "'" + p.nis,
        p.studentName,
        p.title,
        p.method,
        p.amount,
        p.status,
        p.date,
        new Date().toLocaleTimeString('id-ID'),
        'Transaksi Lunas via Portal',
      ]);

      await appendSheetRows(accessToken, selectedSheetId, "'Pembayaran SPP'!A:J", values);
      setStatusMessage({
        type: 'success',
        text: `Berhasil mensinkronkan ${values.length} data Pembayaran SPP ke backend Google Sheet!`,
      });
      await loadSheetRows(accessToken, selectedSheetId, activeTabName);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Gagal sync Keuangan: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Apps Script Snippet
  const appScriptCode = `/**
 * GOOGLE APPS SCRIPT WEBHOOK BACKEND - PKBM AL-ABROR
 * Tempelkan kode ini di Google Apps Script (Extensions > Apps Script)
 * untuk menerima data pendaftaran otomatis via Webhook / POST API.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. WEBHOOK AUTOMATION: PENDAFTARAN PPDB DAPODIK
    if (data.action === 'ADD_PPDB') {
      var sheet = ss.getSheetByName('PPDB Registrations');
      sheet.appendRow([
        data.regNumber || 'DAPODIK-' + Date.now(),
        data.jenisPendaftaran || 'Siswa Baru',
        data.program || 'Paket C (SMA)',
        data.fullName || '',
        "'" + (data.nik || ''),
        "'" + (data.nisn || '-'),
        data.gender || 'L',
        data.pob || '',
        data.dob || '',
        data.religion || 'Islam',
        data.sekolahAsal || '-',
        data.noIjazahSkl || '-',
        data.alamatJalan || '',
        data.rtRw || '',
        data.dusunKelurahan || '',
        data.kecamatan || '',
        data.kabupatenKota || '',
        data.provinsi || '',
        data.kodePos || '',
        data.parentName || '',
        data.parentJob || '',
        data.namaIbu || '',
        data.pekerjaanIbu || '',
        "'" + (data.parentPhone || ''),
        data.tinggiBadan || 165,
        data.beratBadan || 55,
        data.jumlahSaudara || 1,
        data.noKipKksPkh || '-',
        data.status || 'Menunggu Verifikasi',
        new Date().toISOString()
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'PPDB DAPODIK recorded' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. WEBHOOK AUTOMATION: TRANSAKSI PEMBAYARAN SPP
    if (data.action === 'ADD_PAYMENT') {
      var sheetPay = ss.getSheetByName('Pembayaran SPP');
      sheetPay.appendRow([
        data.referenceNo || 'PAY-' + Date.now(),
        "'" + (data.nis || ''),
        data.studentName || '',
        data.title || 'SPP Bulanan',
        data.method || 'QRIS',
        data.amount || 0,
        data.status || 'Lunas',
        data.date || new Date().toLocaleDateString('id-ID'),
        new Date().toLocaleTimeString('id-ID'),
        data.notes || 'Pembayaran Portal'
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'Payment recorded' })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = (text: string, type: 'code' | 'header', headerName?: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedHeaderTab(headerName || '');
      setTimeout(() => setCopiedHeaderTab(null), 2000);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Navigation Tabs for Sheets Backend */}
      <div className="flex border-b border-[#c4c6cf] gap-4">
        <button
          onClick={() => setSubTab('sync')}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'sync'
              ? 'border-[#000a1e] text-[#000a1e]'
              : 'border-transparent text-[#74777f] hover:text-black'
          }`}
        >
          <Database className="w-4 h-4 text-[#735c00]" />
          <span>Live Sync & Preview Spreadsheet</span>
        </button>

        <button
          onClick={() => setSubTab('structure')}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'structure'
              ? 'border-[#000a1e] text-[#000a1e]'
              : 'border-transparent text-[#74777f] hover:text-black'
          }`}
        >
          <Table className="w-4 h-4 text-[#002147]" />
          <span>Struktur Google Sheet (7 Modul Web)</span>
        </button>

        <button
          onClick={() => setSubTab('script')}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'script'
              ? 'border-[#000a1e] text-[#000a1e]'
              : 'border-transparent text-[#74777f] hover:text-black'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-700" />
          <span>Google Apps Script (Webhook API)</span>
        </button>
      </div>

      {/* Top Admin Google Status Box */}
      <div className="bg-[#f9f9f9] rounded-xl p-5 border border-[#e2e2e2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#735c00] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Database Backend Google Sheets Official (Admin Drive)
          </div>
          <p className="text-xs text-[#44474e]">
            Kelola sinkronisasi otomatis seluruh data fitur website (*PPDB DAPODIK, Siswa, Guru, SPP, Users*) langsung ke akun Google Drive Superadmin.
          </p>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-white p-2 px-3 rounded-lg border border-[#c4c6cf]">
              <div className="w-8 h-8 rounded-full bg-[#000a1e] text-white flex items-center justify-center text-xs font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-[#1a1c1c] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {user.displayName || 'Google Admin'}
                </p>
                <p className="text-[#74777f] text-[10px]">{user.email}</p>
              </div>
              <button
                onClick={handleGoogleLogout}
                className="text-[#b3261e] hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer"
                title="Disconnect Google Admin Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="bg-[#000a1e] hover:bg-[#002147] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {isAuthenticating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-[#ffe088]" />
              )}
              <span>Sambungkan Google Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {authError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {statusMessage && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-blue-50 border border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[10px] font-bold opacity-70 hover:opacity-100">
            Tutup
          </button>
        </div>
      )}

      {/* SUB-TAB 1: LIVE SYNC ENGINE */}
      {subTab === 'sync' && (
        <div className="space-y-6">
          {user ? (
            <div className="space-y-6">
              {/* Controls Panel */}
              <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-1/2 space-y-1">
                  <label className="block text-[11px] font-bold text-[#1a1c1c] uppercase tracking-wider">
                    Spreadsheet Backend Aktif:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedSheetId}
                      onChange={(e) => setSelectedSheetId(e.target.value)}
                      disabled={isLoadingDrive || spreadsheets.length === 0}
                      className="w-full rounded-lg border border-[#c4c6cf] bg-[#f9f9f9] text-xs py-2 px-3 font-medium text-[#1a1c1c] focus:outline-none focus:border-[#000a1e]"
                    >
                      {spreadsheets.length === 0 ? (
                        <option value="">Tidak ada spreadsheet ditemukan</option>
                      ) : (
                        spreadsheets.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('id-ID') : 'Terbaru'})
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      onClick={() => loadDriveSpreadsheets(accessToken!)}
                      className="p-2 rounded-lg border border-[#c4c6cf] hover:bg-[#f3f3f3] text-[#44474e]"
                      title="Refresh Daftar Drive"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCreateNewBackendSheet}
                    disabled={isCreatingSheet}
                    className="bg-[#735c00] hover:bg-[#8f7200] text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isCreatingSheet ? 'Membuat 7 Sheet Tab...' : 'Buat Sheet Backend Baru (7 Tab)'}
                  </button>

                  {activeMeta && (
                    <a
                      href={activeMeta.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${selectedSheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-[#c4c6cf] text-[#1a1c1c] hover:bg-[#f3f3f3] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Buka Sheet ↗</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sync Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sync PPDB Card */}
                <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2] space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase bg-[#000a1e] text-[#ffe088] px-2 py-0.5 rounded">
                      PPDB DAPODIK (30 Kolom)
                    </span>
                    <GraduationCap className="w-4 h-4 text-[#735c00]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#000a1e]">Export PPDB DAPODIK</h4>
                    <p className="text-[11px] text-[#74777f]">Total pendaftar: {ppdbList.length} siswa</p>
                  </div>
                  <button
                    onClick={requestSyncPPDB}
                    disabled={isSyncing || !selectedSheetId}
                    className="w-full bg-[#000a1e] text-white hover:bg-[#002147] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#ffe088]" />
                    Sync PPDB DAPODIK
                  </button>
                </div>

                {/* Sync Siswa Card */}
                <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2] space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase bg-blue-900 text-white px-2 py-0.5 rounded">
                      Master Siswa
                    </span>
                    <Users className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#000a1e]">Export Master Siswa Aktif</h4>
                    <p className="text-[11px] text-[#74777f]">Total siswa aktif: {studentsList.length} siswa</p>
                  </div>
                  <button
                    onClick={requestSyncStudents}
                    disabled={isSyncing || !selectedSheetId}
                    className="w-full bg-[#000a1e] text-white hover:bg-[#002147] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#ffe088]" />
                    Sync Master Siswa
                  </button>
                </div>

                {/* Sync Pembayaran Card */}
                <div className="bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2] space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase bg-[#735c00] text-white px-2 py-0.5 rounded">
                      Keuangan SPP
                    </span>
                    <CreditCard className="w-4 h-4 text-[#735c00]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#000a1e]">Export SPP Keuangan</h4>
                    <p className="text-[11px] text-[#74777f]">Total transaksi: {INITIAL_PAYMENT_HISTORY.length} transaksi</p>
                  </div>
                  <button
                    onClick={requestSyncPayments}
                    disabled={isSyncing || !selectedSheetId}
                    className="w-full bg-[#000a1e] text-white hover:bg-[#002147] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#ffe088]" />
                    Sync Keuangan SPP
                  </button>
                </div>
              </div>

              {/* Sheet Data Live Preview */}
              {activeMeta && (
                <div className="bg-white rounded-xl border border-[#e2e2e2] overflow-hidden shadow-sm">
                  <div className="bg-[#f0f4f9] px-4 py-3 border-b border-[#e2e2e2] flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#735c00] mr-1" />
                      <span className="text-xs font-bold text-[#000a1e]">Sheet Tab Aktif:</span>
                      {activeMeta.sheets.map((s) => {
                        const title = s.properties.title;
                        const isActive = activeTabName === title;
                        return (
                          <button
                            key={s.properties.sheetId}
                            onClick={() => setActiveTabName(title)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                              isActive
                                ? 'bg-[#002147] text-white'
                                : 'bg-white text-[#1a1c1c] border border-[#c4c6cf] hover:bg-[#f3f3f3]'
                            }`}
                          >
                            {title}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => loadSheetRows(accessToken!, selectedSheetId, activeTabName)}
                      className="p-1.5 text-[#44474e] hover:bg-[#e2e2e2] rounded cursor-pointer"
                      title="Reload Rows"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto max-h-[350px]">
                    {isLoadingData ? (
                      <div className="py-8 text-center text-xs text-[#74777f]">
                        Memuat data dari Google Sheet...
                      </div>
                    ) : sheetData.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#74777f]">
                        Lembar '{activeTabName}' masih kosong. Klik tombol 'Sync' di atas untuk mengisinya secara otomatis.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#f0f4f9] border-b border-[#c4c6cf]">
                            {sheetData[0]?.map((col: any, idx: number) => (
                              <th key={idx} className="p-2 font-bold text-[#000a1e] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eeeeee]">
                          {sheetData.slice(1).map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-[#f9f9f9]">
                              {sheetData[0]?.map((_: any, colIdx: number) => (
                                <td key={colIdx} className="p-2 text-[#1a1c1c] whitespace-nowrap">
                                  {row[colIdx] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#f9f9f9] border border-[#e2e2e2] rounded-2xl p-8 text-center space-y-3">
              <Database className="w-10 h-10 text-[#735c00] mx-auto opacity-60" />
              <h3 className="font-bold text-base text-[#000a1e]">Sambungkan Akun Google Admin</h3>
              <p className="text-xs text-[#74777f] max-w-md mx-auto">
                Silakan klik tombol "Sambungkan Google Admin" di atas untuk mengakses Google Drive dan mengelola database spreadsheet secara langsung.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: STRUKTUR DOKUMEN GOOGLE SHEETS LENGKAP */}
      {subTab === 'structure' && (
        <div className="space-y-6">
          <div className="bg-[#fffdf0] border border-[#735c00]/30 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#735c00] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1a1c1c] space-y-1">
              <p className="font-bold text-[#000a1e]">Rancangan Arsitektur Spreadsheet Backend Website PKBM AL-ABROR</p>
              <p>
                Seluruh fitur pada website ini dipetakan ke dalam **7 Lembar Kerja (Sheet Tabs)** resmi. Anda dapat menyalin nama kolom header di bawah ini atau menekan tombol **"Buat Sheet Backend Baru"** untuk membuat spreadsheet utuh di Google Drive Anda secara instan.
              </p>
            </div>
          </div>

          {/* Tab Selector for 7 Modules */}
          <div className="flex flex-wrap gap-2 border-b border-[#e2e2e2] pb-3">
            {[
              { id: 'ppdb', label: '1. PPDB Registrations (DAPODIK)', cols: 30, icon: GraduationCap },
              { id: 'siswa', label: '2. Siswa Aktif', cols: 10, icon: Users },
              { id: 'guru', label: '3. Tenaga Pendidik', cols: 8, icon: UserCheck },
              { id: 'spp', label: '4. Pembayaran SPP', cols: 10, icon: CreditCard },
              { id: 'users', label: '5. User Accounts', cols: 8, icon: ShieldCheck },
              { id: 'config', label: '6. Konfigurasi Website', cols: 4, icon: Settings },
              { id: 'logs', label: '7. Log Aktivitas', cols: 6, icon: Activity },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = inspectTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInspectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#000a1e] text-white shadow-sm'
                      : 'bg-white text-[#44474e] border border-[#c4c6cf] hover:bg-[#f3f3f3]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 text-[#ffe088]" />
                  <span>{tab.label}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 rounded font-mono">{tab.cols} kol</span>
                </button>
              );
            })}
          </div>

          {/* Module 1 Detail: PPDB Registrations */}
          {inspectTab === 'ppdb' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#e2e2e2] pb-3">
                <div>
                  <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#735c00]" />
                    Sheet Tab: "PPDB Registrations" (30 Kolom DAPODIK Official)
                  </h4>
                  <p className="text-xs text-[#74777f]">Mencakup pendaftaran siswa baru, data pribadi, domisili, orang tua, dan periodik fisik.</p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'No. Registrasi,Jenis Pendaftaran,Program Kesetaraan,Nama Lengkap Siswa,NIK,NISN,L/P,Tempat Lahir,Tanggal Lahir,Agama,Sekolah Asal / NPSN,No. Ijazah / SKL,Alamat Jalan,RT/RW,Dusun/Kelurahan,Kecamatan,Kabupaten/Kota,Provinsi,Kode Pos,Nama Ayah Kandung,Pekerjaan Ayah,Nama Ibu Kandung,Pekerjaan Ibu,No. WhatsApp Ortu/Wali,Tinggi Badan (cm),Berat Badan (kg),Jumlah Saudara,No. KIP/PKH/KKS,Status DAPODIK,Tanggal Pendaftaran',
                      'header',
                      'PPDB'
                    )
                  }
                  className="bg-[#f0f4f9] hover:bg-[#e2e2e2] text-[#000a1e] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#c4c6cf] flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedHeaderTab === 'PPDB' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Headers (CSV)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'No. Registrasi', 'String', 'DAPODIK-2024-88392', 'Nomor unik pendaftaran'],
                      ['2', 'Jenis Pendaftaran', 'String', 'Siswa Baru', 'Siswa Baru / Pindahan'],
                      ['3', 'Program Kesetaraan', 'String', 'Paket C (SMA)', 'Paket A / B / C'],
                      ['4', 'Nama Lengkap Siswa', 'String', 'Ahmad Fauzi', 'Sesuai Ijazah/KK'],
                      ['5', 'NIK', 'String (Text)', '3207011205080001', 'NIK 16 Digit'],
                      ['6', 'NISN', 'String (Text)', '0081234567', 'NISN 10 Digit'],
                      ['7', 'L/P', 'String', 'Laki-Laki', 'Jenis Kelamin'],
                      ['8', 'Tempat Lahir', 'String', 'Jakarta', 'Kota/Kab Lahir'],
                      ['9', 'Tanggal Lahir', 'Date', '2008-05-20', 'Format YYYY-MM-DD'],
                      ['10', 'Agama', 'String', 'Islam', 'Agama Siswa'],
                      ['11', 'Sekolah Asal / NPSN', 'String', 'SMPN 89 Jakarta (20201100)', 'Asal sekolah'],
                      ['12', 'No. Ijazah / SKL', 'String', 'DN-02/D-SMP/24/001', 'Surat Keterangan Lulus'],
                      ['13', 'Alamat Jalan', 'String', 'Jl. Palmerah Barat No. 45', 'Alamat Domisili'],
                      ['14', 'RT/RW', 'String', '002/005', 'RT / RW'],
                      ['15', 'Dusun/Kelurahan', 'String', 'Palmerah', 'Kelurahan / Desa'],
                      ['16', 'Kecamatan', 'String', 'Palmerah', 'Kecamatan'],
                      ['17', 'Kabupaten/Kota', 'String', 'Jakarta Barat', 'Kabupaten'],
                      ['18', 'Provinsi', 'String', 'DKI Jakarta', 'Provinsi'],
                      ['19', 'Kode Pos', 'String', '11480', 'Kode Pos'],
                      ['20', 'Nama Ayah Kandung', 'String', 'Budi Santoso', 'Nama Ayah Kandung'],
                      ['21', 'Pekerjaan Ayah', 'String', 'Wiraswasta', 'Pekerjaan Ayah'],
                      ['22', 'Nama Ibu Kandung', 'String', 'Siti Aminah', 'Nama Ibu Kandung'],
                      ['23', 'Pekerjaan Ibu', 'String', 'Ibu Rumah Tangga', 'Pekerjaan Ibu'],
                      ['24', 'No. WhatsApp Ortu/Wali', 'String', '081234567890', 'WhatsApp Notifikasi'],
                      ['25', 'Tinggi Badan (cm)', 'Number', '168', 'Fisik Siswa'],
                      ['26', 'Berat Badan (kg)', 'Number', '58', 'Fisik Siswa'],
                      ['27', 'Jumlah Saudara', 'Number', '2', 'Jumlah Saudara Kandung'],
                      ['28', 'No. KIP/PKH/KKS', 'String', 'KIP-2024-001', 'Nomor bantuan pendidikan'],
                      ['29', 'Status DAPODIK', 'String', 'Lulus Verifikasi', 'Menunggu / Lulus / Ditolak'],
                      ['30', 'Tanggal Pendaftaran', 'DateTime', '2024-08-12 14:30', 'Waktu daftar'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                        <td className="p-2.5 text-[#44474e]">{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 2 Detail: Siswa Aktif */}
          {inspectTab === 'siswa' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                Sheet Tab: "Siswa Aktif" (10 Kolom Master Akademik)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'ID Siswa', 'String', 's_172348900'],
                      ['2', 'NIS', 'String', '202400101'],
                      ['3', 'Nama Lengkap Siswa', 'String', 'Ahmad Fauzi'],
                      ['4', 'Program Kesetaraan', 'String', 'Paket C'],
                      ['5', 'Rombel / Kelas', 'String', 'Kelas 10'],
                      ['6', 'Status Siswa', 'String', 'Aktif'],
                      ['7', 'Nama Wali / Ortu', 'String', 'Budi Santoso'],
                      ['8', 'No. WhatsApp Ortu', 'String', '081234567890'],
                      ['9', 'Tanggal Masuk', 'Date', '2024-07-15'],
                      ['10', 'Catatan Tambahan', 'String', 'Registrasi Akademik Lunas'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3 Detail: Tenaga Pendidik */}
          {inspectTab === 'guru' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-700" />
                Sheet Tab: "Tenaga Pendidik" (8 Kolom Master Guru / Tutor)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'ID Tutor', 'String', 't_1'],
                      ['2', 'NIP / NUPTK', 'String', '198501152010011002'],
                      ['3', 'Nama & Gelar Guru', 'String', 'Dr. H. Ahmad Hidayat, M.Pd'],
                      ['4', 'Mata Pelajaran Utama', 'String', 'Pendidikan Kewarganegaraan'],
                      ['5', 'Program Mengajar', 'String', 'Paket C & Paket B'],
                      ['6', 'No. WhatsApp Guru', 'String', '081299887766'],
                      ['7', 'Status Mengajar', 'String', 'Aktif'],
                      ['8', 'Kualifikasi Pendidikan', 'String', 'S2 Pendidikan'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 4 Detail: Pembayaran SPP */}
          {inspectTab === 'spp' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#735c00]" />
                Sheet Tab: "Pembayaran SPP" (10 Kolom Transaksi Keuangan)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'No. Referensi', 'String', 'PAY-2024-001'],
                      ['2', 'NIS', 'String', '202400101'],
                      ['3', 'Nama Siswa', 'String', 'Ahmad Fauzi'],
                      ['4', 'Kategori Tagihan', 'String', 'SPP Bulanan'],
                      ['5', 'Metode Pembayaran', 'String', 'QRIS / Transfer BCA'],
                      ['6', 'Nominal (Rp)', 'Number', '150000'],
                      ['7', 'Status Pembayaran', 'String', 'Lunas'],
                      ['8', 'Tanggal Bayar', 'Date', '2024-08-10'],
                      ['9', 'Waktu Transaksi', 'Time', '10:15:30'],
                      ['10', 'Keterangan Transaksi', 'String', 'Pembayaran via Portal'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 5 Detail: User Accounts */}
          {inspectTab === 'users' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                Sheet Tab: "User Accounts" (8 Kolom Otentikasi & Hak Akses)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'User ID', 'String', 'u_1'],
                      ['2', 'Username / Email', 'String', 'admin@pkbm.sch.id'],
                      ['3', 'Nama Lengkap', 'String', 'Super Admin PKBM'],
                      ['4', 'Role Akses', 'String', 'superadmin'],
                      ['5', 'Status Akun', 'String', 'Aktif'],
                      ['6', 'Linked NIS / NIP', 'String', '-'],
                      ['7', 'Hak Akses JSON', 'String', '{"canManagePPDB":true...}'],
                      ['8', 'Tanggal Dibuat', 'Date', '2024-01-01'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 6 Detail: Website Config */}
          {inspectTab === 'config' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#735c00]" />
                Sheet Tab: "Konfigurasi Website" (4 Kolom Parameter Tampilan)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'Config Key', 'String', 'school_name'],
                      ['2', 'Config Value', 'String', 'PKBM AL-ABROR PALMERAH'],
                      ['3', 'Kategori', 'String', 'General Info'],
                      ['4', 'Terakhir Diubah', 'DateTime', '2024-08-12 21:00'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 7 Detail: Log Aktivitas */}
          {inspectTab === 'logs' && (
            <div className="bg-white border border-[#e2e2e2] rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                Sheet Tab: "Log Aktivitas" (6 Kolom Audit Trail)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f0f4f9] text-[#000a1e] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Header Kolom</th>
                      <th className="p-2.5">Tipe Data</th>
                      <th className="p-2.5">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {[
                      ['1', 'Timestamp', 'DateTime', '2024-08-12 21:05:12'],
                      ['2', 'User Actor', 'String', 'superadmin@pkbm.sch.id'],
                      ['3', 'Role', 'String', 'superadmin'],
                      ['4', 'Nama Tindakan', 'String', 'Export PPDB DAPODIK to Sheet'],
                      ['5', 'Modul Aplikasi', 'String', 'Google Sheets Sync'],
                      ['6', 'Perangkat & IP', 'String', '180.252.xx.xx (Chrome Desktop)'],
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="p-2.5 font-bold font-mono text-[#74777f]">{row[0]}</td>
                        <td className="p-2.5 font-bold text-[#002147]">{row[1]}</td>
                        <td className="p-2.5 font-mono text-[#735c00]">{row[2]}</td>
                        <td className="p-2.5 font-mono text-[#1a1c1c]">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: KODE GOOGLE APPS SCRIPT WEBHOOK */}
      {subTab === 'script' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Code className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Otomatisasi Webhook API dengan Google Apps Script (`Code.gs`)</p>
              <p>
                Salin skrip di bawah ini lalu buka Google Spreadsheet Anda &gt; menu **Extensions** &gt; **Apps Script**. Tempelkan skrip ini untuk mengaktifkan API penerimaan data otomatis dari Google Forms atau integrasi eksternal.
              </p>
            </div>
          </div>

          <div className="bg-[#000a1e] rounded-xl p-4 border border-[#002147] text-white space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-mono text-xs text-[#ffe088] font-bold">Code.gs (Google Apps Script)</span>
              <button
                onClick={() => copyToClipboard(appScriptCode, 'code')}
                className="bg-[#735c00] hover:bg-[#8f7200] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode App Script'}</span>
              </button>
            </div>

            <pre className="font-mono text-[11px] text-[#e2e2e2] overflow-x-auto p-2 leading-relaxed max-h-[400px]">
              {appScriptCode}
            </pre>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e2e2] space-y-4">
            <div className="flex items-center gap-3 text-[#735c00]">
              <div className="w-10 h-10 rounded-full bg-[#735c00]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                {confirmModal.title}
              </h3>
            </div>

            <p className="text-xs text-[#44474e] leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="bg-[#f9f9f9] p-3 rounded-lg border border-[#e2e2e2] text-[11px] text-[#74777f]">
              Tindakan ini akan memperbarui isi spreadsheet backend Google Drive Anda secara langsung.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#c4c6cf] text-[#1a1c1c] hover:bg-[#f3f3f3]"
              >
                Batal
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#000a1e] text-white hover:bg-[#002147] shadow-sm cursor-pointer"
              >
                Konfirmasi & Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
