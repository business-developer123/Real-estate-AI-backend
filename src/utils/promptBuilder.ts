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
