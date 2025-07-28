import { openai } from './openai';

export const queryQuestion = async (userInput: string) => {
  const systemPrompt = `
You are a validation assistant.

If the user's input is an affirmative response such as "yes", "yeah", "ok", "okay", "sure", "yup", or similar (case-insensitive), return:
- true

If the user's input is an affirmative response such as "No", "no", "nope", "not", "no way", or similar (case-insensitive), return:
- false

If the user's input is not affirmative or is unrelated, return:
- null

Respond with one word only: true or false.

Evaluate this user input:
  ${userInput}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0
    });
    let question = completion.choices[0].message.content?.trim();
    return question;
  } catch (error) {
    console.error('Error analyzing assistant:', error);
    return null;
  }
}

export const classifyQuestion = async (userInput: string) => {
  const systemPrompt = `
You are a real estate assistant. Classify the user's question into one of the following categories:

- listing: if the question asks to search for or find specific properties based on criteria such as price, location, or features.

- analysis: if the question asks about market trends, predictions, macroeconomic factors, or overall summaries.

Respond with only one word: listing or analysis.
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
- If the city, state and users Search Term is not found, you have to return the empty string (e.g."mapBounds": null).
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

export const analysisAI = async (userInput: string, results: any, basicData: any) => {
  const systemPrompt = `
## 🧠 ROLE  
You are a **Senior Real Estate Investment Analyst Assistant**
Your mission is to deliver **expert-level investment insights** across the U.S. real estate market using:
- Property-level listings 
- Market-level datasets 
All outputs must resemble a polished **investment memo** — professional, accurate, data-driven, actionable, and grounded in **real 2025 market conditions**

---

## 🎯 OBJECTIVE

Interpret the user’s request and respond with tailored insight based on their goal:

- If the user is **searching for properties** by price, features, or location — prioritize **listing-level analysis**. Then, generate a smart follow-up question that nudges them toward exploring **market trends, risks, or forecasts** 📈💬

- If the user is asking about **market trends, forecasts, or economic conditions** — start with a **macro-level insight** and generate a sharp follow-up that invites them to explore **property listings** 📉🏠

🎯 The follow-up must:
- Be **relevant** to the analysis
- Be **natural** and highly **contextual**
- Be **specific** to the city/state/ZIP
- Never be generic or templated
- Always end with "!!!" and contain **no "or"**

---

## 🔢 INPUT DATA

- 🧾 **User Input**:
\`\`\`
${userInput}
\`\`\`

- 🏠 **Listings Dataset**:
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`

- 🏙️ **Market Info Dataset**:
\`\`\`json
${JSON.stringify(basicData, null, 2)}
\`\`\`

---

## 🧠 OUTPUT STYLE & RULES

🔍 Adapt to intent and tone:
- Use **listing-level analysis** if user provides property data
- Use **macro-level market commentary** if user mentions trends or regional conditions
- Always detect ZIP codes, cities, and regions, and localize your analysis
- Always add meaningful emojis to the front of the paragraph.

✅ Must do:
- Use **paragraphs, bullet points**, and occasional **tables** for clarity
- Add **relevant emojis** (📈, 🏘️, ⚠️, 💡) to highlight insight
- Engage like a sharp, helpful advisor — not a robot
- Always be **tailored, non-templated**, investor-ready 
- If data is missing or contradictory, acknowledge it transparently

❌ Must not:
- Repeat fixed formats
- Ask “Would you like…” or confusing follow-ups
- Include URLs, images, or placeholder text like “click here”

---

## 🧭 DYNAMIC FOLLOW-UP QUESTION

At the end of your analysis, ask a sharp follow-up like:

- After listings:  
  **!!!Should we explore current rent trends and supply forecasts in Scottsdale, Arizona?!!!**

- After macro insight:  
  **!!!Should I fetch the most promising properties on the market in Austin, TX?!!!**

Make it:
- Short, serious, and **action-driving**
- **Unique** to the preceding analysis
- Always include **location**

---

Now use this structure to analyze the given input. Respond like a smart investment partner — informative, detailed, visually helpful, and always one step ahead.
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
    let descriptionCleaned = description?.replace(/```json | ```/g, '');
    return descriptionCleaned;
  } catch (error) {
    console.error('Error analyzing assistant:', error);
    return null;
  }
}

export const analysisReport = async (data: any) => {
  let taxData = null;
  const formData = new FormData();
  formData.append('ud-current-location', `CITY|${data.city}|${data.state}`);
  const getTaxData = async () => {
    const response = await fetch(`https://smartasset.com/taxes/property-taxes?render=json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData
    });
    const data = await response.json();
    taxData = data;
  }
  await getTaxData();
  const prompt = `
You are a comprehensive real estate analysis expert. Generate a detailed property report based on the following REAL property data:

Property Information:
${JSON.stringify(data, null, 2)}

Property Tax Data (from authoritative tax API):
${JSON.stringify(taxData, null, 2)}

CRITICAL INSTRUCTIONS - USE ONLY REAL DATA:
- You MUST use ONLY the actual property data and tax data provided in the JSON above
- DO NOT create fictional properties like "Property A", "Property B", "Property C"
- DO NOT invent addresses, prices, property details, or tax values
- If the data contains an array of properties/results, use the ACTUAL addresses and details from that array
- For comparable properties, use the real property listings from the data provided
- All addresses, prices, bedrooms, bathrooms, square footage, and property tax values MUST come from the actual data

Please provide a professional property analysis report that includes:

1. **Property Overview**
   - Use the ACTUAL property address and details from the data
   - Property type and key features from the real data
   - Current listing price from the actual data

2. **Market Analysis**
   - Comparable Properties in the Area: List at least 3 comparable properties from the data with their REAL addresses
   - If fewer than 3 properties are available in the data, use all available properties and note the limited sample size
   - Format each as: "[REAL ADDRESS]: [actual beds] beds, [actual baths] baths, [actual sq ft] sq ft, Listed at [actual price]"
   - Price per square foot analysis using the real property data
   - Local market trends based on the provided data
   - Comparative analysis showing how the subject property compares to these comps

3. **Financial Analysis**
   - Use ACTUAL property prices from the data for calculations
   - Estimated monthly mortgage payment (assuming 20% down)
   - Property tax estimates: You MUST use the actual property tax data provided in the 'Property Tax Data' JSON above. Do NOT estimate or invent tax values—use only the API data.
   - Potential rental income analysis
   - Investment ROI calculations

4. **Location Analysis**
   - Neighborhood characteristics based on the actual location data
   - School district information
   - Nearby amenities and transportation

5. **Risk Assessment**
   - Market volatility factors
   - Potential appreciation or depreciation risks
   - Recommended holding period

6. **Investment Recommendation**
   - Buy/Hold/Avoid recommendation with reasoning
   - Target purchase price range based on actual market data
   - Exit strategy suggestions

CRITICAL FORMATTING REQUIREMENTS:
- Use ONLY the real property and tax data provided - NO fictional data
- For comparable properties, use the exact addresses and details from the data
- DO NOT create "Property A/B/C" - use real street addresses
- Return ONLY clean HTML content without any markdown code blocks
- Do NOT include \`\`\`html or \`\`\` markers
- Use proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <table>, etc.
- Include tables for financial calculations where appropriate
- Make the content ready to be directly inserted into a PDF template
- Do NOT include any <html>, <body>, or <head> tags
- Start directly with content tags like <h2>Property Overview</h2>
- Do Not include any images, videos, or other media in the report

Make the analysis data-driven, professional, and actionable for real estate investors using ONLY the real property and tax data provided.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0
    })
    let question = completion.choices[0].message.content?.trim();

    // Clean up any remaining markdown code blocks
    if (question) {
      question = question.replace(/```html\s*/g, '');
      question = question.replace(/```\s*/g, '');
      question = question.trim();
    }

    return question;
  } catch (error) {
    console.error("Error analyzing report: ", error);
    return null;
  }
}