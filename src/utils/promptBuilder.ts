export function buildRentalPrompt(property: any, investor: any) {
  return `
  You are a real estate advisor.
  
  Investor Profile:
  - Budget: $${investor.budget}
  - Location: ${investor.location}
  - Strategy: ${investor.strategy}
  
  Property:
  - Address: ${property.address}
  - Price: $${property.price}
  - Rent: $${property.estimated_rent}
  - Taxes: $${property.taxes}
  - Maintenance: $${property.maintenance}
  - Insurance: $${property.insurance}
  
  Goals:
  - Estimate cap rate
  - Project monthly cash flow
  - Assess risk factors
  - Give conversational output with advice
  `;
}

export async function extractSearchQuery(userInput: string): Promise<string> {
  // Simple implementation - return a basic search query
  return JSON.stringify({
    city: "Phoenix",
    state: "AZ",
    usersSearchTerm: "Phoenix, AZ"
  });
}

export async function extractDescription(listings: any[], userInput: string): Promise<string> {
  // Simple implementation - return a basic description
  return JSON.stringify({
    description: `Found ${listings.length} properties matching your search.`,
    cardView: true
  });
}
