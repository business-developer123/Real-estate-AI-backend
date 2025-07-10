import { openai } from './openai';

export const extractSearchQuery = async (userInput: string) => {
  const systemPrompt = `
You are a real estate AI assistant that creates a Zillow searchQueryState JSON object.
Convert the following natural language into a strict Zillow searchQueryState JSON object. Only include results **inside the exact city**, and exclude surrounding cities or nearby areas.

Natural language:
"Find me 3-bedroom, 2-bath single-family homes in Austin, TX under $350K."

Requirements:
- Must match exactly: city = "Austin" and state = "TX"
- Must filter: minimum 3 beds, minimum 2 baths
- Must filter: price <= 350000
- Must filter: homeType = SINGLE_FAMILY
- Must exclude: condos, townhomes, apartments, manufactured homes
- Must exclude nearby cities like Del Valle, Buda, etc.
- Return a Zillow-compatible \`searchQueryState\` JSON structure with:
- regionSelection (Austin, TX)
- proper filterState
- don't include null/undefined values
- don't guess bounding boxes if you don't have them

Return only a valid JSON structure that follows this schema exactly:

{
  "isMapVisible": true,
  "mapBounds": {
    "north": number,
    "south": number,
    "east": number,
    "west": number
  },
  "filterState": {
    "sort": { "value": "priced" },
    "baths": { "min": number, "max": number or null },
    "price": { "min": number or null, "max": number or null },
    "mp": { "min": number or null, "max": number or null },
    "beds": { "min": number },
    "hoa": { "max": number or null },
    "mf": { "value": false },
    "con": { "value": false },
    "apa": { "value": false },
    "apco": { "value": false }
  },
  "isListVisible": true,
  "mapZoom": 10,
  "regionSelection": [
    {
      "regionId": 0,
      "regionType": 2
    }
  ],
  "usersSearchTerm": "San Diego",
  "schoolId": null,
  "pagination": {}
}
Only fill values that apply based on the user query. Use nulls only where required. Remove empty filters.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput }
    ],
    temperature: 0
  });

  return completion.choices[0].message.content?.trim();
};

export const extractDescription = async (allListings: any) => {
  const prompt = `
You are a real estate data analyst.

You will receive a JSON array of property listings. Each object in the array includes fields such as:

- bedrooms (number)
- bathrooms (number)
- livingArea (number in square feet)
- yearBuilt (number)
- price (number)
- city (string)
- state (string)
- homeType (string)

Your task is to analyze this data and summarize it in a friendly, readable format for users.

Your response must include:
1. The number of matching properties
2. The range of bedrooms (e.g., 3 to 4 bedrooms)
3. The range of bathrooms
4. The range of living areas (in sq ft)
5. The range of years built
6. The range of property prices
7. 2–3 helpful follow-up questions a user might ask (e.g., "Would you like to filter by neighborhood?" or "Do you want to adjust the price range?")

Make your output easy to understand, like you’re writing for homebuyers browsing online.

Here is the full JSON data:
  ${JSON.stringify(allListings)}
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0
  });

  return completion.choices[0].message.content?.trim();
}