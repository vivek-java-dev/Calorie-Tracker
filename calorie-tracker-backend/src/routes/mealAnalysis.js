const express = require('express');
const multer = require('multer');
const mongoose = require("mongoose");
const { analyzeUserText, analyzeMealImage } = require('../services/geminiService');
const Entry = require('../models/Entry');
const  authMiddleware  = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/entries',authMiddleware, async (req, res) => {
  try {
    const date = req.query.date || req.body.date;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: date is required',
        hint: 'Provide date as query parameter (?date=2025-02-01) or in request body',
      });
    }

    console.log(' Fetching entries for date:', date);
    
    const entries = await Entry.find({
      userId:req.user.userId,
      date: date
    })
      .sort({ createdAt: -1 })
    
    console.log(` Found ${entries.length} entries for date: ${date}`);
    
    // Calculate summary
    let calorieIntake = 0;
    let caloriesBurned = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    entries.forEach(entry => {
      if (entry.type === 'meal') {
        calorieIntake += entry.calories || 0;
        totalProteins += entry.proteins || 0;
        totalCarbs += entry.carbs || 0;
        totalFats += entry.fats || 0;
      } else if (entry.type === 'exercise') {
        caloriesBurned += Math.abs(entry.calories) || 0;
      }
    });

    const netCalories = calorieIntake - caloriesBurned;

    const summary = {
      calories: {
        intake: calorieIntake,
        burned: caloriesBurned,
        netCalories: netCalories
      },
      macros: {
        proteins: Math.round(totalProteins * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fats: Math.round(totalFats * 10) / 10
      }
    };
    
    res.status(200).json({
      success: true,
      data: {
        date: date,
        summary: summary,
        entries: entries
      },
      message: 'Entries retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});


router.post('/analyze-user-text',authMiddleware, async (req, res) => {
  try {
    const userText = req.body.user_text || req.body['user-text'];
    const date = req.body.date || req.query.date || new Date().toISOString().split('T')[0];

    if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
      const receivedKeys = Object.keys(req.body);
      return res.status(400).json({
        success: false,
        error: 'Invalid request: user_text (or user-text) is required and must be a non-empty string',
        received_fields: receivedKeys.length > 0 ? receivedKeys : ['none'],
        hint: receivedKeys.length > 0 
          ? `You sent: ${JSON.stringify(receivedKeys)}. Expected: "user_text" or "user-text"`
          : 'Request body is empty. Make sure you are sending JSON with Content-Type: application/json',
      });
    }

    console.log(' Processing meal analysis request for:', userText.trim());

    // Analyze the user text using Gemini AI
    const nutritionData = await analyzeUserText(userText.trim());
    console.log(' Gemini analysis completed:', nutritionData);

    // Prepare data for database save (using new schema fields)
    const entryData = {
      userId:req.user.userId,
      userText: nutritionData.userText,
      name: nutritionData.name,
      type: nutritionData.type,
      items: nutritionData.items,
      calories: nutritionData.calories,
      proteins: nutritionData.proteins,
      carbs: nutritionData.carbs,
      fats: nutritionData.fats,
      duration: nutritionData.duration || undefined,
      healthAnalysis: nutritionData.healthAnalysis,
      date: date,
    };

    console.log(' Saving to database:', entryData);

    // Save to MongoDB
    const savedEntry = await Entry.create(entryData);
    console.log(' Successfully saved to database with ID:', savedEntry._id);

    // Return successful response with both analysis and saved data
    res.status(201).json({
      success: true,
      data: {
        analysis: nutritionData,
        saved_entry: {
          userId: savedEntry.userId,
          id: savedEntry._id,
          userText: savedEntry.userText,
          name: savedEntry.name,
          type: savedEntry.type,
          items: savedEntry.items,
          calories: savedEntry.calories,
          protein: savedEntry.protein,
          carbs: savedEntry.carbs,
          fats: savedEntry.fats,
          duration: savedEntry.duration,
          healthAnalysis: savedEntry.healthAnalysis,
          date: savedEntry.date,
          created_at: savedEntry.createdAt
        }
      },
      message: 'Meal analyzed and saved successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-user-text:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

    // Handle database save errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Database validation error: ' + error.message,
      });
    }

    // Handle specific Gemini API error types
    if (status === 401 || code === 'invalid_api_key' || code === 'missing_api_key' || message.toLowerCase().includes('api key')) {
      return res.status(401).json({
        success: false,
        error: 'Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server.',
      });
    }

    if (status === 429 || code === 'insufficient_quota' || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'Gemini request blocked (rate limit or quota). Check your Google AI usage/billing, then try again.',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal text',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.delete('/entries',authMiddleware ,async (req, res) => {
  const { id, date } = req.query || req.body;

  try {
    // ❌ No params
    if (!id && !date) {
      return res.status(400).json({
        error: "Either id or date is required",
      });
    }

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }

      const deletedEntry = await Entry.findByIdAndDelete({_id:id, userId:req.user.userId });

      if (!deletedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Entry deleted successfully",
        data: deletedEntry,
      });
    }

    if (date) {
      const [year, month, day] = date.split("-");

      if (
        !year || !month || !day ||
        day < 1 || day > 31 ||
        month < 1 || month > 12
      ) {
        return res.status(400).json({
          error: "Invalid date format. Use YY-MM-DD",
        });
      }

      const fullYear = `20${year}`;
      const formattedDate = `${fullYear}-${month}-${day}`;

      const result = await Entry.deleteMany({ date: formattedDate, userId:req.user.userId });

      return res.status(200).json({
        success: true,
        message: `Deleted entries for ${date}`,
        deletedCount: result.deletedCount,
      });
    }

  } catch (error) {
    console.error("Error in DELETE /entries:", error);
    return res.status(500).json({ error: error.message });
  }
});



