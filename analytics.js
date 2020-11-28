const { MongoClient } = require("mongodb");

const mongoFun = require('./utils/mongoQueries');
const mongoAnalyticFun = require('./utils/mongoAnalyticsQueries');
const objectFun = require('./utils/objects');

// Setup MongoDB connection
const uri = "mongodb://localhost:27017";
const mClient = new MongoClient(uri, { useUnifiedTopology: true });

async function runQuery(queryFunction, ...params) {
    try {
        await mClient.connect();
        const database = mClient.db('nosedive');
        const collection = database.collection('users');

        result = await queryFunction(collection, ...params);
        if (result) console.log(JSON.stringify(result, null, 2));
    } finally {
        // Ensures that the client will close when you finish/error
        await mClient.close();
    }
}

var myArgs = process.argv.slice(2); // Elimino node y fileName
if (myArgs.length < 1) {
    console.log('Please run with `node analytics.js option-name [option-params]`');
    console.log('Available option-name\'s are: \n* `top [n]` shows the best n users according to their rating.\n* `bottom [n]` shows the worst n users according to their rating.\n* `info [id]` shows all available information from the user with that id.\n* `top-activity [n]` shows the n most rated people, regardless of the score.\n* `avg-activity` shows the average number of ratings made to each person.\n* `interactions-per-hour [YYYY-MM-DD]` shows the average interactions made each hour on day \[YYYY-MM-DD\].\n* `top-days [n]` shows the n days when people made the most ratings.\n* `geo-count-within [lat, lon, radius]` shows the number of ratings made in a spherical radius (in kilometers) around [lat, lon].\n');
    return;
}

var option = myArgs[0];
var result;
switch(option) {
    case 'top':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.bestUsers, number);
        break;
    case 'bottom':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.worstUsers, number);
        break;
    case 'info':
        var personId = myArgs[1];
        runQuery(mongoFun.findUserById, personId);
        break;
    case 'top-activity':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.topActivity, number);
        break;
    case 'avg-activity':
        runQuery(mongoAnalyticFun.avgActivity);
        break;
    case 'interactions-per-hour':
        var date = myArgs[1];
        if (date.split('-').length != 3) {
            console.log('date format must be YYYY-MM-DD');
            return;
        }
        date = new Date(date + 'T00:00');
        if (isNaN(date)) {
            console.log('Invalid date. Format must be YYYY-MM-DD');
            return;   
        }
        runQuery(mongoAnalyticFun.interactionsPerHour, date);
        break;
    case 'top-days':
        var number = parseInt(myArgs[1]);
        if (isNaN(number) || number <= 0) {
            console.log('n must be a number greater than 0');
            return;
        }
        runQuery(mongoAnalyticFun.topDays, number);
        break;
    case 'geo-count-within':
        var lat = parseFloat(myArgs[1]), lon = parseFloat(myArgs[2]), radius = parseInt(myArgs[3]);
        if (isNaN(lat) || isNaN(lon) || isNaN(radius) || radius <= 0) {
            console.log('latitude, longitude and radius (> 0) must be provided');
            return;
        }
        runQuery(mongoAnalyticFun.countWithinRadius, lat, lon, radius);
        break;
    default:
        console.log('Please run with `node analytics.js option-name [option-params]`');
        console.log('Available option-name\'s are: \n* `top [n]` shows the best n users according to their rating.\n* `bottom [n]` shows the worst n users according to their rating.\n* `info [id]` shows all available information from the user with that id.\n* `top-activity [n]` shows the n most rated people, regardless of the score.\n* `avg-activity` shows the average number of ratings made to each person.\n* `interactions-per-hour [YYYY-MM-DD]` shows the average interactions made each hour on day \[YYYY-MM-DD\].\n* `top-days [n]` shows the n days when people made the most ratings.\n* `geo-count-within [lat, lon, radius]` shows the number of ratings made in a spherical radius (in kilometers) around [lat, lon].\n');
        return;
}