const Snapshot = require("../models/Snapshot");
const axios = require("axios");
const Account = require("../models/Account");
const Competition = require("../models/Competition");
const { Games } = require("../models/enums/Games");
const CompetitionMatch = require("../models/CompetitionMatch");
const competitionMatchRepository = require("../repositories/competitionMatchRepository");

async function GetStats(steamIdLong) {
  try {
    response = await axios.get(
      `http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=DC1DC1F143DCEACFA0168FF0ECC9F635&steamid=${steamIdLong}`
    );

    const statDict = {};
    response?.data?.playerstats?.stats
      .filter(
        (stat) =>
          stat.name === "total_kills" ||
          stat.name === "total_matches_played" ||
          stat.name === "total_deaths" ||
          stat.name === "total_matches_won"
      )
      .map((stat) => (statDict[stat.name] = stat.value));
    return statDict;
  } catch (error) {
    console.error(error);
  }
}

async function ConsumeMatches(competition) {
  const competitors = competition.players.filter(
    (competitor) => (competitor.status = "Pending")
  );
  for (const competitor of competitors) {
    if (competitor.status !== "Pending") continue;
    const account = await Account.findOne({ id: competitor.accountId });
    const currentStats = await GetStats(account.steamIdLong);
    const snapshot = await Snapshot.findOne({
      accountId: competitor.accountId,
      competitionId: competition.id,
      game: Games.CsGo,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!snapshot) {
      await TakeCsGoSnapshot(account, competition);
      continue;
    }

    if (
      snapshot.stats.total_matches_played === currentStats.total_matches_played
    )
      continue; // no new games played
    await TakeCsGoSnapshot(account, competition);

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
      game: Games.CsGo,
      matchStats: matchStats,
      matchUniqueField: `${Games.CsGo}-${
        competitor.accountId
      }-${matchTime.valueOf()}`,
    });
    await competitionMatchRepository.Add(match);
  }
}

async function TakeCsGoSnapshot(account, competition) {
  const stats = await GetStats(account.steamIdLong);
  const snaphsot = new Snapshot({
    accountId: account.id,
    competitionId: competition.id,
    stats: stats,
    game: Games.CsGo,
  });
  await snaphsot.save();
}

function GetFinalScore(matches) {
  let totalScore = 0;
  for (const match of matches) {
    totalScore += match.matchStats.total_kills;
  }
  return totalScore;
}

module.exports = { TakeCsGoSnapshot, GetFinalScore, ConsumeMatches };
