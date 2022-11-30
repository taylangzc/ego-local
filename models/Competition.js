const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const competitionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: uuidv4,
    },
    players: {
      type: Array,
      default: new Array(),
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    standings: {
      type: Object,
      required: false,
    },
    game: {
      type: String,
      required: true,
    },
  },
  {
    collection: "Competitions",
    versionKey: false,
  }
);

module.exports = mongoose.model("Competition", competitionSchema);
