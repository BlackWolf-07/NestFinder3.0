const recommendationEngine = require('../ai/recommendationEngine');
const aiService = require('../ai/aiService');
const Property = require('../models/Property');

/**
 * AI Controller
 * Orchestrates recommendation and chat logic.
 */

exports.recommendProperties = async (req, res) => {
  try {
    const preferences = req.body;
    
    // 1. Get deterministic recommendations from backend engine
    const recommendations = await recommendationEngine.getRecommendations(preferences);

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        summary: "No properties found matching your criteria. Try adjusting your filters."
      });
    }

    // 2. Use AI for a natural language summary/explanation
    const summary = await aiService.getSummary(preferences, recommendations);

    res.json({
      success: true,
      recommendations,
      summary
    });
  } catch (error) {
    console.error("Recommendation Controller Error:", error);
    res.status(500).json({ success: false, error: 'AI Recommendation failed' });
  }
};

exports.propertyChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const property = await Property.getById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const aiResponse = await aiService.getChatResponse(property, message, history || []);
    res.json({ success: true, reply: aiResponse });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ success: false, error: 'Chat failed' });
  }
};

exports.generalAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    // For general assistant, we can still use the old geminiService or refactor it here.
    // Keeping it simple for now by calling the AI service directly if needed.
    const geminiService = require('../services/geminiService');
    const response = await geminiService.getGeneralAssistantResponse(message);
    res.json({ success: true, ...response });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Assistant failed' });
  }
};
