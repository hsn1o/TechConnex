const express = require("express");
const cors = require("cors");
const bodyParser = require("express").json;
const routes = require("./routes");
require("dotenv").config();
const app = express();


//cors
app.use(cors());
//for accepting past form data
app.use(bodyParser());
//register routes
app.use(routes);

module.exports = app;