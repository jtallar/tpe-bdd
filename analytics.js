const { MongoClient } = require("mongodb");

const mongoFun = require('./utils/mongoQueries');
const mongoAnalyticFun = require('./utils/mongoAnalyticsQueries');
const objectFun = require('./utils/objects');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function runQuery(queryFunction, ...params) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        result = await queryFunction(collection, ...params);
        if (result) console.log(JSON.stringify(result, null, 2));
    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
}

var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length < 1) {
    console.log('Please run with `node analytics.js option-name [option-params]`');
    console.log('Available option-name\'s are top [n], bottom [n], info [id]');
    return;
}

var option = myArgs[0];
var result;
switch(option) {
    case 'top':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.bestUsers, number);
        break;
    case 'bottom':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.worstUsers, number);
        break;
    case 'info':
        var personId = myArgs[1];
        runQuery(mongoFun.findUserById, personId);
        break;
    default:
        console.log('Please run with `node analytics.js option-name`');
        console.log('Available option-name\'s are top10, bottom10');
        return;
}