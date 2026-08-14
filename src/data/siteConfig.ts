export interface SiteConfig {
  // Brand & General
  schoolName: string;
  logoUrl: string; // URL for custom school logo
  accreditationText: string;
  academicYear: string;
  npsn: string;
  skIzin: string;

  // School Profile & Vision Mission
  schoolProfileTitle: string;
  vision: string;
  mission: string;
  history: string;

  // Running Announcement Banner
  showAnnouncement: boolean;
  announcementText: string;
  announcementBgColor: 'navy' | 'amber' | 'emerald';

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  graduatesCount: string;
  graduatesLabel: string;

  // Sambutan Kepala Sekolah
  principalName: string;
  principalTitle: string;
  principalMessage: string;
  principalPhotoUrl: string;

  // Contact Info & Footer
  schoolPhone: string;
  schoolEmail: string;
  schoolAddress: string;
  operatingHours: string;

  // Social & Virtual Tour Links
  youtubeVirtualTourUrl: string;
  instagramUrl: string;
  facebookUrl: string;

  // Program Descriptions
  paketADesc: string;
  paketBDesc: string;
  paketCDesc: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  schoolName: 'PKBM AL-ABROR PALMERAH',
  logoUrl: '',
  accreditationText: 'Lembaga Pendidikan Terakreditasi B',
  academicYear: '2024/2025',
  npsn: 'P2961234',
  skIzin: '503/128/DISDIK/2021',

  schoolProfileTitle: 'Profil Lembaga PKBM AL-ABROR PALMERAH',
  vision: 'Mewujudkan generasi cerdas, mandiri, berakhlak mulia, dan berdaya saing tinggi melalui pendidikan kesetaraan yang inklusif.',
  mission: '1. Menyediakan layanan pendidikan Paket A, B, C berstandar nasional.\n2. Mengintegrasikan program Bahasa Inggris British & Tahfidz Al-Qur\'an.\n3. Membekali peserta didik dengan keterampilan wirausaha (entrepreneurship).\n4. Menjalin kemitraan dengan IDUKA dan Perguruan Tinggi.',
  history: 'Didirikan sejak tahun 2012, PKBM AL-ABROR PALMERAH berfokus memberikan akses pendidikan seluas-luasnya bagi masyarakat Jakarta Barat dan sekitarnya yang membutuhkan fleksibilitas belajar tanpa mengorbankan kualitas akademik.',

  showAnnouncement: true,
  announcementText: '🎉 PPDB Tahun Ajaran 2024/2025 Telah Dibuka! Bebas Biaya Pendaftaran untuk 50 Pendaftar Pertama.',
  announcementBgColor: 'navy',

  heroTitle: 'Membangun Masa Depan Melalui Pendidikan Kesetaraan yang Berkualitas',
  heroSubtitle: 'PKBM AL-ABROR PALMERAH menyediakan layanan pendidikan Paket A, B, dan C dengan standar nasional. Kami mengintegrasikan Program Unggulan English British & Tahfidz untuk mencetak generasi cerdas dan berakhlak mulia.',
  heroImageUrl: '/src/assets/images/indonesian_students_1786585730581.jpg',
  ctaPrimaryText: 'Daftar PPDB Sekarang',
  ctaSecondaryText: 'Pelajari Kurikulum',
  graduatesCount: '1000+',
  graduatesLabel: 'Lulusan Sukses',

  principalName: 'Drs. H. Ahmad Dahlan, M.Pd.',
  principalTitle: 'Kepala PKBM AL-ABROR PALMERAH',
  principalMessage: 'Selamat datang di PKBM AL-ABROR PALMERAH, Jakarta Barat. Kami berkomitmen memberikan layanan pendidikan inklusif, fleksibel, dan berkualitas tinggi agar setiap peserta didik mampu meraih cita-citanya tanpa terkendala usia maupun latar belakang.',
  principalPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',

  schoolPhone: '081234567890',
  schoolEmail: 'info@pkbmalabror.sch.id',
  schoolAddress: 'Jl. Palmerah Barat No. 123, Palmerah, Jakarta Barat, DKI Jakarta',
  operatingHours: 'Senin - Sabtu: 08:00 - 16:00 WIB',

  youtubeVirtualTourUrl: 'https://www.youtube.com',
  instagramUrl: 'https://instagram.com/pkbm_alabror',
  facebookUrl: 'https://facebook.com/pkbmalabror',

  paketADesc: 'Pendidikan dasar setara Sekolah Dasar (SD) yang membangun pondasi literasi, numerasi, dan karakter kuat bagi peserta didik.',
  paketBDesc: 'Pendidikan menengah pertama yang mengembangkan keterampilan analitis, sosial, dan kesiapan untuk jenjang selanjutnya.',
  paketCDesc: 'Pendidikan menengah atas komprehensif, dilengkapi kelas peminatan untuk persiapan dunia kerja atau perguruan tinggi.',
};

const LOCAL_STORAGE_KEY = 'pkbm_site_config_v1';

export function getStoredSiteConfig(): SiteConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error reading site config from localStorage:', err);
  }
  return DEFAULT_SITE_CONFIG;
}

export function saveStoredSiteConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('site_config_updated'));
  } catch (err) {
    console.error('Error saving site config to localStorage:', err);
  }
}
