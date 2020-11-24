const redis = require("redis");
const redisFun = require('./redisGeoQueries');
const redisClient = redis.createClient(6376);

async function runRedis(queryFunction, ...params) {
    try {
        redisClient.on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`)})
        // redisClient.on('ready', () => {
        //     console.log('✅ Redis ready!')})
        redisClient.on('connect', () => {
            console.log('✅ Redis connected!')})

        // Call query function with params
        await queryFunction(redisClient, ...params);
    } finally {
        // Ensures that the client will close when you finish/error
        redisClient.quit();
    }
}

// runRedis(redisFun.geoAddOne, "people", 10.999300, 45.4432922, "jtallar");
// runRedis(redisFun.geoAddOne, "people", 10.999116, 45.4432523, "mbrula");
// redisClient.geoadd(objectFunctions.locations, function(err, reply){
//     if(err) console.error(err)
//     else console.log('added locations:', reply)
//   })






runRedis(redisFun.geoAddOne, "people", 10.999215, 45.4432923, "cvuoso");
runRedis(redisFun.geoAddOne, "people", 10.999300, 45.4432922, "jtallar");
runRedis(redisFun.geoAddOne, "people", 10.999116, 45.4432523, "mbrula");
runRedis(redisFun.geoRadiusBM, "people", "cvuoso", 1, 'm');
runRedis(redisFun.geoRadiusBM, "people", "cvuoso", 1, 'km');