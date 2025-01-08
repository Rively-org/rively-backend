import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from '@langchain/openai';
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';

const pinecone = new Pinecone();
const openai = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });

interface ProcessedData {
  title: string;
  summary: string;
  key_points: string[];
}

interface ScrapeData {
  timestamp: string;
  type_of_data: string;
  source: string;
  content: ProcessedData;
}

async function fetchAndParseWebsite(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Remove script and style elements
    $('script, style').remove();
    
    // Get the text content
    return $('body').text().trim().replace(/\s+/g, ' ').substring(0, 4000); // Limit to 4000 characters
  } catch (error) {
    console.error(`Error fetching and parsing ${url}:`, error.message);
    throw error;
  }
}

async function processContentWithOpenAI(content: string): Promise<ProcessedData> {
  const prompt = `
    Analyze the following web content and provide a structured response:
    
    ${content}
    
    Respond with a JSON object in the following format:
    {
      "title": "A concise title for the content",
      "summary": "A brief summary of the main points (max 100 words)",
      "key_points": ["Key point 1", "Key point 2", "Key point 3"]
    }
  `;

  const response = await openai.call(prompt);
  return JSON.parse(response);
}

async function storeScrapedDataInPinecone(data: ScrapeData) {
  console.log("store");
  const index = pinecone.Index(process.env.PINECONE_INDEX!);
  
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const doc = new Document({
    pageContent: JSON.stringify(data.content),
    metadata: {
      timestamp: data.timestamp,
      type_of_data: data.type_of_data,
      source: data.source,
    },
  });

  const [embedding] = await embeddings.embedDocuments([doc.pageContent]);

  const vector = {
    id: `scrape-${data.timestamp}`,
    values: embedding,
    metadata: doc.metadata,
  };

  await index.upsert([vector]);
  console.log('Scraped data stored in Pinecone successfully');
}

export async function scrapeAndProcessWebsite(url: string, dataType: string) {
  try {
    console.log(`Starting scraping for URL: ${url}`);
    
    const parsedContent = await fetchAndParseWebsite(url);
    const processedData = await processContentWithOpenAI(parsedContent);
    
    const scrapeData: ScrapeData = {
      timestamp: new Date().toISOString(),
      type_of_data: dataType,
      source: url,
      content: processedData,
    };

    await storeScrapedDataInPinecone(scrapeData);
    console.log(`Scraping completed and stored in Pinecone for ${url}`);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message || error);
  }
}
