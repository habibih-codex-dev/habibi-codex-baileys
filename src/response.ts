// ============================================================
// habibi-codex-baileys — parseButtonResponse()
// Tangkap semua tipe button response secara konsisten
// ============================================================

import type { WAMessage } from '@whiskeysockets/baileys'
import type { ButtonResponseResult } from './types.js'

/**
 * Parse response dari user yang menekan button (quick_reply, list, cta)
 * Return null jika bukan button response
 *
 * @example
 * sock.ev.on('messages.upsert', ({ messages }) => {
 *   const msg = messages[0]
 *   if (msg.key.fromMe) return
 *
 *   const response = parseButtonResponse(msg)
 *   if (!response) return
 *
 *   console.log(response.id)   // ID tombol yang dipilih
 *   console.log(response.text) // Teks tombol
 *   console.log(response.type) // 'quick_reply' | 'list' | 'url'
 * })
 */
export function parseButtonResponse(msg: WAMessage): ButtonResponseResult | null {
  const message = msg.message

  if (!message) return null

  // 1. interactiveResponseMessage (nativeFlow — quick_reply & cta_url)
  const nativeFlow = message.interactiveResponseMessage?.nativeFlowResponseMessage
  if (nativeFlow) {
    try {
      const params = JSON.parse(nativeFlow.paramsJson ?? '{}')
      return {
        type: 'quick_reply',
        id: params.id ?? nativeFlow.name ?? '',
        text: params.display_text ?? nativeFlow.name ?? '',
        raw: params,
      }
    } catch {
      return {
        type: 'unknown',
        id: nativeFlow.name ?? '',
        text: nativeFlow.name ?? '',
        raw: nativeFlow,
      }
    }
  }

  // 2. listResponseMessage
  const listResponse = message.listResponseMessage
  if (listResponse) {
    return {
      type: 'list',
      id: listResponse.singleSelectReply?.selectedRowId ?? '',
      text: listResponse.title ?? '',
      raw: listResponse,
    }
  }

  // 3. buttonsResponseMessage (legacy)
  const buttonsResponse = message.buttonsResponseMessage
  if (buttonsResponse) {
    return {
      type: 'quick_reply',
      id: buttonsResponse.selectedButtonId ?? '',
      text: buttonsResponse.selectedDisplayText ?? '',
      raw: buttonsResponse,
    }
  }

  // 4. templateButtonReplyMessage
  const templateReply = message.templateButtonReplyMessage
  if (templateReply) {
    return {
      type: 'quick_reply',
      id: templateReply.selectedId ?? '',
      text: templateReply.selectedDisplayText ?? '',
      raw: templateReply,
    }
  }

  return null
}

/**
 * Guard — cek apakah pesan dari bot sendiri, perlu di-skip
 * Mencegah bot proses pesannya sendiri (infinite loop / antilink bug)
 */
export function isFromMe(msg: WAMessage): boolean {
  return msg.key.fromMe === true
}

/**
 * Guard — cek apakah pesan dari sistem/status WA
 */
export function isSystemMessage(msg: WAMessage): boolean {
  return (
    msg.key.remoteJid === 'status@broadcast' ||
    !!msg.message?.protocolMessage ||
    !!msg.message?.senderKeyDistributionMessage
  )
}
