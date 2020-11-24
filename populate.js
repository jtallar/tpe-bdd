const { MongoClient } = require("mongodb");

const mongoFun = require('./mongoQueries');
const objectFun = require('./objects');

const csv = require('csv-parser');
const fs = require('fs');
const randomWords = require('random-words');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function populateMongo(shouldDrop) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        if (shouldDrop) {
            await mongoFun.dropAll(collection);
        }
        await mongoFun.insertManyUsers(collection, users);
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
var myArgs = process.argv.slice(2);
if (myArgs.length < 2) {
    console.log('Please run with `node populate.js file.csv linesToProcess [DROP]`');
    return;
}
// const csvFilename = 'babyNamesUSYOB-full.csv';
const csvFilename = myArgs[0];

var maxLines = parseInt(myArgs[1]);
if (isNaN(maxLines) || maxLines <= 0) {
    console.log('linesToProcess must be a number higher than 0');
    return;
}

var shouldDrop = false;
if (myArgs[2] === 'DROP') {
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
        console.log(users.length)
        
        // Connect to MongoDB and insert users in MongoDB
        populateMongo(shouldDrop);
    });
