require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect(process.env.mongo_url);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to mongo"));

app.use(express.json());

const accountsRouter = require("./controllers/accountApi");
const competitionsRouter = require("./controllers/competitionApi");
app.use("/accounts", accountsRouter);
app.use("/competitions", competitionsRouter);

app.listen(3000, () => console.log("Server Started"));
