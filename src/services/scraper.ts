// services/scraper.ts

import axios from 'axios';
import cheerio from 'cheerio';

export async function scrapeWebsite(url: string) {
  try {
    // Fetch the website HTML
    const { data } = await axios.get(url);
    
    // Load HTML into Cheerio for scraping
    const $ = cheerio.load(data);
    
    // Example: Get the website title
    const title = $('title').text();
    console.log(`Website title: ${title}`);
    
    // Add any additional scraping logic here
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
}

