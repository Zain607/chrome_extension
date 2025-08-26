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
              const name1 = getText(document, "h1");
              const headline1 = getText(document, "div.text-body-medium.break-words");
              const location1 = getText(document, "span.text-body-small.inline.t-black--light.break-words");
              
              return {
                link: window.location.href.replace(/\/$/, ""),
                name: name1,
                headline: headline1,
                location: location1,
                full: `
Name: ${name1}
Location: ${location1}
Headline: ${headline1}
                `
                // main: main ? main.innerText : "Not Found"
              };
            }
          },
          (results) => {
            console.log("Results: ");
            console.log(results);
            const {  link, name, headline, location, full } = results[0].result;
            resolve({ link, name, headline, location, full, id });
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

  const pushToDB = async (scraped) => { // scraped is an array of JSONs to make.com
    // Push Scraped (array of JSONs) to MongoDB via make
    const data = {"items": scraped};
    const response = await fetch(
      "https://hook.eu2.make.com/3pa2xijpax9y9vy8fpd71uc79k1t4cpg", 
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const text = await response.text();
    console.log("API to Make sent to push scraped Leads to DB");
    console.log(text);
    return text;
  }

// Listen to message from popup to perform tasks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "processTabs"){
      (async() => {
        try{
          const urls = message.data;
          // console.log(urls);
          const tabs = await openTabs(urls);
          const scraped = await scrapeTabs(tabs);
          
          await closeTabs(tabs);
          await pushToDB(scraped);
          sendResponse(scraped);
        } catch (err) {
        console.log(err);
        sendResponse({error: err.message });
        }
      })();
      return true;
    };
})