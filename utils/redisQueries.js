exports.hsetOneUser = async function (client, id, name, rating) {
    const { promisify } = require("util");
    const getAsync = promisify(client.hmset).bind(client);
    const result = await getAsync(id, {name: name, rating: rating});
    return result;
}

exports.hgetOneUser = async function (client, id, field){
    const { promisify } = require("util");
    const getAsync = promisify(client.hget).bind(client);
    const result = await getAsync(id, field);
    return result;

    // const result = await client.hget(id, field, (err, value) => {
    //     console.log(id+'\'s '+field+' is', value);
    // });
    // return result;
}

exports.hgetOneFullUser = async function (client, id){
    const { promisify } = require("util");
    const getAsync = promisify(client.hgetall).bind(client);
    const result = await getAsync(id);
    return result;

    // const result = await client.hgetall(id, function(err, object) {
    //     if (err) throw err;
    //     console.log(object);
    // });
    // return result;
}