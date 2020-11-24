const redis = require("redis");
const redisFun = require('./redisGeoQueries');

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

async function runRedis(queryFunction, ...params) {
    try {
        // redisClient.on('connect', () => {
        //     console.log('✅ Redis connected!')})
        redisClient.on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)})   
        redisClient.on('ready', () => {
            console.log('✅ Redis ready!')})
        // Call query function with params
        await queryFunction(redisClient, ...params);
    } finally {
        // Ensures that the client will close when you finish/error
        redisClient.quit();
    }
}

runRedis(redisFun.geoAddOne, "people", 10.999215, 45.4432923, 'cvuoso');
runRedis(redisFun.geoAddOne, "people", 10.999300, 45.4432922, 'jtallar');
runRedis(redisFun.geoAddOne, "people", 10.999116, 45.4432523, 'mbrula');
runRedis(redisFun.geoRadiusBM, "people", 'cvuoso', 1, 'm');
runRedis(redisFun.geoRadiusBM, "people", 'cvuoso', 1, 'km');