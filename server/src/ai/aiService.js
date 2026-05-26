const { GoogleGenerativeAI } = require("@google/generative-ai");
const PromptBuilder = require("./promptBuilder");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI Service
 * Handles interactions with the Gemini API.
 */
const aiService = {
  getSummary: async (preferences, properties) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = PromptBuilder.buildRecommendationExplanationPrompt(preferences, properties);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Summary Error:", error);
      return "Based on your preferences, we've found these top matches that best fit your budget and desired location.";
    }
  },

  getChatResponse: async (property, message, history) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = PromptBuilder.buildPropertyChatPrompt(property, message, history);
      
      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Chat Error:", error);
      return "I'm having trouble connecting right now. Please try again later or contact the owner directly.";
    }
  }
};

module.exports = aiService;
