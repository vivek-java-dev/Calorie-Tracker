/**
 * Gemini Service (Google Gemini API)
 * Handles all interactions with Google Gemini for meal analysis (text + vision).
 *
 * Exposes the SAME public API as the previous AI service:
 * - analyzeuserText(userText)
 * - analyzeMealImage(imageBuffer, imageMimeType)
 *
 * The rest of the backend (routes/controllers/clients) should remain unchanged.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log(' Checking Gemini API key...');
  console.log(' API key exists:', !!apiKey);
  console.log(' API key length:', apiKey ? apiKey.length : 0);
  console.log(' API key starts with:', apiKey ? apiKey.substring(0, 8) + '...' : 'N/A');
  
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    const err = new Error('Gemini API key not configured: set GEMINI_API_KEY in your .env');
    // Surface as "unauthorized" to API callers (similar to invalid/missing key).
    err.status = 401;
    err.code = 'missing_api_key';
    throw err;
  }
  
  console.log(' Gemini API key validated successfully');
  return new GoogleGenerativeAI(apiKey.trim());
}

function getTextModelName() {
  return process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
}
function getVisionModelName() {
  return process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
}

function buildNutritionPrompt({ userText, isVision }) {
  return (
  `You are an expert nutritionist and food scientist with comprehensive knowledge of food composition, macronutrient distribution, micronutrient profiles, and dietary health implications. Analyze the provided meal or exercise activity with precision and provide detailed nutritional estimates based on standard serving sizes and nutritional databases.
  
  When analyzing meals, consider:
  - Accurate portion sizes and weights
  - Cooking methods and their nutritional impact (boiling, frying, grilling, etc.)
  - Common food substitutions and variations
  - Both macronutrients (proteins, carbs, fats) and key micronutrients
  - Health implications and balanced nutrition guidance

  ${isVision ? 'Input Meal Image: An image of a meal will be provided.' : `Input Meal Description: "${userText}"`}

  Return ONLY a valid JSON object with EXACTLY this structure (no extra keys, no extra text,no changing key names):
  {
    userText: string,          // Original user input text (if any)
    name: string,              // Short name/label for the meal or exercise
    type: "meal" | "exercise", // Type of entry
    items: [                   // For meals: array of detected food items
      {
        name: string,         // Name of the food item
        calories: number,    // Calories in kcal
        proteins: number,     // Proteins in grams
        carbs: number,       // Carbohydrates in grams
        fats: number         // Fats in grams
      },
    ],                        // items array is False for exercises and optional for meals
    calories: number,        // Total calories (negative for exercise)
    proteins: number,         // Total proteins in grams (meals only)
    carbs: number,           // Total carbohydrates in grams (meals only)
    fats: number,            // Total fats in grams (meals only)
    duration: number,      // For exercises only: duration in minutes
    healthAnalysis: string   // Brief health analysis of the meal or exercise

  }

  EXAMPLE 1: 
    Input: "i ate two chicken burger with cheese sauce in lunch."
    Output:
    {
      "userText": "i ate two chicken burger with cheese sauce in lunch",
      "name": "Lunch - chiken burger with sauce",
      "type": "meal",
      "items": [
        {
          "name": "Chicken Burger(2 burger)",
          "calories": 900,
          "proteins": 50,
          "carbs": 80,
          "fats": 40
        },
        {
          "name": "Cheese Sauce(20g)",
          "calories": 200,
          "proteins": 4,
          "carbs": 4,
          "fats": 18
        }
      ],
      "calories": 1100,
      "proteins": 54,
      "carbs": 84,
      "fats": 58,
      "healthAnalysis": "A chicken burger with cheese sauce is high in proteins and calories, but it also contains significant saturated fat, sodium, and refined carbs, which can strain heart health if eaten frequently. It’s fine occasionally, but pairing it with veggies and limiting portion size makes it a more balanced meal.",
    }
    EXAMPLE 2:
    Input: " moong Dal chila made from 80g Moong Dal And 80g Curd With red sauce And 200ML cow milk"
    Output:
    {
      "userText": "moong Dal chila made from 80g Moong Dal And 80g Curd With red sauce And 200ML cow milk",
      "name": "Moong Dal Chila with Sides",
      "type": "meal",
      "items": [
        {
          "name": "Moong Dal(split yellow gram)(80g)",
          "calories": 270,
          "proteins": 20,
          "carbs": 40,
          "fats": 5
        },
        {
          "name": "Curd(plain,whole milk)(80g)",
          "calories": 50,
          "proteins": 3,
          "carbs": 4,
          "fats": 2
        },
        {
          "name": "Red Sauce(tomato ketchup)(20g)",
          "calories": 30,
          "proteins": 1,
          "carbs": 6,
          "fats": 0
        },
        {
          "name": "Cow Milk(whole)(200ml)",
          "calories": 200,
          "proteins": 13,
          "carbs": 12,
          "fats": 12
        }
      ],
      "calories":550 ,
      "proteins": 37,
      "carbs": 62,
      "fats": 19,
      "healthAnalysis": "A moong dal chila with curd, red sauce, and cow milk provides a balanced meal rich in proteins, fiber, and essential nutrients. Moong dal is an excellent source of plant-based protein and fiber, supporting digestion and muscle health. Curd adds probiotics for gut health, while cow milk contributes calcium and vitamin D for bone strength. However, be mindful of portion sizes and the added red sauce, which may contain extra sodium and sugars. Overall, this meal supports sustained energy levels and muscle recovery.",
    }
  EXAMPLE 3:
    Input: "A run for 30 minutes in morning"
    Output:
    {
      "userText": "A run for 30 minutes in morning",
      "name": "Morning Run",
      "type": "exercise",
      "duration": 30,
      "calories": -250,
      "healthAnalysis": "A 30-minute morning run improves cardiovascular fitness, boosts mood, and helps with weight control by increasing calorie expenditure and metabolism. You typically burn around 250 calories in 30 minutes (depending on body weight and running speed).",
    }
  EXAMPLE 4:
    Input: " A workout session of chest with exercise Chest cable fly, Flatbench press And inclined bench press Three sets of each."
    Output:
    {
      "userText": "A workout session of chest with exercise Chest cable fly, Flatbench press And inclined bench press Three sets of each.",
      "name": "Chest Workout Session",
      "type": "exercise",
      "duration": 45,
      "calories": -200,
      "healthAnalysis": "A chest workout session targeting major chest muscles enhances upper body strength, muscle tone, and endurance. It also boosts metabolism and supports weight management by increasing calorie burn during and after exercise. A typical 45-minute session can burn around 200 calories, depending on intensity and individual factors.",
    }
  EXAMPLE 5:
    Input: "1 scoop of whey protein with water"
    Output:
    {
      "userText": "1 scoop of whey protein with water",
      "name": "Whey Protein Shake",
      "type": "meal",
      "calories": 120,
      "proteins": 24,
      "carbs": 3,
      "fats": 1,
      "healthAnalysis": "A whey protein shake is an excellent source of high-quality protein that supports muscle repair and growth. It is low in calories, carbs, and fats, making it a convenient option for post-workout nutrition or as a protein supplement throughout the day. However, it should not replace whole food meals regularly, as whole foods provide additional essential nutrients and fiber.",
    }
  EXAMPLE 6:
    Input: "I ate 2 paneer parathas"
    Output:
    {
      "userText": "i ate 2 paneer parathas",
      "name": "Paneer Parathas(2 units)",
      "type": "meal",
      "calories": 600,
      "proteins": 20,
      "carbs": 70,
      "fats": 25,
      "healthAnalysis": "Paneer parathas are a good source of protein and carbohydrates, providing energy and muscle support. However, they can be high in calories and fats due to the use of oil or ghee in preparation. Consuming them in moderation is key, and pairing with a side of vegetables or yogurt can enhance the meal's nutritional balance.",
    }

    Rules:
  - Always provide detailed item-by-item breakdown for meals; include serving sizes in parentheses
  - Estimate portion sizes accurately based on visual cues (for images) or standard servings (for text)
  - For exercises, estimate calories burned based on typical intensity and user body weight (assume average adult)
  - Ensure all numeric values (calories, proteins, carbs, fats) are valid JSON numbers without quotes
  - All nutrition values must be non-negative (negative values only for exercise calories to indicate burn)
  - Include specific food types with qualifiers (e.g., "Curd(plain,whole milk)" not just "Curd")
  - Do NOT wrap output in markdown code fences or backticks
  - Do NOT include any text before or after the JSON object
  - If ingredient quantities are ambiguous, make reasonable estimates based on typical serving sizes
  - Ensure healthAnalysis is balanced, acknowledging both benefits and potential concerns
  - For meals without explicit items array (e.g., protein shakes,pastas, pizzas, parathas), include total macros but items array is optional
  - The items array must not contain duplicate elements
  - Round calories to nearest whole number; round proteins/carbs/fats to 1 decimal place
  - Validate JSON structure matches the schema exactly before responding`);
}

function extractJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text && typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
    if (!match) throw new Error('Failed to parse model response as JSON');
    return JSON.parse(match[0]);
  }
}

/**
 * Validate and normalize nutrition data from Gemini response
 * @param {Object} data - Raw nutrition data from Gemini API
 * @returns {Object} Normalized nutrition data
 */
