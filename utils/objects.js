exports.newUserJson = function (id, nameString, addressString, birthDateInstance, 
    genderString, imageUrlString) {
    return {
        _id: id,
        name: nameString,
        address: addressString,
        birthDate: birthDateInstance,
        gender: genderString,
        imageUrl: imageUrlString,
        rating: 3500,
        ratings: []
    };
}

exports.newRatingJson = function (scoreInt, fromId, toId, lat, lon) {
    return {
        date: new Date(),
        score: scoreInt,
        from: fromId,
        to: toId,
        location: {
            type: "Point",
            coordinates: [lon, lat]
        }
    }
}