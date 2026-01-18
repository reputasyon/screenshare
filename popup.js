document.getElementById('mirrorBtn').addEventListener('click', async () => {
  // Önce aktif sekmeyi al
  const response = await chrome.runtime.sendMessage({ action: 'getActiveTab' });

  if (!response.success) {
    alert('Hata: ' + response.error);
    return;
  }

  const activeTab = response.tab;

  // Tab capture stream ID al
  const captureResponse = await chrome.runtime.sendMessage({
    action: 'captureTab',
    tabId: activeTab.id
  });

  if (!captureResponse.success) {
    alert('Yakalama hatası: ' + captureResponse.error);
    return;
  }

  // Yeni pencere aç ve streamId'yi URL'de gönder
  const mirrorURL = chrome.runtime.getURL('mirror.html') +
    '?streamId=' + encodeURIComponent(captureResponse.streamId) +
    '&tabTitle=' + encodeURIComponent(activeTab.title);

  window.open(
    mirrorURL,
    'ekran_yansit_' + Date.now(),
    'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  // Popup'ı kapat
  setTimeout(() => window.close(), 500);
});

// Tablete Gönder butonu
document.getElementById('tabletBtn').addEventListener('click', async () => {
  // Önce aktif sekmeyi al
  const response = await chrome.runtime.sendMessage({ action: 'getActiveTab' });

  if (!response.success) {
    alert('Hata: ' + response.error);
    return;
  }

  const activeTab = response.tab;

  // Tab capture stream ID al
  const captureResponse = await chrome.runtime.sendMessage({
    action: 'captureTab',
    tabId: activeTab.id
  });

  if (!captureResponse.success) {
    alert('Yakalama hatası: ' + captureResponse.error);
    return;
  }

  // Cast sayfasını aç (QR kod gösterecek)
  const castURL = chrome.runtime.getURL('cast.html') +
    '?streamId=' + encodeURIComponent(captureResponse.streamId) +
    '&tabTitle=' + encodeURIComponent(activeTab.title);

  window.open(
    castURL,
    'ekran_yansit_cast_' + Date.now(),
    'width=600,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  // Popup'ı kapat
  setTimeout(() => window.close(), 500);
});
