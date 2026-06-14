# habibi-codex-baileys 🤖

Wrapper ringan di atas [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) v7 yang menambahkan dukungan **interactiveMessage**, **nativeFlow button**, dan **listMessage** langsung via API yang mudah dipakai.

## ✨ Kelebihan

- ✅ Semua fitur Baileys v7 tetap tersedia
- ✅ Kirim nativeFlow button tanpa ribet `relayMessage` manual
- ✅ Kirim listMessage dengan API yang bersih
- ✅ Auto-detect semua tipe button response
- ✅ Guard functions untuk cegah bug infinite loop
- ✅ Dapat security update otomatis dari Baileys v7

---

## 📦 Instalasi

### Via GitHub
```bash
npm install github:USERNAME/habibi-codex-baileys
```

### Via NPM (setelah publish)
```bash
npm install habibi-codex-baileys
```

---

## 🚀 Quick Start

```js
import makeWASocket, { useMultiFileAuthState } from 'habibi-codex-baileys'
import { sendInteractive, sendListMessage, parseButtonResponse, isFromMe, isSystemMessage } from 'habibi-codex-baileys'

const { state, saveCreds } = await useMultiFileAuthState('./auth')

const sock = makeWASocket({ auth: state })

sock.ev.on('creds.update', saveCreds)

sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]

  // ⚠️ WAJIB: skip pesan dari bot sendiri & sistem
  if (isFromMe(msg)) return
  if (isSystemMessage(msg)) return

  const jid = msg.key.remoteJid

  // Tangkap response button
  const btnRes = parseButtonResponse(msg)
  if (btnRes) {
    console.log('Button ditekan:', btnRes.id, btnRes.text)
    
    if (btnRes.id === 'menu') {
      await kirimMenu(sock, jid)
    }
    return
  }

  // Handle pesan teks biasa
  const text = msg.message?.conversation ?? 
               msg.message?.extendedTextMessage?.text ?? ''

  if (text === '.menu') {
    await kirimMenu(sock, jid)
  }
})

async function kirimMenu(sock, jid) {
  await sendInteractive(sock, jid, {
    body: "Halo! Pilih menu di bawah:",
    footer: "Powered by habibi-codex-baileys",
    header: { title: "🤖 Main Menu" },
    buttons: [
      { text: "📦 Produk",  id: "produk" },
      { text: "💬 Hubungi CS", id: "cs" },
      { text: "🌐 Website", url: "https://example.com" },
    ]
  })
}
```

---

## 📖 API Reference

### `sendInteractive(sock, jid, options)`

Kirim interactiveMessage dengan nativeFlow buttons (tampilan modern di WA).

```js
await sendInteractive(sock, jid, {
  body: "Teks utama pesan",           // wajib
  footer: "Teks kecil di bawah",      // opsional
  header: {
    title: "Judul di atas",           // opsional
    subtitle: "Sub judul",            // opsional
  },
  buttons: [
    // Quick reply — kirim ID ke bot saat ditekan
    { text: "✅ Pilihan 1", id: "pilihan1" },
    { text: "❌ Pilihan 2", id: "pilihan2" },

    // CTA URL — buka browser saat ditekan
    { text: "🌐 Website", url: "https://example.com" },

    // CTA Call — buka dialer saat ditekan
    { text: "📞 Hubungi", phone: "628123456789" },
  ],
  quoted: msg,  // opsional — untuk reply/quote pesan
})
```

---

### `sendListMessage(sock, jid, options)`

Kirim listMessage (menu pilihan scroll).

```js
await sendListMessage(sock, jid, {
  body: "Ketuk tombol untuk melihat menu",
  title: "Menu Bot",                // opsional
  footer: "Pilih salah satu",       // opsional
  buttonText: "📋 Lihat Menu",
  sections: [
    {
      title: "🛒 Produk",
      rows: [
        { title: "Paket Basic", rowId: "basic", description: "Rp 50rb/bln" },
        { title: "Paket Pro",   rowId: "pro",   description: "Rp 100rb/bln" },
      ]
    },
    {
      title: "⚙️ Bantuan",
      rows: [
        { title: "FAQ",             rowId: "faq" },
        { title: "Hubungi Admin",   rowId: "admin" },
      ]
    }
  ],
  quoted: msg,  // opsional
})
```

---

### `parseButtonResponse(msg)`

Tangkap response dari user yang menekan button apapun. Return `null` jika bukan button response.

```js
const response = parseButtonResponse(msg)

if (response) {
  console.log(response.type)  // 'quick_reply' | 'list' | 'url' | 'unknown'
  console.log(response.id)    // ID tombol yang dipilih
  console.log(response.text)  // Teks tombol
}
```

---

### `isFromMe(msg)`

Cek apakah pesan dari bot sendiri — **wajib dipakai** untuk cegah infinite loop dan bug antilink.

```js
if (isFromMe(msg)) return  // skip pesan bot sendiri
```

---

### `isSystemMessage(msg)`

Cek apakah pesan dari sistem WA (status broadcast, protocol message, dll).

```js
if (isSystemMessage(msg)) return
```

---

## 🛡️ Tips Antilink yang Benar

```js
sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0]

  // ✅ SELALU cek ini dulu — cegah bot proses pesannya sendiri
  if (isFromMe(msg)) return
  if (isSystemMessage(msg)) return

  const jid = msg.key.remoteJid
  const isGroup = jid?.endsWith('@g.us')
  const text = msg.message?.conversation ?? 
               msg.message?.extendedTextMessage?.text ?? ''

  // Antilink
  if (isGroup && (text.includes('http') || text.includes('wa.me'))) {
    // Cek apakah bot admin dulu
    const groupMeta = await sock.groupMetadata(jid)
    const botJid = sock.user.id
    const isAdmin = groupMeta.participants
      .find(p => p.id === botJid)?.admin !== null

    if (!isAdmin) {
      await sock.sendMessage(jid, { text: '⚠️ Bot harus jadi admin!' })
      return
    }

    // Hapus pesan
    await sock.sendMessage(jid, { delete: msg.key })
    await sock.sendMessage(jid, { 
      text: `⚠️ @${msg.key.participant?.split('@')[0]} link dilarang!`,
      mentions: [msg.key.participant]
    })
  }
})
```

---

## 🔧 Development

```bash
git clone https://github.com/USERNAME/habibi-codex-baileys
cd habibi-codex-baileys
npm install
npm run build   # compile TypeScript
npm run dev     # watch mode
```

---

## 📤 Publish ke NPM

```bash
npm login
npm publish --access public
```

---

## 📝 License

MIT © habibi-codex
