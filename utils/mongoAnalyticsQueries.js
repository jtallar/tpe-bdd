exports.bestUsers = async function (collection, n) {
    const result = await collection.aggregate([ 
        { $sort : { rating: -1} }, 
        { $limit : n },
        { $project: { _id: 1, name: 1, rating: 1} }
    ]).toArray();
    return result;
}

exports.worstUsers = async function (collection, n) {
    const result = await collection.aggregate([ 
        { $sort : { rating: 1} }, 
        { $limit : n },
        { $project: { _id: 1, name: 1, rating: 1} }
    ]).toArray();
    return result;
}