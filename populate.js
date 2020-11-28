const { MongoClient } = require("mongodb");

const mongoFun = require('./utils/mongoQueries');
const objectFun = require('./utils/objects');
const utilsFun = require('./utils/utils');

const redis = require("redis");
const randomLocation = require('random-location');
const redisFun = require('./utils/redisGeoQueries');

const csv = require('csv-parser');
const fs = require('fs');
const randomWords = require('random-words');

function trackLineCount() {
    if (++processedLines % 1000 === 0) {
        console.log(`Lines Processed: ${processedLines}`);
    }
}

async function populateRedis(users, flush, point, radius) {
    try {
        redisClient.on('connect', () => {
            console.log('✅ Redis connected!')
        })
        .on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)})   
        .on('ready', function() {
            console.log('Redis ✅')
        })

        // Drop all geo if requested
        if (flush) {
            try {
                redisClient.flushall((err, success) => {
                    if (err) console.log('  ❗️ '+ err)
                    else console.log(success);
                });
            } catch (err) {
                console.log('Nothing to drop');
            }
        }
        var inserted = 0;
        // Insert users into geo
        for (var i = 0; i < users.length; i++) {
            const randomPoint = randomLocation.randomCirclePoint(point, radius);
            inserted += await redisFun.geoAddOne(redisClient, "people", randomPoint.longitude, randomPoint.latitude, users[i]._id);
        }
        console.log('Inserted in GeoRedis')
    } finally {
        redisClient.quit();     // Ensures that the client will close when you finish/error
    }
}

async function populateMongo(users, shouldDrop, rateCount, point, radius) {
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
        var i;
        
        for (i = 0; i < users.length / 100000; i++) {
            var chunk = users.slice(i * 100000, (i + 1) * 100000);
            var ret = await mongoFun.insertManyUsers(collection, chunk);
            console.log('Inserted ' + ret + ' in MongoDB');
        }

        // Generate rateCount random ratings
        for (i = 0; i < rateCount; i++) {
            var index0 = utilsFun.randomBetween(0, users.length);
            var index1 = utilsFun.randomBetween(0, users.length);
            if (index1 == index0) index1 = (index1 + 1) % users.length;
            var score = utilsFun.randomBetween(1, 6); // Rating [1,5]

            const randomPoint = randomLocation.randomCirclePoint(point, radius);
            var rating = objectFun.newRatingJson(score, users[index0]._id, users[index1]._id, randomPoint.latitude, randomPoint.longitude);
            await mongoFun.rateUser(collection, rating);
        }
        console.log('Inserted ' + rateCount + ' rates');
        console.log('MongoDB ✅')

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
if (myArgs.length < 4) {
    console.log('Please run with `node populate.js file.csv linesToProcess rateCount redisPort [DROP]`');
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

var redisPort = parseInt(myArgs[3]);
if (isNaN(redisPort) || redisPort <= 0) {
    console.log('redisPort must be a number greater than 0');
    return;
}

var shouldDrop = false;
if (myArgs[4] === 'DROP') {
    shouldDrop = true;
}

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

// Setup Redis connection
const redisClient = redis.createClient(redisPort);

var processedLines = 0;

const centerPoint = {
    latitude: -34.60252364016448,
    longitude: -58.36740569629624
}
const radius = 500000;

var users = [];
var stream = fs.createReadStream(csvFilename);
    stream.pipe(streamOptions)
    .on('data', function(data) {
        if (processedLines < maxLines) {
            var year = data['YearOfBirth'],
            name = data['Name'],
            genre = data['Sex'];
        
            var userJson = objectFun.newUserJson(randomWords(1) + processedLines + '-' + utilsFun.randomBetween(0, 10), name, 
            'Calle Falsa ' + processedLines, new Date(year + '-01-15T00:00'), genre, "link.to.image");
            users.push(userJson);

            trackLineCount();
        } else {
            stream.unpipe(streamOptions);
        }
    })
    .on('unpipe', function() { // Uso unpipe porque cubre ambos casos (por fin de archivo y por limite maxLines)
        console.log('\n    ⌛   ...   ⌛    \n');
        console.log(`Total lines processed: ${processedLines}`);

        // Connect to MongoDB and insert users in MongoDB
        populateMongo(users, shouldDrop, rateCount, centerPoint, radius);
        // Connect to Redis and insert random locations for each user
        populateRedis(users, shouldDrop, centerPoint, radius);
    });
