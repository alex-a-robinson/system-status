var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var process = require('child_process')

var servers = {
    'andromeda' : 'andromeda.begly.co.uk',
    'ganymede'  : 'ganymede.begly.co.uk',
    'europa'    : 'europa.begly.co.uk',
    'callisto'  : 'callisto.begly.co.uk'
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('New user!')
  socket.on('update', function(msg){
    console.log('Recived update message')
    updateStatus(io)
  });
});

function updateStatus(io) {
    for (var name in servers) {
        console.log('Updating: ' + name)
        var host = servers[name]
        var cmd = process.exec('ping -c 1 -W 3 ' + host)

        cmd.on('exit', (function(name) { return function(code) {
            console.log('exit with code: ' + code + ' name: ' + name)
            data = [name, (code == 0?'OK':'FAIL')]
            io.emit('status-update', data)
        } }(name)))
    }
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
