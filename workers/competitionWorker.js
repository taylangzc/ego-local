require("dotenv").config();
const Competition = require("../models/Competition");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/DotaThingy");
const CompetitionMatch = require("../models/CompetitionMatch");
const Account = require("../models/Account");
const { Games } = require("../models/enums/Games");
const DotaHelper = require("../helpers/dota2");
const CsgoHelper = require("../helpers/csgo");
const ForniteHelper = require("../helpers/fortnite");

async function Worker() {
  const processingCompetitions = await Competition.find({
    status: "Processing",
  });
  if (processingCompetitions.length <= 0)
    return console.info("No competitions found");

  for (const processingCompetition of processingCompetitions) {
    const playersOfCompetition = processingCompetition.players.filter(
      (player) => player.status === "Pending"
    );
    if (playersOfCompetition.length <= 0) {
      console.info(
        `no active players for competition: ${processingCompetition.id}`
      );
      continue;
    }

    for (const player of playersOfCompetition) {
      const matchesOfPlayer = await CompetitionMatch.find({
        competitionId: processingCompetition.id,
        accountId: player.accountId,
      });
      if (matchesOfPlayer.length === 3) {
        console.info(
          `player: ${player.accountId} completed the competition: ${processingCompetition.id}`
        );
        player.status = "Completed";
        let competitorScore;
        switch (processingCompetition.game) {
          case Games.Dota:
            competitorScore = DotaHelper.GetFinalScore(matchesOfPlayer);
            break;
          case Games.CsGo:
            competitorScore = CsgoHelper.GetFinalScore(matchesOfPlayer);
            break;
          case Games.Fortnite:
            competitorScore = await ForniteHelper.GetFinalScore(
              matchesOfPlayer
            );
            break;
        }

        await Competition.updateOne(
          {
            id: processingCompetition.id,
            "players.accountId": player.accountId,
          },
          {
            "players.$.status": "Completed",
            "players.$.finalScore": competitorScore,
          }
        );
        await Account.updateOne(
          {
            id: player.accountId,
            "competitions.competitionId": processingCompetition.id,
          },
          {
            $set: {
              "competitions.$.status": "Completed",
              "competitions.$.finalScore": competitorScore,
            },
          }
        );
      }
    }
  }
}

Worker();
