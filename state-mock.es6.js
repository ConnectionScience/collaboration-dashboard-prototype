// mock data based on user activity weighting

var stoch = require('stochastic');

// conversation model: leader
// user1 dominates the conversation

// reduced list of all speakers
var speakers = [
    "user1",
    "user2",
    "user3"
];

// indexed position into responders
var lookup = {
    "user1": 0,
    "user2": 1,
    "user3": 2
};

// succeeds: matrix (An)
// responders to a speaker by count
var succeeds = [
    [2, 4, 4], // user1
    [4, 0, 1], // user2
    [4, 1, 0]  // user3
];

// transnormal: matrix
var transnormal = [
    [0.2, 0.4, 0.4], // user1
    [0.8, 0.0, 0.2], // user2
    [0.8, 0.2, 0.0]  // user3
];

// testnormal: matrix
var testnormal = [
    [0.1, 0.5, 0.4], // user1
    [0.8, 0.1, 0.1], // user2
    [0.6, 0.3, 0.1]  // user3
];

var T = 100;
var start = 0;
var path = true;

// respondersMC: object
// time offset and speaker
var respondersMC = stoch.CTMC(testnormal, T, start, path);
console.log(respondersMC);

// talkers: array
// speaker talk incidents w/o time
var talkers = [];
var timeseries = {};
var now = Date.now();

for (var key in respondersMC) {
    talkers.push(respondersMC[key]);
    timeseries[parseInt(now + 1000 * key)] = respondersMC[key];
}
// console.log(talkers);
console.log(timeseries);

// distribution: object
// frequency of each each speaker talking
var distribution = talkers.reduce(function(p, c, i) {
    p[c] ? p[c]++ : p[c] = 1;
    return p;
}, {});
// console.log(distribution);

for (var speaker in distribution) {
    console.log(talkers[speaker], distribution[speaker]);
}
