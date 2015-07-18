console.log('dashboard-mock');

var events = setInterval(function() {
    var event = {
        user: 'user' + Math.floor(Math.random() * 3),
        date: (new Date()),
        type: 'talk'
    };
    console.log(event);
}, 1000000 * Math.random());

var sample = {
        "1437228462204": 0,
        "1437228462368": 2,
        "1437228462526": 0,
        "1437228462902": 2,
        "1437228463280": 1,
        "1437228463913": 1,
        "1437228465501": 0,
        "1437228465945": 1,
        "1437228466925": 0,
        "1437228468421": 1,
        "1437228468972": 1,
        "1437228469756": 1,
        "1437228470856": 0,
        "1437228472892": 2,
        "1437228473367": 0,
        "1437228473390": 2,
        "1437228475274": 0,
        "1437228477052": 1,
        "1437228477087": 0,
        "1437228477154": 1,
        "1437228477439": 0,
        "1437228478997": 1,
        "1437228479154": 0,
        "1437228479410": 2,
        "1437228479542": 0,
        "1437228481659": 2,
        "1437228482899": 0,
        "1437228483105": 1,
        "1437228484639": 0,
        "1437228484911": 1,
        "1437228485928": 1,
        "1437228487327": 0,
        "1437228487616": 1,
        "1437228490127": 0,
        "1437228491500": 1,
        "1437228491596": 0,
        "1437228491741": 1,
        "1437228492654": 1,
        "1437228494332": 0,
        "1437228495383": 0,
        "1437228495977": 2,
        "1437228498572": 1,
        "1437228498842": 1,
        "1437228498904": 0,
        "1437228499090": 2,
        "1437228499521": 1,
        "1437228500548": 1,
        "1437228501246": 0,
        "1437228501397": 2,
        "1437228501542": 0,
        "1437228501544": 2,
        "1437228502161": 1,
        "1437228502242": 0,
        "1437228502274": 1,
        "1437228503034": 0,
        "1437228504009": 2,
        "1437228504632": 0,
        "1437228504797": 1,
        "1437228505327": 0,
        "1437228505947": 1,
        "1437228506653": 0,
        "1437228507364": 2,
        "1437228508288": 0,
        "1437228509922": 2,
        "1437228511003": 1,
        "1437228512676": 0,
        "1437228515443": 2,
        "1437228517104": 0,
        "1437228517712": 1,
        "1437228517771": 0,
        "1437228519281": 2,
        "1437228519723": 0,
        "1437228520625": 1,
        "1437228521390": 0,
        "1437228521562": 1,
        "1437228522966": 0,
        "1437228524887": 2,
        "1437228527935": 0,
        "1437228529157": 2,
        "1437228529545": 0,
        "1437228529694": 1,
        "1437228533332": 0,
        "1437228533382": 2,
        "1437228535171": 2,
        "1437228535235": 0,
        "1437228535670": 1,
        "1437228535856": 0,
        "1437228536985": 1,
        "1437228537180": 2,
        "1437228539200": 0,
        "1437228539233": 1,
        "1437228539532": 1,
        "1437228539844": 0,
        "1437228540302": 1,
        "1437228542400": 0,
        "1437228544498": 1,
        "1437228546130": 0,
        "1437228546134": 1,
        "1437228546750": 0,
        "1437228547651": 1,
        "1437228547966": 0,
        "1437228548449": 2,
        "1437228549513": 0,
        "1437228551145": 0,
        "1437228551266": 1,
        "1437228551559": 2,
        "1437228552287": 0,
        "1437228555212": 1,
        "1437228555708": 0,
        "1437228559850": 1,
        "1437228560192": 0,
        "1437228560233": 1,
        "1437228561258": 0,
        "1437228561364": 1
};

// speakers: array
// speaker incidents
var speakers = Object.keys(sample)
        .map(function(e, i, c) {
            return sample[e];
        });
// console.log(speakers);

// activity: data frame
// activity minutes following the start
var activity = Object.keys(sample)
        .map(function(e, i, c) {
            var first = c[0];
            var toSecond = function(d) {
                return parseInt(d / 1000);
            };
            return toSecond(e) - toSecond(first);
        })
        .reduce(function(p, c, i, a) {
            p.push([c]);
            // Collect by time
            //  p[c] ? p[c][1]++ : p[c] = [c, 1];
            console.log(c);
            return p;
        }, [])
        .filter(function(e) {
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
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Time');
    console.log(activity);
    data.addRows(activity);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Volume'
        }
    };

    var chart = new google.visualization.Histogram(document.getElementById('activity'));
    console.log(data);
    chart.draw(data, options);
};

google.setOnLoadCallback(drawParticipation);
google.setOnLoadCallback(drawActivity);
