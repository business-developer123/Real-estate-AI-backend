import { analysisAI } from "./assistant";
import { getMarket } from "./getMarket";
import { getZillow } from "./getZillow";

export const listingAssistant = async (userInput: string) => {
    const basicData = await getZillow(userInput);

    const marketData = await getMarket(basicData, userInput);

    const description = await analysisAI(userInput, marketData, basicData);

    return { type: 'listing', description, results: basicData };
}