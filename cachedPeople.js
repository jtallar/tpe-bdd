/* - Consultar cache o simular cache a partir de un id
- Dado un id, traerme su nombre y/o rating                                */

const redis = require("redis");
const redisCacheFun = require('./utils/redisQueries');

async function getCachedField(id, field){
    try {
        redisCache.on('error', function(error) {
            console.error(` ❗️ Redis Error: ${error}`);})
        // redisCache.on('ready', () => {
        //     console.log('✅ Redis ready!')})
        return await redisCacheFun.hgetOneUser(redisCache, id, field);
    } finally {
        redisCache.quit();
    }
}

async function getCached(id){
    try {
        redisCache.on('error', function(error) {
            console.error(` ❗️ Redis Error: ${error}`);})
        // redisCache.on('ready', () => {
        //     console.log('✅ Redis ready!')})
        return await redisCacheFun.hgetOneFullUser(redisCache, id);
    } finally {
        redisCache.quit();
    }
}

var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length != 2 && myArgs.length != 3) {
    console.log('Please run with `node cachedPeople.js id full|name|rating [port]`');
    return;
}
var id = myArgs[0];
var option = myArgs[1];

var cachePort = 6379;
if(myArgs.length == 3){
    cachePort = myArgs[2];
    if (isNaN(cachePort)) {
        console.log('Redis ports must be a number.');
        return;
    }
}
const redisCache = redis.createClient(cachePort);   // 6379

async function getField(id, field){
    var data = await getCachedField(id, field);
    if(data) console.log(id+'\'s '+field+' is: ' +data);
    else console.log(' ❗️ Error getting close ids')
}

async function getFull(id){
    var data = await getCached(id);
    if(data) console.log(data);
    else console.log(' ❗️ Error getting close ids')
}

switch (option) {
    case 'full': getFull(id); break;
    case 'name':
    case 'rating': getField(id, option); break;
    default:
        console.log('Choose option between full user, user\'s name or users\'s rating: `node cachedPeople.js id full|name|rating [port]`');
        redisCache.quit();
        return;
}
