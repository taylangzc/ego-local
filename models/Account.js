const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const accountSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    steamId: {
      type: String,
      unique: true,
    },
    steamIdLong: {
      type: String,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    competitions: {
      type: Array,
      default: new Array(),
    },
    gameData: {
      type: Array,
      default: new Array(),
    },
    epicGamesId: {
      type: String,
      unique: true,
    },
  },
  {
    collection: "Accounts",
    versionKey: false,
  }
);

module.exports = mongoose.model("Account", accountSchema);
