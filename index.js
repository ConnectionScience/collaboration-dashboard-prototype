console.log('dashboard-mock');

// atom for global state
window.state = {};
window.googleLoaded = false;
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

var models = {
    leader: [
        [0.1, 0.4, 0.2, 0.2, 0.1, 0.1], // user0
        [0.7, 0.1, 0.1, 0.0, 0.0, 0.1], // user1
        [0.5, 0.3, 0.1, 0.0, 0.0, 0.1], // user2
        [0.5, 0.5, 0.0, 0.0, 0.0, 0.0], // user3
        [0.5, 0.5, 0.0, 0.0, 0.0, 0.0], // user4
        [1.0, 0.0, 0.0, 0.0, 0.0, 0.0]  // user5
    ],
    alone: [
        [1.0]
    ],
    two: [
        [0.1, 0.9],
        [0.5, 0.5]
    ],
    five: generateTransitionMatrix(5),
    ten: generateTransitionMatrix(10)
};

var model = models.leader;
var query = querystring.parse(location.search);
console.log(query);
if (query.model && models[query.model]) {
    model = models[query.model];
}

// transitionMatrix: matrix
var transitionMatrix = model;

var modelHTML = Object.keys(models).reduce(function(a, b) {
    if (model == b) {
        a += '<b>' + b + '</b>, ';
    } else {
        a += '<a href="?&model=' + b + '">' + b + '</a>, ';
    }
    return a;
}, 'Select: ');

document.getElementById('models').innerHTML = modelHTML;

var activityHeader = ['Intermal'].concat(
    transitionMatrix.map(function(e, i, c) {
        return 'user' + i;
    }));

var T = 10000;
var start = 0;
var path = true;
var distributionFrames;
// respondersMC: object
// time and speaker
var respondersMC = module.exports.CTMC(transitionMatrix, T, start, path);
// console.log(respondersMC);

state.responders = respondersMC;

// talkers: array
// speaker talk incidents w/o time
var talkers = [];
var timeseries = {};
var now = Date.now();
var followers = {};
// initial speaker
var prev = 0;

// current list of followers
var deriveFollowers = function(speaker, prev) {
    var curr = speaker;
    followers = followers || {};
    followers[prev] = followers[prev] || {};
    followers[prev][curr] = followers[prev][curr] || 1;
    followers[prev][curr]++;
    showFollowers();
};

var showReplay = function(talker, prev, time) {
    // console.log('showReplay', talker, time);
    // TODO: this has multiple responsibilities
    deriveFollowers(talker, prev);
    // 2. talkers
    talkers.push(speaker);
    // 3. timeseries
    timeseries[time] = talker;


    showFollowers();
    showEvents(timeseries);
    updateTimeseries();

    if (googleLoaded) drawParticipation(distributionFrames);
    if (googleLoaded) drawActivity(activity);

    var notice = 'Talker: -' + talker + '- @ ' + (time / 1000) + 's';
    document.getElementById('replay').innerHTML =
        notice
        .replace("-0-", '<b style="color: blue">0</b>')
        .replace("-1-", '<b style="color: red">1</b>')
        .replace("-2-", '<b style="color: orange">2</b>')
        .replace("-3-", '<b style="color: green">3</b>')
        .replace("-4-", '<b style="color: purple">4</b>')
        .replace("-5-", '<b style="color: teal">5</b>')
        .replace(/-(\d+)-/, '<b">$1</b>');
};


for (var key in respondersMC) {
    var speaker = respondersMC[key];
    var curr = speaker;
    // TODO: this has multiple responsibilities
    // 3. replay
    var timeout = 100 * Math.floor(parseInt(key));
    setTimeout(
        function(curr, prev, ms) {
            // console.log('setTimeout', curr, ms);
            return function() {
                showReplay(curr, prev, ms);
            };
        }(curr, prev, timeout), timeout);

    prev = curr;

}

var updateTimeseries = function() {

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
    window.activity = Object.keys(sample)
            .map(function(e, i, c) {
                var first = c[0];
                // converting to seconds and rolling the buckets isn't
                // necessary with Google charts: testing other buckets
                var toBucket = function(d) {
                    return parseInt(d / 1000);
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
                                   Array(transitionMatrix.length))
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

    window.distributionFrames = Object.keys(distribution)
        .map(function(e, i, c) {
            return ['user' + e, distribution[e]];
        });
    //    console.log(distributionFrames);

};

google.load("visualization", "1", {packages:["corechart", "line"]});

var drawParticipation = function(distributionFrames) {
    var data = google.visualization.arrayToDataTable([
        ['User', 'Talking']
    ].concat(distributionFrames));
    var options = {
        title: 'Talk Time by User'
    };
    // Histogram
    participationChart.draw(data, options);
};


var drawActivity = function(activity) {
    var data = google.visualization.arrayToDataTable([
        activityHeader
    ].concat(
        activity
    ));

    var options = {
        title: 'Speaker Activity',
        isStacked: true
    };
    activityChart.draw(data, options);
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
        .replace(/"0"/g, '<b style="color: blue">0</b>')
        .replace(/"1"/g, '<b style="color: red">1</b>')
        .replace(/"2"/g, '<b style="color: orange">2</b>')
        .replace(/"3"/g, '<b style="color: green">3</b>')
        .replace(/"4"/g, '<b style="color: purple">4</b>')
        .replace(/"5"/g, '<b style="color: teal">5</b>')
        .replace(/\"(\d+)\"/g, '<b>$1</b>');
};

var showEvents = function(timeseries) {
    document.getElementById('events').innerHTML = JSON
        .stringify(timeseries)
        .replace(/,/g, ',\n')
        .replace(/:0,/g, ':<b style="color: blue">0</b>,')
        .replace(/:1,/g, ':<b style="color: red">1</b>,')
        .replace(/:2,/g, ':<b style="color: orange">2</b>,')
        .replace(/:3,/g, ':<b style="color: green">3</b>,')
        .replace(/:4,/g, ':<b style="color: purple">4</b>,')
        .replace(/:5,/g, ':<b style="color: teal">5</b>,')
        .replace(/:(\d+),/g, ':<b style="color: ">$1</b>,');
};

var showModel = function() {
    document.getElementById('model').innerHTML = JSON
        .stringify(transitionMatrix)
        .replace(/],/g, '],\n');
};

// Rendering
google.setOnLoadCallback(function() {
    window.googleLoaded = true;
    window.activityChart = new google.visualization.ScatterChart(document.getElementById('activity'));
    window.participationChart = new google.visualization.PieChart(document.getElementById('participation'));
});
showFollowers();
showEvents(timeseries);
showModel();

// replay();
