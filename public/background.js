// Service Worker file

const openTabs = async (urls) => { // Open new tabs given array of URLs input
    // Input array of URLs
    // Output?
  const tabs = await Promise.all(
    urls.map(url =>
      new Promise((resolve) => {
        chrome.tabs.create({ url, active: false }, (tab) => {
          const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve(tab);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
      })
    )
  );
  return tabs.map(tab => tab.id)
};

const scrapeTabs = async (tabIDs) => {
  console.log("tabIDs: ", tabIDs);
  const info = await Promise.all(
    tabIDs.map(id => 
      new Promise((resolve) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: id },
            func: () => ({
              url: window.location.href,
              html: document.documentElement.outerHTML
            })
          },
          (results) => {
            const { url, html } = results[0].result;
            resolve({ url, html, id });
          }
        );
      })
    )
  );

  return info; // array of { url, html, id }
};


// Listen to message from popup to perform tasks
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action == "processTabs"){
        const urls = message.data;
        const tab = await openTabs(urls);
        const scraped = await scrapeTabs(tab);
        sendResponse(scraped)
    };
    return true;
})