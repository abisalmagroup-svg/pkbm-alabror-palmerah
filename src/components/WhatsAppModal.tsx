import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { getStoredSiteConfig } from '../data/siteConfig';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const siteConfig = getStoredSiteConfig();
  const [name, setName] = useState('');
  const [programChoice, setProgramChoice] = useState('Paket C (Setara SMA)');
  const [question, setQuestion] = useState(`Halo Panitia PPDB ${siteConfig.schoolName}, saya ingin bertanya mengenai syarat pendaftaran dan biaya...`);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      const text = encodeURIComponent(`Halo ${siteConfig.schoolName},\n\nNama: ${name || 'Calon Siswa'}\nProgram Interest: ${programChoice}\nPesan: ${question}`);
      const rawPhone = siteConfig.schoolPhone.replace(/[^0-9]/g, '');
      const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
      window.open(`https://wa.me/${waPhone || '6281234567890'}?text=${text}`, '_blank');
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#e2e2e2] overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#002147] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#735c00] flex items-center justify-center text-white text-xl font-bold shadow">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-white">
                Konsultasi PPDB Online
              </h3>
              <p className="text-xs text-blue-100">
                Layanan Panitia WhatsApp ({siteConfig.schoolPhone})
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {sent ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-[#000a1e]">Mengarahkan ke WhatsApp...</h4>
            <p className="text-xs text-[#44474e]">
              Anda akan langsung terhubung dengan Admin PPDB {siteConfig.schoolName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Nama Anda
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#c4c6cf] focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Pilihan Program Diminati
              </label>
              <select
                value={programChoice}
                onChange={(e) => setProgramChoice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#c4c6cf] focus:outline-none focus:ring-2 focus:ring-[#002147] bg-white"
              >
                <option value="Paket A (Setara SD)">Paket A (Setara SD)</option>
                <option value="Paket B (Setara SMP)">Paket B (Setara SMP)</option>
                <option value="Paket C (Setara SMA)">Paket C (Setara SMA)</option>
                <option value="Kelas Entrepreneur & Tahfidz">Kelas Entrepreneur & Tahfidz</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Pesan / Pertanyaan
              </label>
              <textarea
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#c4c6cf] focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#735c00] hover:bg-[#745c00] text-white py-3 rounded-full font-semibold text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Kirim ke WhatsApp Admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
