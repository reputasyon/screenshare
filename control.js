// DOM elementleri
const preview = document.getElementById('preview');
const tabTitleDiv = document.getElementById('tabTitle');
const monitorBtn = document.getElementById('monitorBtn');
const monitorStatus = document.getElementById('monitorStatus');
const monitorInfo = document.getElementById('monitorInfo');
const tabletBtn = document.getElementById('tabletBtn');
const tabletStatus = document.getElementById('tabletStatus');
const qrSection = document.getElementById('qrSection');
const qrCode = document.getElementById('qrCode');
const qrUrl = document.getElementById('qrUrl');
const closeBtn = document.getElementById('closeBtn');

// State
let currentStream = null;
let monitorWindow = null;
let peer = null;
let peerId = null;
let connectedTablets = 0;

// URL parametreleri
const urlParams = new URLSearchParams(window.location.search);
const streamId = urlParams.get('streamId');
const tabTitle = urlParams.get('tabTitle');

// Başlat
window.addEventListener('DOMContentLoaded', async () => {
  tabTitleDiv.textContent = tabTitle || 'Bilinmeyen sekme';

  if (!streamId) {
    alert('Stream ID bulunamadı!');
    return;
  }

  try {
    await startCapture();
    initPeer();
  } catch (error) {
    alert('Hata: ' + error.message);
  }
});

// Tab capture başlat (sadece video, ses yok - orijinal sekmede ses devam etsin)
async function startCapture() {
  currentStream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    audio: false  // Ses yakalama kapalı - bilgisayarda ses normal devam eder
  });

  preview.srcObject = currentStream;
}

// PeerJS başlat (tablet için)
function initPeer() {
  peerId = 'ekran-' + Math.random().toString(36).substr(2, 6);

  peer = new Peer(peerId, { debug: 1 });

  peer.on('open', (id) => {
    console.log('Peer hazır:', id);
  });

  peer.on('connection', (conn) => {
    console.log('Tablet bağlandı:', conn.peer);

    conn.on('open', () => {
      conn.on('data', (data) => {
        if (data.type === 'request-stream') {
          sendStreamToTablet(conn.peer);
        }
      });
    });

    conn.on('close', () => {
      connectedTablets = Math.max(0, connectedTablets - 1);
      updateTabletStatus();
    });
  });

  peer.on('error', (error) => {
    console.error('Peer error:', error);
  });
}

// Tablet'e stream gönder
function sendStreamToTablet(viewerId) {
  if (!currentStream) return;

  const call = peer.call(viewerId, currentStream);

  call.on('close', () => {
    connectedTablets = Math.max(0, connectedTablets - 1);
    updateTabletStatus();
  });

  connectedTablets++;
  updateTabletStatus();
}

function updateTabletStatus() {
  if (connectedTablets > 0) {
    tabletStatus.className = 'status-badge active';
    tabletStatus.textContent = connectedTablets + ' bağlı';
  } else if (qrSection.classList.contains('visible')) {
    tabletStatus.className = 'status-badge waiting';
    tabletStatus.textContent = 'Bekliyor';
  } else {
    tabletStatus.className = 'status-badge inactive';
    tabletStatus.textContent = 'Kapalı';
  }
}

// ===== MONITOR =====
monitorBtn.addEventListener('click', () => {
  if (monitorWindow && !monitorWindow.closed) {
    // Zaten açık, kapat
    monitorWindow.close();
    monitorWindow = null;
    monitorStatus.className = 'status-badge inactive';
    monitorStatus.textContent = 'Kapalı';
    monitorBtn.textContent = 'Monitörde Aç';
    monitorBtn.className = 'target-btn primary';
    monitorInfo.textContent = '';
  } else {
    // Aç
    openMonitorWindow();
  }
});

function openMonitorWindow() {
  // Monitor window için stream'i paylaş
  // Aynı stream'i kullanacak şekilde URL ile ID gönder
  const monitorURL = chrome.runtime.getURL('mirror.html') +
    '?streamId=' + encodeURIComponent(streamId) +
    '&tabTitle=' + encodeURIComponent(tabTitle);

  monitorWindow = window.open(
    monitorURL,
    'ekran_yansit_monitor',
    'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  monitorStatus.className = 'status-badge active';
  monitorStatus.textContent = 'Aktif';
  monitorBtn.textContent = 'Monitörü Kapat';
  monitorBtn.className = 'target-btn danger';
  monitorInfo.textContent = '💡 Pencereyi 2. monitöre sürükle, F ile tam ekran';

  // Pencere kapandığında durumu güncelle
  const checkWindow = setInterval(() => {
    if (monitorWindow && monitorWindow.closed) {
      clearInterval(checkWindow);
      monitorWindow = null;
      monitorStatus.className = 'status-badge inactive';
      monitorStatus.textContent = 'Kapalı';
      monitorBtn.textContent = 'Monitörde Aç';
      monitorBtn.className = 'target-btn primary';
      monitorInfo.textContent = '';
    }
  }, 500);
}

// ===== TABLET =====
tabletBtn.addEventListener('click', () => {
  if (qrSection.classList.contains('visible')) {
    // QR'ı gizle
    qrSection.classList.remove('visible');
    tabletBtn.textContent = 'QR Kod Göster';
    if (connectedTablets === 0) {
      tabletStatus.className = 'status-badge inactive';
      tabletStatus.textContent = 'Kapalı';
    }
  } else {
    // QR göster
    showQRCode();
  }
});

function showQRCode() {
  const viewerUrl = `https://reputasyon.github.io/screenshare/viewer.html?peerId=${peerId}`;

  QRCode.toCanvas(document.createElement('canvas'), viewerUrl, {
    width: 180,
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
    qrCode.innerHTML = '';
    qrCode.appendChild(canvas);
  });

  qrUrl.textContent = viewerUrl;
  qrSection.classList.add('visible');
  tabletBtn.textContent = 'QR Kodu Gizle';
  tabletStatus.className = 'status-badge waiting';
  tabletStatus.textContent = 'Bekliyor';
}

// ===== CLOSE =====
closeBtn.addEventListener('click', () => {
  cleanup();
  window.close();
});

function cleanup() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  if (monitorWindow && !monitorWindow.closed) {
    monitorWindow.close();
  }
  if (peer) {
    peer.destroy();
  }
}

// Sayfa kapanırken temizlik
window.addEventListener('beforeunload', cleanup);
