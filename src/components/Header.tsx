import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';
import { getStoredSiteConfig, SiteConfig } from '../data/siteConfig';
import { Menu, X, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'program', label: 'Program' },
    { id: 'ppdb', label: 'PPDB' },
    { id: 'portal', label: 'Portal' },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#ffffff] shadow-sm border-b border-[#eeeeee]">
      {/* Running Announcement Bar */}
      {siteConfig.showAnnouncement && (
        <div
          className={`py-1.5 px-4 text-center text-xs font-semibold overflow-hidden transition-colors ${
            siteConfig.announcementBgColor === 'navy'
              ? 'bg-[#000a1e] text-[#ffe088]'
              : siteConfig.announcementBgColor === 'amber'
              ? 'bg-[#735c00] text-white'
              : 'bg-emerald-800 text-white'
          }`}
        >
          <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#ffe088]" />
            <span className="truncate">{siteConfig.announcementText}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto flex justify-between items-center px-4 md:px-12 py-3.5">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          {siteConfig.logoUrl ? (
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.schoolName}
              className="w-10 h-10 object-contain rounded-full border border-[#002147]/20 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#002147] text-[#ffffff] flex items-center justify-center font-bold shadow-sm group-hover:bg-[#735c00] transition-colors">
              <GraduationCap className="w-5 h-5 text-[#ffe088]" />
            </div>
          )}
          <div>
            <span className="font-headline font-bold text-xl tracking-tight text-[#000a1e] block leading-none">
              {siteConfig.schoolName}
            </span>
            <span className="text-[10px] text-[#745c00] font-semibold tracking-wider uppercase block mt-0.5">
              {siteConfig.accreditationText}
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`pb-1 font-semibold text-sm tracking-wide transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#000a1e] border-b-2 border-[#735c00] font-bold'
                    : 'text-[#44474e] hover:text-[#735c00]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <button
            onClick={() => handleNavClick('ppdb')}
            className="bg-[#735c00] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#fed65b] hover:text-[#745c00] transition-all duration-200 shadow-sm hover:shadow cursor-pointer flex items-center gap-2"
          >
            {siteConfig.ctaPrimaryText || 'Daftar Sekarang'}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#000a1e] p-2 hover:bg-[#eeeeee] rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#ffffff] border-b border-[#e2e2e2] px-6 py-4 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-3 mb-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg text-left text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#002147] text-[#ffffff]'
                      : 'text-[#1a1c1c] hover:bg-[#f3f3f3]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#ffe088]' : 'text-[#74777f]'}`} />
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => handleNavClick('ppdb')}
            className="w-full bg-[#735c00] text-white py-3 rounded-full font-semibold text-center hover:bg-[#fed65b] hover:text-[#745c00] transition-colors shadow"
          >
            {siteConfig.ctaPrimaryText || 'Daftar Sekarang'}
          </button>
        </div>
      )}
    </header>
  );
};

