// Tab Capture için background service worker

// Popup'tan gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureTab') {
    captureCurrentTab(message.tabId).then(streamId => {
      sendResponse({ success: true, streamId: streamId });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // async response için
  }

  if (message.action === 'getActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ success: true, tab: tabs[0] });
      } else {
        sendResponse({ success: false, error: 'Aktif sekme bulunamadı' });
      }
    });
    return true;
  }
});

// Tab capture başlat
async function captureCurrentTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    }, (streamId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(streamId);
      }
    });
  });
}
