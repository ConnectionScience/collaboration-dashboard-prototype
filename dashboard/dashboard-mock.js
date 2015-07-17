console.log('dashboard-mock');

var events = setInterval(function() {
    var event = {
        user: 'user1',
        date: (new Date()),
        type: 'talk'
    };
    var activity = document.getElementById('activity');
    var entry = document.createElement('tr');
    var data = '<td>' + event.user + '</td><td>' + event.date + '</td>';
    entry.innerHTML = data;
    document.getElementById('activity').appendChild(entry);
}, 10000 * Math.random());


google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawChart);
function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['User', 'Talking'],
        ['user1', 10]]);

    var options = {
        title: 'Talk Time by User',
        legend: { position: 'none' }
    };

    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
    chart.draw(data, options);

};
