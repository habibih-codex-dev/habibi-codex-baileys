// ============================================================
// habibi-codex-baileys — sendInteractive()
// Kirim interactiveMessage + nativeFlowMessage dengan mudah
// ============================================================

import type { WASocket } from '@whiskeysockets/baileys'
import { generateMessageID } from '@whiskeysockets/baileys'
import type { SendInteractiveOptions, InteractiveButton } from './types.js'

/**
 * Deteksi tipe tombol berdasarkan properti yang ada
 */
function resolveButtonType(btn: InteractiveButton) {
  if (btn.url) {
    return {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: btn.text,
        url: btn.url,
        merchant_url: btn.url,
      }),
    }
  }

  if (btn.phone) {
    return {
      name: 'cta_call',
      buttonParamsJson: JSON.stringify({
        display_text: btn.text,
        phone_number: btn.phone,
      }),
    }
  }

  // Default: quick_reply
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: btn.text,
      id: btn.id ?? btn.text,
    }),
  }
}

/**
 * Kirim interactiveMessage dengan nativeFlowMessage (button WA modern)
 *
 * @example
 * await sendInteractive(sock, jid, {
 *   body: "Pilih menu:",
 *   footer: "Powered by habibi-codex-baileys",
 *   header: { title: "🤖 Main Menu" },
 *   buttons: [
 *     { text: "📦 Produk", id: "produk" },
 *     { text: "💬 CS", id: "cs" },
 *     { text: "🌐 Website", url: "https://example.com" },
 *   ]
 * })
 */
export async function sendInteractive(
  sock: WASocket,
  jid: string,
  options: SendInteractiveOptions
): Promise<void> {
  const { body, footer, header, buttons, quoted } = options

  // Build header node
  const headerNode: any = {
    hasMediaAttachment: false,
    ...(header?.title && { title: header.title }),
    ...(header?.subtitle && { subtitle: header.subtitle }),
  }

  if (header?.image) {
    headerNode.imageMessage = { url: header.image }
    headerNode.hasMediaAttachment = true
  } else if (header?.video) {
    headerNode.videoMessage = { url: header.video }
    headerNode.hasMediaAttachment = true
  }

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
      interactiveMessage: {
        body: { text: body },
        ...(footer && { footer: { text: footer } }),
        header: headerNode,
        nativeFlowMessage: {
          buttons: buttons.map(resolveButtonType),
        },
        ...(contextInfo && { contextInfo }),
      },
    },
    { messageId: generateMessageID() }
  )
}
