const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories : {type:String, required:true},
  proteins: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
}, { _id: false });

const entrySchema = new mongoose.Schema({
  // history: [
  //   {
  //     snapshot: mongoose.Schema.Types.Mixed,
  //     updatedAt: Date,
  //   },
  // ],

  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },

  userText : {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["meal", "exercise"],
    required: true,
  },

  items: {
    type: [itemSchema],
    default: undefined
  },

  calories: {
    type: Number,
    required: true,
  },
  
  proteins: {
    type: Number,
    required: function () {
      return this.type === "meal";
    },
  },
  carbs: {
    type: Number,
    required: function () {
      return this.type === "meal";
    },
  },
  fats: {
    type: Number,
    required: function () {
      return this.type === "meal";
    },
  },
  duration: {
    type: Number,
    required: function () {
      return this.type === "exercise";
    },
  },

  healthAnalysis:{
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Entry = mongoose.models.Entry || mongoose.model("Entry", entrySchema);
module.exports = Entry;