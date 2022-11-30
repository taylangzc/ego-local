require("dotenv").config();
const Competition = require("../models/Competition");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/DotaThingy");
const DotaHelper = require("../helpers/dota2");
const CsgoHelper = require("../helpers/csgo");
const ForniteHelper = require("../helpers/fortnite");
const { Games } = require("../models/enums/Games");

async function Worker() {
  const readyCompetitions = await Competition.find({
    status: "Processing",
  });
  if (readyCompetitions.length <= 0)
    return console.info("No competitions found");

  for (readyCompetition of readyCompetitions) {
    console.info(`Checking: ${readyCompetition.id}`);
    const competitors = readyCompetition.players;

    if (!competitors) {
      console.info(`No competitor found for ${readyCompetition.id}.`);
      continue;
    }

    switch (readyCompetition.game) {
      // case Games.CsGo:
      //   await CsgoHelper.ConsumeMatches(readyCompetition);
      //   break;

      // case Games.Dota:
      //   await DotaHelper.ConsumeMatches(readyCompetition);
      //   break;

      case Games.Fortnite:
        await ForniteHelper.ConsumeMatches(readyCompetition);
        break;

      // case Games.Valorant:
      //   await ValorantHelper.AssignScores(readyCompetition);
      //   break;
    }
  }
}
Worker();
setInterval(Worker, 10000);
