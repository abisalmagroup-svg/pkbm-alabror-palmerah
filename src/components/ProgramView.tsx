import React, { useState } from 'react';
import { NavTab, PPDBVerificationSettings, ProgramInfo } from '../types';
import { PROGRAMS_DETAIL } from '../data/mockData';
import { CurriculumModal } from './CurriculumModal';
import {
  BookOpen,
  FlaskConical,
  Award,
  Sparkles,
  BookMarked,
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ProgramViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenConsultation: () => void;
  ppdbSettings?: PPDBVerificationSettings;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  setActiveTab,
  onOpenConsultation,
  ppdbSettings,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramInfo | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'kesetaraan' | 'unggulan'>('all');

  const getCustomizedProgram = (prog: ProgramInfo): ProgramInfo => {
    const key = prog.id.includes('sd') ? 'paket_a' : prog.id.includes('smp') ? 'paket_b' : 'paket_c';
    if (!ppdbSettings?.programFees?.[key]) return prog;

    const pf = ppdbSettings.programFees[key];
    return {
      ...prog,
      fees: {
        registration: pf.registrationFee,
        monthly: pf.sppMonthly,
        building: pf.buildingFee,
        reRegistration: pf.reRegistrationFee,
      } as any,
    };
  };

  return (
    <div className="w-full pt-28 pb-20 px-4 md:px-12 bg-[#f9f9f9]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="bg-[#002147] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-3">
            Program Akademik PKBM AL-ABROR
          </span>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#000a1e] mb-4">
            Pendidikan Kesetaraan & Program Unggulan
          </h1>
          <p className="text-base text-[#44474e] leading-relaxed">
            Menyediakan jenjang Paket A, B, dan C terakreditasi B serta program penunjang English British, Tahfidz Al-Qur'an, dan Kewirausahaan.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#eeeeee] p-1.5 rounded-full inline-flex gap-2 border border-[#e2e2e2]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#000a1e] text-white shadow'
                  : 'text-[#44474e] hover:text-[#000a1e]'
              }`}
            >
              Semua Program
            </button>
            <button
              onClick={() => setActiveFilter('kesetaraan')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'kesetaraan'
                  ? 'bg-[#000a1e] text-white shadow'
                  : 'text-[#44474e] hover:text-[#000a1e]'
              }`}
            >
              Pendidikan Kesetaraan
            </button>
            <button
              onClick={() => setActiveFilter('unggulan')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'unggulan'
                  ? 'bg-[#000a1e] text-white shadow'
                  : 'text-[#44474e] hover:text-[#000a1e]'
              }`}
            >
              Program Unggulan
            </button>
          </div>
        </div>

        {/* Programs List */}
        {(activeFilter === 'all' || activeFilter === 'kesetaraan') && (
          <div className="space-y-8 mb-16">
            <h2 className="font-headline text-2xl font-bold text-[#000a1e] border-b border-[#e2e2e2] pb-3 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#735c00]" />
              Pendidikan Kesetaraan Ijazah Nasional (Terakreditasi B)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PROGRAMS_DETAIL.map((rawProg) => {
                const prog = getCustomizedProgram(rawProg);
                return (
                  <div
                    key={prog.id}
                    className="bg-white rounded-2xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-[#002147]/10 text-[#002147] px-3 py-1 rounded-full text-xs font-bold">
                        {prog.equivalent}
                      </span>
                      <span className="text-xs text-[#745c00] font-bold">Resmi Kemendikbud</span>
                    </div>

                    <h3 className="font-headline text-2xl font-bold text-[#000a1e] mb-2">
                      {prog.title}
                    </h3>

                    <p className="text-xs text-[#44474e] mb-4 leading-relaxed line-clamp-3">
                      {prog.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-bold text-[#000a1e] uppercase tracking-wider">
                        Mata Pelajaran Kunci:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {prog.subjects.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-[#f3f3f3] text-[#1a1c1c] text-[11px] px-2.5 py-1 rounded-md border border-[#e2e2e2]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e2e2e2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#74777f] block">SPP Bulanan</span>
                      <span className="font-bold text-sm text-[#000a1e]">
                        Rp {prog.fees.monthly.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedProgram(prog)}
                      className="bg-[#735c00] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#745c00] transition-colors cursor-pointer"
                    >
                      Detail Kurikulum
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Programs */}
        {(activeFilter === 'all' || activeFilter === 'unggulan') && (
          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold text-[#000a1e] border-b border-[#e2e2e2] pb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#735c00]" />
              Program Unggulan & Ekstrakurikuler
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* English British */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#002147]/10 text-[#002147] flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#000a1e] mb-2">
                  English British Conversation
                </h3>
                <p className="text-xs text-[#44474e] leading-relaxed mb-4">
                  Pelatihan bahasa Inggris aksen British profesional dengan tutor berpengalaman, meningkatkan kepercayaan diri berbicara, debat, dan korespondensi internasional.
                </p>
                <ul className="space-y-2 text-xs text-[#1a1c1c]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#735c00]" />
                    Sertifikat Keterampilan Bahasa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#735c00]" />
                    Praktek Percakapan Mingguan
                  </li>
                </ul>
              </div>

              {/* Tahfidz */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#002805]/10 text-[#002805] flex items-center justify-center mb-4">
                  <BookMarked className="w-6 h-6 text-[#002805]" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#000a1e] mb-2">
                  Tahfidz Al-Qur'an
                </h3>
                <p className="text-xs text-[#44474e] leading-relaxed mb-4">
                  Program hafalan Al-Qur'an terstruktur (Juz 30 & Juz pilihan) didampingi Ustadz/Ustadzah bersertifikat sanad untuk membentuk generasi berakhlak mulia.
                </p>
                <ul className="space-y-2 text-xs text-[#1a1c1c]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#002805]" />
                    Setoran Muroja'ah Harian/Mingguan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#002805]" />
                    Wisuda Tahfidz Berkala
                  </li>
                </ul>
              </div>

              {/* Entrepreneur */}
              <div className="bg-white rounded-2xl p-6 border border-[#e2e2e2] shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#735c00]/10 text-[#735c00] flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-[#735c00]" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#000a1e] mb-2">
                  Kelas Kewirausahaan & Digital
                </h3>
                <p className="text-xs text-[#44474e] leading-relaxed mb-4">
                  Praktik bisnis online, desain grafis, e-commerce, dan pengelolaan keuangan mandiri agar lulusan siap berwirausaha atau bekerja profesional.
                </p>
                <ul className="space-y-2 text-xs text-[#1a1c1c]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#735c00]" />
                    Mentoring Bisnis Praktis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#735c00]" />
                    Pameran Karya Siswa (Bazaar)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Banner */}
        <div className="mt-16 bg-[#002147] text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div>
            <span className="bg-[#ffe088] text-[#241a00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
              Pendaftaran Dibuka
            </span>
            <h3 className="font-headline text-2xl md:text-3xl font-bold text-white mb-2">
              Daftar Sekarang untuk Gelombang Ajaran Baru
            </h3>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl">
              Kuota per kelas terbatas untuk menjaga efektivitas dan kualitas bimbingan siswa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setActiveTab('ppdb');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-[#735c00] hover:bg-[#fed65b] hover:text-[#745c00] text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all shadow text-center cursor-pointer flex items-center justify-center gap-2"
            >
              Isi Form PPDB Online
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConsultation}
              className="bg-white text-[#000a1e] px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors text-center cursor-pointer"
            >
              Konsultasi via WA
            </button>
          </div>
        </div>
      </div>

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
