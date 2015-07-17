// Create mock data based on user activity weighting

var stoch = require('stochastic');

// conversation model: leader
// user1 dominates the conversation
var responders = {
    "user1": {
        "user1": 2,
        "user2": 2,
        "user3": 4
    },
    "user2": {
        "user1": 4,
        "user2": 0,
        "user3": 1
    },
    "user3": {
        "user1": 4,
        "user2": 1,
        "user3": 0
    }
};

// responders transformed
var transMatrix = [
    [2, 4, 4], // user1
    [4, 0, 1], // user2
    [4, 1, 0]  // user3
];

var T = 10;
var start = 0;
var path = true;

var respondersMC = stoch.CTMC(transMatrix, T, start, path);

console.log(respondersMC);

var speakers = [];
for (key in respondersMC) {
    speakers.push(respondersMC[key]);
}
console.log(speakers);

var distribution = {};
speakers.reduce(function(p, c, i) {
    if (distribution[c]) {
        distribution[c]++;
    } else {
        distribution[c] = 1;
    }
});
console.log(distribution);
