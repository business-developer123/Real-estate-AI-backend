import { extractSearchQuery } from "./assistant";
import querystring from 'querystring';
import { searchZillow } from "./zillow";

export const getZillow = async (userInput: string) => {
    const query = await extractSearchQuery(userInput);

    const searchQueryState = JSON.parse(query || '{}');

    const encoded = await querystring.escape(JSON.stringify(searchQueryState));

    const url = `https://www.zillow.com/homes/for_sale/LOCATION_rb/?searchQueryState=${encoded}`;

    const results = await searchZillow(url);

    return results;
}