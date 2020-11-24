
const redis = require("redis");
const redisFun = require('./redisGeoQueries');
const randomLocation = require('random-location');

const redisClient = redis.createClient(6376, {
    retry_strategy: (options) => {
        const {error, total_retry_time, attempt} = options;
        if (error && error.code === "ECONNREFUSED") {
            console.log(error.code); // take actions or throw exception
        }
        if (total_retry_time > 1000 * 15) { //in ms i.e. 15 sec
            console.log('Retry time exhausted'); // take actions or throw exception
        }
        if (options.attempt > 10) {
            console.log('10 attempts done'); // take actions or throw exception
        }
        console.log("Attempting connection");
        // reconnect after
        return Math.min(options.attempt * 100, 3000); //in ms
    }
});

async function populateRedis(flush, cant, point, radius) {
    try {
        // redisClient.on('connect', () => {
        //     console.log('✅ Redis connected!')});
        redisClient.on('ready', () => {
            console.log('✅ Redis ready!')});
        redisClient.on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)});

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

