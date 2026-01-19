// DOM elementleri
const qrcodeDiv = document.getElementById('qrcode');
const statusDiv = document.getElementById('status');
const urlBox = document.getElementById('urlBox');
const viewerUrlLink = document.getElementById('viewerUrl');
const previewVideo = document.getElementById('preview');
const audioBtn = document.getElementById('audioBtn');
const talkBtn = document.getElementById('talkBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const switchCameraBtn = document.getElementById('switchCameraBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const openCameraBtn = document.getElementById('openCameraBtn');
const cameraFullscreenBtn = document.getElementById('cameraFullscreenBtn');

let peer = null;
let currentStream = null;
let connectedViewers = [];
let dataConnections = []; // Tüm data connection'ları tut
let remoteAudio = null; // Tabletten gelen ses için
let remoteCamera = null; // Tabletten gelen kamera için
let micStream = null;
let isTalking = false;
let securityPin = null; // 4 haneli güvenlik PIN'i

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
  audioBtn.textContent = 'Sesi Kapat';
  audioBtn.classList.add('active');
}

// 4 haneli rastgele PIN oluştur
function generatePin() {
  securityPin = Math.floor(1000 + Math.random() * 9000).toString();
  const pinCodeEl = document.getElementById('pinCode');
  if (pinCodeEl) {
    pinCodeEl.textContent = securityPin;
  }
  console.log('Güvenlik PIN:', securityPin);
  return securityPin;
}

// PeerJS bağlantısı kur
function initPeer() {
  // PIN oluştur
  generatePin();

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
    console.log('Viewer bağlanmaya çalışıyor:', conn.peer);
    let isAuthenticated = false;

    conn.on('open', () => {
      conn.on('data', (data) => {
        console.log('Gelen mesaj:', data);

        // PIN doğrulama
        if (data.type === 'verify-pin') {
          if (data.pin === securityPin) {
            isAuthenticated = true;
            dataConnections.push(conn);
            conn.send({ type: 'pin-verified', success: true });
            console.log('PIN doğrulandı, bağlantı onaylandı!');
          } else {
            conn.send({ type: 'pin-verified', success: false });
            console.log('Yanlış PIN girişi!');
          }
          return;
        }

        // PIN doğrulanmadan diğer istekleri reddet
        if (!isAuthenticated) {
          console.log('Kimlik doğrulanmamış istek reddedildi');
          conn.send({ type: 'error', message: 'PIN doğrulaması gerekli' });
          return;
        }

        // Viewer stream istedi, ona call yap
        if (data.type === 'request-stream') {
          sendStreamToViewer(conn.peer);
        }

        // Kamera açıldı
        if (data.type === 'camera-started') {
          console.log('Tablet kamerası açıldı!');
          showCameraPreview(true);
        }

        // Kamera kapandı
        if (data.type === 'camera-stopped') {
          console.log('Tablet kamerası kapandı!');
          showCameraPreview(false);
        }
      });

      conn.on('close', () => {
        dataConnections = dataConnections.filter(c => c !== conn);
      });
    });
  });

  peer.on('error', (error) => {
    console.error('Peer error:', error);
    if (error.type !== 'peer-unavailable') {
      showError('Bağlantı hatası: ' + error.type);
    }
  });

  // Tabletten gelen ses veya kamera
  peer.on('call', (call) => {
    console.log('Tabletten stream geliyor!');
    call.answer(); // Boş cevap ver, sadece al

    call.on('stream', (remoteStream) => {
      // Video track var mı kontrol et (kamera mı ses mi?)
      const hasVideo = remoteStream.getVideoTracks().length > 0;

      if (hasVideo) {
        // Kamera stream
        console.log('Tablet kamera stream alındı!');
        remoteCamera = document.getElementById('cameraPreview');
        if (remoteCamera) {
          remoteCamera.srcObject = remoteStream;
          remoteCamera.play();
        }
      } else {
        // Ses stream
        console.log('Tablet ses stream alındı!');
        if (!remoteAudio) {
          remoteAudio = document.createElement('audio');
          remoteAudio.autoplay = true;
          document.body.appendChild(remoteAudio);
        }
        remoteAudio.srcObject = remoteStream;
      }
    });

    call.on('close', () => {
      console.log('Tablet stream bağlantısı kapandı');
      if (remoteAudio) {
        remoteAudio.srcObject = null;
      }
    });
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
    audioBtn.textContent = 'Sesi Kapat';
    audioBtn.classList.add('active');
  } else {
    previewVideo.muted = true;
    audioBtn.textContent = 'Sesi Aç';
    audioBtn.classList.remove('active');
  }
});

