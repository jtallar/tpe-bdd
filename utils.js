/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
exports.randomBetween = function (min, max) {  
    return Math.floor(
        Math.random() * (max - min) + min
    );
}