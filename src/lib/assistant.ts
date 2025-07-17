import { openai } from './openai';

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
You are a **Senior Real Estate Investment Analyst Assistant**.

Your role is to provide expert-level investment insights using both **property listings** and **market-level data** across the United States. Your output should resemble a professional investment memo—**accurate, data-driven, actionable, and grounded in current (2025) market conditions**.

---

## 🎯 OBJECTIVE  
Your task is to interpret the user's question and provide the appropriate analysis based on their goal:

- If the user is **searching for properties** by price, location, or features — prioritize **property-level listing analysis** and, based on your findings, create an engaging follow-up question that invites the user to explore **market trends, risks, or forecasts**.
  
- If the user is asking about **market conditions, trends, or forecasts** — start with a **macro-level investment analysis** and then generate a follow-up that invites the user to **explore matching properties** based on those insights.

You should generate the follow-up question yourself based on the content you’ve just presented. It should be natural, specific, and encourage the user to take the next step.

---

## 🔢 INPUTS  
- **User Input**: ${userInput}  
- **Listings Dataset (property-level)**:  
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`  
- **Market Info Dataset (city/region-level)**:  
\`\`\`json
${JSON.stringify(basicData, null, 2)}
\`\`\`

---

## 🧠 ANALYSIS GUIDELINES  

### ✅ Include these core components:

#### Quantitative Detail  
- Median home price, price per square foot  
- YoY price change, rental yield %, average days on market (DOM)  
- Vacancy rate, inventory levels  
- If any data is missing, clearly mention it

#### Neighborhood-Level Precision  
- Mention **zip codes**, **neighborhoods**, or **submarkets**  
- Don’t generalize with only city-level references

#### Growth Drivers  
Clearly explain *why* an area is growing or attractive:
- Job growth (new HQs, tech hubs)
- Infrastructure (transit, highways, airports)
- Zoning changes or incentives
- Education or medical institution expansion
- Demographics (e.g. Gen Z renters, retirees)

#### Risk Factors  
Call out red flags with evidence:
- Overbuilding, vacancy, declining rents
- Affordability mismatch, job reliance
- Climate risks (flood, drought, fire)
- Policy shifts (rent control, tax hikes)

#### Comparative Insights  
- Benchmark the location with national or regional averages  
- Align findings with **2025 market conditions**:
  - Stable or slowing appreciation
  - Higher insurance costs
  - Tighter mortgage credit

#### Credible Sources  
Reference:
- Redfin, Zillow, Realtor.com  
- MLS, Census.gov, local planning data

#### Visual Suggestions  
Recommend visuals like:
- “Rental yield trend by zip code”
- “YoY price appreciation by submarket”

---

## 📊 OUTPUT FORMAT  

Structure your memo like this:

### Market Overview  
Brief snapshot of market and listing data (depending on user’s question)

### Opportunities  
Highlight high-potential areas or segments, with reasoning

### Risks  
Call out issues with real numbers and trends

### Comparative Insights  
Show how this area stacks up vs. national or metro benchmarks

### Recommendations  
Summarize insights and what the user should consider doing

---

## 🧭 DYNAMIC FOLLOW-UP QUESTION  
**At the very end**, you must generate a **clear, specific, and action-oriented question** that encourages the user to explore the next step — either listings or macro-level insights — based on what you just analyzed.
Do not ask questions that are confusing, and always include the address, such as the state and city.
The question should be fascinating and serious.
You have to ask the clear question.
Don't use the "or" in the question.
Don't ask questions that are confusing like "Would you like to explore specific properties currently for sale in Phoenix, AZ, such as the recently reduced home at 3131 W Elm St, priced at $275,777, or would you prefer a deeper analysis of market trends and forecasts in this area?"
Ask the short question.
Please mark the question with a specific mark like "!!!"

Examples:
- After listing-focused content: *!!!Should we provide a detailed analysis of specific market trends, forecasts, macroeconomic factors, or a summary of real estate currently listed in La Jolla, California?”*
- After macro-level content: *!!!Should I find the most popular real estate in Texas on the market?!!!*

This question must be:
- Please mark the question with a specific mark like "!!!"
- After macro-level content, you have to add the top address or state, city, zipcode, etc
- Unique to the analysis
- Not templated
- Action-driving and helpful

---

## ✨ STYLE & TONE  
- Write with a clear, investor-friendly tone  
- Use bullet points and short paragraphs  
- Avoid vague statements — ground everything in facts  
- Be engaging but professional, like a smart advisor  
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