// Push-to-talk: Bilgisayardan tablete konuş
let previousVolume = 1;

async function startTalking() {
  if (isTalking || connectedViewers.length === 0) return;
  isTalking = true;
  talkBtn.classList.add('talking');
  talkBtn.textContent = '🎤 Konuşuyor...';

  // Bilgisayar sesini kıs (konuşurken karışmasın)
  previousVolume = previewVideo.volume;
  previewVideo.volume = 0.1;

  try {
    // Mikrofon izni al
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Tüm bağlı viewer'lara ses gönder
    connectedViewers.forEach(viewerId => {
      const call = peer.call(viewerId, micStream);
      console.log('Ses gönderiliyor:', viewerId);
    });
  } catch (err) {
    console.error('Mikrofon hatası:', err);
    isTalking = false;
    talkBtn.classList.remove('talking');
    talkBtn.textContent = 'Basılı Tut ve Konuş';
    previewVideo.volume = previousVolume;
  }
}

function stopTalking() {
  if (!isTalking) return;
  isTalking = false;
  talkBtn.classList.remove('talking');
  talkBtn.textContent = 'Basılı Tut ve Konuş';

  // Bilgisayar sesini geri aç
  previewVideo.volume = previousVolume;

  // Mikrofonu kapat
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }
}

// Mouse events
talkBtn.addEventListener('mousedown', startTalking);
talkBtn.addEventListener('mouseup', stopTalking);
talkBtn.addEventListener('mouseleave', stopTalking);

// Kamera preview göster/gizle
function showCameraPreview(show) {
  const cameraSection = document.getElementById('cameraSection');
  const cameraPreview = document.getElementById('cameraPreview');

  if (cameraSection) {
    if (show) {
      cameraSection.classList.remove('hidden');
    } else {
      cameraSection.classList.add('hidden');
      if (cameraPreview) {
        cameraPreview.srcObject = null;
      }
    }
  }
}

// Tam ekran toggle
fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
    fullscreenBtn.textContent = 'Tam Ekrandan Çık';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    fullscreenBtn.textContent = 'Tam Ekran Aç';
  }
}

// Kamera değiştir butonu (tablete mesaj gönder)
switchCameraBtn.addEventListener('click', () => {
  // Tüm bağlı tabletlere kamera değiştir mesajı gönder
  dataConnections.forEach(conn => {
    if (conn.open) {
      conn.send({ type: 'switch-camera' });
    }
  });
});

// Kamera kapat butonu (tablete mesaj gönder)
closeCameraBtn.addEventListener('click', () => {
  // Tüm bağlı tabletlere kamera kapat mesajı gönder
  dataConnections.forEach(conn => {
    if (conn.open) {
      conn.send({ type: 'close-camera' });
    }
  });
  showCameraPreview(false);
});

// Kamera aç butonu (tablete mesaj gönder - uzaktan açma)
openCameraBtn.addEventListener('click', () => {
  if (connectedViewers.length === 0) {
    alert('Önce tablet bağlanmalı!');
    return;
  }
  // Tüm bağlı tabletlere kamera aç mesajı gönder
  dataConnections.forEach(conn => {
    if (conn.open) {
      conn.send({ type: 'open-camera' });
    }
  });
});

// Kamera video'sunu tam ekran yap
cameraFullscreenBtn.addEventListener('click', () => {
  const cameraPreview = document.getElementById('cameraPreview');
  if (!cameraPreview) return;

  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (cameraPreview.requestFullscreen) {
      cameraPreview.requestFullscreen();
    } else if (cameraPreview.webkitRequestFullscreen) {
      cameraPreview.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

// Sayfa kapanırken temizlik
window.addEventListener('beforeunload', () => {
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  if (peer) {
    peer.destroy();
  }
});
