import React from 'react';
import { PPDBRegistration } from '../types';
import { getStoredSiteConfig } from '../data/siteConfig';
import { Printer, X, CheckCircle2, Building2, ShieldCheck, Award } from 'lucide-react';

interface DapodikPrintSheetProps {
  data: PPDBRegistration;
  onClose: () => void;
}

export const DapodikPrintSheet: React.FC<DapodikPrintSheetProps> = ({ data, onClose }) => {
  const siteConfig = getStoredSiteConfig();

  const handlePrint = () => {
    window.print();
  };

  const getProgramTitle = (p: string) => {
    switch (p) {
      case 'paket_a':
        return 'PAKET A (SETARA SD / MI)';
      case 'paket_b':
        return 'PAKET B (SETARA SMP / MTS)';
      case 'paket_c':
        return 'PAKET C (SETARA SMA / MA)';
      default:
        return p.toUpperCase();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-dapodik-sheet, .printable-dapodik-sheet * {
            visibility: visible !important;
          }
          .printable-dapodik-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 11px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Top Control Header Bar (Hidden on Print) */}
        <div className="no-print bg-[#000a1e] text-white p-4 flex items-center justify-between shrink-0 border-b border-indigo-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffe088] text-[#000a1e] rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-white">
                Lembar Hasil Isian DAPODIK Resmi
              </h3>
              <p className="text-[11px] text-gray-300">
                Pendaftaran & Data Pokok Pendidikan Kemendikbudristek RI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Sheet */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-white text-[#1a1c1c]">
          <div className="printable-dapodik-sheet bg-white p-6 md:p-8 rounded-xl border border-gray-300 shadow-sm space-y-5 font-sans">
            {/* KOP SURAT OFFICIAL */}
            <div className="border-b-4 border-double border-[#000a1e] pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {siteConfig.logoUrl ? (
                  <img
                    src={siteConfig.logoUrl}
                    alt={siteConfig.schoolName}
                    className="w-16 h-16 object-contain rounded-full border-2 border-[#000a1e] p-0.5 bg-white shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#000a1e] text-[#ffe088] flex items-center justify-center shrink-0 border-2 border-[#735c00]">
                    <Building2 className="w-9 h-9" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI RI
                  </p>
                  <h2 className="font-headline text-lg md:text-xl font-black text-[#000a1e] leading-tight">
                    {siteConfig.schoolName || 'PKBM AL-ABROR PALMERAH'}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#735c00]">
                    PANITIA PPDB & TIM OPERATOR DAPODIK NASIONAL
                  </p>
                  <p className="text-[10px] text-gray-600">
                    Izin Operasional: {siteConfig.skIzin || '503/128/DISDIK/2021'} | NPSN: {siteConfig.npsn || 'P2961234'} | {siteConfig.accreditationText}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {siteConfig.schoolAddress || 'Jl. Palmerah Barat No. 123, Palmerah, Jakarta Barat'} | Telp/WA: {siteConfig.schoolPhone}
                  </p>
                </div>
              </div>

              {/* Status Badge & Stamp */}
              <div className="text-right shrink-0">
                <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-center font-mono font-bold text-xs">
                  <span className="block text-[9px] text-emerald-700 uppercase">Status DAPODIK</span>
                  {data.status === 'Lulus Verifikasi' ? 'TERVERIFIKASI' : data.status.toUpperCase()}
                </div>
                <p className="text-[9px] text-gray-500 font-mono mt-1">
                  Tgl Daftar: {data.date}
                </p>
              </div>
            </div>

            {/* TITLE & REGISTRATION NUMBER */}
            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <h1 className="font-headline font-bold text-base md:text-lg text-[#000a1e] tracking-wide uppercase">
                FORMULIR BUKTI HASIL ISIAN DATA POKOK PENDIDIKAN (DAPODIK)
              </h1>
              <p className="text-xs font-mono font-bold text-[#735c00]">
                NOMOR REGISTRASI: <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300 text-sm">{data.regNumber}</span>
              </p>
            </div>

            {/* SECTION 1: DATA REGISTRASI & PROGRAM */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-[#000a1e] bg-slate-100 p-2 rounded border-l-4 border-[#000a1e] uppercase">
                I. DATA REGISTRASI & PILIHAN PROGRAM
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-xs p-2">
                <div>
                  <span className="text-gray-500 text-[10px] block">Jenis Pendaftaran:</span>
                  <span className="font-bold">{data.jenisPendaftaran || 'Siswa Baru'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Program Kesetaraan:</span>
                  <span className="font-bold text-[#000a1e]">{getProgramTitle(data.program)}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Sekolah Asal:</span>
                  <span className="font-medium">{data.sekolahAsal || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">NPSN Sekolah Asal:</span>
                  <span className="font-mono">{data.npsnAsal || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">No. Ijazah / SKL Terakhir:</span>
                  <span className="font-mono">{data.noIjazahSkl || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Cita-Cita / Hobi:</span>
                  <span className="font-medium">{data.citaCita || '-'} / {data.hobi || '-'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: DATA PRIBADI PESERTA DIDIK (WITH PHOTO) */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-[#000a1e] bg-slate-100 p-2 rounded border-l-4 border-[#000a1e] uppercase">
                II. DATA PRIBADI PESERTA DIDIK
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 p-2">
                {/* 3x4 Student Photo */}
                <div className="shrink-0 flex flex-col items-center justify-center p-2 border border-dashed border-gray-300 rounded-lg bg-slate-50 w-28 h-36">
                  {data.photoUrl || data.documents?.pasFotoUrl ? (
                    <img
                      src={data.photoUrl || data.documents?.pasFotoUrl}
                      alt={data.fullName}
                      className="w-full h-full object-cover rounded shadow-sm border border-gray-300"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-1">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">PAS FOTO</span>
                      <span className="text-[8px] text-gray-400">3 x 4 cm</span>
                    </div>
                  )}
                </div>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-xs flex-grow">
                  <div>
                    <span className="text-gray-500 text-[10px] block">Nama Lengkap Siswa:</span>
                    <span className="font-bold text-sm text-[#000a1e]">{data.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">NIK (Nomor Induk Kependudukan):</span>
                    <span className="font-mono font-bold">{data.nik}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">NISN (Nomor Induk Siswa Nasional):</span>
                    <span className="font-mono font-semibold">{data.nisn || '(Belum Ada / Penerbitan Baru)'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Jenis Kelamin:</span>
                    <span className="font-medium">{data.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Tempat, Tanggal Lahir:</span>
                    <span className="font-medium">{data.pob}, {data.dob}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Agama:</span>
                    <span className="font-medium">{data.religion || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Kewarganegaraan:</span>
                    <span className="font-medium">{data.kewarganegaraan || 'Indonesia (WNI)'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Kebutuhan Khusus:</span>
                    <span className="font-medium">{data.kebutuhanKhusus || 'Tidak Ada'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">No. HP / WhatsApp Siswa:</span>
                    <span className="font-mono font-bold text-emerald-800">{data.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: DATA ALAMAT DOMISILI */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-[#000a1e] bg-slate-100 p-2 rounded border-l-4 border-[#000a1e] uppercase">
                III. DATA ALAMAT DOMISILI
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs p-2">
                <div className="col-span-2">
                  <span className="text-gray-500 text-[10px] block">Alamat Jalan:</span>
                  <span className="font-medium">{data.alamatJalan || 'Jl. Palmerah Barat No. 45'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">RT / RW:</span>
                  <span className="font-mono">{data.rtRw || '002/005'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Dusun / Kelurahan:</span>
                  <span className="font-medium">{data.dusunKelurahan || 'Palmerah'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Kecamatan:</span>
                  <span className="font-medium">{data.kecamatan || 'Palmerah'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Kabupaten / Kota:</span>
                  <span className="font-medium">{data.kabupatenKota || 'Jakarta Barat'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Provinsi:</span>
                  <span className="font-medium">{data.provinsi || 'DKI Jakarta'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Kode Pos:</span>
                  <span className="font-mono">{data.kodePos || '11480'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: DATA ORANG TUA / WALI */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-[#000a1e] bg-slate-100 p-2 rounded border-l-4 border-[#000a1e] uppercase">
                IV. DATA ORANG TUA & WALI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs p-2 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="space-y-1">
                  <p className="font-bold text-[#000a1e] text-[11px] underline">Data Ayah Kandung:</p>
                  <p><span className="text-gray-500">Nama Ayah:</span> <strong>{data.parentName || '-'}</strong></p>
                  <p><span className="text-gray-500">NIK Ayah:</span> <span className="font-mono">{data.nikAyah || '-'}</span></p>
                  <p><span className="text-gray-500">Pekerjaan:</span> {data.parentJob || '-'}</p>
                  <p><span className="text-gray-500">Penghasilan:</span> {data.penghasilanAyah || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-[#000a1e] text-[11px] underline">Data Ibu Kandung:</p>
                  <p><span className="text-gray-500">Nama Ibu:</span> <strong>{data.namaIbu || '-'}</strong></p>
                  <p><span className="text-gray-500">NIK Ibu:</span> <span className="font-mono">{data.nikIbu || '-'}</span></p>
                  <p><span className="text-gray-500">Pekerjaan:</span> {data.pekerjaanIbu || '-'}</p>
                  <p><span className="text-gray-500">Penghasilan:</span> {data.penghasilanIbu || '-'}</p>
                </div>
              </div>
              <div className="p-2 text-xs">
                <span className="text-gray-500 text-[10px]">No. WhatsApp Orang Tua / Wali:</span>
                <span className="font-mono font-bold text-[#000a1e] ml-2">{data.parentPhone}</span>
              </div>
            </div>

            {/* SECTION 5: DATA PERIODIK & PROGRAM BANTUAN */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-[#000a1e] bg-slate-100 p-2 rounded border-l-4 border-[#000a1e] uppercase">
                V. DATA PERIODIK & PROGRAM BANTUAN KESEJAHTERAAN
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs p-2">
                <div>
                  <span className="text-gray-500 text-[10px] block">Tinggi / Berat Badan:</span>
                  <span className="font-medium">{data.tinggiBadan || '-'} cm / {data.beratBadan || '-'} kg</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Jarak Ke Sekolah:</span>
                  <span className="font-medium">{data.jarakSekolah || 'Kurang dari 1 km'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Jumlah Saudara:</span>
                  <span className="font-medium">{data.jumlahSaudara || 1} orang</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">No. KIP / KKS / PKH:</span>
                  <span className="font-mono">{data.noKipKksPkh || '(Tidak Memiliki)'}</span>
                </div>
              </div>
            </div>

            {/* SIGNATURE & LEGALIZATION FOOTER */}
            <div className="pt-6 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <p className="text-gray-600">Calon Peserta Didik / Orang Tua / Wali,</p>
                </div>
                <div>
                  <p className="font-bold underline text-[#000a1e]">{data.fullName}</p>
                  <p className="text-[10px] text-gray-500">(Tanda Tangan & Nama Terang)</p>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="text-gray-600">Jakarta Barat, {data.date}</p>
                  <p className="font-bold text-[#000a1e]">Panitia Operator DAPODIK PKBM AL-ABROR</p>
                </div>
                <div className="relative inline-block">
                  <div className="border border-emerald-700 bg-emerald-50 text-emerald-900 px-3 py-1 rounded text-[10px] font-mono inline-block font-bold">
                    ✓ TERVERIFIKASI SERTA SINKRON DAPODIK
                  </div>
                  <p className="font-bold underline text-[#000a1e] mt-2">Operator Dapodik Resmi</p>
                  <p className="text-[10px] text-gray-500">NIP/NPT: 198204122011011002</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
