const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

const gameDataRoute = require('./routes/data.route.js');

const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
};

app.use(bodyParser.json());
app.use(express.json());
app.use(cors(corsOptions));
app.use('/api/gameData', gameDataRoute);

module.exports = app;