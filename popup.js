// Monitöre Yansıt butonu
document.getElementById('mirrorBtn').addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ action: 'getActiveTab' });

  if (!response.success) {
    alert('Hata: ' + response.error);
    return;
  }

  const activeTab = response.tab;

  const captureResponse = await chrome.runtime.sendMessage({
    action: 'captureTab',
    tabId: activeTab.id
  });

  if (!captureResponse.success) {
    alert('Yakalama hatası: ' + captureResponse.error);
    return;
  }

  const mirrorURL = chrome.runtime.getURL('mirror.html') +
    '?streamId=' + encodeURIComponent(captureResponse.streamId) +
    '&tabTitle=' + encodeURIComponent(activeTab.title);

  window.open(
    mirrorURL,
    'ekran_yansit_' + Date.now(),
    'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  setTimeout(() => window.close(), 500);
});

// Tablete Gönder butonu
document.getElementById('tabletBtn').addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ action: 'getActiveTab' });

  if (!response.success) {
    alert('Hata: ' + response.error);
    return;
  }

  const activeTab = response.tab;

  const captureResponse = await chrome.runtime.sendMessage({
    action: 'captureTab',
    tabId: activeTab.id
  });

  if (!captureResponse.success) {
    alert('Yakalama hatası: ' + captureResponse.error);
    return;
  }

  const castURL = chrome.runtime.getURL('cast.html') +
    '?streamId=' + encodeURIComponent(captureResponse.streamId) +
    '&tabTitle=' + encodeURIComponent(activeTab.title);

  window.open(
    castURL,
    'ekran_yansit_cast_' + Date.now(),
    'width=600,height=700,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  setTimeout(() => window.close(), 500);
});
