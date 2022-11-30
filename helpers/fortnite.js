const Snapshot = require("../models/Snapshot");
const axios = require("axios");
const Account = require("../models/Account");
const Competition = require("../models/Competition");
const { Games } = require("../models/enums/Games");
const CompetitionMatch = require("../models/CompetitionMatch");
const competitionMatchRepository = require("../repositories/competitionMatchRepository");

async function GetStats(id) {
  try {
    const response = await axios.get(
      `https://fortnite-api.com/v2/stats/br/v2/${id}`,
      {
        headers: {
          Authorization: "70f26ba5-caea-4a92-947e-ca019cac4c83",
        },
      }
    );

    return response.data.data.stats.all.overall;
  } catch (error) {
    console.error(error);
  }
}

async function ConsumeMatches(competition) {
  const competitors = competition.players;
  for (const competitor of competitors) {
    if (competitor.status !== "Pending") continue;
    const account = await Account.findOne({ id: competitor.accountId });
    const currentStats = await GetStats(account.epicGamesId);
    const snapshot = await Snapshot.findOne({
      accountId: competitor.accountId,
      competitionId: competition.id,
      game: Games.Fortnite,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!snapshot) {
      await TakeFortniteSnapshot(account, competition);
      continue;
    }
    if (snapshot.stats.matches === currentStats.matches) continue;
    await TakeFortniteSnapshot(account, competition);

    const matchStats = new Object();
    for (const [key, value] of Object.entries(currentStats)) {
      matchStats[key] = value - snapshot.stats[key];
    }
    const matchTime = new Date();
    const match = new CompetitionMatch({
      competitionId: readyCompetition.id,
      accountId: competitor.accountId,
      playedAtFormatted: matchTime,
      playedAt: matchTime.valueOf(),
      game: Games.Fortnite,
      matchStats: matchStats,
      matchUniqueField: `${Games.Fortnite}-${
        competitor.accountId
      }-${matchTime.valueOf()}`,
    });
    await competitionMatchRepository.Add(match);
  }
}

async function GetFinalScore(matches) {
  let totalScore = 0;
  for (const match of matches) {
    totalScore += match.matchStats.kills;
  }
  return totalScore;
}

async function TakeFortniteSnapshot(account, competition) {
  const stats = await GetStats(account.epicGamesId);
  const snaphsot = new Snapshot({
    accountId: account.id,
    competitionId: competition.id,
    stats: stats,
    game: Games.Fortnite,
  });
  await snaphsot.save();
}

module.exports = { TakeFortniteSnapshot, ConsumeMatches, GetFinalScore };