function validateAndNormalizeNutritionData(data) {
  const getNumber = (value, fallback = 0) => 
    typeof value === 'number' ? value : fallback;

  const getString = (value, fallback = '') => 
    typeof value === 'string' ? value.trim() : fallback;

  return {
    userText: getString(data?.userText),
    name: getString(data?.name, 'Meal'),
    type: data?.type === 'exercise' ? 'exercise' : 'meal',
    items: Array.isArray(data?.items) ? data.items : [],
    calories: Math.round(getNumber(data?.calories)),
    proteins: Math.round(getNumber(data?.proteins) * 10) / 10,
    carbs: Math.round(getNumber(data?.carbs) * 10) / 10,
    fats: Math.round(getNumber(data?.fats) * 10) / 10,
    duration: getNumber(data?.duration),
    healthAnalysis: getString(data?.healthAnalysis),
  };
}

function wrapGeminiError(error, prefixMessage) {
  // The SDK error shapes can vary; normalize to include status/code for route-level mapping.
  const wrapped = new Error(`${prefixMessage}: ${error?.message || String(error)}`);
  wrapped.cause = error;

  // Common places where HTTP status might exist.
  wrapped.status =
    error?.status ||
    error?.response?.status ||
    error?.response?.statusCode ||
    undefined;

  const msg = (error?.message || '').toLowerCase();
  if (wrapped.status === 401 || wrapped.status === 403 || msg.includes('api key') || msg.includes('permission') || msg.includes('unauthorized')) {
    wrapped.status = 401;
    wrapped.code = 'invalid_api_key';
  } else if (wrapped.status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate limit')) {
    wrapped.status = 429;
    wrapped.code = 'insufficient_quota';
  } else {
    wrapped.code = error?.code;
  }

  return wrapped;
}

