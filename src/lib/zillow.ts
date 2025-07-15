import axios from 'axios';
import dotenv from 'dotenv';
import stateCityMap from './state';
import stateAbbreviations from './shortState';
dotenv.config();

export const searchZillow = async (url: string) => {
    try {
        const response = await axios.get(`https://zillow56.p.rapidapi.com/search_url`, {
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_API_KEY,
                'x-rapidapi-host': 'zillow56.p.rapidapi.com'
            },
            params: {
                url: url,
                page: '1',
                output: 'json',
                listing_type: 'by_agent'
            },
        });

        return response.data.results;
    } catch (error) {
        console.error('Error searching Zillow:', error);
        return null;
    }
};


export const getMarketData = async (results: any) => {
    try {
        let state = results.state;
        let city = results.city;
        let cityState = city ? `${city}, ${state}` : state;
        const response = await axios.get(`https://zillow56.p.rapidapi.com/market_sale_overview`, {
            headers: {
                'x-rapidapi-key': "2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae",
                'x-rapidapi-host': 'zillow56.p.rapidapi.com'
            },
            params: {
                location: cityState
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting market data:', error);
        return null;
    }
};