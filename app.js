// Load the http module to create an http server.
// Load the websocket module to listen for websocket connections
var http = require('http'),
    WebSocketServer = require('websocket').server;

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {});

// Listen on port 8000
// Put a friendly message on the terminal
server.listen(8000, function(){
  console.log("Server running at http://localhost:8000/");
});

// Start the websocket server
wsServer = new WebSocketServer({ httpServer: server });

var count = 0;
var clients = {};

// Listen for websocket connection
wsServer.on('request', function(r){
  var connection = r.accept('chat-protocol', r.origin);
  // console.log(r);
  connectNewClient(connection);
});

var connectNewClient = function(connection){
  // Specific id for this client & increment count
  var id = count++;
  
  // Store the connection method so we can loop through & contact all clients
  clients[id] = connection;
  console.log((new Date()) + ' Connection accepted [' + id + ']');
  
  // Add connection listeners
  connection.on('message', function(message){
    sendMessage(id, message);
  });
  connection.on('close', function(reasonCode, description){
    closeConnection(id, connection, reasonCode, description);
  });
  
  // tell everyone there is a new connection
  for(var i in clients){
    if(id.toString() !== i){
      clients[i].sendUTF('<presence><user name="user_'+id+'" status="join" /></presence>');
    }
  }
  
  // send a message back to say connected
  clients[id].sendUTF('<message><from>Server</from><body>connected with id: '+id+'</body></message>');
  // tell the new connection whos online
  var presence = '';
  for(var i in clients){
    if(id.toString() !== i){
      presence += '<user name="user_'+i+'" status="join" />';
    }
  }
  clients[id].sendUTF('<presence>'+presence+'</presence>');
};

var closeConnection = function(id, connection, reasonCode, description){
  // tell everyone someone has left
  for(var i in clients){
    if(id.toString() !== i){
      clients[i].sendUTF('<presence><user name="user_'+id+'" status="leave" /></presence>');
    }
  }
  
  delete clients[id];
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
};

var sendMessage = function(id, message){
  // The string message that was sent to us
  var msgString = message.utf8Data;
  console.log(msgString);
  
  for(var i in clients){
    if(id.toString() !== i){
      clients[i].sendUTF(msgString);
    }
  }
};