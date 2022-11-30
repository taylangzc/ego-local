const express = require("express");
const router = express.Router();
const Account = require("../models/Account");

router.post("/", async (req, res) => {
  try {
    const account = new Account({
      username: req.body.username,
      steamId: req.body.steamId,
      steamIdLong: req.body.steamIdLong,
    });
    await account.save();
    res.status(200).json(account);
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).json({ message: "user already exists." });
    } else res.status(500).json({ message: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const accounts = await Account.find();
    if (!accounts) {
      res.status(404).json({ message: "No accounts found" });
      return;
    }
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:id", getAccount, async (req, res) => {
  try {
    res.json(res.result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

async function getAccount(req, res, next) {
  let account;
  try {
    account = await Account.findOne({ id: req.params.id });
    if (!account) {
      return res
        .status(404)
        .json({ message: "No account found with the given id." });
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
  res.result = account;
  next();
}

module.exports = router;
