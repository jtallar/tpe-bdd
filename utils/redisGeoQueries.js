exports.geoAddOne = async function (client, key, long, lat, id) {
    const result = client.geoadd(key, long, lat, id, (err, value) => {
        console.log(value + ' inserted');
    });
    return result;
}
// runRedis(redisFun.geoAdd, "people", 10.999216, 45.4432923, "cvuoso");

exports.geoRadiusBM = async function (client, key, id, radius, unit) {
    const { promisify } = require("util");
    const getAsync = promisify(client.georadiusbymember).bind(client);
    const result = await getAsync(key, id, radius, unit);
    return result;
}
// runRedis(redisFun.geoRadiusBM, "people", "cvuoso", 1, 'km');