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
            func: () => {
              const nameElement = document.querySelector("h1.OxxOqDfGIbFPnYNBINkSMUTiprsgGqfeMDPfA.inline.t-24.v-align-middle.break-words");
              const name = nameElement ? nameElement.innerText : "";
              return {
                url: window.location.href,
                name: name
              };
            }
          },
          (results) => {
            const { url, name } = results[0].result;
            resolve({ url, name, id });
          }
        );
      })
    )
  );
  console.log(info);
  return info; // array of { url, html, id }
};

const closeTabs = async(tabIDs) => { // Close tabs once finished
  chrome.tabs.remove(tabIDs, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log("Closed all tabs");
    }
  });
};

// Listen to message from popup to perform tasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "processTabs"){
      (async() => {
        try{
          const urls = message.data;
          const tabs = await openTabs(urls);
          const scraped = await scrapeTabs(tabs);
          await closeTabs(tabs)
          sendResponse(scraped);
        } catch (err) {
        console.log(err);
        sendResponse({error: err.message });
        }
      })();
      return true;
    };
})