import { listingAI } from "./assistant";
import { getZillow } from "./getZillow";

export const listingAssistant = async (userInput: string) => {
    const results = await getZillow(userInput);

    const description = await listingAI(userInput, results);

    return { type: 'listing', description, results };
}