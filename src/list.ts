// ============================================================
// habibi-codex-baileys — sendListMessage()
// Kirim listMessage (menu pilihan scroll) dengan mudah
// ============================================================

import type { WASocket } from '@whiskeysockets/baileys'
import { generateMessageID } from '@whiskeysockets/baileys'
import type { SendListOptions } from './types.js'

/**
 * Kirim listMessage (tombol yang membuka daftar pilihan scroll)
 *
 * @example
 * await sendListMessage(sock, jid, {
 *   body: "Ketuk tombol untuk melihat menu",
 *   title: "Menu Bot",
 *   buttonText: "📋 Lihat Menu",
 *   sections: [
 *     {
 *       title: "🛒 Produk",
 *       rows: [
 *         { title: "Paket Basic", rowId: "basic", description: "Rp 50rb/bln" },
 *         { title: "Paket Pro", rowId: "pro", description: "Rp 100rb/bln" },
 *       ]
 *     },
 *     {
 *       title: "⚙️ Bantuan",
 *       rows: [
 *         { title: "FAQ", rowId: "faq" },
 *         { title: "Hubungi Admin", rowId: "admin" },
 *       ]
 *     }
 *   ]
 * })
 */
export async function sendListMessage(
  sock: WASocket,
  jid: string,
  options: SendListOptions
): Promise<void> {
  const { body, title, footer, buttonText, sections, quoted } = options

  const contextInfo = quoted
    ? {
        stanzaId: quoted.key?.id,
        participant: quoted.key?.participant ?? quoted.key?.remoteJid,
        quotedMessage: quoted.message,
      }
    : undefined

  await sock.relayMessage(
    jid,
    {
      listMessage: {
        title: title ?? '',
        description: body,
        buttonText,
        listType: 1,
        sections: sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({
            title: row.title,
            description: row.description ?? '',
            rowId: row.rowId,
          })),
        })),
        ...(footer && { footerText: footer }),
        ...(contextInfo && { contextInfo }),
      },
    },
    { messageId: generateMessageID() }
  )
}
