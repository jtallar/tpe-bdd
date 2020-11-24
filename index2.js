const redis= require("redis");
const redisFun = require('./redisQueries');

const redisClient = redis.createClient(6377, {
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