// Service Worker file

const urls = [
    "https://www.google.co.uk/",
    "https://www.bbc.co.uk/"
];

const processTabs = async () => {
    await Promise.all( // Open each tab in parallel
        urls.map(url => chrome.tabs.create({ url, active: false }))
    );
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "processTabs"){
        processTabs();
    }
})