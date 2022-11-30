const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Competition = require("../models/Competition");
const moment = require("moment");
const csgoHelper = require("../helpers/csgo");
const fortniteHelper = require("../helpers/fortnite");
const { Games } = require("../models/enums/Games");

router.get("/", async (req, res) => {
  try {
    const competitions = await Competition.find();
    if (!competitions) {
      res.status(404).json({ message: "No competitions found" });
      return;
    }
    res.json(competitions);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", getCompetition, async (req, res) => {
  try {
    res.json(res.result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const competition = new Competition({
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      game: req.body.game,
    });
    await competition.save();
    res.status(200).json(competition);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/joinCompetition/:id", getCompetition, async (req, res) => {
  try {
    if (!req.body.accountId) {
      res.status(400).json({ message: "accountId is required." });
      return;
    }

    if (
      res.result.players
        .map((player) => player.accountId)
        .includes(req.body.accountId)
    ) {
      res
        .status(400)
        .json({ message: "user already entered the competition." });
      return;
    }
    var account = await Account.findOne({ id: req.body.accountId });

    if (!account) {
      res.status(404).json({ message: "user not found." });
      return;
    }
    const joinedAt = new Date();
    const joinedAtFormatted = moment().unix();

    const newCompetitionInfo = {
      competitionId: req.params.id,
      status: "Pending",
      joinedAt: joinedAt,
      joinedAtFormatted: joinedAtFormatted,
    };

    if (account.competitions) {
      account["competitions"] = [
        ...account["competitions"],
        newCompetitionInfo,
      ];
    } else account["competitions"] = [newCompetitionInfo];

    await account.save();

    res.result.players = [
      ...res.result.players,
      {
        accountId: req.body.accountId,
        status: "Pending",
        joinedAt: joinedAt,
        joinedAtFormatted: joinedAtFormatted,
      },
    ];

    if (res.result.game === Games.CsGo) {
      csgoHelper.TakeCsGoSnapshot(account, res.result);
    } else if (res.result.game === Games.Fortnite) {
      fortniteHelper.TakeFortniteSnapshot(account, res.result);
    }

    res.result.save();
    res.status(200).json(res.result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

async function getCompetition(req, res, next) {
  let competition;
  try {
    competition = await Competition.findOne({ id: req.params.id });
    if (!competition) {
      return res
        .status(404)
        .json({ message: "No competition found with the given id." });
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
  res.result = competition;
  next();
}

module.exports = router;
