export interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetMeta {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: {
    properties: {
      sheetId: number;
      title: string;
    };
  }[];
  spreadsheetUrl: string;
}

/**
 * List Google Spreadsheets owned or accessible by user in Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gagal mengambil daftar file Google Drive.');
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing spreadsheets:', error);
    throw error;
  }
}

/**
 * Create a new official Backend Google Spreadsheet for PKBM AL-ABROR
 */
export async function createPKBMSpreadsheet(
  accessToken: string,
  title: string = 'Backend Database PKBM AL-ABROR'
): Promise<SheetMeta> {
  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'PPDB Registrations',
          gridProperties: { rowCount: 100, columnCount: 30 },
        },
      },
      {
        properties: {
          title: 'Siswa Aktif',
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'Tenaga Pendidik',
          gridProperties: { rowCount: 50, columnCount: 8 },
        },
      },
      {
        properties: {
          title: 'Pembayaran SPP',
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'User Accounts',
          gridProperties: { rowCount: 50, columnCount: 8 },
        },
      },
      {
        properties: {
          title: 'Konfigurasi Website',
          gridProperties: { rowCount: 20, columnCount: 4 },
        },
      },
      {
        properties: {
          title: 'Log Aktivitas',
          gridProperties: { rowCount: 100, columnCount: 6 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Sheet backend.');
  }

  const meta: SheetMeta = await response.json();

  // 1. Populate Header for PPDB DAPODIK
  await updateSheetRange(accessToken, meta.spreadsheetId, "'PPDB Registrations'!A1:AD1", [
    [
      'No. Registrasi',
      'Jenis Pendaftaran',
      'Program Kesetaraan',
      'Nama Lengkap Siswa',
      'NIK',
      'NISN',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Agama',
      'Sekolah Asal / NPSN',
      'No. Ijazah / SKL',
      'Alamat Jalan',
      'RT/RW',
      'Dusun/Kelurahan',
      'Kecamatan',
      'Kabupaten/Kota',
      'Provinsi',
      'Kode Pos',
      'Nama Ayah Kandung',
      'Pekerjaan Ayah',
      'Nama Ibu Kandung',
      'Pekerjaan Ibu',
      'No. WhatsApp Ortu/Wali',
      'Tinggi Badan (cm)',
      'Berat Badan (kg)',
      'Jumlah Saudara',
      'No. KIP/PKH/KKS',
      'Status DAPODIK',
      'Tanggal Pendaftaran',
    ],
  ]);

  // 2. Populate Header for Siswa Aktif
  await updateSheetRange(accessToken, meta.spreadsheetId, "'Siswa Aktif'!A1:J1", [
    [
      'ID Siswa',
      'NIS',
      'Nama Lengkap Siswa',
      'Program Kesetaraan',
      'Rombel / Kelas',
      'Status Siswa',
      'Nama Wali / Ortu',
      'No. WhatsApp Ortu',
      'Tanggal Masuk',
      'Catatan Tambahan',
    ],
  ]);

  // 3. Populate Header for Tenaga Pendidik
  await updateSheetRange(accessToken, meta.spreadsheetId, "'Tenaga Pendidik'!A1:H1", [
    [
      'ID Tutor',
      'NIP / NUPTK',
      'Nama & Gelar Guru',
      'Mata Pelajaran Utama',
      'Program Mengajar',
      'No. WhatsApp Guru',
      'Status Mengajar',
      'Kualifikasi Pendidikan',
    ],
  ]);

  // 4. Populate Header for Pembayaran
  await updateSheetRange(accessToken, meta.spreadsheetId, "'Pembayaran SPP'!A1:J1", [
    [
      'No. Referensi',
      'NIS',
      'Nama Siswa',
      'Kategori Tagihan',
      'Metode Pembayaran',
      'Nominal (Rp)',
      'Status Pembayaran',
      'Tanggal Bayar',
      'Waktu Transaksi',
      'Keterangan Transaksi',
    ],
  ]);

  // 5. Populate Header for User Accounts
  await updateSheetRange(accessToken, meta.spreadsheetId, "'User Accounts'!A1:H1", [
    [
      'User ID',
      'Username / Email',
      'Nama Lengkap',
      'Role Akses',
      'Status Akun',
      'Linked NIS / NIP',
      'Hak Akses JSON',
      'Tanggal Dibuat',
    ],
  ]);

  // 6. Populate Header for Konfigurasi Website
  await updateSheetRange(accessToken, meta.spreadsheetId, "'Konfigurasi Website'!A1:D1", [
    [
      'Config Key',
      'Config Value',
      'Kategori',
      'Terakhir Diubah',
    ],
  ]);

  // 7. Populate Header for Log Aktivitas
  await updateSheetRange(accessToken, meta.spreadsheetId, "'Log Aktivitas'!A1:F1", [
    [
      'Timestamp',
      'User Actor',
      'Role',
      'Nama Tindakan',
      'Modul Aplikasi',
      'Perangkat & IP',
    ],
  ]);

  return meta;
}

/**
 * Get metadata for spreadsheet
 */
export async function getSpreadsheetMeta(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMeta> {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal mengambil metadata Google Sheet.');
  }

  return response.json();
}

/**
 * Read values from a spreadsheet range
 */
export async function readSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal membaca range Google Sheet.');
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Append rows to a sheet
 */
export async function appendSheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal menambahkan baris ke Google Sheet.');
  }

  return response.json();
}

/**
 * Update range in sheet
 */
export async function updateSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal memperbarui Google Sheet.');
  }

  return response.json();
}
