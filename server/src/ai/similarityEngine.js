const Property = require('../models/Property');

/**
 * Similarity Engine for "You may also like"
 * Compares properties to find the most similar ones.
 */

// Safe amenities parser
function parseAmenities(amenitiesField) {
  try {
    // Already an array
    if (Array.isArray(amenitiesField)) {
      return amenitiesField;
    }

    // String handling
    if (typeof amenitiesField === "string") {

      // JSON array string
      if (amenitiesField.trim().startsWith("[")) {
        return JSON.parse(amenitiesField);
      }

      // Comma-separated string
      return amenitiesField
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    }

    return [];
  } catch (err) {
    console.error("Amenities parse error:", err);
    return [];
  }
}

const similarityEngine = {
  calculateSimilarity: (target, candidate) => {
    let score = 0;

    // 1. Price Similarity (up to 40 points)
    const targetPrice = parseFloat(target.price);
    const candidatePrice = parseFloat(candidate.price);

    if (!isNaN(targetPrice) && !isNaN(candidatePrice) && targetPrice > 0) {
      const priceDiff = Math.abs(targetPrice - candidatePrice);
      const priceRatio = priceDiff / targetPrice;

      if (priceRatio < 0.1) score += 40;
      else if (priceRatio < 0.2) score += 30;
      else if (priceRatio < 0.3) score += 20;
      else if (priceRatio < 0.5) score += 10;
    }

    // 2. Same Category (30 points)
    if (
      target.category &&
      candidate.category &&
      target.category.toLowerCase() === candidate.category.toLowerCase()
    ) {
      score += 30;
    }

    // 3. Same Locality/City (20 points)
    if (
      target.locality &&
      candidate.locality &&
      target.locality.toLowerCase() === candidate.locality.toLowerCase()
    ) {
      score += 20;
    } else if (
      target.city &&
      candidate.city &&
      target.city.toLowerCase() === candidate.city.toLowerCase()
    ) {
      score += 10;
    }

    // 4. Shared Amenities (10 points)
    const targetAmenities = parseAmenities(target.amenities);
    const candidateAmenities = parseAmenities(candidate.amenities);

    const common = targetAmenities.filter(a =>
      candidateAmenities.some(ca =>
        ca.toLowerCase() === a.toLowerCase()
      )
    );

    if (common.length > 0) {
      score += 10;
    }

    return score;
  },

  getSimilarProperties: async (propertyId, limit = 4) => {
    const target = await Property.getById(propertyId);

    if (!target) return [];

    // Get properties in the same city to compare
    const candidates = await Property.getAll({
      city: target.city
    });

    // Filter out the target property itself
    const filteredCandidates = candidates.filter(
      p => p.id !== parseInt(propertyId)
    );

    const scored = filteredCandidates.map(candidate => ({
      ...candidate,
      similarityScore:
        similarityEngine.calculateSimilarity(target, candidate)
    }));

    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
};

module.exports = similarityEngine;