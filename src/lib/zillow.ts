import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const searchZillow = async (url: string) => {
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
};