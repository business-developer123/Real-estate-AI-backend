import { openai } from './openai';

export const classifyQuestion = async (userInput: string) => {
  const systemPrompt = `
You are a real estate assistant. Classify the user's question into one of the following types:
- listing: if it's asking to search or find properties (e.g., price, location, features)
- analysis: if it's asking about trends, predictions, macroeconomic factors, or summaries

Respond only with one word: listing or analysis.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      temperature: 0
    });

    return completion.choices[0].message.content?.trim();
  } catch (error) {
    console.error('Error analyzing assistant:', error);
    return null;
  }
}

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

✅ Output JSON Schema Template:
{
  "city": string,
  "state": string,
  "usersSearchTerm": string,
  "mapBounds": {
    "north": number,
    "south": number,
    "east": number,
    "west": number
  },
  "filterState": {
    "sort": { "value": string },
    "price": {
      "min": number,
      "max": number
    },
    "beds": {
      "min": number,
      "max": number
    },
    "baths": {
      "min": number,
      "max": number
    },
   "mf": {
      "value": boolean
    },
    "con": {
      "value": boolean
    },
    "apa": {
      "value": boolean
    },
    "apco": {
      "value": boolean
    },
    "pool": {
      "value": boolean
    }
  },
  "isMapVisible": boolean,
  "isListVisible": boolean,
  "mapZoom": number,
  "regionSelection": [
    {
      "regionId": number,
      "regionType": number
    }
  ],
  "schoolId": number
}

🧾 Example 1 Natural Language Query:
"Find me 3-bedroom, 2-bath single-family homes in Austin, TX under $350K."

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

🧾 Example 2 Natural Language Query:
"What is the median and average home value in Arizona?"


{
  "city": "",
  "state": "AZ",
  "usersSearchTerm": "Arizona, AZ",
  "mapBounds": {
    "north": 37.00426,
    "south": 31.332177,
    "east": -109.045223,
    "west": -114.818269
  },
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

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      temperature: 0
    });

    return completion.choices[0].message.content?.trim();
  } catch (error) {
    console.error('Error extracting search query:', error);
    return null;
  }
};

export const listingAI = async (userInput: string, results: any) => {
  const systemPrompt = `
You are a smart, helpful, and highly accurate real estate assistant.

You will receive:
- A JSON array of real estate listings (results)
- A natural language request from the user (userInput)

Your job is to interpret the request and return a summary that is:
- Clear and data-driven
- Strictly limited to what the user asked
- Easy to understand
- Systematically structured
- Friendly and helpful

---

🏠 Listings JSON:
${JSON.stringify(results, null, 2)}


---

👤 User Request:
${userInput}

---

🧠 Systematic Analysis Instructions:

1. Understand the user’s intent:
   - If they ask for **statistics** (e.g. median/average prices, market trends):
     → Use the \`results\` array
   - If they ask to **see homes or listings** (e.g. homes for sale with a pool or in a certain area):
     → Use the \`results\` array
   - If unclear or mixed, prioritize statistics

2. If the user wants statistics:
   - Use only \`results\`
   - Show only relevant stats the user asked for:
     - medianSalePrice
     - averageSalePrice
   - Include the date of the data (e.g. "as of 2025-07-11")
   - End with a friendly question:
     - “Would you like to explore a specific city or zip code?”
     - “Want to filter by property type or budget?”

3. If the user wants listings:
   - Show a short intro like: “Here are the current homes matching your request.”
   - Do not include market statistics unless requested
   - End with a helpful question:
     - “Should I narrow this by price, beds, or features like pool or garage?”

---

🔒 Final Rules:

- Do NOT include:
  - Contain the images and URL
  - Market advice or general insights
  - Common property types or patterns

- ALWAYS use:
  - results for stats
  - results for listing-based prompts

- END with a friendly follow-up question if appropriate

Only answer what the user asked. Be systematic, friendly, and accurate.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0
    });

    let description = completion.choices[0].message.content?.trim();
    let descriptionCleaned = description?.replace(/```json|```/g, '');
    let descriptionCleanedFinal = descriptionCleaned?.replace(/\n/g, '<br />').replace(/[#*]/g, '');
    return descriptionCleanedFinal;
  } catch (error) {
    console.error('Error analyzing assistant:', error);
    return null;
  }
}

export const analysisAI = async (userInput: string, results: any, basicData: any) => {
  const systemPrompt = `
You are a senior-level real estate investment analyst assistant.

Your job is to accurately answer any real estate-related question using the user's natural language query, listing data, and market information. Your analysis must be complete, correct, data-driven, and actionable — similar to a professional investor report.

---

## 🎯 YOUR TASK:

- Understand the user’s intent (e.g. price trends, appreciation, rental yield, risks, portfolio advice).
- Use the provided datasets — listings and market info — to produce a deep analysis.
- Include specific statistics, locations, and trends.
- Compare the target market to other relevant markets if needed.
- Identify both **opportunities** and **risks** (e.g., overbuilding, job shifts, regulation).
- Name **specific neighborhoods**, not just cities (e.g., Barrio Viejo in Tucson, Roosevelt Row in Phoenix).
- Suggest tools, data sources, or local steps the user can take next.

---

## 🔢 INPUTS:
- User Input: ${userInput}
- Listings Dataset (JSON): ${JSON.stringify(results, null, 2)}
- Market Info Dataset (JSON): ${JSON.stringify(basicData, null, 2)}

---

## 🛠️ ANALYSIS REQUIREMENTS:

✅ DO:
- Use **quantitative metrics** (e.g., median price, appreciation %, rental yield).
- Highlight **growth drivers**: population, jobs, infrastructure, zoning.
- Show **comparisons**: local vs national trends.
- Identify **high-growth neighborhoods**, not just cities.
- Mention **risks** clearly and professionally.
- Suggest actionable research tools or next steps (Zillow, Redfin, Census data, local agents).

🚫 DO NOT:
- Fabricate or assume missing numbers.
- Give generic, vague summaries.
- Skip risk analysis or market-specific issues.

---

## 🧾 OUTPUT FORMAT:
- Professional tone — think investment report
- Use **clear headers** and **bullet points** for readability
- Include **specific city + neighborhood names**
- Include **numeric values** when possible
- Conclude with **actionable recommendations**

---

Now, analyze the user's question based on the above context.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0
    });
    let description = completion.choices[0].message.content?.trim();
    let descriptionCleaned = description?.replace(/```json|```/g, '');
    let descriptionCleanedFinal = descriptionCleaned?.replace(/\n/g, '<br />').replace(/[#*]/g, '');
    return descriptionCleanedFinal;
  } catch (error) {
    console.error('Error analyzing assistant:', error);
    return null;
  }
}