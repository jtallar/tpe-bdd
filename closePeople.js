/* - Quienes estan cerca a partir de tu id.
        - GEORADIUSBYMEMBER --> Array de ids cercanos
        - findManyUsersById --> Me traigo _id, rating, name 	{ _id: 1, rating: 1, name: 1 }
        - Popular Redis cache --> hset oneuser con id, rating, name                                 */

const { MongoClient } = require("mongodb");
const mongoFun = require('./utils/mongoQueries');

const redis = require("redis");
const redisCacheFun = require('./utils/redisQueries');
const redisGeoFun = require('./utils/redisGeoQueries');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function geoRadiusRedis(id, radius) {
    var ret;
    try {
        redisGeo.on('error', function(error) {
            console.error(` ❗️ Redis Error: ${error}`);})
        // redisGeo.on('ready', () => {
        //     console.log('✅ Redis ready!')})
        try {
            ret = await redisGeoFun.geoRadiusBM(redisGeo, 'people', id, radius, 'm');
        } catch (err) {
            if(!ret) redisCache.quit();
            // console.log(' ❗️ No user named ' + id)
        }
    } finally {
        redisGeo.quit();
    }
    return ret;
}

async function findUsersMongo(ids) {
    var people
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');
        people = await mongoFun.findManyUsersById(collection, ids, { _id: 1, rating: 1, name: 1 });
        // console.log(people)
    } finally {
        await mClient.close();
    }
    return people;
}

async function fillCacheRedis(people){
    try {
        redisCache.on('error', function(error) {
            console.error(` ❗️ Redis Error: ${error}`);})
        // redisCache.on('ready', () => {
        //     console.log('✅ Redis ready!')})
        for (person of people)
            await redisCacheFun.hsetOneUser(redisCache, person._id, person.name, person.rating);
    } finally {
        redisCache.quit();
    }
}

var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length != 4 && myArgs.length != 2) {
    console.log('Please run with `node closePeople.js id radius(meters) [geoport] [cacheport]`');
    return;
}
var id = myArgs[0];
var radius = myArgs[1];
if (isNaN(radius) || radius < 0) {
    console.log('radius must be a positive number');
    return;
}

var geoPort = 6378, cachePort = 6379;

if(myArgs.length == 4){
    geoPort = myArgs[2];
    cachePort = myArgs[3];
    if (isNaN(geoPort) || isNaN(cachePort)) {
        console.log('Both ports must be numbers. First GeoRedis port and then CacheRedis port.');
        return;
    }
}

const redisGeo = redis.createClient(geoPort);       // 6378
const redisCache = redis.createClient(cachePort);   // 6379

async function getCloseIds(id, radius){
    var close = await geoRadiusRedis(id, radius);
    if(close){
        close = close.filter((el) => el != id);
        if (close.length === 0) {
            console.log(' ✗  No people close');
            redisCache.quit();
            return;
        }
        console.log('Close people ⟿    ' +close)
        await fillCacheRedis(await findUsersMongo(close))
    } else {
        console.log(' ❗️ No user named '+id)
        redisCache.quit();
    }
}

getCloseIds(id, radius);