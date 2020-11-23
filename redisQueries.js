exports.hsetOneUser = async function (client, id, name, rating) {
    const result = client.hmset(id, {name: name, rating: rating}, (err, value) => {
        console.log('HSet ' + value);
    });
    return !result;
}
// redisClient.hmset("jtallar", { name: "Julian Tallar", rating: 4.11 });

exports.hgetOneUser = async function (client, id, field){
    const result = client.hget(id, field, (err, value) => {
        console.log(id+'\'s ' + field + ' is', value);
    });
    return result;
}
// redisClient.hget('jtallar', 'name', (err, value) => {
//     if (err) throw err;
//     console.log('jtallar\'s name is', value);
// });

exports.hgetOneFullUser = async function (client, id){
    const result = client.hgetall(id, function(err, object) {
            if (err) throw err;
            console.log(object);
        });
    return result;
}
// redisClient.hgetall("jtallar", function(err, object) {
//     if (err) throw err;
//     console.log(object);
// });