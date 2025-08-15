// Service Worker file

const openTabs = async (links) => { // Open new tabs given array of URLs input
    // Input array of URLs
    // Output?
  // console.log(links);
  const tabs = await Promise.all(
    links.map(link =>
      new Promise((resolve) => {
        chrome.tabs.create({ url: link, active: false }, (tab) => {
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
  // console.log("tabIDs: ", tabIDs);
  const info = await Promise.all(
    tabIDs.map(id => 
      new Promise((resolve) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: id },
            func: () => {
              const getText = (doc, selector) => {
                const element = doc.querySelector(selector);
                return element ? element.innerText : "";
              }
              /*
              function getElementByXPath(path) {
                return document.evaluate(
                    path,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
              }
              */
              // const main = document.querySelector("main.sHUEuypAIrQQkLeMMRyjocBGdDtktBssQaExY")?.innerText;
              
              return {
                link: window.location.href,
                name: getText(document, "h1.RZUjpoRzdSTcfspnoKCbxuvCHpKKszYYg.inline.t-24.v-align-middle.break-words"),
                headline: getText(document, "div.text-body-medium.break-words"),
                location: getText(document, "span.text-body-small.inline.t-black--light.break-words"),
                // main: main ? main.innerText : "Not Found"
              };
            }
          },
          (results) => {
            console.log("Results: ");
            console.log(results);
            const {  link, name, headline, location, main } = results[0].result;
            resolve({ link, name, headline, location, main, id });
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
      // console.log("Closed all tabs");
    }
  });
};

// Listen to message from popup to perform tasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "processTabs"){
      (async() => {
        try{
          const urls = message.data;
          console.log(urls);
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