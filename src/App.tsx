import React, { useState, useEffect } from 'react';
import { NavTab, PPDBRegistration, PPDBVerificationSettings, StudentData, UserAccount } from './types';
import { INITIAL_PPDB_REGISTRATIONS, DEFAULT_PPDB_VERIFICATION_SETTINGS, INITIAL_STUDENTS, INITIAL_USER_ACCOUNTS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BerandaView } from './components/BerandaView';
import { ProgramView } from './components/ProgramView';
import { PPDBView } from './components/PPDBView';
import { PortalView } from './components/PortalView';
import { WhatsAppModal } from './components/WhatsAppModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [waModalOpen, setWaModalOpen] = useState(false);

  // Shared Centralized App State
  const [ppdbList, setPpdbList] = useState<PPDBRegistration[]>(() => {
    try {
      const saved = localStorage.getItem('pkbm_ppdb_list');
      return saved ? JSON.parse(saved) : INITIAL_PPDB_REGISTRATIONS;
    } catch (e) {
      return INITIAL_PPDB_REGISTRATIONS;
    }
  });

  const [ppdbSettings, setPpdbSettings] = useState<PPDBVerificationSettings>(() => {
    try {
      const saved = localStorage.getItem('pkbm_ppdb_settings');
      return saved ? JSON.parse(saved) : DEFAULT_PPDB_VERIFICATION_SETTINGS;
    } catch (e) {
      return DEFAULT_PPDB_VERIFICATION_SETTINGS;
    }
  });

  const [students, setStudents] = useState<StudentData[]>(() => {
    try {
      const saved = localStorage.getItem('pkbm_students_list');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch (e) {
      return INITIAL_STUDENTS;
    }
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('pkbm_user_accounts');
      return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
    } catch (e) {
      return INITIAL_USER_ACCOUNTS;
    }
  });

  // State Persistence Hooks
  useEffect(() => {
    localStorage.setItem('pkbm_ppdb_list', JSON.stringify(ppdbList));
  }, [ppdbList]);

  useEffect(() => {
    localStorage.setItem('pkbm_ppdb_settings', JSON.stringify(ppdbSettings));
  }, [ppdbSettings]);

  useEffect(() => {
    localStorage.setItem('pkbm_students_list', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('pkbm_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased selection:bg-[#735c00] selection:text-white">
      {/* Fixed Navigation Bar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'beranda' && (
          <BerandaView
            setActiveTab={setActiveTab}
            onOpenConsultation={() => setWaModalOpen(true)}
          />
        )}

        {activeTab === 'program' && (
          <ProgramView
            setActiveTab={setActiveTab}
            onOpenConsultation={() => setWaModalOpen(true)}
            ppdbSettings={ppdbSettings}
          />
        )}

        {activeTab === 'ppdb' && (
          <PPDBView
            setActiveTab={setActiveTab}
            onOpenConsultation={() => setWaModalOpen(true)}
            ppdbList={ppdbList}
            setPpdbList={setPpdbList}
            ppdbSettings={ppdbSettings}
          />
        )}

        {activeTab === 'portal' && (
          <PortalView
            ppdbList={ppdbList}
            setPpdbList={setPpdbList}
            ppdbSettings={ppdbSettings}
            setPpdbSettings={setPpdbSettings}
            students={students}
            setStudents={setStudents}
            userAccounts={userAccounts}
            setUserAccounts={setUserAccounts}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenConsultation={() => setWaModalOpen(true)}
      />

      {/* Floating WhatsApp Consultation Dialog */}
      <WhatsAppModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
      />
    </div>
  );
}
