// ============================================================
// habibi-codex-baileys
// Wrapper @whiskeysockets/baileys v7 dengan dukungan
// interactiveMessage, nativeFlow button & listMessage
// ============================================================

// Re-export SEMUA dari Baileys resmi
// Jadi bisa pakai: import { makeWASocket, ... } from 'habibi-codex-baileys'
export * from '@whiskeysockets/baileys'

// Export helper functions
export { sendInteractive } from './interactive.js'
export { sendListMessage } from './list.js'
export { parseButtonResponse, isFromMe, isSystemMessage } from './response.js'
export { connectWithQR, connectWithPairing } from './auth.js'

// Export types
export type {
  InteractiveButton,
  InteractiveHeader,
  SendInteractiveOptions,
  ListRow,
  ListSection,
  SendListOptions,
  ButtonResponseResult,
} from './types.js'

export type { ConnectOptions } from './auth.js'
} from './types.js'
