var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var process = require('child_process')
var config = require('./config.json')

var servers = config['servers']

app.get('/', function(req, res) {
    if (req.subdomains[1] == 'status') {
        res.sendFile(__dirname + '/index.html')
    } else {
        res.status = 404;
        res.end('404 - content not found')
    }
});

io.on('connection', function(socket){
    socket.on('update', function(msg){
        updateStatus(io)
    });
});

function updateStatus(io) {
    for (var name in servers) {
        console.log('Updating: ' + name)
        var host = servers[name]
        var cmd = process.exec('ping -c 1 -W 3 ' + host)

        cmd.on('exit', (function(name, host) { return function(code) {
            data = [name, (code == 0?'OK':'FAIL'), host]
            io.emit('status-update', data)
        } }(name, host)))
    }
}

http.listen(80, function(){
    console.log('listening on *:80');
});
