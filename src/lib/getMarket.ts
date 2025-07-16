import axios from "axios";

export const getMarket = async (results: any, userInput: string) => {
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

        const googleResponse = await axios.get("https://www.googleapis.com/customsearch/v1", {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CSE_ID,
                q: userInput
            }
        });

        let snippets = googleResponse.data.items.map((item: any) => item.snippet);
        // let googleData = await Promise.all(links.map((item: any) => fetchArticleText(item.link)));

        return {
            marketData: response.data,
            googleData: snippets
        };
    } catch (error) {
        console.error('Error getting market data:', error);
        return null;
    }
};