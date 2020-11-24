
const redis = require("redis");
const redisFun = require('./redisGeoQueries');
const randomLocation = require('random-location');

const redisClient = redis.createClient(6376);

const point = {
    latitude: 37.7768006,
    longitude: -122.4187928
}

redisClient.w

async function populateRedis(flush, cant, radius) {
    try {
        redisClient.on('connect', () => {
            console.log('✅ Redis connected!')});
        redisClient.on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)});

        // Drop all geo if requested
        if (flush) {
            try {
                redisClient.flushall((err, success) => {
                    if (err) console.log('❗️'+ err)
                    else console.log(success);});
            } catch (err) {
                console.log('Nothing to drop');
            }
        }

        // Insert users into geo
        for (var i = 0; i < cant; i++) {
            const randomPoint = randomLocation.randomCirclePoint(point, radius);
            await redisFun.geoAddOne(redisClient, "people", randomPoint.longitude, randomPoint.latitude, 'cvuoso'+i);
            console.log(randomPoint);
        }
        redisClient.georadius("people", point.longitude, point.latitude, 300000, 'm', (err, value) => {
            if(err) console.log(err);
            else console.log(value);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        redisClient.quit();
    }
}

populateRedis(true, 10, 500000);

