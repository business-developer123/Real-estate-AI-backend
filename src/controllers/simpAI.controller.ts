import { Request, Response } from 'express';
import { extractDescription, extractSearchQuery } from '../lib/prompt';
import { getMarketData, searchZillow } from '../lib/zillow';
import querystring from 'querystring';
import axios from 'axios';
import stateCityMap from '../lib/state';

export const analyzeProperty = async (req: Request, res: Response) => {
    try {
        const { userInput } = req.body;

        const query = await extractSearchQuery(userInput);

        const jsonCleaned = query?.replace(/```json|```/g, "");

        const searchQueryState = JSON.parse(jsonCleaned || '{}');

        const encoded = await querystring.escape(JSON.stringify(searchQueryState));

        const url = `https://www.zillow.com/homes/for_sale/LOCATION_rb/?searchQueryState=${encoded}`;
        console.log(url);
        const results = await searchZillow(url);

        const description = await extractDescription(results);

        const described = description?.replace(/\n/g, '<br />').replace(/[#*]/g, '');

        if (!results || results.length === 0) {
            res.status(404).json({ message: 'No properties found.' });
            return;
        }

        res.status(200).json({ listings: results, description: described });
    } catch (error) {
        console.error('Error analyzing property:', error);
        res.status(500).json({ error: 'Failed to analyze property' });
    }
}

export const getStreetView = async (req: Request, res: Response) => {
    try {
        const { location } = req.body;
        const response = await axios.get(location);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error getting street view:', error);
        res.status(500).json({ error: 'Failed to get street view' });
    }
}   