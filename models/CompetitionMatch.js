const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const competitionMatchSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: uuidv4,
    },
    competitionId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    playedAt: {
      type: Date,
      required: true,
    },
    playedAtFormatted: {
      type: Number,
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
    matchStats: {
      type: Object,
      required: true,
    },
    matchUniqueField: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    collection: "CompetitionMatches",
    versionKey: false,
  }
);

module.exports = mongoose.model("CompetitionMatch", competitionMatchSchema);
