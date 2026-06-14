// ============================================================
// habibi-codex-baileys — Auth Helpers
// connectWithQR() & connectWithPairing()
// ============================================================

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  type WASocket,
  type UserFacingSocketConfig,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

export interface ConnectOptions {
  /** Folder untuk simpan kredensial sesi (default: './auth') */
  authFolder?: string
  /** Tampilkan QR di terminal otomatis (default: true untuk QR mode) */
  printQR?: boolean
  /** Callback saat QR string tersedia */
  onQR?: (qr: string) => void
  /** Callback saat pairing code tersedia */
  onPairingCode?: (code: string) => void
  /** Callback saat berhasil connect */
  onConnected?: (sock: WASocket) => void
  /** Auto-reconnect saat disconnect (default: true) */
  autoReconnect?: boolean
  /** Config tambahan untuk makeWASocket */
  socketConfig?: Partial<UserFacingSocketConfig>
}

/**
 * Connect ke WhatsApp via QR Code
 *
 * @example
 * const sock = await connectWithQR({
 *   authFolder: './auth',
 *   onQR: (qr) => console.log('Scan QR ini:', qr),
 *   onConnected: () => console.log('Bot online!'),
 * })
 */
export async function connectWithQR(options: ConnectOptions = {}): Promise<WASocket> {
  const {
    authFolder = './auth',
    printQR = true,
    onQR,
    onConnected,
    autoReconnect = true,
    socketConfig = {},
  } = options

  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    ...socketConfig,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      if (printQR) {
        try {
          const qrcode = await import('qrcode-terminal')
          qrcode.default.generate(qr, { small: true })
        } catch {
          console.log('QR string:', qr)
        }
      }
      onQR?.(qr)
    }

    if (connection === 'open') {
      onConnected?.(sock)
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut

      if (autoReconnect && shouldReconnect) {
        connectWithQR(options)
      }
    }
  })

  return sock
}

/**
 * Connect ke WhatsApp via Pairing Code (8 digit, tanpa scan QR)
 *
 * @example
 * const sock = await connectWithPairing('628123456789', {
 *   authFolder: './auth',
 *   onPairingCode: (code) => console.log('Masukkan kode ini di WA:', code),
 *   onConnected: () => console.log('Bot online!'),
 * })
 */
export async function connectWithPairing(
  phoneNumber: string,
  options: ConnectOptions = {}
): Promise<WASocket> {
  const {
    authFolder = './auth',
    onPairingCode,
    onConnected,
    autoReconnect = true,
    socketConfig = {},
  } = options

  // Bersihkan nomor — hapus +, spasi, strip
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')

  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    ...socketConfig,
  })

  sock.ev.on('creds.update', saveCreds)

  // Request pairing code kalau belum registered
  if (!sock.authState.creds.registered) {
    // Delay sebentar supaya socket siap
    await new Promise((r) => setTimeout(r, 3000))
    const code = await sock.requestPairingCode(cleanNumber)
    // Format jadi XXXX-XXXX biar gampang dibaca
    const formatted = code?.match(/.{1,4}/g)?.join('-') ?? code
    onPairingCode?.(formatted)
    if (!onPairingCode) {
      console.log(`\n🔢 Pairing Code: ${formatted}`)
      console.log('Masukkan di: WhatsApp → Perangkat Tertaut → Tautkan dengan nomor telepon\n')
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      onConnected?.(sock)
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut

      if (autoReconnect && shouldReconnect) {
        connectWithPairing(phoneNumber, options)
      }
    }
  })

  return sock
}
