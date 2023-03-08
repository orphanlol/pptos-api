import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path';
import { promises as fs } from 'fs';

async function readJsonFromFile(fileName) {
    const jsonDirectory = path.join(process.cwd(), 'src/data/json/');
    const fileContents = await fs.readFile(jsonDirectory + fileName, 'utf8');
  
    return JSON.parse(fileContents);
}

function createStatsJson(scrapeJson, userJson) {
    const statsJson = {
        "total_items": scrapeJson["total"],
        "total_users": userJson["options"].length
    }

    return statsJson;
}


export default async function handler(req, res) {
    const scrapeJson = await readJsonFromFile("pptos_scrape.json");
    const userJson = await readJsonFromFile("pptos_users.json");

    const statsJson = createStatsJson(scrapeJson, userJson);

    res.status(200).json(statsJson);
}