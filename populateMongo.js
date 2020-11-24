const { MongoClient } = require("mongodb");

const mongoFun = require('./mongoQueries');
const objectFun = require('./objects');
const utilsFun = require('./utils');

const csv = require('csv-parser');
const fs = require('fs');
const randomWords = require('random-words');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function populateMongo(users, shouldDrop, rateCount) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        // Drop all documents if requested
        if (shouldDrop) {
            try {
                await mongoFun.dropAll(collection);
            } catch (err) {
                console.log('Nothing to drop')
            }
        }
        // Insert users into collection
        await mongoFun.insertManyUsers(collection, users);
        // Generate rateCount random ratings
        var i;
        for (i = 0; i < rateCount; i++) {
            var index0 = utilsFun.randomBetween(0, users.length);
            var index1 = utilsFun.randomBetween(0, users.length);
            if (index1 == index0) index1 = (index1 + 1) % users.length;
            var score = utilsFun.randomBetween(1, 6); // Rating [1,5]

            // TODO: Generate random locations
            var rating = objectFun.newRatingJson(score, users[index0]._id, users[index1]._id, 0, 0);
            await mongoFun.rateUser(collection, rating);
        }

    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
}

// Stream file
var streamOptions = csv({
    separator: ',',
    newline: '\n'
});

// Recibir el nombre por parametro
var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length < 3) {
    console.log('Please run with `node populate.js file.csv linesToProcess rateCount [DROP]`');
    return;
}
// const csvFilename = 'babyNamesUSYOB-full.csv';
const csvFilename = myArgs[0];

var maxLines = parseInt(myArgs[1]);
if (isNaN(maxLines) || maxLines <= 0) {
    console.log('linesToProcess must be a number greater than 0');
    return;
}

var rateCount = parseInt(myArgs[2]);
if (isNaN(rateCount) || rateCount < 0) {
    console.log('linesToProcess must be a number greater or equal than 0');
    return;
}

var shouldDrop = false;
if (myArgs[3] === 'DROP') {
    shouldDrop = true;
}

var processedLines = 0;

function trackLineCount() {
    if (++processedLines % 1000 === 0) {
        console.log(`Lines Processed: ${processedLines}`);
    }
}

var users = [];
var stream = fs.createReadStream(csvFilename);
    stream.pipe(streamOptions)
    .on('data', function(data) {
        if (processedLines < maxLines) {
            var year = data['YearOfBirth'],
            name = data['Name'],
            genre = data['Sex'];
        
            var userJson = objectFun.newUserJson(randomWords(1) + processedLines, name, 'Calle Falsa ' + processedLines,
            Date.UTC(year, 1, 15), genre, "link.to.image");
            users.push(userJson);

            trackLineCount();
        } else {
            stream.unpipe(streamOptions);
        }
    })
    .on('unpipe', function() { // Uso unpipe porque cubre ambos casos (por fin de archivo y por limite maxLines)
        console.log(`Total lines processed: ${processedLines}`);

        // Connect to MongoDB and insert users in MongoDB
        populateMongo(users, shouldDrop, rateCount);
    });