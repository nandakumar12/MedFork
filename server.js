const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const app = express();

app.use("/public", express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


app.use("/",mainRoute);
app.use("/blockchain",blockchainRoute);

hbs.registerPartials(path.join(__dirname, "/views/partials"));

app.set("view engine", "hbs");
app.set('views', __dirname + '/views');

const port = 8081;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