/**
 * @param {string} userText - Natural language meal description
 * @returns {Promise<Object>} Nutrition data in standardized format
 */
async function analyzeUserText(userText) {
  try {
    console.log(' Starting meal text analysis with Gemini...');
    console.log(' Meal text:', userText);
    
    const genAI = getGeminiClient();
    const modelName = getTextModelName();
    console.log(' Using model:', modelName);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
   
      generationConfig: { temperature: 0.3 },
    });

    const prompt = buildNutritionPrompt({ userText, isVision: false });
    console.log(' Sending request to Gemini...');
    
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? '';
    
    console.log(' Raw Gemini response:', text);
    
    const nutritionData = extractJsonObject(text);
    const normalizedData = validateAndNormalizeNutritionData(nutritionData);
    
    console.log(' Normalized nutrition data:', normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error(' Error in analyzeuserText:', error.message);
    console.error(' Error details:', {
      status: error.status,
      code: error.code,
      cause: error.cause?.message
    });
    throw wrapGeminiError(error, 'Failed to analyze meal text');
  }
}

/**
 * Analyze meal from image (Gemini vision-capable model)
 * @param {Buffer|string} imageData - Image buffer o string
 * @param {string} imageMimeType - MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<Object>} Nutrition data in standardized format
 */
async function analyzeMealImage(imageData, imageMimeType = 'image/jpeg') {
  try {
    console.log(' Starting meal image analysis with Gemini...');
    console.log(' Image type:', imageMimeType);
    
    const genAI = getGeminiClient();
    const modelName = getVisionModelName();
    console.log(' Using vision model:', modelName);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3 },
    });

    // Convert image to base64 if it's a buffer
    let imageBase64;
    if (Buffer.isBuffer(imageData)) {
      imageBase64 = imageData.toString('base64');
      console.log(' Converted buffer to base64, size:', imageData.length, 'bytes');
    } else if (typeof imageData === 'string') {
      imageBase64 = imageData.replace(/^data:image\/\w+;base64,/, '');
      console.log(' Using provided base64 string');
    } else {
      const err = new Error('Invalid image data format');
      err.status = 400;
      err.code = 'invalid_image';
      throw err;
    }

    const prompt = buildNutritionPrompt({ userText: '', isVision: true });
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    };

    console.log(' Sending image analysis request to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const text = result?.response?.text?.() ?? '';
    
    console.log(' Raw Gemini response:', text);
    
    const nutritionData = extractJsonObject(text);
    const normalizedData = validateAndNormalizeNutritionData(nutritionData);
    
    console.log(' Normalized nutrition data:', normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error(' Error in analyzeMealImage:', error.message);
    console.error(' Error details:', {
      status: error.status,
      code: error.code,
      cause: error.cause?.message
    });
    throw wrapGeminiError(error, 'Failed to analyze meal image');
  }
}

module.exports = {
  analyzeUserText,
  analyzeMealImage,
};

