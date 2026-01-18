# Ekran Yansıt - Screen Mirror Chrome Extension

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
