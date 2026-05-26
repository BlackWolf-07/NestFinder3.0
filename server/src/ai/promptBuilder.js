/**
 * Prompt Builder for AI service
 * Centralizes prompt engineering for consistency.
 */
class PromptBuilder {
  static buildRecommendationExplanationPrompt(preferences, properties) {
    return `
      You are the NestFinder AI Assistant. 
      I have selected the following properties for a user based on their preferences.
      
      User Preferences:
      - Budget: ${preferences.budget}
      - Location: ${preferences.city}, ${preferences.locality || 'Any'}
      - Property Type: ${preferences.category}
      
      Selected Properties:
      ${properties.map(p => `- ${p.title} in ${p.locality} ($${p.price})`).join('\n')}
      
      Task:
      Provide a very brief (2 sentence) welcoming summary for the user explaining why these properties are great choices for them.
      Return ONLY the summary text.
    `;
  }

  static buildPropertyChatPrompt(property, message, history) {
    const amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities;
    
    return `
      You are an AI assistant for a specific property listing on NestFinder.
      Property Details:
      Title: ${property.title}
      Price: ${property.price}
      Location: ${property.location}, ${property.locality}, ${property.city}
      Type: ${property.type}
      Category: ${property.category}
      BHK: ${property.bhk}
      Furnishing: ${property.furnishing}
      Amenities: ${Array.isArray(amenities) ? amenities.join(', ') : 'N/A'}
      Description: ${property.description}

      Answer the user's question accurately based ONLY on the details provided above.
      If information is not available, say "I don't have that specific information, but you can contact the owner for more details."
      Be helpful, concise, and professional.
    `;
  }
}

module.exports = PromptBuilder;
