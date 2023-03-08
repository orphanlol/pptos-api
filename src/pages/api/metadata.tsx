import type { NextApiRequest, NextApiResponse } from 'next'

async function readJsonFromURL(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function getFilesFromIdentifier (identifier) {
    if (await readJsonFromURL('https://archive.org/metadata/' + identifier) !== undefined) {
        const data = await readJsonFromURL('https://archive.org/metadata/' + identifier);
        return data;
    } else {
        return undefined;
    }
}

export default async function handler(req, res) {
    const query = req.query;
    const { identifier } = query;

    if (!identifier) {
        res.status(400).json({ error: 'Missing identifier' });
    } else {
        const data = await getFilesFromIdentifier(identifier);
        res.status(200).json(data);
    }
}
