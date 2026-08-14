import React, { useState } from 'react';
import { SiteConfig, getStoredSiteConfig, saveStoredSiteConfig, DEFAULT_SITE_CONFIG } from '../data/siteConfig';
import {
  Palette,
  Megaphone,
  Layout,
  UserCheck,
  PhoneCall,
  BookOpen,
  Save,
  RotateCcw,
  CheckCircle2,
  Eye,
  Sparkles,
  Link2,
  GraduationCap,
  Building,
  Image as ImageIcon,
} from 'lucide-react';

export const LandingPageCustomizer: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig());
  const [activeSection, setActiveSection] = useState<'profile' | 'announcement' | 'hero' | 'principal' | 'contact' | 'programs'>('profile');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Handle Field Change
  const handleChange = (field: keyof SiteConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Save Config
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredSiteConfig(config);
    setSavedSuccessMessage('Pengaturan Landing Page berhasil disimpan dan diterapkan ke seluruh halaman!');
    setTimeout(() => {
      setSavedSuccessMessage('');
    }, 3500);
  };

  // Reset to Defaults
  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh pengaturan Landing Page ke bawaan awal?')) {
      setConfig(DEFAULT_SITE_CONFIG);
      saveStoredSiteConfig(DEFAULT_SITE_CONFIG);
      setSavedSuccessMessage('Pengaturan berhasil dikembalikan ke standar awal.');
      setTimeout(() => setSavedSuccessMessage(''), 3000);
    }
  };

  // Sample Preset Image URLs
  const HERO_IMAGE_PRESETS = [
    { label: 'Siswa Indonesia di Kelas', url: '/src/assets/images/indonesian_students_1786585730581.jpg' },
    { label: 'Siswa Wisuda Success', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Belajar Digital & Komputer', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2e2e2] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#735c00] font-bold text-xs uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#735c00]" />
            Pengaturan Tampilan & Konten Website
          </div>
          <h2 className="font-headline text-2xl font-bold text-[#000a1e]">
            Kostumisasi Landing Page & Informasi Sekolah
          </h2>
          <p className="text-xs text-[#74777f]">
            Atur pengumuman running bar, judul banner hero, sambutan kepala sekolah, nomor kontak WA, dan informasi publik secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setShowLivePreviewModal(true)}
            className="bg-[#f0f4f9] text-[#000a1e] border border-[#c4c6cf] hover:bg-[#e2e2e2] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#002147]" />
            Pratinjau Hero
          </button>
          <button
            onClick={handleReset}
            className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Initial
          </button>
          <button
            onClick={handleSave}
            className="bg-[#000a1e] text-white hover:bg-[#735c00] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#ffe088]" />
            Simpan Perubahan
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs md:text-sm font-semibold animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Sub-tabs for Section Categories */}
      <div className="bg-white rounded-2xl border border-[#e2e2e2] shadow-sm p-4">
        <div className="flex border-b border-[#e2e2e2] gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'profile'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <Building className="w-4 h-4 text-[#ffe088]" />
            1. Logo & Profile Sekolah
          </button>

          <button
            onClick={() => setActiveSection('announcement')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'announcement'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <Megaphone className="w-4 h-4 text-[#ffe088]" />
            2. Running Bar Pengumuman
          </button>

          <button
            onClick={() => setActiveSection('hero')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'hero'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <Layout className="w-4 h-4 text-[#ffe088]" />
            3. Hero Banner Landing Page
          </button>

          <button
            onClick={() => setActiveSection('principal')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'principal'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#ffe088]" />
            4. Sambutan Kepala Sekolah
          </button>

          <button
            onClick={() => setActiveSection('contact')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'contact'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-[#ffe088]" />
            5. Kontak & Footer Informasi
          </button>

          <button
            onClick={() => setActiveSection('programs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'programs'
                ? 'bg-[#000a1e] text-white'
                : 'bg-[#f0f4f9] text-[#44474e] hover:bg-[#e2e2e2]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#ffe088]" />
            6. Keterangan Program
          </button>
        </div>

        {/* SECTION 0: PROFILE & LOGO SEKOLAH */}
        {activeSection === 'profile' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#735c00]" />
                Kostumisasi Logo, Identitas, Visi Misi & Profile Sekolah
              </h3>
              <p className="text-[#74777f]">
                Atur logo resmi, nomor registrasi izin operasional (NPSN & SK), Visi, Misi, serta Sejarah Singkat Lembaga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Nama Resmi Sekolah:</label>
                <input
                  type="text"
                  value={config.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">NPSN (Nomor Pokok Sekolah):</label>
                <input
                  type="text"
                  value={config.npsn}
                  onChange={(e) => handleChange('npsn', e.target.value)}
                  placeholder="P2961234"
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">SK Izin Operasional:</label>
                <input
                  type="text"
                  value={config.skIzin}
                  onChange={(e) => handleChange('skIzin', e.target.value)}
                  placeholder="503/128/DISDIK/2021"
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-[#e2e2e2] pt-4">
              <div>
                <label className="font-bold text-[#000a1e] block text-xs">
                  Logo Resmi Sekolah (Tampil pada Header, Footer, Cetak Berkas DAPODIK & Kartu Siswa KTS):
                </label>
                <p className="text-[11px] text-[#74777f]">
                  Unggah file gambar logo sekolah Anda (PNG/JPG/WebP) atau masukkan link URL eksternal atau pilih preset resmi.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Logo Preview box */}
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#c4c6cf] p-1 bg-[#f9f9f9] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-[#735c00]" />
                  )}
                </div>

                <div className="flex-grow space-y-2 w-full">
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* File Upload Button */}
                    <label className="bg-[#000a1e] text-white hover:bg-[#002147] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <ImageIcon className="w-3.5 h-3.5 text-[#ffe088]" />
                      Unggah File Logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                handleChange('logoUrl', event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {config.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('logoUrl', '')}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Hapus Logo (Gunakan Ikon Bawaan)
                      </button>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={config.logoUrl || ''}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="Atau tempel URL gambar logo: https://domain.com/logo.png"
                      className="w-full pl-8 pr-3 py-2 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Presets */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-gray-600 block uppercase tracking-wider">
                  Preset Emblem Logo Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        'logoUrl',
                        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80'
                      )
                    }
                    className="text-[11px] bg-white hover:bg-amber-50 text-[#000a1e] px-2.5 py-1 rounded border border-gray-300 font-semibold cursor-pointer"
                  >
                    🏛️ Logo Lambang Pendidikan Emas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        'logoUrl',
                        'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80'
                      )
                    }
                    className="text-[11px] bg-white hover:bg-amber-50 text-[#000a1e] px-2.5 py-1 rounded border border-gray-300 font-semibold cursor-pointer"
                  >
                    🎓 Lambang Akademik Toga Hijau
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    className="text-[11px] bg-white hover:bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-300 font-semibold cursor-pointer"
                  >
                    ⭐ Default Vector Emblem
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Visi Lembaga:</label>
              <textarea
                rows={2}
                value={config.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Misi Lembaga:</label>
              <textarea
                rows={4}
                value={config.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs leading-relaxed font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Sejarah Singkat Lembaga:</label>
              <textarea
                rows={3}
                value={config.history}
                onChange={(e) => handleChange('history', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SECTION 1: RUNNING BAR ANNOUNCEMENT */}
        {activeSection === 'announcement' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#735c00]" />
                Pengaturan Running Bar Top Banner
              </h3>
              <p className="text-[#74777f]">
                Banner pengumuman berjalan ini akan muncul di bagian paling atas halaman situs untuk menarik perhatian calon pendaftar PPDB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[#e2e2e2] rounded-xl space-y-3 bg-white">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showAnnouncement}
                    onChange={(e) => handleChange('showAnnouncement', e.target.checked)}
                    className="w-5 h-5 text-[#000a1e] rounded focus:ring-[#000a1e]"
                  />
                  <div>
                    <span className="font-bold text-sm text-[#000a1e] block">
                      Aktifkan Running Announcement Bar
                    </span>
                    <span className="text-[11px] text-[#74777f]">
                      Centang untuk menampilkan pengumuman berjalan di atas menu navigasi
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-4 border border-[#e2e2e2] rounded-xl space-y-2 bg-white">
                <label className="font-bold text-[#000a1e] block">Tema Warna Background Banner</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('announcementBgColor', 'navy')}
                    className={`px-3 py-1.5 rounded-lg font-bold border text-xs cursor-pointer ${
                      config.announcementBgColor === 'navy'
                        ? 'bg-[#000a1e] text-white border-[#000a1e]'
                        : 'bg-[#f0f4f9] text-[#000a1e] border-[#c4c6cf]'
                    }`}
                  >
                    Deep Navy & Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('announcementBgColor', 'amber')}
                    className={`px-3 py-1.5 rounded-lg font-bold border text-xs cursor-pointer ${
                      config.announcementBgColor === 'amber'
                        ? 'bg-[#735c00] text-white border-[#735c00]'
                        : 'bg-[#f0f4f9] text-[#000a1e] border-[#c4c6cf]'
                    }`}
                  >
                    Amber Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('announcementBgColor', 'emerald')}
                    className={`px-3 py-1.5 rounded-lg font-bold border text-xs cursor-pointer ${
                      config.announcementBgColor === 'emerald'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-[#f0f4f9] text-[#000a1e] border-[#c4c6cf]'
                    }`}
                  >
                    Emerald Islamic
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">
                Teks Pengumuman Running Bar:
              </label>
              <textarea
                rows={3}
                value={config.announcementText}
                onChange={(e) => handleChange('announcementText', e.target.value)}
                placeholder="Tuliskan pesan pengumuman..."
                className="w-full p-3 border border-[#c4c6cf] rounded-xl text-xs focus:ring-2 focus:ring-[#000a1e] outline-none"
              />
            </div>

            {/* Banner Preview Box */}
            <div className="space-y-1">
              <span className="font-bold text-[11px] text-[#74777f] uppercase">Simulasi Tampilan Running Bar:</span>
              <div
                className={`p-2.5 rounded-lg text-center font-bold text-xs shadow-inner overflow-hidden whitespace-nowrap ${
                  config.announcementBgColor === 'navy'
                    ? 'bg-[#000a1e] text-[#ffe088]'
                    : config.announcementBgColor === 'amber'
                    ? 'bg-[#735c00] text-white'
                    : 'bg-emerald-800 text-white'
                }`}
              >
                <div className="animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffe088]" />
                  <span>{config.announcementText || 'Teks pengumuman belum diisi'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HERO BANNER LANDING PAGE */}
        {activeSection === 'hero' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#735c00]" />
                Pengaturan Hero Section (Header Utama Website)
              </h3>
              <p className="text-[#74777f]">
                Seksi hero adalah bagian pertama yang dilihat pengunjung saat membuka website PKBM AL-ABROR.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Nama Lembaga Publik:</label>
                <input
                  type="text"
                  value={config.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Badge Status Akreditasi:</label>
                <input
                  type="text"
                  value={config.accreditationText}
                  onChange={(e) => handleChange('accreditationText', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Judul Utama Headline Hero:</label>
              <textarea
                rows={2}
                value={config.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Deskripsi Sub-Hero:</label>
              <textarea
                rows={3}
                value={config.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Teks Tombol Utama CTA:</label>
                <input
                  type="text"
                  value={config.ctaPrimaryText}
                  onChange={(e) => handleChange('ctaPrimaryText', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Teks Tombol Sekunder:</label>
                <input
                  type="text"
                  value={config.ctaSecondaryText}
                  onChange={(e) => handleChange('ctaSecondaryText', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Jumlah Lulusan Badge:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={config.graduatesCount}
                    onChange={(e) => handleChange('graduatesCount', e.target.value)}
                    placeholder="1000+"
                    className="p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={config.graduatesLabel}
                    onChange={(e) => handleChange('graduatesLabel', e.target.value)}
                    placeholder="Lulusan Sukses"
                    className="p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Gambar Hero URL & Presets */}
            <div className="space-y-2 border-t border-[#e2e2e2] pt-4">
              <label className="font-bold text-[#000a1e] block">URL Gambar Utama Hero Section:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.heroImageUrl}
                  onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="flex-grow p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#74777f] font-semibold">Gunakan Preset Gambar:</span>
                {HERO_IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('heroImageUrl', preset.url)}
                    className="bg-white hover:bg-[#f0f4f9] border border-[#c4c6cf] px-2.5 py-1 rounded text-[11px] font-medium text-[#000a1e] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SAMBUTAN KEPALA SEKOLAH */}
        {activeSection === 'principal' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#735c00]" />
                Sambutan Kepala Sekolah & Profil Kepemimpinan
              </h3>
              <p className="text-[#74777f]">
                Tampilkan pesan hangat dari Kepala Sekolah untuk meningkatkan kepercayaan calon wali murid dan peserta didik baru.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Nama Lengkap & Gelar Kepala Sekolah:</label>
                <input
                  type="text"
                  value={config.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Jabatan / Gelar Resmi:</label>
                <input
                  type="text"
                  value={config.principalTitle}
                  onChange={(e) => handleChange('principalTitle', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Pesan Sambutan Kepala Sekolah:</label>
              <textarea
                rows={4}
                value={config.principalMessage}
                onChange={(e) => handleChange('principalMessage', e.target.value)}
                className="w-full p-3 border border-[#c4c6cf] rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">URL Foto Profil Kepala Sekolah:</label>
              <input
                type="text"
                value={config.principalPhotoUrl}
                onChange={(e) => handleChange('principalPhotoUrl', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* SECTION 4: KONTAK & FOOTER INFORMASI */}
        {activeSection === 'contact' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#735c00]" />
                Kontak Resmi, Alamat, & Media Sosial
              </h3>
              <p className="text-[#74777f]">
                Pengaturan nomor HP WhatsApp konsultan, email resmi, dan tautan sosial media yang tampil di Footer & Konsultasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Nomor WhatsApp Konsultasi PPDB:</label>
                <input
                  type="text"
                  value={config.schoolPhone}
                  onChange={(e) => handleChange('schoolPhone', e.target.value)}
                  placeholder="081234567890"
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Email Resmi Sekretariat:</label>
                <input
                  type="email"
                  value={config.schoolEmail}
                  onChange={(e) => handleChange('schoolEmail', e.target.value)}
                  placeholder="info@pkbmalabror.sch.id"
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#000a1e] block mb-1">Alamat Lengkap Kampus PKBM:</label>
              <textarea
                rows={2}
                value={config.schoolAddress}
                onChange={(e) => handleChange('schoolAddress', e.target.value)}
                className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Jam Operasional Layanan:</label>
                <input
                  type="text"
                  value={config.operatingHours}
                  onChange={(e) => handleChange('operatingHours', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Link YouTube Video Profil / Virtual Tour:</label>
                <input
                  type="text"
                  value={config.youtubeVirtualTourUrl}
                  onChange={(e) => handleChange('youtubeVirtualTourUrl', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: KETERANGAN PROGRAM */}
        {activeSection === 'programs' && (
          <div className="pt-6 space-y-5 text-xs">
            <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] space-y-1">
              <h3 className="font-bold text-sm text-[#000a1e] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#735c00]" />
                Ringkasan Deskripsi Program Pendidikan (Kartu Landing Page)
              </h3>
              <p className="text-[#74777f]">
                Sesuaikan deskripsi Paket A, Paket B, dan Paket C yang tampil pada Bento Grid Beranda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Keterangan Paket A (Setara SD):</label>
                <textarea
                  rows={2}
                  value={config.paketADesc}
                  onChange={(e) => handleChange('paketADesc', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Keterangan Paket B (Setara SMP):</label>
                <textarea
                  rows={2}
                  value={config.paketBDesc}
                  onChange={(e) => handleChange('paketBDesc', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#000a1e] block mb-1">Keterangan Paket C (Setara SMA):</label>
                <textarea
                  rows={2}
                  value={config.paketCDesc}
                  onChange={(e) => handleChange('paketCDesc', e.target.value)}
                  className="w-full p-2.5 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL LIVE PREVIEW */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#e2e2e2] text-[#1a1c1c] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#735c00]" />
                <h3 className="font-headline text-lg font-bold text-[#000a1e]">
                  Simulasi Pratinjau Tampilan Hero & Landing Page
                </h3>
              </div>
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="text-[#74777f] hover:text-black font-bold px-2"
              >
                Tutup ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Announcement Bar Preview */}
              {config.showAnnouncement && (
                <div
                  className={`p-2 rounded text-center text-xs font-bold ${
                    config.announcementBgColor === 'navy'
                      ? 'bg-[#000a1e] text-[#ffe088]'
                      : config.announcementBgColor === 'amber'
                      ? 'bg-[#735c00] text-white'
                      : 'bg-emerald-800 text-white'
                  }`}
                >
                  {config.announcementText}
                </div>
              )}

              {/* Hero Preview Box */}
              <div className="relative bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-6 overflow-hidden">
                <div className="inline-block bg-[#735c00]/10 text-[#000a1e] text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                  ✓ {config.accreditationText}
                </div>
                <h1 className="font-headline text-xl md:text-2xl font-bold text-[#000a1e] mb-2 leading-tight">
                  {config.heroTitle}
                </h1>
                <p className="text-xs text-[#44474e] leading-relaxed mb-4 max-w-xl">
                  {config.heroSubtitle}
                </p>
                <div className="flex gap-2">
                  <span className="bg-[#000a1e] text-white px-4 py-2 rounded-full text-xs font-bold">
                    {config.ctaPrimaryText}
                  </span>
                  <span className="border border-[#000a1e] text-[#000a1e] px-4 py-2 rounded-full text-xs font-bold">
                    {config.ctaSecondaryText}
                  </span>
                </div>
              </div>

              {/* Principal Message Preview */}
              <div className="bg-[#f0f4f9] p-4 rounded-xl border border-[#c4c6cf] flex items-center gap-4">
                <img
                  src={config.principalPhotoUrl}
                  alt={config.principalName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#735c00]"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-[#000a1e]">{config.principalName}</h4>
                  <p className="text-[10px] text-[#735c00] font-semibold">{config.principalTitle}</p>
                  <p className="text-[#44474e] italic mt-1 font-serif">"{config.principalMessage}"</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="bg-[#000a1e] text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Tutup Simulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
