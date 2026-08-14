import React from 'react';
import { ProgramInfo } from '../types';
import { X, CheckCircle2, Clock, DollarSign, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

interface CurriculumModalProps {
  program: ProgramInfo | null;
  onClose: () => void;
  onNavigatePPDB: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  program,
  onClose,
  onNavigatePPDB,
}) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e2e2e2] relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#002147] text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#ffe088] text-[#241a00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {program.equivalent}
            </span>
            <span className="text-xs text-blue-200">Terakreditasi B</span>
          </div>

          <h3 className="font-headline text-3xl font-bold text-white mb-2">
            Kurikulum {program.title}
          </h3>
          <p className="text-sm text-blue-100 leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-grow">
          {/* Schedule */}
          <div className="bg-[#f3f3f3] p-4 rounded-xl flex items-start gap-3 border border-[#e2e2e2]">
            <Clock className="w-5 h-5 text-[#000a1e] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-[#000a1e]">Jadwal & Waktu Belajar</h4>
              <p className="text-xs text-[#44474e] mt-0.5">{program.schedule}</p>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="font-headline text-lg font-bold text-[#000a1e] mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#735c00]" />
              Mata Pelajaran Utama & Keahlian
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {program.subjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f9f9f9] border border-[#e2e2e2] text-xs font-medium text-[#1a1c1c]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#735c00] shrink-0" />
                  <span>{subj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Advantages */}
          <div>
            <h4 className="font-headline text-lg font-bold text-[#000a1e] mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#002147]" />
              Fasilitas & Keunggulan
            </h4>
            <ul className="space-y-2">
              {program.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#44474e]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#735c00] mt-1.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tuition Fee Breakdown */}
          <div className="border-t border-[#e2e2e2] pt-4">
            <h4 className="font-headline text-lg font-bold text-[#000a1e] mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#735c00]" />
              Rincian Biaya Pendidikan Resmi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f9f9f9] p-4 rounded-xl border border-[#e2e2e2]">
              <div>
                <span className="text-[11px] text-[#74777f] block font-medium">Biaya SPP Perbulan</span>
                <span className="font-bold text-sm text-[#735c00]">
                  Rp {program.fees.monthly.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74777f] block font-medium">Uang Pendaftaran</span>
                <span className="font-bold text-sm text-[#000a1e]">
                  Rp {program.fees.registration.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74777f] block font-medium">Uang Gedung & Sarana</span>
                <span className="font-bold text-sm text-[#000a1e]">
                  Rp {((program.fees as any).building || (program.id.includes('sd') ? 500000 : program.id.includes('smp') ? 750000 : 1000000)).toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#74777f] block font-medium">Uang Daftar Ulang</span>
                <span className="font-bold text-sm text-[#000a1e]">
                  Rp {((program.fees as any).reRegistration || (program.id.includes('sd') ? 150000 : program.id.includes('smp') ? 200000 : 250000)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-[#f9f9f9] border-t border-[#e2e2e2] rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-[#74777f] text-sm font-semibold text-[#1a1c1c] hover:bg-[#e8e8e8] transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigatePPDB();
            }}
            className="px-6 py-2.5 rounded-full bg-[#000a1e] text-white text-sm font-semibold hover:bg-[#002147] transition-all flex items-center justify-center gap-2 shadow"
          >
            Daftar {program.title} Sekarang
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
