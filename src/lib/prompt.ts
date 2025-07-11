import { openai } from './openai';

export const extractSearchQuery = async (userInput: string) => {
  const systemPrompt = `
You are a real estate AI assistant that creates a Zillow searchQueryState JSON object.

Convert the following natural language into a strict Zillow searchQueryState JSON object. Only include results **inside the exact city**, and exclude surrounding cities or nearby areas.
You must analyze the user input in detail and get the most similar and matching all data.

Natural language:
"Find me 3-bedroom, 2-bath single-family homes in Austin, TX under $350K."

Requirements:
- Must match exactly: city = "Austin" and state = "TX"
- Must filter: minimum 3 beds, minimum 2 baths
- Must filter: price <= 350000
- Must filter: homeType = SINGLE_FAMILY
- Must exclude: condos, townhomes, apartments, manufactured homes
- Must exclude nearby cities like Del Valle, Buda, etc.

Return a Zillow-compatible searchQueryState JSON object with:
- Accurate mapBounds for Austin, TX
- filterState with only the filters described
- isMapVisible and isListVisible set to true
- mapZoom appropriate for city-level detail (suggested: 11)
- usersSearchTerm = "Austin, TX"
- regionSelection = a placeholder: [{ "regionId": 0, "regionType": 2 }]
- Remove any null or undefined fields unless required by Zillow
- Sort = globalrelevanceex (recommended)

Final Output must be a **valid, clean JSON** structure following this schema exactly:

{
  "isMapVisible": true,
  "mapBounds": {
    "north": number,
    "south": number,
    "east": number,
    "west": number
  },
  "filterState": {
    "sort": { "value": "globalrelevanceex" },
    "baths": { "min": number },
    "beds": { "min": number },
    "price": { "max": number },
    "mf": { "value": false },
    "con": { "value": false },
    "apa": { "value": false },
    "apco": { "value": false }
  },
  "isListVisible": true,
  "mapZoom": 11,
  "regionSelection": [
    {
      "regionId": 0,
      "regionType": 2
    }
  ],
  "usersSearchTerm": "Austin, TX",
  "schoolId": null,
  "pagination": {}
}

Only return the JSON. 
You must get the most similar and matching url.
Do not include comments or extra explanations. 
Use approximate bounds for central Austin (e.g., 30.16–30.51 latitude, -97.94 to -97.58 longitude). 
Do not guess filters. 
Do not include filters not mentioned in the user request.
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
You are a real estate data assistant. Analyze the following JSON dataset of real estate listings and summarize the key statistics in clean natural language.

Here is the JSON input:
${JSON.stringify(allListings)}
You need to parse the JSON data to extract the data that the customer wants.
The data needs to be accurate and extract key details about the property.
The information needs to be systematic and explained naturally and simply.
If I say again, you have to write very simply.
And you need to add some questions to the user.
In any case, be creative with your prompts and ask questions.
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