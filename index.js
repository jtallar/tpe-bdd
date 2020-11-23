const { MongoClient } = require("mongodb");
const objectFunctions = require('./objects');
const mongoFun = require('./mongoQueries');

const uri = "mongodb://localhost:27017";

const mClient = new MongoClient(uri, { useUnifiedTopology: true });


// TODO: Ver como hacer para correr multiples queries, con esto es de a una
async function runMongo(queryFunction, ...params) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        // Call query function with params
        await queryFunction(collection, ...params);
    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
}

// runMongo(mongoFun.findOneUser).catch(console.dir);
runMongo(mongoFun.countAll).catch(console.dir);
var user1 = objectFunctions.newUserJson("person-id-4", "Jota Te", 
    "Calle Falsa 123", Date.UTC(1998, 1, 15), "Delfin", "url");

// runMongo(mongoFun.insertOneUser, user1).catch(console.dir);
// runMongo(mongoFun.findUserById, "person-id-3").catch(console.dir);

// runMongo(mongoFun.testParams, "person-id-3", {_id: 1}).catch(console.dir);
// runMongo(mongoFun.rateUser, objectFunctions.newRatingJson(4, "person-id-4", "person-id-3", -73, 40)).catch(console.dir);