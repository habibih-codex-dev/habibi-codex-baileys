// ============================================================
// habibi-codex-baileys — Types
// ============================================================

export interface InteractiveButton {
  /** Teks yang tampil di tombol */
  text: string
  /** Untuk quick_reply: ID yang dikirim saat user tap tombol */
  id?: string
  /** Untuk cta_url: URL yang dibuka saat user tap tombol */
  url?: string
  /** Untuk cta_call: nomor telepon yang dihubungi */
  phone?: string
}

export interface InteractiveHeader {
  title?: string
  subtitle?: string
  /** Gambar header (Buffer atau URL) */
  image?: Buffer | string
  /** Video header (Buffer atau URL) */
  video?: Buffer | string
  /** Dokumen header */
  document?: Buffer | string
  hasMediaAttachment?: boolean
}

export interface SendInteractiveOptions {
  /** Teks utama pesan */
  body: string
  /** Teks kecil di bawah tombol */
  footer?: string
  /** Header pesan (judul, gambar, dll) */
  header?: InteractiveHeader
  /** Daftar tombol (maks 3 di WA) */
  buttons: InteractiveButton[]
  /** Pesan yang di-quote */
  quoted?: any
}

export interface ListRow {
  title: string
  description?: string
  rowId: string
}

export interface ListSection {
  title: string
  rows: ListRow[]
}

export interface SendListOptions {
  /** Teks utama pesan */
  body: string
  /** Judul list (muncul di header modal) */
  title?: string
  /** Teks footer */
  footer?: string
  /** Teks tombol yang memunculkan list */
  buttonText: string
  /** Sections dengan rows */
  sections: ListSection[]
  /** Pesan yang di-quote */
  quoted?: any
}

export interface ButtonResponseResult {
  /** Tipe response: 'quick_reply' | 'list' | 'url' | 'unknown' */
  type: 'quick_reply' | 'list' | 'url' | 'unknown'
  /** ID tombol yang dipilih */
  id: string
  /** Teks yang tampil di tombol */
  text: string
  /** Raw data tambahan */
  raw?: any
}
