import { useState } from "react"; // Used for taking user input
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() { // Context of popup
 
  
  const [scrapedHTML, setScrapedHTML] = useState<string[]>([]);

  const onClick = async () => {
    await chrome.runtime.sendMessage({ 
      action: "processTabs",
      data: [
        "https://www.linkedin.com/in/zain-n-112a361a8/",
        "https://www.linkedin.com/in/timcampbellmbe/"
      ],
    }, response => {
      if (chrome.runtime.lastError){
        console.error(chrome.runtime.lastError.message);
        return;
      } else{
        const array = response.map((item: {name: string}) => item.name);
        setScrapedHTML(array)
      }
    });
  };



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
      <div className="card">
        <button onClick={() => onClick()}>
          Open
        </button>
        <p>
          {scrapedHTML.join("\n")}
        </p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
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
