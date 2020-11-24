const redis= require("redis");
const redisFun = require('./utils/redisQueries');

const redisClient = redis.createClient(6377);

async function runRedis(queryFunction, ...params) {
    try {
        redisClient.on('error', function(error) {
            console.error(`❗️ Redis Error: ${error}`);
            throw error;
        })
        // redisClient.on('connect', () => { 
        //     console.log('✅ Redis connected!')})
        redisClient.on('ready', () => {
            console.log('✅ Redis ready!')})
        // Call query function with params
        await queryFunction(redisClient, ...params);
    } finally {
        // Ensures that the client will close when you finish/error
        redisClient.quit();
    }
}

runRedis(redisFun.hsetOneUser, "cvuoso", "Coco Vuoso", 3.22);
runRedis(redisFun.hgetOneUser, "cvuoso", 'name');
runRedis(redisFun.hgetOneUser, "cvuoso", 'rating');
runRedis(redisFun.hgetOneFullUser, "cvuoso");