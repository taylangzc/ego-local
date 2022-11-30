const CompetitionMatch = require("../models/CompetitionMatch");
const mongoose = require("mongoose");

async function Add(competitionMatch) {
  const existingMatch = await CompetitionMatch.findOne({
    matchUniqueField: competitionMatch.matchUniqueField,
  });
  if (existingMatch) return;
  await competitionMatch.save();
}

module.exports = { Add };
