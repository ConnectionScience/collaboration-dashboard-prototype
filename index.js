console.log('dashboard-mock');

// atom for global state
window.state = {};

// generateTranstionMatrix(): matrix
// Create an NxN array with even distribution
var generateTransitionMatrix = function(n) {
var scaffold = Array
        .apply(null,
               Array(n));
    var row = scaffold
            .map(Number.prototype.valueOf, 1 / n);
    var matrix = scaffold
            .map(function(e, i, c) {
                return row;
            });

    return matrix;
};

// testnormal: matrix
var testnormal = generateTransitionMatrix(5);

var transExample= [
    [0.1, 0.4, 0.2, 0.2, 0.1, 0.1], // user0
    [0.7, 0.1, 0.1, 0.0, 0.0, 0.1], // user1
    [0.5, 0.3, 0.1, 0.0, 0.0, 0.1],  // user2
    [0.5, 0.5, 0.0, 0.0, 0.0, 0.0],  // user3
    [0.5, 0.5, 0.0, 0.0, 0.0, 0.0],  // user4
    [1.0, 0.0, 0.0, 0.0, 0.0, 0.0]  // user5
];

var activityHeader = ['Intermal'].concat(
    testnormal.map(function(e, i, c) {
        return 'user' + i;
    }));

var T = 10000;
var start = 0;
var path = true;

// respondersMC: object
// time and speaker
var respondersMC = module.exports.CTMC(testnormal, T, start, path);
// console.log(respondersMC);

// talkers: array
// speaker talk incidents w/o time
var talkers = [];
var timeseries = {};
var now = Date.now();
var followers = {};
// initial speaker
var prev = 0;
for (var key in respondersMC) {
    var speaker = respondersMC[key];
    // TODO: this has multiple responsibilities
    // followers
    var curr = speaker;
    followers = followers || {};
    followers[prev] = followers[prev] || {};
    followers[prev][curr] = followers[prev][curr] || 1;
    followers[prev][curr]++;
    // talkers
    talkers.push(speaker);
    timeseries[parseInt(now + 1000 * key)] = respondersMC[key];
    prev = curr;
}
// console.log(talkers);
// console.log(timeseries);

var sample = timeseries;

// speakers: array
// speaker incidents
var speakers = Object.keys(sample)
        .map(function(e, i, c) {
            return sample[e];
        });
// console.log(speakers);

// activity: data frame
// activity minutes following the start
// the data needs to look like
// ['Year', 'Sales', 'Expenses'],
// ['2004',  1000,      400],
var activity = Object.keys(sample)
        .map(function(e, i, c) {
            var first = c[0];
            // converting to seconds and rolling the buckets isn't
            // necessary with Google charts: testing other buckets
            var toBucket = function(d) {
                return parseInt(d / 10000);
            };
            // Transform time to offset and speaker
            var result = [toBucket(e) - toBucket(first), sample[e]];
            return result;
        })
        .reduce(function(a, b) {
            var offset = parseInt(b[0]);
            var speaker = parseInt(b[1]);
            var result = a[offset];
            if (!result) {
                // 0 populated array
                var initial = Array
                        .apply(null,
                               Array(testnormal.length))
                        .map(Number.prototype.valueOf,0);
                result = [offset].concat(initial);
            }
            result[speaker + 1]++;
            // console.log(result);
            a[offset] = result;
            return a;
        }, [])
        .filter(function(e, i, c) {
            return e;
        });

// console.log(activity);

var distribution = speakers.reduce(function(p, c, i) {
    p[c] ? p[c]++ : p[c] = 1;
    return p;
}, {});
// console.log(distribution);

var distributionFrames = Object.keys(distribution)
        .map(function(e, i, c) {
            return ['user' + e, distribution[e]];
        });
// console.log(distributionFrames);

google.load("visualization", "1", {packages:["corechart", "line"]});

var drawParticipation = function() {
    var data = google.visualization.arrayToDataTable([
        ['User', 'Talking']
    ].concat(distributionFrames));
    var options = {
        title: 'Talk Time by User'
    };
    // Histogram
    var chart = new google.visualization.PieChart(document.getElementById('participation'));
    chart.draw(data, options);
};

var drawActivity = function() {
    var data = google.visualization.arrayToDataTable([
        activityHeader
    ].concat(
        activity
    ));

    var options = {
        title: 'Speaker Activity',
        isStacked: true
    };
    var chart = new google.visualization.LineChart(document.getElementById('activity'));
    chart.draw(data, options);
};

var colorMap = {
    "0" : "blue",
    "1" : "red",
    "2" : "orange",
    "3" : "green",
    "4" : "purple"
};

var showFollowers = function() {
    document.getElementById('followers').innerHTML = JSON
        .stringify(followers)
        .replace(/\},/g, '},\n')
        .replace(/"0"/g, '"<b style="color: blue">0</b>"')
        .replace(/"1"/g, '"<b style="color: red">1</b>"')
        .replace(/"2"/g, '"<b style="color: orange">2</b>"')
        .replace(/"3"/g, '"<b style="color: green">3</b>"')
        .replace(/"4"/g, '"<b style="color: purple">4</b>"')
        .replace(/"5"/g, '"<b style="color: ">5</b>"')
        .replace(/"6"/g, '"<b style="color: ">6</b>"');
};

var showEvents = function() {
    document.getElementById('events').innerHTML = JSON
        .stringify(timeseries)
        .replace(/,/g, ',\n')
        .replace(/:0,/g, ',<b style="color: blue">0</b>,')
        .replace(/:1,/g, ',<b style="color: red">1</b>,')
        .replace(/:2,/g, ',<b style="color: orange">2</b>,')
        .replace(/:3,/g, ',<b style="color: green">3</b>,')
        .replace(/:4,/g, ',<b style="color: purple">4</b>,')
        .replace(/:5,/g, ',<b style="color: ">5</b>,')
        .replace(/:6,/g, ',<b style="color: ">6</b>,');
};

var showModel = function() {
    document.getElementById('model').innerHTML = JSON
        .stringify(testnormal)
        .replace(/],/g, '],\n');
};

// Rendering
google.setOnLoadCallback(drawParticipation);
google.setOnLoadCallback(drawActivity);
showFollowers();
showEvents();
showModel();

var replay = function() {
    var talker = '' + talkers.shift();
    document.getElementById('replay').innerHTML =
        talker
        .replace(0, '<b style="color: blue">0</b>')
        .replace(1, '<b style="color: red">1</b>')
        .replace(2, '<b style="color: orange">2</b>')
        .replace(3, '<b style="color: green">3</b>')
        .replace(4, '<b style="color: purple">4</b>')
        .replace(5, '<b style="color: ">5</b>')
        .replace(6, '<b style="color: ">6</b>');
    if (talkers.length > 0) setTimeout(replay, 100);
};

replay();
