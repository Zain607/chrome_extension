// Service Worker file

const processTabs = async (urls) => {
    await Promise.all( // Open each tab in parallel
        urls.map(url => chrome.tabs.create({ url, active: false }))
    );
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "processTabs"){
        processTabs(message.data);
    }
})