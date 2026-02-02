const mockDailyLog = {
  "date": "2026-01-23",
  "summary": {
    "calories":{
      "intake": 1800,
      "burned": 400,
      "netCalories": 1400
    },
    "macros":{
      "protein": 120,
      "carbs": 200,
      "fats": 55
    }
  },
  "entries": [
    {
      "_id": "1",
      "userId": "user_123",
      "userText": "i ate chicken burger with cheese sauce in lunch",
      "name": "Lunch - chiken burger with sauce",
      "type": "meal",
      "items": [
        {
          "name": "Chicken Burger",
          "calories": 450,
          "protein": 25,
          "carbs": 40,
          "fats": 20
        },
        {
          "name": "Cheese Sauce",
          "calories": 100,
          "protein": 2,
          "carbs": 2,
          "fats": 9
        }
      ],
      "calories": 550,
      "protein": 27,
      "carbs": 42,
      "fats": 29,
      "healthAnalysis": "A chicken burger with cheese sauce is high in protein and calories, but it also contains significant saturated fat, sodium, and refined carbs, which can strain heart health if eaten frequently. It’s fine occasionally, but pairing it with veggies and limiting portion size makes it a more balanced meal.",
      "date": "2026-01-24",
      "createdAt": "2026-01-24T12:41:00.000Z",
      "updatedAt": "2026-01-24T12:41:00.000Z"
    },
    {
      "_id": "2",
      "userId": "user_123",
      "userText": "A run for 30 minutes in morning",
      "name": "Morning Run",
      "type": "exercise",
      "duration": 30,
      "calories": -250,
      "healthAnalysis": "A 30-minute morning run improves cardiovascular fitness, boosts mood, and helps with weight control by increasing calorie expenditure and metabolism. You typically burn around 200–350 calories in 30 minutes (depending on body weight and running speed).",
      "date": "2026-01-24",
      "createdAt": "2026-01-24T07:15:00.000Z",
      "updatedAt": "2026-01-24T07:15:00.000Z"
    }
  ]
}
module.exports = mockDailyLog;