var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sessions = {};

//routes
require('./routers/metadataRouter').routeMetadata(app);
require('./routers/sloRouter').routeSlo(app, sessions);
require('./routers/ssoRouter').routeSso(app, sessions);
require('./routers/commandsRouter').routeSpInitCommands(app, sessions);


app.use(bodyParser.urlencoded({
    extended: true
}));

  


//https
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

const PORT = process.env.PORT || 7001;
httpsServer.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});



//http
// const PORT = process.env.PORT || 7000;
// app.listen(PORT, () => {
//     console.log(`Our app is running on port ${PORT}`);
// });