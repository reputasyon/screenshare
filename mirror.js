// DOM elementleri
const video = document.getElementById('video');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const errorDiv = document.getElementById('error');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const restartBtn = document.getElementById('restartBtn');
const closeBtn = document.getElementById('closeBtn');

let currentStream = null;

// URL parametrelerini al
const urlParams = new URLSearchParams(window.location.search);
const streamId = urlParams.get('streamId');
const tabTitle = urlParams.get('tabTitle');

// Sayfa yüklendiğinde otomatik başlat (streamId varsa)
window.addEventListener('DOMContentLoaded', () => {
  if (streamId) {
    startCaptureWithStreamId(streamId);
    // Pencere başlığını güncelle
    if (tabTitle) {
      document.title = 'Yansıtılıyor: ' + tabTitle;
    }
  }
});

// StreamId ile yakalama başlat (Tab Capture API)
async function startCaptureWithStreamId(streamId) {
  try {
    errorDiv.style.display = 'none';
    startBtn.textContent = '⏳ Bağlanıyor...';
    startBtn.disabled = true;

    // Önceki stream'i durdur
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    // Tab Capture stream'i al
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

    // Video elementine bağla
    video.srcObject = currentStream;

    // UI güncelle
    startScreen.style.display = 'none';
    video.style.display = 'block';

    // Stream bittiğinde
    currentStream.getVideoTracks()[0].onended = function () {
      video.style.display = 'none';
      startScreen.style.display = 'flex';
      startBtn.textContent = '▶️ Sekme Seç ve Başlat';
      startBtn.disabled = false;
    };

  } catch (error) {
    console.error('Hata:', error);

    startBtn.textContent = '▶️ Sekme Seç ve Başlat';
    startBtn.disabled = false;

    errorDiv.textContent = '❌ Hata: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

// Manuel başlatma (eski yöntem - fallback)
async function startCapture() {
  try {
    errorDiv.style.display = 'none';
    startBtn.textContent = '⏳ Seçim bekleniyor...';
    startBtn.disabled = true;

    // Önceki stream'i durdur
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    // Ekran yakalama başlat (eski yöntem)
    currentStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "never",
        displaySurface: "browser",
        frameRate: { ideal: 60, max: 60 }
      },
      audio: true,
      preferCurrentTab: false,
      selfBrowserSurface: "exclude",
      systemAudio: "include",
      surfaceSwitching: "include"
    });

    // Video elementine bağla
    video.srcObject = currentStream;

    // UI güncelle
    startScreen.style.display = 'none';
    video.style.display = 'block';

    // Stream bittiğinde (kullanıcı durdurursa)
    currentStream.getVideoTracks()[0].onended = function () {
      video.style.display = 'none';
      startScreen.style.display = 'flex';
      startBtn.textContent = '▶️ Sekme Seç ve Başlat';
      startBtn.disabled = false;
    };

  } catch (error) {
    console.error('Hata:', error);

    startBtn.textContent = '▶️ Sekme Seç ve Başlat';
    startBtn.disabled = false;

    if (error.name === 'NotAllowedError') {
      errorDiv.textContent = '❌ İzin verilmedi. Tekrar deneyin ve bir sekme seçin.';
    } else {
      errorDiv.textContent = '❌ Hata: ' + error.message;
    }
    errorDiv.style.display = 'block';
  }
}

// Yeniden başlat
function restartCapture() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  video.style.display = 'none';
  startScreen.style.display = 'flex';
  startBtn.textContent = '▶️ Sekme Seç ve Başlat';
  startBtn.disabled = false;
}

// Tam ekran toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Event listeners
startBtn.addEventListener('click', startCapture);
fullscreenBtn.addEventListener('click', toggleFullscreen);
restartBtn.addEventListener('click', restartCapture);
closeBtn.addEventListener('click', function () {
  window.close();
});

// Klavye kısayolları
document.addEventListener('keydown', function (e) {
  if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  }
  if (e.key === 'r' || e.key === 'R') {
    restartCapture();
  }
});

// Çift tıklama ile tam ekran
video.addEventListener('dblclick', toggleFullscreen);
