// mock data based on user activity weighting

var stoch = require('stochastic');

// conversation model: leader
// user1 dominates the conversation
var responders = [
    "user1",
    "user2",
    "user3"
];
var lookup = {
    "user1": 0,
    "user2": 1,
    "user3": 2
};

// transitions: matrix
// responders transformed
var transitions = [
    [2, 4, 4], // user1
    [4, 0, 1], // user2
    [4, 1, 0]  // user3
];

var T = 10;
var start = 0;
var path = true;

// respondersMC: object
// time offset and speaker
var respondersMC = stoch.CTMC(transitions, T, start, path);
// console.log(respondersMC);

// speakers: array
// speaker talk incidents w/o time
var speakers = [];
for (var key in respondersMC) {
    speakers.push(respondersMC[key]);
}
// console.log(speakers);

// distribution: object
// frequency of each each speaker talking
var distribution = speakers.reduce(function(p, c, i) {
    // initialize to the empty map for the first entry
    var d = !p ? {} : p;
    d[c] ? d[c]++ : d[c] = 1;
    return d;
});
// console.log(distribution);

for (var speaker in distribution) {
    console.log(responders[speaker], distribution[speaker]);
}
