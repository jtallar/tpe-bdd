exports.findOneUser = async function (collection) {
    const result = await collection.findOne();
    console.log(result);
}

exports.findUserById = async function (collection, id, proj) {
    const result = await collection.findOne({ _id: id}, { projection: proj });
    if (!result) {
        console.log(id + " Not found");
    }
    return result;
}

exports.checkUserIdExists = async function (collection, id) {
    const result = await collection.findOne({ _id: id});
    if (result) {
        return true;
    }
    return false;
}

exports.insertOneUser = async function (collection, user) {
    const exists = await exports.checkUserIdExists(collection, user._id);
    if (exists) {
        console.log("ERROR, _id " + user._id + " already exists");
        return;
    }
    const result = await collection.insertOne(user);
    if (result.result.ok) {
        console.log("OK, inserted");
    } else {
        console.log("ERROR, not inserted");
    }
}

exports.insertManyUsers = async function (collection, users) {
    for (user of users) {
        const exists = await exports.checkUserIdExists(collection, user._id);
        if (exists) {
            console.log("ERROR, _id " + user._id + " already exists");
            return;
        }
    }
    const result = await collection.insertMany(users);
    if (result.result.ok) {
        console.log("OK, inserted");
    } else {
        console.log("ERROR, not inserted");
    }
}

exports.countAll = async function (collection) {
    const result = await collection.countDocuments();
    console.log(result);
}

exports.rateUser = async function (collection, ratingJson) {
    var fromUser = await exports.findUserById(collection, ratingJson.from, {_id:1, rating: 1});
    var toUser = await exports.findUserById(collection, ratingJson.to, {_id:1, rating: 1});
    if (!fromUser || !toUser) return;
    delete ratingJson.to;
    
    const newRating = Math.round(toUser.rating + (ratingJson.score * 1000 - toUser.rating) * ((fromUser.rating / 1000) ** (1.5)) / 100);
    const result = await collection.updateOne({ _id: toUser._id }, { $push: { ratings: ratingJson }, $set : { rating: newRating} });
    if (result.result.ok) {
        console.log("OK, rated");
    } else {
        console.log("ERROR, not rated");
    }
}
