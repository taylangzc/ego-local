require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/DotaThingy"); //dotenv doesn't work on command console
const moment = require("moment");
const Competition = require("../models/competition");

async function Worker() {
  let pendingCompetitions = await Competition.find({
    startsAt: { $lte: moment() },
    status: "Pending",
  });
  console.info(`checking...`);
  if (pendingCompetitions.length > 0) {
    for (pendingCompetition of pendingCompetitions) {
      pendingCompetition.status = "Processing";
      await pendingCompetition.save();
      console.info(`${pendingCompetition.id} competition started!`);
    }
  }

  let processigCompetitions = await Competition.find({
    endsAt: { $lte: moment() },
    status: "Processing",
  });
  if (processigCompetitions.length > 0) {
    for (processigCompetition of processigCompetitions) {
      processigCompetition.status = "Completed";
      await processigCompetition.save();
      console.info(`${processigCompetition.id} competition started!`);
    }
  }
}

setInterval(Worker, 10000);
