exports.hsetOneUser = async function (client, id, name, rating) {
    const result = await client.hmset(id, {name: name, rating: rating}, (err, value) => {
        console.log('HSet ' + value);
    });
    return !result;
}

exports.hgetOneUser = async function (client, id, field){
    const result = await client.hget(id, field, (err, value) => {
        console.log(id+'\'s '+field+' is', value);
    });
    return result;
}

exports.hgetOneFullUser = async function (client, id){
    const result = await client.hgetall(id, function(err, object) {
            if (err) throw err;
            console.log(object);
        });
    return result;
}