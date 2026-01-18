document.getElementById('startBtn').addEventListener('click', async () => {
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

  // Kontrol panelini aç
  const controlURL = chrome.runtime.getURL('control.html') +
    '?streamId=' + encodeURIComponent(captureResponse.streamId) +
    '&tabTitle=' + encodeURIComponent(activeTab.title);

  window.open(
    controlURL,
    'ekran_yansit_control',
    'width=400,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
  );

  // Popup'ı kapat
  setTimeout(() => window.close(), 500);
});
