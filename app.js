var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var process = require('child_process')

var servers = {
    'andromeda' : 'andromeda.begly.co.uk',
    'ganymede'  : 'ganymede.begly.co.uk',
    'europa'    : 'europa.begly.co.uk',
}

app.get('/', function(req, res) {
    if (req.subdomains[1] == 'status') {
        res.sendFile(__dirname + '/index.html')
    } else {
        res.status = 404;
        res.end()
    }
});

app.get('/style.css', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/css'})
    res.sendFile(__dirname + '/style.css')
})

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

http.listen(3000, function(){
    console.log('listening on *:3000');
});
