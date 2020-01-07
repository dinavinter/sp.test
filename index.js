var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sessions = {};

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.raw({
    extended: true
}));

app.use(bodyParser.text({
    extended: true
}));

app.use(bodyParser.json({
    extended: true
}));

//routes
require('./routers/metadataRouter').routeMetadata(app);
require('./routers/sloRouter').routeSlo(app, sessions);
require('./routers/ssoRouter').routeSso(app, sessions);
require('./routers/commandsRouter').routeSpInitCommands(app, sessions);



var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
var httpServer = http.createServer(app);

const PORT = process.env.PORT || 7001;
httpsServer.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

const PORT2 = process.env.PORT || 7000;
httpServer.listen(PORT2, () => {
    console.log(`Our app is running on port ${PORT2}`);
});