console.log('dashboard-mock');

var events = setInterval(function() {
    var event = {
        user: 'user' + Math.floor(Math.random() * 3),
        date: (new Date()),
        type: 'talk'
    };
    console.log(event);
}, 1000000 * Math.random());


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
                result = [offset, 0, 0, 0];
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
        ['30 Seconds', 'user0', 'user1', 'user2']
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

var showFollowers = function() {
    document.getElementById('followers').innerHTML = JSON
        .stringify(followers)
        .replace(/\},/g, '},\n');
};

// Rendering
google.setOnLoadCallback(drawParticipation);
google.setOnLoadCallback(drawActivity);
showFollowers();
