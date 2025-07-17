import axios from "axios";

export const getMarket = async (results: any, userInput: string) => {
    try {
        let response: any = null;
        let housingMarket: any = null;
        let housingMarketRentals: any = null;
        let marketTrend: any = null;
        if (results && results.state) {
            let state = results.state;
            let city = results.city;
            let cityState = city ? `${city}, ${state}` : state;
            response = await axios.get(`https://zillow56.p.rapidapi.com/market_sale_overview`, {
                headers: {
                    'x-rapidapi-key': "2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae",
                    'x-rapidapi-host': 'zillow56.p.rapidapi.com'
                },
                params: {
                    location: cityState
                }
            });

            housingMarket = await axios.get('https://zillow-working-api.p.rapidapi.com/housing_market', {
                headers: {
                    'x-rapidapi-key': '2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae',
                    'x-rapidapi-host': 'zillow-working-api.p.rapidapi.com'
                },
                params: {
                    search_query: cityState,
                    home_type: 'All_Homes',
                    exclude_rentalMarketTrends: 'true',
                    exclude_neighborhoods_zhvi: 'true'
                },
            })

            housingMarketRentals = await axios.get('https://zillow-working-api.p.rapidapi.com/rental_market', {
                headers: {
                    'x-rapidapi-key': '2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae',
                    'x-rapidapi-host': 'zillow-working-api.p.rapidapi.com'
                },
                params: {
                    search_query: cityState,
                    bedrooom_type: 'All_Bedrooms',
                    home_type: 'All_Property_Types'
                },
            })

            marketTrend = await axios.get('https://zillow-api-data.p.rapidapi.com/trend', {
                params: {
                    durationDays: '21',
                    includeCurrentRate: 'true',
                    limit: '5',
                    program: 'Fixed30Year',
                    stateAbbreviation: state.toLowerCase().charAt(0).toUpperCase() + state.toLowerCase().slice(1)
                },
                headers: {
                    'x-rapidapi-key': '2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae',
                    'x-rapidapi-host': 'zillow-api-data.p.rapidapi.com'
                }
            })
        }

        const monthlyInventory = await axios.get('https://zillow-com1.p.rapidapi.com/residentialData/monthlyInventory', {
            headers: {
                'x-rapidapi-key': "2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae",
                'x-rapidapi-host': 'zillow-com1.p.rapidapi.com'
            },
            params: {
                yyyymm: new Date().getFullYear().toString() + (new Date().getMonth() + 1).toString().padStart(2, '0'),
                limit: '20'
            },
        })

        // const realtorData = await axios.get('https://us-real-estate-listings.p.rapidapi.com/property/marketTrends', {
        //     params: {
        //         property_url: 'https://www.realtor.com/realestateandhomes-detail/2433-S-Ramona-Cir_Tampa_FL_33612_M56257-22633'
        //     },
        //     headers: {
        //         'x-rapidapi-key': '2e5dd68fe7mshd661c7de69087c4p153130jsn820b372673ae',
        //         'x-rapidapi-host': 'us-real-estate-listings.p.rapidapi.com'
        //     }
        // })

        const googleResponse = await axios.get("https://www.googleapis.com/customsearch/v1", {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CSE_ID,
                q: userInput
            }
        });

        let snippets = googleResponse.data.items.map((item: any) => item.snippet);

        return {
            marketData: response?.data,
            googleData: snippets,
            monthlyInventory: monthlyInventory?.data,
            housingMarket: housingMarket?.data,
            housingMarketRentals: housingMarketRentals?.data,
            marketTrend: marketTrend?.data
        };
    } catch (error) {
        console.error('Error getting market data:', error);
        return null;
    }
};