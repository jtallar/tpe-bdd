
const redis = require("redis");
const redisFun = require('../utils/redisGeoQueries');
const randomLocation = require('random-location');

const redisClient = redis.createClient(6376);

async function populateRedis(flush, cant, point, radius) {
    try {
        redisClient.on('connect', () => {
            console.log('✅ Redis connected!')
        })
        .on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)})   
        .on('ready', function() {
            console.log('✅ Redis ready!')
        })

        // Drop all geo if requested
        if (flush) {
            try {
                redisClient.flushall((err, success) => {
                    if (err) console.log('  ❗️ '+ err)
                    else console.log(success);});
            } catch (err) {
                console.log('Nothing to drop');
            }
        }

        // Insert users into geo
        for (var i = 0; i < cant; i++) {
            const randomPoint = randomLocation.randomCirclePoint(point, radius);
            await redisFun.geoAddOne(redisClient, "people", randomPoint.longitude, randomPoint.latitude, 'cvuoso'+i);
            // console.log(randomPoint);
        }
        /*  redisClient.georadius("people", point.longitude, point.latitude, 300000, 'm', (err, value) => {
            if(err) console.log(err);
            else console.log(value);
        }); */

    } finally {
        redisClient.quit();     // Ensures that the client will close when you finish/error
    }
}

const p = {
    latitude: 37.7768006,
    longitude: -122.4187928
}

populateRedis(false, 10, p, 500000);

