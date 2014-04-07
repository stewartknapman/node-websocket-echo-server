// message data
var msgString = "<message><from>ground control</from><body>you've really made the grade</body></message>";

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
  
  // send a message back
  clients[id].sendUTF(msgString);
};

var closeConnection = function(id, connection, reasonCode, description){
  delete clients[id];
  console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
};

var sendMessage = function(id, message){
  console.log(message);
};