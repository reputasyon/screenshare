# Ekran Yansıt - Screen Mirror Chrome Extension

[🇹🇷 Türkçe](#türkçe) | [🇬🇧 English](#english)

---

<p align="center">
  <a href="https://github.com/reputasyon/screenshare/stargazers"><img src="https://img.shields.io/github/stars/reputasyon/screenshare?style=social" alt="GitHub Stars"></a>
  <a href="https://github.com/reputasyon/screenshare/network/members"><img src="https://img.shields.io/github/forks/reputasyon/screenshare?style=social" alt="GitHub Forks"></a>
  <img src="https://img.shields.io/github/license/reputasyon/screenshare" alt="License">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-blue" alt="Manifest V3">
</p>

<p align="center">
  <strong>Mirror Chrome tabs to a second monitor or tablet - without the annoying "Stop sharing" badge!</strong>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/reputasyon/screenshare/main/demo.gif" alt="Demo" width="600">
</p>

> **Note:** Add a `demo.gif` to your repo showing the extension in action for best results!

---

## English

Mirror any Chrome tab to a second monitor or stream it to your iPad/tablet via QR code. Perfect for couples who want to watch Netflix/YouTube together from different screens!

### Why This Extension?

❌ **The Problem:** Chrome's built-in screen sharing shows an ugly "Stop sharing" badge that covers video controls and can't be dismissed.

✅ **The Solution:** This extension uses the Tab Capture API instead of Display Media API, so there's **no badge** - just clean, fullscreen mirroring!

### Features

- **🖥️ Mirror to Monitor**: Cast any tab to a second monitor in fullscreen
- **📱 Stream to Tablet**: Scan QR code with iPad/Android tablet to watch
- **🚫 No Badge**: No annoying "Stop sharing" overlay
- **🎬 60 FPS**: Smooth video playback
- **🔊 Audio Support**: Sound is included in the stream

### Quick Start

1. Clone this repo: `git clone https://github.com/reputasyon/screenshare.git`
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" → Select the cloned folder
5. Done! Click the extension icon on any video tab

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F | Toggle fullscreen |
| M | Toggle mute |
| R | Restart stream |

---

## Türkçe

Aktif Chrome sekmesini ikinci monitöre veya tablete yansıtın. Eşinizle birlikte farklı ekranlardan aynı içeriği izleyin!

## Özellikler

- **Monitöre Yansıt**: Sekmeyi ikinci monitörde tam ekran izleyin
- **Tablete Gönder**: QR kod ile iPad/Android tablete yayın yapın
- **Badge Yok**: Tab Capture API sayesinde tarayıcıda rahatsız edici uyarı yok
- **60 FPS**: Akıcı video deneyimi
- **Ses Desteği**: Video sesi de aktarılır

## Kurulum

1. Bu repoyu indirin veya klonlayın:
   ```bash
   git clone https://github.com/reputasyon/screenshare.git
   ```

2. Chrome'da `chrome://extensions/` adresine gidin

3. Sağ üstten "Geliştirici modu"nu açın

4. "Paketlenmemiş öğe yükle" tıklayın ve indirdiğiniz klasörü seçin

## Kullanım

### Monitöre Yansıtma
1. Yansıtmak istediğiniz sekmeye gidin (örn: Netflix, YouTube)
2. Eklenti ikonuna tıklayın
3. "Yansıtmayı Başlat" butonuna tıklayın
4. Açılan pencereyi ikinci monitöre sürükleyin
5. **F** tuşu ile tam ekran yapın

### Tablete Gönderme
1. Yansıtmak istediğiniz sekmeye gidin
2. Eklenti ikonuna tıklayın
3. "Tablete Gönder" butonuna tıklayın
4. Ekranda QR kod belirecek
5. iPad/Tablet ile QR kodu tarayın
6. Açılan sayfada "İzlemeye Başla" tıklayın

**Not:** Bilgisayar ve tablet aynı WiFi ağında olmalıdır.

## Klavye Kısayolları

| Tuş | İşlev |
|-----|-------|
| F | Tam ekran aç/kapat |
| R | Yeniden başlat |
| Çift tıklama | Tam ekran aç/kapat |

## Dosya Yapısı

```
screenshare/
├── manifest.json      # Eklenti yapılandırması
├── popup.html         # Popup arayüzü
├── popup.js           # Popup mantığı
├── background.js      # Service worker (Tab Capture)
├── mirror.html        # Monitör yansıtma sayfası
├── mirror.js          # Yansıtma mantığı
├── cast.html          # QR kod gösterme sayfası
├── cast.js            # WebRTC host mantığı
├── viewer.html        # Tablet izleme sayfası (GitHub Pages)
└── icon.png           # Eklenti ikonu
```

## Teknolojiler

- Chrome Extension Manifest V3
- Tab Capture API
- WebRTC (PeerJS)
- QR Code generation

## Gereksinimler

- Google Chrome (v88+)
- Tablet özelliği için: Aynı WiFi ağında iPad/Android tablet

## Lisans

MIT License - Özgürce kullanın, değiştirin, paylaşın!

---

Made with ❤️ for couples who want to watch together
