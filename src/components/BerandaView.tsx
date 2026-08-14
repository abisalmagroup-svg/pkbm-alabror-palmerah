import React, { useState, useEffect } from 'react';
import { NavTab, ProgramInfo } from '../types';
import { PROGRAMS_DETAIL } from '../data/mockData';
import { getStoredSiteConfig, SiteConfig } from '../data/siteConfig';
import { CurriculumModal } from './CurriculumModal';
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Award,
  GraduationCap,
  Star,
  ArrowUpRight,
  UserCheck,
  Headphones,
  Quote,
} from 'lucide-react';

interface BerandaViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenConsultation: () => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({ setActiveTab, onOpenConsultation }) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramInfo | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getStoredSiteConfig());

  useEffect(() => {
    const handleConfigUpdate = () => {
      setSiteConfig(getStoredSiteConfig());
    };
    window.addEventListener('site_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('site_config_updated', handleConfigUpdate);
    };
  }, []);

  const handleOpenCurriculum = (programId: string) => {
    const prog = PROGRAMS_DETAIL.find((p) => p.id === programId) || PROGRAMS_DETAIL[0];
    setSelectedProgram(prog);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[780px] md:min-h-[850px] flex items-center justify-center pt-24 pb-16 px-4 md:px-12 overflow-hidden bg-[#f9f9f9]">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={siteConfig.heroImageUrl}
            alt={`${siteConfig.schoolName} Environment`}
            className="w-full h-full object-cover opacity-15"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002147]/85 via-[#f9f9f9]/80 to-[#f9f9f9]/95"></div>
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          {/* Left Text Column */}
          <div className="md:col-span-7 flex flex-col items-start gap-6">
            {/* Accredited Badge */}
            <div className="inline-flex items-center gap-2 bg-[#735c00]/10 px-4 py-2 rounded-full border border-[#735c00]/20 backdrop-blur-sm shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#735c00]" />
              <span className="text-xs md:text-sm font-semibold text-[#000a1e]">
                {siteConfig.accreditationText}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-[#000a1e] leading-[1.25] tracking-tight">
              {siteConfig.heroTitle}
            </h1>

            {/* Sub-description */}
            <p className="text-base md:text-lg text-[#44474e] leading-relaxed max-w-2xl">
              {siteConfig.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActiveTab('ppdb');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#000a1e] text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#002147] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                {siteConfig.ctaPrimaryText}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('bento-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-[#000a1e] border-2 border-[#000a1e] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#eeeeee] transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                {siteConfig.ctaSecondaryText}
              </button>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="hidden md:block md:col-span-5 relative">
            <div className="absolute inset-0 bg-[#735c00]/10 rounded-[2rem] transform translate-x-4 translate-y-4"></div>
            <img
              src={siteConfig.heroImageUrl}
              alt="Siswa Siswi Indonesia Belajar"
              className="relative w-full h-[580px] object-cover rounded-[2rem] shadow-xl border-4 border-white"
              referrerPolicy="no-referrer"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-[#e2e2e2] flex items-center gap-4">
              <div className="bg-[#002147]/10 p-3.5 rounded-full text-[#002147]">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <p className="font-headline text-2xl font-bold text-[#000a1e] leading-tight">
                  {siteConfig.graduatesCount}
                </p>
                <p className="text-xs font-medium text-[#44474e]">
                  {siteConfig.graduatesLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sambutan Kepala Sekolah Section */}
      <section className="py-16 px-4 md:px-12 bg-[#f0f4f9] border-y border-[#e2e2e2]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#735c00] rounded-2xl rotate-3 scale-105 opacity-20"></div>
              <img
                src={siteConfig.principalPhotoUrl}
                alt={siteConfig.principalName}
                className="relative w-56 h-56 md:w-64 md:h-64 object-cover rounded-2xl shadow-lg border-4 border-white"
              />
            </div>
          </div>
          <div className="md:col-span-8 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-[#735c00] shadow-sm">
              <Quote className="w-4 h-4" />
              Sambutan Kepala Sekolah
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold text-[#000a1e] leading-relaxed italic font-serif">
              "{siteConfig.principalMessage}"
            </h3>
            <div className="pt-2">
              <p className="font-bold text-base text-[#000a1e]">{siteConfig.principalName}</p>
              <p className="text-xs text-[#735c00] font-semibold">{siteConfig.principalTitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs Bento Grid Section */}
      <section id="bento-grid" className="py-20 px-4 md:px-12 bg-white">
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#000a1e] mb-4">
              Program Pendidikan Kesetaraan
            </h2>
            <p className="text-base text-[#44474e] max-w-2xl mx-auto leading-relaxed">
              Kurikulum berbasis nasional yang dirancang untuk memberikan fleksibilitas tanpa mengorbankan kualitas akademis.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Paket A */}
            <div className="group bg-[#f9f9f9] rounded-2xl p-8 border border-[#e2e2e2] hover:border-[#465f88] transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#465f88]"></div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-[#465f88]/10 p-3.5 rounded-xl text-[#465f88] group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <span className="bg-[#e8e8e8] px-3.5 py-1 rounded-full text-xs font-semibold text-[#1a1c1c]">
                    Setara SD
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#000a1e] mb-3">Paket A</h3>
                <p className="text-sm text-[#44474e] leading-relaxed mb-6">
                  Pendidikan dasar setara Sekolah Dasar (SD) yang membangun pondasi literasi, numerasi, dan karakter kuat bagi peserta didik.
                </p>
              </div>
              <button
                onClick={() => handleOpenCurriculum('paket_a')}
                className="inline-flex items-center gap-2 font-semibold text-sm text-[#465f88] group-hover:text-[#000a1e] transition-colors cursor-pointer pt-2"
              >
                Lihat Detail Kurikulum <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Paket B */}
            <div className="group bg-[#f9f9f9] rounded-2xl p-8 border border-[#e2e2e2] hover:border-[#735c00] transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#735c00]"></div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-[#735c00]/10 p-3.5 rounded-xl text-[#735c00] group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-8 h-8" />
                  </div>
                  <span className="bg-[#735c00]/10 px-3.5 py-1 rounded-full text-xs font-bold text-[#735c00]">
                    Setara SMP
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#000a1e] mb-3">Paket B</h3>
                <p className="text-sm text-[#44474e] leading-relaxed mb-6">
                  Pendidikan menengah pertama yang mengembangkan keterampilan analitis, sosial, dan kesiapan untuk jenjang selanjutnya.
                </p>
              </div>
              <button
                onClick={() => handleOpenCurriculum('paket_b')}
                className="inline-flex items-center gap-2 font-semibold text-sm text-[#735c00] group-hover:text-[#000a1e] transition-colors cursor-pointer pt-2"
              >
                Lihat Detail Kurikulum <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Paket C (Featured) */}
            <div className="group bg-[#f9f9f9] rounded-2xl p-8 border-2 border-[#002147]/30 hover:border-[#000a1e] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,33,71,0.15)] relative overflow-hidden transform md:-translate-y-3 flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#000a1e]"></div>
              
              {/* Star Badge */}
              <div className="absolute top-4 right-4 bg-[#000a1e] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 text-[#ffe088] fill-[#ffe088]" /> Favorit
              </div>

              <div>
                <div className="flex items-center justify-between mb-6 mt-2">
                  <div className="bg-[#000a1e]/10 p-4 rounded-xl text-[#000a1e] group-hover:scale-110 transition-transform">
                    <Award className="w-9 h-9" />
                  </div>
                  <span className="bg-[#e8e8e8] px-3.5 py-1 rounded-full text-xs font-semibold text-[#1a1c1c]">
                    Setara SMA
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-[#000a1e] mb-3">Paket C</h3>
                <p className="text-sm text-[#44474e] leading-relaxed mb-6">
                  Pendidikan menengah atas komprehensif, dilengkapi kelas peminatan untuk persiapan dunia kerja atau perguruan tinggi.
                </p>

                <ul className="mb-6 space-y-2.5">
                  <li className="flex items-center gap-2 text-xs font-medium text-[#1a1c1c]">
                    <CheckCircle2 className="w-4 h-4 text-[#000a1e]" />
                    Termasuk Program Entrepreneur
                  </li>
                  <li className="flex items-center gap-2 text-xs font-medium text-[#1a1c1c]">
                    <CheckCircle2 className="w-4 h-4 text-[#000a1e]" />
                    Persiapan Ujian UTBK SNBT
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenCurriculum('paket_c')}
                className="w-full bg-[#000a1e] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#002147] transition-colors cursor-pointer shadow text-center"
              >
                Lihat Detail Kurikulum
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 md:px-12 bg-white border-t border-[#e2e2e2]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#000a1e] mb-6">
            Siap Membangun Masa Depan Anda?
          </h2>
          <p className="text-base md:text-lg text-[#44474e] mb-10 leading-relaxed max-w-2xl mx-auto">
            Bergabunglah dengan ratusan siswa lainnya yang telah meraih kesuksesan melalui pendidikan berkualitas di PKBM AL-ABROR.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setActiveTab('ppdb');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#000a1e] text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#002147] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-[#ffe088]" />
              Daftar PPDB Sekarang
            </button>
            <button
              onClick={onOpenConsultation}
              className="bg-white text-[#000a1e] border border-[#74777f] px-8 py-4 rounded-full font-semibold text-sm hover:bg-[#f3f3f3] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headphones className="w-5 h-5 text-[#735c00]" />
              Hubungi Konsultan Kami
            </button>
          </div>
        </div>
      </section>

      {/* Curriculum Modal */}
      <CurriculumModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onNavigatePPDB={() => {
          setSelectedProgram(null);
          setActiveTab('ppdb');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
