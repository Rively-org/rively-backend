// orchestrator.ts

import { scrapeWebsite } from '../services/scraper';

export async function startScraping(siteUrl: string, dataType: string) {
  try {
    console.log(`Starting scraping for URL: ${siteUrl}`);
    // Call the scraper function with the site URL
    await scrapeWebsite(siteUrl);
    console.log(`Scraping completed for ${siteUrl}`);
  } catch (error) {
    console.error(`Error during scraping process for ${siteUrl}:`, error);
  }
}

