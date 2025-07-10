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

Only return the JSON. Do not include comments or extra explanations. Use approximate bounds for central Austin (e.g., 30.16–30.51 latitude, -97.94 to -97.58 longitude). Do not guess filters. Do not include filters not mentioned in the user request.
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
You are a real estate data assistant. Given a JSON dataset of real estate properties, summarize the key statistics in natural language like this:

---
I found [X] single-family homes for sale with a pool in the [ZIP] zip code area.

Here are some key details about these properties:

• Bedrooms range from [min] to [max], with an average of [average] bedrooms  
• Living areas range from [min] to [max] square feet  
• Bathrooms range from [min] to [max]  
• Built between [min year] and [max year]  
• AVM (Automated Valuation Model) prices range from [$min_price] to [$max_price]

Would you like to know more about these properties, such as their specific locations or more detailed characteristics?

---

Your goal is to extract this information from the JSON input:
- Total number of properties
- Zip code (if provided)
- Range and average of bedrooms
- Range of square footage (livingArea)
- Range of bathrooms
- Year built (range)
- AVM price (range), or use a fallback like listPrice if AVM is missing

After the summary, write:
**"Dataset available"**
and display download links for JSON and CSV if supported.

Only return this clean summary. No code or tables.

Here is the JSON input:
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