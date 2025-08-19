import { useState } from "react"; // Used for taking user input
import mortsLogo from '/morts_more.jpeg'
import './App.css'

function App() { // Context of popup
  const [Accept, setAccept] = useState("Accepted");
  const [Scraped, setScraped] = useState("Inactive");

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
            setAccept("Accepted");
            resolve(response);
          }
        }
      );
    });
  };


  /*const pushToDB = async (scraped: string[]) => {
    // Push Scraped (array of JSONs) to MongoDB via make
    const data = {"items": scraped};
    const response = await fetch(
      "https://hook.eu2.make.com/3pa2xijpax9y9vy8fpd71uc79k1t4cpg", 
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const text = await response.text();
    setAccept(text);
  }*/

  const scrapeLeads = async() => {
    // Return array of leads string[]
    setScraped("Active");
    let leads: string[] = [];
    let [tab] = await chrome.tabs.query({ active: true });
    
    const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id!},
      func: () => {
        // Get the entire HTML content as text
        const htmlText = document.documentElement.outerHTML;
        
        // Regex pattern to find LinkedIn profile URLs
        // This pattern specifically matches https://www.linkedin.com/in/{profile-id}/
        const linkedInProfileRegex = /https:\/\/www\.linkedin\.com\/in\/[^\/\?\s<"]+/g;

        
        // Find all matches in the HTML text
        const matches = htmlText.match(linkedInProfileRegex);
        
        // Log what we found
        console.log('Raw matches:', matches);
        
        // Remove duplicates and return unique URLs
        const uniqueUrls = matches ? [...new Set(matches)] : [];
        console.log('Unique URLs found:', uniqueUrls);
        
        return uniqueUrls;
      }
    });
    
    // Extract the results from the executed script
    if (results && results[0] && results[0].result) {
      leads = results[0].result;
    }
    
    return leads;
  }
  const uploadLeads = async(links: string[]) => {
    // Upload array of leads to MongoDB via Make.
    // Convert links into {link, name, headline, location, full}
    const conv = links.map(link => ({"link": link}))
    const endpoint = "https://hook.eu2.make.com/3pa2xijpax9y9vy8fpd71uc79k1t4cpg";
    const data = {
      "items": conv
    };
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    const tmp = await response.text()
    console.log(tmp);
    setScraped("Inactive");
    }

  


// Next we qualify leads with OpenAI prompting via Make
// Then we update profiles by scraping a LinkedIn page and adding links to MongoDB via Make

  return (
    <>
      <div>
        <a href="https://www.mortsandmore.com/" target="_blank">
          <img src={mortsLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h3>Lead Generation</h3>

      {/* Container for side-by-side buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          style={{
            flex: 1,                   // takes up half (or proportionally) of the container
            backgroundColor: "transparent",
            color: "#666",
            border: "0px solid #ccc",
            borderRadius: "4px",
            padding: "15px",           // bigger button
            fontSize: "16px",          // larger text
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#000"}
          onMouseLeave={e => e.currentTarget.style.color = "#666"}
          onClick={async () => {
            const leads = await scrapeLeads();
            await uploadLeads(leads);
          }}
          disabled={Scraped !== "Inactive"}
        >
          {Scraped === "Active" ? "Running..." : "Find new profiles"}
        </button>

        <button
          style={{
            flex: 1,                   // takes up the other half
            backgroundColor: "transparent",
            color: "#666",
            border: "0px solid #ccc",
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#000"}
          onMouseLeave={e => e.currentTarget.style.color = "#666"}
          onClick={async () => {
            const links = await getLinks();
            await scrape(links);
          }}
          disabled={Accept === ""}
        >
          {Accept === "" ? "Running..." : "Analyse existing profiles"}
        </button>
      </div>
    </>
  );

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