// Configure multer for image uploads // Store in memory (no disk storage needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});
router.post('/analyze-meal-image', authMiddleware,upload.single('meal_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: meal_image file is required',
      });
    }

    // Get image data and MIME type
    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;
    const date = req.body.date || req.query.date || new Date().toISOString().split('T')[0];

    console.log(' Processing meal image analysis, file size:', imageBuffer.length, 'bytes');

    // Analyze the meal image using Gemini AI
    const nutritionData = await analyzeMealImage(imageBuffer, imageMimeType);
    console.log(' Gemini image analysis completed:', nutritionData);

    // Prepare data for database save (using new schema fields)
    const entryData = {
      userText: nutritionData.userText,
      name: nutritionData.name,
      type: nutritionData.type,
      items: nutritionData.items,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fats: nutritionData.fats,
      duration: nutritionData.duration || undefined,
      healthAnalysis: nutritionData.healthAnalysis,
      date: date,
    };

    console.log(' Saving image analysis to database:', entryData);

    // Save to MongoDB
    const savedEntry = await Entry.create(entryData);
    console.log(' Successfully saved image analysis to database with ID:', savedEntry._id);

    // Return successful response with both analysis and saved data
    res.status(201).json({
      success: true,
      data: {
        analysis: nutritionData,
        saved_entry: {
          id: savedEntry._id,
          userText: savedEntry.userText,
          name: savedEntry.name,
          type: savedEntry.type,
          items: savedEntry.items,
          calories: savedEntry.calories,
          proteins: savedEntry.proteins,
          carbs: savedEntry.carbs,
          fats: savedEntry.fats,
          duration: savedEntry.duration,
          healthAnalysis: savedEntry.healthAnalysis,
          date: savedEntry.date,
          created_at: savedEntry.createdAt
        }
      },
      message: 'Meal image analyzed and saved successfully',
    });
  } catch (error) {
    console.error('Error in /analyze-meal-image:', error);

    const status = error?.status ?? error?.cause?.status;
    const code = error?.code ?? error?.cause?.code;
    const message = error?.message ?? '';

    // Handle database save errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Database validation error: ' + error.message,
      });
    }

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.',
        });
      }
      return res.status(400).json({
        success: false,
        error: `File upload error: ${error.message}`,
      });
    }

    // Handle specific error types
    if (error.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only image files are allowed.',
      });
    }

    // Gemini auth / missing key
    if (status === 401 || code === 'invalid_api_key' || code === 'missing_api_key' || message.toLowerCase().includes('api key')) {
      return res.status(401).json({
        success: false,
        error: 'Gemini authentication failed (missing/invalid API key). Update GEMINI_API_KEY in your .env and restart the server.',
      });
    }

    if (status === 429 || code === 'insufficient_quota' || message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('exceeded your current quota')) {
      return res.status(429).json({
        success: false,
        error: 'Gemini request blocked (rate limit or quota). Check your Google AI usage/billing, then try again.',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to analyze meal image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
