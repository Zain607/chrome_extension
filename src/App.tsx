import { useState } from "react"; // Used for taking user input
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() { // Context of popup
  const [Accept, setAccept] = useState("Accepted");

  const getLinks = async () => {
    // Retrieve MongoDB records via Make.com webhook
    setAccept("");
    const urls = await fetch("https://hook.eu2.make.com/ugu82mo26r9yq1wehoeybpss3gnr5jgf", { method: "GET" });
    const response  = await urls.text();
    const links = JSON.parse(response);
    type linkItem = { link: string }; // Introduce to fix typing in links.map below
    const parsed = links.map((link: linkItem) => link.link);
    return parsed
  }


  const scrape = (parsed: string[]): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "processTabs", data: parsed },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    });
  };


  const pushToDB = async (scraped: string[]) => {
    // Push Scraped (array of JSONs) to MongoDB via make
    const data = {"items": scraped};
    const response = await fetch("https://hook.eu2.make.com/3pa2xijpax9y9vy8fpd71uc79k1t4cpg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const text = await response.text();
    setAccept(text);
  }



  return (
    <>
      <div>s
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Open URL</h1>
      <div className="scraping">
        <button 
          onClick={async () => {
            const links = await getLinks();
            const data = await scrape(links);
            await pushToDB(data);
          }}
          disabled={Accept === ""}
        >
          {Accept === "" ? "Running..." : "Scrape and update profiles"}
        </button>
      </div>
    </>
  )
}

export default App












  /*const onclick = async () => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    chrome.scripting.executeScript({ // Context of tab
      target: { tabId: tab.id! },
      func: () => { 
        // Make API calls to Make from here: Retrieve URLs
        // Send URLs to service worker to open and scrape and send back here (to popup)
        // Send back to Make as new info to edit database
        
        // When button is clicked

        // const profile = document.querySelector("main.UmpKJDMHujvaUHaivsXIrTzozXArRFJJjsFuhQ");

        // alert(profile);
        // Then run profile.querySelector()...
        // Find <span aria-hidden="true"> tags for complete text in each section
        // Run .click() on buttons identified by querySelector
        // For prototype, get (1) Headline, (2) About, (3) Experience, (4) Education PLUS DATES
      }
    });
  
  }*/
