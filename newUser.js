const { MongoClient } = require("mongodb");

const mongoFun = require('./utils/mongoQueries');
const objectFun = require('./utils/objects');

const redis = require("redis");
const redisFun = require('./utils/redisGeoQueries');

async function addUserRedis(userId, point) {
    try {
        redisClient.on('connect', () => {
            console.log('✅ Redis connected!')
        })
        .on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)})   
        .on('ready', function() {
            console.log('✅ Redis ready!')
        })

        await redisFun.geoAddOne(redisClient, "people", point.longitude, point.latitude, userId);
    } finally {
        redisClient.quit();     // Ensures that the client will close when you finish/error
    }
}

async function addUserMongo(user) {
    var ret;
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        // Insert users into collection
        ret = await mongoFun.insertOneUser(collection, user);
    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
    return ret;
}

async function callDBs(userJson, point) {
    const ret = await addUserMongo(userJson);
    if (ret) {
        addUserRedis(userJson._id, point);
    } else {
        redisClient.quit();
    }
}

// Recibir el nombre por parametro
var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length < 6) {
    console.log('Please run with `node newUser.js redisPort id name address YYYY-MM-DD gender [lat lon]`');
    return;
}

var redisPort = parseInt(myArgs[0]);
if (isNaN(redisPort) || redisPort <= 0) {
    console.log('redisPort must be a number greater than 0');
    return;
}

const userId = myArgs[1], userName = myArgs[2], userAddress = myArgs[3];
var userBirth = myArgs[4], userGender = myArgs[5];
if (userBirth.split('-').length != 3) {
    console.log('birthDate format must be YYYY-MM-DD');
    return;
}
userBirth = new Date(userBirth + 'T00:00');
if (isNaN(userBirth)) {
    console.log('Invalid birthDate. Format must be YYYY-MM-DD');
    return;   
}

var lat = parseFloat(myArgs[6]), lon  = parseFloat(myArgs[7]);
if (isNaN(lat) || isNaN(lon)) {
    console.log('No correct coordinates provided, defaulting to ITBA Madero');
    lat = -34.60252364016448;
    lon = -58.36740569629624;
}
const point = {
    latitude: lat,
    longitude: lon
}

var userJson = objectFun.newUserJson(userId, userName, userAddress,
    userBirth, userGender, "link.to.image");

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

// Setup Redis connection
const redisClient = redis.createClient(redisPort);

callDBs(userJson, point);