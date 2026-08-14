import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { getStoredSiteConfig, SiteConfig } from '../data/siteConfig';
import { Globe, Video, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenConsultation?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenConsultation }) => {
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

  return (
    <footer className="w-full bg-[#000a1e] text-white pt-16 pb-8 px-4 md:px-12 mt-auto">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12 border-b border-white/10 pb-12">
          {/* Brand Info */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-3 mb-4">
              {siteConfig.logoUrl && (
                <img
                  src={siteConfig.logoUrl}
                  alt={siteConfig.schoolName}
                  className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-amber-300 shrink-0"
                />
              )}
              <div className="font-headline text-2xl font-bold text-[#ffe088] tracking-tight">
                {siteConfig.schoolName}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-sm">
              {siteConfig.accreditationText}, menyediakan akses pendidikan berkualitas tinggi untuk semua kalangan dengan fleksibilitas dan standar nasional.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onOpenConsultation}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] hover:bg-[#735c00] hover:text-white transition-colors cursor-pointer"
                title="Website & Portal"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenConsultation}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] hover:bg-[#735c00] hover:text-white transition-colors cursor-pointer"
                title="Sesi Telekonferensi / Live Class"
              >
                <Video className="w-5 h-5" />
              </button>
              <a
                href={`mailto:${siteConfig.schoolEmail}`}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] hover:bg-[#735c00] hover:text-white transition-colors cursor-pointer"
                title="Email Sekretariat"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Nav Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:w-2/3 w-full">
            {/* Tautan Cepat */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-xs text-[#ffe088] uppercase tracking-wider mb-1">
                Tautan Cepat
              </h4>
              <button
                onClick={() => { setActiveTab('beranda'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => { setActiveTab('program'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Program
              </button>
              <button
                onClick={() => { setActiveTab('ppdb'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                PPDB Online
              </button>
              <button
                onClick={() => { setActiveTab('portal'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Portal Login
              </button>
            </div>

            {/* Program */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-xs text-[#ffe088] uppercase tracking-wider mb-1">
                Program
              </h4>
              <button
                onClick={() => { setActiveTab('program'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Paket A (SD)
              </button>
              <button
                onClick={() => { setActiveTab('program'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Paket B (SMP)
              </button>
              <button
                onClick={() => { setActiveTab('program'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Paket C (SMA)
              </button>
              <button
                onClick={() => { setActiveTab('program'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-left text-sm text-gray-300 hover:text-[#ffe088] transition-colors cursor-pointer"
              >
                Kelas Entrepreneur
              </button>
            </div>

            {/* Hubungi Kami */}
            <div className="flex flex-col gap-3 col-span-2">
              <h4 className="font-semibold text-xs text-[#ffe088] uppercase tracking-wider mb-1">
                Hubungi Kami
              </h4>
              <p className="text-sm text-gray-300 flex items-start gap-2 leading-relaxed">
                <MapPin className="w-5 h-5 text-[#ffe088] shrink-0 mt-0.5" />
                <span>{siteConfig.schoolAddress}</span>
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#ffe088] shrink-0" />
                <span>+62 {siteConfig.schoolPhone.replace(/^0/, '')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {siteConfig.schoolName}. {siteConfig.accreditationText}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
