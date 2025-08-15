import { useState } from "react"; // Used for taking user input
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() { // Context of popup
 
  
  const [Scraped, setScraped] = useState<string[]>([]);
  const [Links, setLinks] = useState<string[]>([]);

  const getLinks = async () => {
    // Retrieve MongoDB records via Make.com webhook
    const urls = await fetch("https://hook.eu2.make.com/ugu82mo26r9yq1wehoeybpss3gnr5jgf", { method: "GET" });
    const response  = await urls.text();
    const links = JSON.parse(response);
    type linkItem = { link: string }; // Introduce to fix typing in links.map below
    const parsed = links.map((link: linkItem) => link.link);
    setLinks(parsed);
  }


  const scrape = async () => {
    // Scrape fetched URLs saved in "Links" state
    await chrome.runtime.sendMessage({ 
      action: "processTabs",
      data: Links,
    }, response => {
      if (chrome.runtime.lastError){
        console.error(chrome.runtime.lastError.message);
        return;
      } else{
        console.log(response);
        setScraped(response)
      }
    });
  };

  const pushToDB = async () => {
    // Push Scraped (array of JSONs) to MongoDB via make
    
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
      <div className="link_retrieval">
        <button onClick={() => getLinks()}>
          Get Links
        </button>
        <p>
          Links: {JSON.stringify(Links, null, 2)}
        </p>
      </div>
      <div className="scraping">
        <button onClick={() => scrape()}>
          Scrape Links
        </button>
        <p>
          Scraped: {JSON.stringify(Scraped, null, 2)}
        </p>
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
