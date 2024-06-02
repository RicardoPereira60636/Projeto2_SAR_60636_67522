/**
 * Express app to serve Angular 2 single page auction site
 * author: Pedro Amaral
 */

const express = require('express');
const fs = require('fs');
const path = require('path');//object to deal with paths
const favicon = require('serve-favicon');
var { expressjwt: jwt} = require('express-jwt'); //to deal with authentication based in tokens
const morgan = require('morgan'); // Logs each server request to the console
const cookieParser = require('cookie-parser');
const http = require('http');
const https = require ('https');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // to deal with the mongodb database
var databaseUri = 'mongodb://127.0.0.1:27017/local'; // database uri for local mongod installation
//var databaseUri = 'mongodb+srv://pfa:URMPcHgv2Hpwr6FU@cluster0.gxfye.mongodb.net/?retryWrites=true&w=majority'; // database uri for cloudAtlas mongod installation          
var secret = 'this is the secret secret secret 12356'; // same secret as in socket.js and api.js used her to verify the Authorization token

//get the file with the API routes
const routes = require('./routes/api');

//get the file with the socket api code
const socket = require('./routes/socket');

const app = express(); //the Express HTTPS server
app.use(morgan ('dev')); // use developer logs
//parser for POST JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

//POint static path to dist directory
app.use(express.static(path.join(__dirname, '../dist/auction-sar/')));
app.use (favicon(path.join(__dirname,'../dist/auction-sar/favicon.ico')));

// JWT middleware
const protectJwt = jwt({ secret: secret, algorithms: ['HS256'] });

// Set our api routes
app.post('/api/authenticate', routes.Authenticate); //route to deal with the post of the authentication form
app.post('/api/newuser', routes.NewUser); //route to deal with the post of the register form
app.post('/api/newitem', protectJwt,routes.NewItem); //route to deal with the post of the new item form needs authentication token
app.get('/api/items', protectJwt, routes.GetItems); //route to deal with the get all items call to the api needs authentication token
app.get('/api/users', protectJwt, routes.GetUsers); //route to deal with the get all users call to the api needs authentication token
app.post('/api/removeitem', protectJwt, routes.RemoveItem); //route to deal with the post of the new item form needs authentication token
app.get('/api/solditems', protectJwt, routes.SoldItem); //route to deal with the get of the sold item form needs authentication token


// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/auction-sar/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//connect to the database

mongoose.connect(databaseUri); // Connects to your MongoDB.  Make sure mongod is running!
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
mongoose.connection.on('connected', function () {
  mongoose.set('strictQuery', false);
  console.log('Mongoose connected to ' + databaseUri);
});


//defines the ports
const port = '3000';
const ports = '3043';
var options = {
  key: fs.readFileSync(path.join(__dirname, '../Backend/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../Backend/cert.pem'))
};

app.set('port', ports);

/**
 * Create HTTP server
 */
 const httpserver = express(); // Unsecure http server just to handle redirection to HTTPS
 httpserver.set('port', port); //set unsecure http port
 //redirect all requests in http to https
 httpserver.get('*', (req, res) => {
  var arrayOfStrings = req.headers.host.split(":");
  res.redirect('https://' + arrayOfStrings[0] + ":" + ports + req.url);
});

 const server = http.createServer(httpserver);

/**
 * Create HTTPS server using the certificate defined in files cert.pem and key.pem
 */
const secureserver = https.createServer(options, app);

/**
* Create websocket listening on the same port as the https server
*/
const io = require('socket.io')(secureserver,{
  cors: {
    origin: `http://localhost:${ports}`,
    methods: ['GET', 'POST']
  }
});
socket.StartSocket(io); // call the StartSocket function in socket module

/**
 * Listen on provided port, on all network interfaces.
 */
secureserver.listen(ports, () => console.log(`API running on https://localhost:${ports}`));
/**
* Http listens on provided port, to provide redirection for HTTPS
*/
server.listen(port, () => console.log(`Http server for https re-direction running on http://localhost:${port}`));
