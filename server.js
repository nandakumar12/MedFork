const express = require("express");
const bodyparser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const app = express();
const hbs = require("hbs");
require("./src/kafka/kafka-consumer")
const blockConsumerKafka = require("./src/kafka-block-consumer/kafka-block-consumer");

const Blockchain = require("./src/blockchain");
const blockchainRoutes = require("./src/routes/blockchain-routes");
const mainRoutes = require("./src/routes/main-routes");
const patientDashboardRoutes = require("./src/routes/dashboard-routes/patient");
const hospitalDashboardRoutes = require("./src/routes/dashboard-routes/hospital");
const doctorDashboardRoutes = require("./src/routes/dashboard-routes/doctor");
const MerkleTrees = require("./src/merkle-tree");


app.use("/public", express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const blockchain = new Blockchain();
const merkleTree = new MerkleTrees();
const blockchainRoute = blockchainRoutes(blockchain);
const hospitalDashboardRoute = hospitalDashboardRoutes(blockchain);
const patientDashboardRoute = patientDashboardRoutes(blockchain, merkleTree);
const doctorDashboardRoute = doctorDashboardRoutes(blockchain, merkleTree);
const mainRoute = mainRoutes(blockchain);
blockConsumerKafka(blockchain);

app.use("/",mainRoute);
app.use("/blockchain",blockchainRoute);
app.use("/dashboard-hospital", hospitalDashboardRoute);
app.use("/dashboard-patient",  patientDashboardRoute);
app.use("/dashboard-doctor", doctorDashboardRoute);

app.engine(
  "hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials'
  })
);

hbs.registerPartials(path.join(__dirname, "/views/partials"));

app.set("view engine", "hbs");
app.set('views', __dirname + '/views');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on ${port}`);
});
