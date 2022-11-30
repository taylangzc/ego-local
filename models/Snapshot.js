const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const snapshotSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    accountId: {
      type: String,
      required: true,
    },
    competitionId: {
      type: String,
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
    stats: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "Snapshots",
    versionKey: false,
  }
);

module.exports = mongoose.model("Snapshot", snapshotSchema);
