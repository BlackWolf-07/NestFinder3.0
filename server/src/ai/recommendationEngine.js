const Property = require('../models/Property');

/**
 * Smart Property Recommendation Engine
 * Provides deterministic scoring for properties based on user preferences.
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

      // JSON string format
      if (amenitiesField.trim().startsWith("[")) {
        return JSON.parse(amenitiesField);
      }

      // Comma-separated format
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

const recommendationEngine = {
  scoreProperties: (properties, preferences) => {
    return properties.map(property => {
      let score = 0;
      const reasonsList = [];

      // 1. Budget Match (Weighted 40%)
      const price = parseFloat(property.price);
      const budget = parseFloat(preferences.budget);

      if (!isNaN(price) && !isNaN(budget)) {
        if (price <= budget) {
          score += 40;
          reasonsList.push("Within your budget");
        } else if (price <= budget * 1.2) {
          score += 20;
          reasonsList.push("Slightly above your budget but offers great value");
        }
      }

      // 2. Location Match (Weighted 25%)
      if (
        property.locality &&
        preferences.locality &&
        property.locality.toLowerCase() === preferences.locality.toLowerCase()
      ) {
        score += 25;
        reasonsList.push("Matches preferred locality");
      } else if (
        property.city &&
        preferences.city &&
        property.city.toLowerCase() === preferences.city.toLowerCase()
      ) {
        score += 15;
        reasonsList.push("In your preferred city");
      }

      // 3. Property Type/Category Match (Weighted 15%)
      if (
        property.category &&
        preferences.category &&
        property.category.toLowerCase() === preferences.category.toLowerCase()
      ) {
        score += 15;
        reasonsList.push(`Matches requested property type (${property.category})`);
      }

      // 4. Amenities Match (Weighted 15%)
      if (
        preferences.amenities &&
        Array.isArray(preferences.amenities)
      ) {
        const propertyAmenities = parseAmenities(property.amenities);

        const matchedAmenities = preferences.amenities.filter(a =>
          propertyAmenities.some(pa =>
            pa.toLowerCase().includes(a.toLowerCase())
          )
        );

        if (matchedAmenities.length > 0) {
          const amenityScore = Math.min(15, matchedAmenities.length * 3);

          score += amenityScore;

          reasonsList.push(
            `Includes requested amenities: ${matchedAmenities
              .slice(0, 3)
              .join(", ")}`
          );
        }
      }

      // 5. Featured Property Bonus
      if (property.isFeatured) {
        score += 5;
        reasonsList.push("Top-rated featured property");
      }

      console.log("IMAGE FIELD RAW:", JSON.stringify(property.images));
      return {
        ...property,
        matchScore: Math.min(100, score),
        aiReason:
          reasonsList.length > 0
            ? reasonsList.join(". ") + "."
            : "Recommended based on your preferences."
      };
    });
  },

  getRecommendations: async (preferences) => {
    // Basic SQL filtering to optimize performance
    const filters = {
      city: preferences.city,
      type: preferences.type
    };

    const properties = await Property.getAll(filters);

    const scoredProperties =
      recommendationEngine.scoreProperties(properties, preferences);

    // Sort by score descending and take top 5
    return scoredProperties
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }
};

module.exports = recommendationEngine;