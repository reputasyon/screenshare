// DOM elementleri
const qrcodeDiv = document.getElementById('qrcode');
const statusDiv = document.getElementById('status');
const urlBox = document.getElementById('urlBox');
const viewerUrlLink = document.getElementById('viewerUrl');
const previewVideo = document.getElementById('preview');
const audioBtn = document.getElementById('audioBtn');

let peer = null;
let currentStream = null;
let connectedViewers = [];

// URL'den parametreleri al
const urlParams = new URLSearchParams(window.location.search);
const streamId = urlParams.get('streamId');

// Sayfa yüklendiğinde başlat
window.addEventListener('DOMContentLoaded', async () => {
  if (!streamId) {
    showError('Stream ID bulunamadı. Lütfen eklentiden tekrar deneyin.');
    return;
  }

  try {
    // Önce tab capture stream'i al
    await startCapture();

    // Sonra peer bağlantısı kur
    initPeer();
  } catch (error) {
    showError('Hata: ' + error.message);
  }
});

// Tab capture başlat (video + ses - tablette ses olsun, bilgisayarda da çalsın)
async function startCapture() {
  currentStream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    }
  });

  // Önizleme göster (ses açık başlasın - bilgisayarda da ses olsun)
  previewVideo.srcObject = currentStream;
  previewVideo.muted = false;

  // Buton durumunu güncelle
  audioBtn.textContent = 'Bilgisayar Sesini Kapat';
  audioBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
}

// PeerJS bağlantısı kur
function initPeer() {
  // Rastgele ama kısa bir ID oluştur
  const peerId = 'ekran-' + Math.random().toString(36).substr(2, 6);

  peer = new Peer(peerId, {
    debug: 2
  });

  peer.on('open', (id) => {
    console.log('Peer ID:', id);
    generateQRCode(id);
  });

  // Data connection geldiğinde (viewer bağlandığında)
  peer.on('connection', (conn) => {
    console.log('Viewer bağlandı:', conn.peer);

    conn.on('open', () => {
      conn.on('data', (data) => {
        console.log('Gelen mesaj:', data);

        // Viewer stream istedi, ona call yap
        if (data.type === 'request-stream') {
          sendStreamToViewer(conn.peer);
        }
      });
    });
  });

  peer.on('error', (error) => {
    console.error('Peer error:', error);
    if (error.type !== 'peer-unavailable') {
      showError('Bağlantı hatası: ' + error.type);
    }
  });
}

// Viewer'a stream gönder
function sendStreamToViewer(viewerId) {
  if (!currentStream) {
    console.error('Stream yok!');
    return;
  }

  console.log('Stream gönderiliyor:', viewerId);

  const call = peer.call(viewerId, currentStream);

  call.on('stream', () => {
    // Viewer'dan stream gelmez ama event tetiklenir
  });

  call.on('close', () => {
    console.log('Viewer bağlantısı kapandı:', viewerId);
    updateViewerCount(-1);
  });

  call.on('error', (err) => {
    console.error('Call error:', err);
  });

  connectedViewers.push(viewerId);
  updateViewerCount(1);

  statusDiv.className = 'status connected';
  statusDiv.innerHTML = '✅ Tablet bağlandı! Yayın aktif.';

  // Tablet bağlandığında preview'ı gizle (performans için)
  previewVideo.style.display = 'none';
}

function updateViewerCount(delta) {
  // İsteğe bağlı: bağlı viewer sayısını göster
}

// QR kod oluştur
function generateQRCode(peerId) {
  // Viewer URL'i oluştur
  const viewerUrl = getViewerUrl(peerId);

  // QR kodu oluştur
  QRCode.toCanvas(document.createElement('canvas'), viewerUrl, {
    width: 200,
    margin: 0,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff'
    }
  }, (error, canvas) => {
    if (error) {
      console.error(error);
      return;
    }
    qrcodeDiv.innerHTML = '';
    qrcodeDiv.appendChild(canvas);
  });

  // URL'i de göster
  viewerUrlLink.href = viewerUrl;
  viewerUrlLink.textContent = viewerUrl;
  urlBox.classList.remove('hidden');
}

// Viewer URL'i oluştur
function getViewerUrl(peerId) {
  // GitHub Pages'e yüklenecek viewer sayfası
  // Kullanıcı kendi GitHub'ına yükleyebilir
  // Şimdilik örnek URL kullanıyoruz

  // Lokal test için: chrome-extension://[ID]/viewer.html kullanılamaz
  // Çünkü tablet extension'a erişemez

  // Çözüm 1: GitHub Pages
  // Çözüm 2: Netlify/Vercel
  // Çözüm 3: Kullanıcının kendi hosting'i

  // GitHub Pages URL'i
  const baseUrl = 'https://reputasyon.github.io/screenshare/viewer.html';

  return `${baseUrl}?peerId=${peerId}`;
}

function showError(message) {
  statusDiv.className = 'status error';
  statusDiv.textContent = '❌ ' + message;
}

// Bilgisayar sesi aç/kapat butonu
audioBtn.addEventListener('click', () => {
  if (previewVideo.muted) {
    previewVideo.muted = false;
    audioBtn.textContent = '🔇 Bilgisayar Sesini Kapat';
    audioBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  } else {
    previewVideo.muted = true;
    audioBtn.textContent = '🔊 Bilgisayar Sesini Aç';
    audioBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
});

// Sayfa kapanırken temizlik
window.addEventListener('beforeunload', () => {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  if (peer) {
    peer.destroy();
  }
});
