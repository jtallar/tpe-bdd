exports.bestUsers = async function (collection, n) {
    const result = await collection.aggregate([ 
        { $sort : { rating: -1, _id: 1} }, 
        { $limit : n },
        { $project: { _id: 1, name: 1, rating: 1} }
    ]).toArray();
    return result;
}

exports.worstUsers = async function (collection, n) {
    const result = await collection.aggregate([ 
        { $sort : { rating: 1, _id: 1} }, 
        { $limit : n },
        { $project: { _id: 1, name: 1, rating: 1} }
    ]).toArray();
    return result;
}

exports.topActivity = async function (collection, n) {
    const result = await collection.aggregate([ 
        { $project: { _id: 1, name: 1, ratingCount: { $size: "$ratings" }}},
        { $sort : { ratingCount: -1, _id: 1} }, 
        { $limit : n },
    ]).toArray();
    return result;
}

exports.avgActivity = async function (collection) {
    const result = await collection.aggregate([ 
        { $project: { _id: 1, ratingCount: { $size: "$ratings" }}},
        { $group: { _id: "Activity per Person", avgRating: { $avg : "$ratingCount" } } }
    ]).toArray();
    return result;
}

exports.interactionsPerHour = async function (collection, date) {
    nextDay = new Date(date); 
    nextDay.setDate(nextDay.getDate() + 1);
    const result = await collection.aggregate([ 
        { 
            $project: { 
                ratings: { 
                    $filter: { 
                        input: "$ratings", 
                        as: "rating",
                        cond: { 
                            "$and": [
                                { $gte: [ "$$rating.date", date] }, 
                                { $lt: [ "$$rating.date", nextDay] } 
                            ]
                        }
                    }
                }
            }
        },
        { $project: { _id: 1, ratingCount: { $size: "$ratings" }}},
        { $group: { _id: "Total Interactions per hour that day", totalInter: { $sum : "$ratingCount" } } },
        { $project: { _id: 1, interPerHour: { $divide : ["$totalInter", 24] } } },
    ]).toArray();
    return result;
}

exports.topDays = async function (collection, n) {
    const result = await collection.aggregate([
        { $project: { _id: 1, ratings: { date: 1 }}},
        { $unwind: "$ratings" },
        { $project: { _id: 1, date: { $dateToString: { format: "%Y-%m-%d", date: "$ratings.date" } }}},
        { $group: { _id: "$date", cant: { $sum : 1 } } },
        { $sort : { cant: -1, _id: 1 } }, 
        { $limit : n },
    ]).toArray();
    return result;
}

// radius is in meters
exports.countWithinRadius = async function (collection, lat, lon, radius) {
    const result = await collection.aggregate([
        { $project: { _id: 1, ratings: { location: 1 }}},
        { $unwind: "$ratings" },
        { $project: { _id: 1, location: "$ratings.location" }},
        { $match : { location: { $geoWithin: { $centerSphere: [ [lat, lon], radius / 6371000] } } } },
        { $group: { _id: "Count Within Radius", cant: { $sum : 1 } } },
    ]).toArray();
    return result;
}