import { openai } from './openai';

export const extractSearchQuery = async (userInput: string) => {
  const systemPrompt = `
You are a real estate AI assistant that generates Zillow-compatible searchQueryState JSON objects for property search URLs.

Your task is to analyze natural language property search queries and convert them into a strict, valid Zillow searchQueryState JSON object. Your output must follow the exact schema format shown below and reflect only the filters explicitly described in the user's request.

🧠 Responsibilities:
- Understand and interpret the natural language request
- Convert it into a structured JSON for Zillow search
- Strictly exclude nearby cities or neighboring areas unless specified
- Only include filters that are explicitly mentioned
- Ensure the JSON is syntactically and structurally valid

🧾 Example Natural Language Query:
"Find me 3-bedroom, 2-bath single-family homes in Austin, TX under $350K."

✅ Output JSON Schema Template:
{
  "city": "Austin",
  "state": "TX",
  "usersSearchTerm": "Austin, TX",
  "mapBounds": {
    "north": 30.51,
    "south": 30.16,
    "east": -97.58,
    "west": -97.94
  },
  "filterState": {
    "sort": { "value": "globalrelevanceex" },
    "price": {
      "min": null,
      "max": 350000
    },
    "beds": {
      "min": 3,
      "max": null
    },
    "baths": {
      "min": 2,
      "max": null
    },
   "mf": {
      "value": false
    },
    "con": {
      "value": false
    },
    "apa": {
      "value": false
    },
    "apco": {
      "value": false
    },
    "pool": {
      "value": true
    }
  },
  "isMapVisible": true,
  "isListVisible": true,
  "mapZoom": 11,
  "regionSelection": [
    {
      "regionId": 0,
      "regionType": 2
    }
  ],
  "schoolId": null
}

⚠️ Output Rules:
- If you needn't any value, you have to remove that key and value.
- You mustn't change the structure of the schema.
- You mustn't add any new key and value as your mind.
- This schema is a **template only**. You must modify its content based on each new user request.
- Do not include values from the template if they’re not explicitly required (e.g., lot size, year built).
- Do not include filters unless specifically mentioned.
- Set values like null only when necessary (e.g., price.min).
- Only return valid JSON, with no explanations or additional content.
- Do not include nearby areas—respect city boundaries only.
- Use appropriate map bounds for the target city based on real coordinates.
- Ensure all data types and nesting are correct.
- If there aren't the data that match, you have to return the similar data that match the user input.
- If the value can't be found, you have to return the similar data that match the user input.

📌 Reminder:
Your output must reflect the user's specific request, but maintain the exact structure and naming style of the provided template.

You must ONLY return the JSON output based on the analyzed user input.
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

export const extractDescription = async (allListings: any, userInput: any) => {
  const prompt = `
You are a smart, friendly, and reliable real estate assistant.

You just received a dataset of real estate listings in JSON format. Your job is to review this data and explain the key insights in **clear, natural language**, as if you're speaking to a home buyer, investor, or real estate enthusiast.

---

### 🏠 Listings JSON:
${JSON.stringify(allListings, null, 2)}

---

### 👤 User Request:
${userInput}

---

### 🎯 The description should be:

1. **Understand the user's intent.**  
   Read the user’s input and figure out what they want:
   - A general description of the listings
   - A statistical summary (averages, medians, outliers)
   - Both summary and listings

2. **Analyze the dataset.**  
   Extract useful insights from the listings data:
   - Average and median home prices
   - Typical number of bedrooms, bathrooms, and square footage
   - Price per square foot (if available)
   - Most common property types and features
   - Any special listings or notable trends

3. **Write a natural summary.**  
   Describe your findings in plain English — helpful, smart, and easy to understand. Avoid technical jargon. Use a warm and expert tone.

4. **Structure your output.**  
   Your summary should:
   - Use bullet points or short paragraphs
   - Highlight key insights clearly
   - Stay brief and relevant

5. **Ask helpful follow-up questions.**  
   Be proactive. Suggest what the user might want to do next. For example:
   - “Would you like to filter by price or number of bedrooms?”
   - “Are you looking for investment properties or a place to live?”
   - “Should I focus only on homes with a pool or garage?”
---

### 📦 Your Output Format:

The description should be in above format.

Based on the user's request, you must return **one of these two formats**:


"What is the median and average home value in Arizona?"
Like this If the client wants only median and average home value, you have to return the following JSON:

\`\`\`json
{
  "description": "description here",
  "cardView": false
}
\`\`\`

But like this example:
"Find me all single family homes for sale with a pool in 92037"
If the client want to see the card view, you have to return the following JSON:

\`\`\`json
{
  "description": "description here",
  "cardView": true
}
\`\`\`
---

### ❗ Rules:

- The description should be more detailed and specific.
- Do not make up any data that’s not in the JSON.
- Be specific and accurate based on the actual listings.
- Be helpful, clear, and friendly — like a real estate expert.
- Always return one of the two valid JSON output formats shown above.
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