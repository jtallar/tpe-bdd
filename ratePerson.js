const { MongoClient } = require("mongodb");

const mongoFun = require('./mongoQueries');
const objectFun = require('./objects');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function rateInMongo(rating) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        await mongoFun.rateUser(collection, rating);
    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
}

var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length < 3) {
    console.log('Please run with `node ratePerson.js score from-id to-id [lat lon]`');
    return;
}

var score = parseInt(myArgs[0]);
if (isNaN(score) || score < 1 || score > 5) {
    console.log('score must be a number between 1 and 5');
    return;
}

var fromId = myArgs[1], toId = myArgs[2];

var lat = parseFloat(myArgs[3]), lon  = parseFloat(myArgs[4]);
if (isNaN(lat) || isNaN(lon)) {
    console.log('No correct coordinates provided, defaulting to ITBA');
    lat = -34.60252364016448;
    lon = -58.36740569629624;
}

var rating = objectFun.newRatingJson(score, fromId, toId, lat, lon);
rateInMongo(rating);