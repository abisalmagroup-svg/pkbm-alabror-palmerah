import React, { useState, useEffect } from 'react';
import { NavTab, PPDBRegistration, PPDBVerificationSettings, StudentData, UserAccount } from './types';
import { INITIAL_PPDB_REGISTRATIONS, DEFAULT_PPDB_VERIFICATION_SETTINGS, INITIAL_STUDENTS, INITIAL_USER_ACCOUNTS } from './data/mockData';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { fetchSiteConfigFromSupabase } from './data/siteConfig';
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

  // Fetch Students from Supabase
  useEffect(() => {
    const fetchStudentsFromSupabase = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase.from('students').select('*');
        if (error) {
          console.error("Error fetching students from Supabase:", error.message);
          return;
        }
        
        if (data && data.length > 0) {
          // Map to match the expected StudentData format for the UI
          const mappedStudents: StudentData[] = data.map((row: any) => ({
            id: row.id,
            nis: row.nis || '',
            name: row.name || 'Unknown',
            program: row.major || 'Paket C', // Fallback to a valid program enum
            classGrade: row.class_id || 'X',
            status: 'Aktif', // Default
            parentName: row.parent_name || '',
            parentPhone: row.parent_phone || '',
            registrationDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error("Failed to fetch from Supabase", err);
      }
    };

    fetchStudentsFromSupabase();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    fetchSiteConfigFromSupabase();
  }, []);

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
