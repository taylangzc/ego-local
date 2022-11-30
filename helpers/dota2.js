require("dotenv").config();
const Dota2Api = require("dota2-api");
const dota2ApiInstance = Dota2Api.create(process.env.DOTA_API_KEY);
const Account = require("../models/Account");
const CompetitionMatch = require("../models/CompetitionMatch");
const competitionMatchRepository = require("../repositories/competitionMatchRepository");
const { Games } = require("../models/enums/Games");

async function ConsumeMatches(competition) {
  const competitors = competition.players;
  const matchesPerCompetition = Number(process.env.MATCHES_PER_COMPETITION);
  for (competitor of competitors) {
    if (competitor.status === "Pending") {
      let matchHistory;
      const account = await Account.findOne({ id: competitor.accountId });

      try {
        matchHistory = await dota2ApiInstance.getMatchHistory({
          account_id: account.steamId,
        });
      } catch (error) {
        console.error(error);
      }

      const competitionMatches =
        matchHistory &&
        matchHistory.result?.matches
          .filter((match) => match.start_time > competitor.joinedAtFormatted)
          .slice(-matchesPerCompetition);
      if (!competitionMatches) continue;

      for (let i = competitionMatches.length - 1; i >= 0; i--) {
        const competitionMatch = competitionMatches[i];
        const matchDetails = await dota2ApiInstance.getMatchDetails({
          match_id: competitionMatch?.match_id,
        });

        const competitorStats =
          matchDetails &&
          matchDetails.result?.players
            .filter((player) => player.account_id == account.steamId)
            .at(0);

        const match = new CompetitionMatch({
          competitionId: readyCompetition.id,
          accountId: competitor.accountId,
          playedAtFormatted: matchDetails.result.start_time,
          playedAt: new Date(matchDetails.result.start_time * 1000),
          game: Games.Dota,
          matchStats: competitorStats,
          matchUniqueField: `${Games.Dota}-${matchDetails.result.match_id}`,
        });

        await competitionMatchRepository.Add(match);
      }

      console.info(`${competitor.accountId} completed a game!`);
    }
  }
}

function GetFinalScore(matches) {
  let totalScore = 0;
  for (const match of matches) {
    // do some math to calculate comp score
    totalScore += match.matchStats.net_worth;
  }
  return totalScore;
}
module.exports = { ConsumeMatches, GetFinalScore };
