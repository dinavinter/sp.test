var saml2 = require('saml2-js');
console.log('1');
var fs = require('fs');
var express = require('express');
console.log('2');

var app = express();
console.log('3');

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
console.log('3');
// Create service provider
var sp_options = {
    entity_id: "https://sp.example.com/metadata.xml",
    private_key: fs.readFileSync("server.pem").toString(),
    certificate: fs.readFileSync("server.crt").toString(),
    assert_endpoint: "https://sp.example.com/assert"
};
var sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
var idp_options = {
    sso_login_url: "https://fidm.us1.gigya.com/saml/v2.0/3_VL0lfWLluGwf2VZ5niQd4Xx6HFf6hSdYHfHoDMJDF2njekgvaEbnxryRAsaXwZK2/idp/sso",
    sso_logout_url: "https://fidm.us1.gigya.com/saml/v2.0/3_VL0lfWLluGwf2VZ5niQd4Xx6HFf6hSdYHfHoDMJDF2njekgvaEbnxryRAsaXwZK2/idp/slo",
    certificates: [fs.readFileSync("cert-file.crt").toString()]
};
var idp = new saml2.IdentityProvider(idp_options);
console.log('3');
// ------ Define express endpoints ------

// Endpoint to retrieve metadata
app.get("/metadata.xml", function (req, res) {
    res.type('application/xml');
    res.send(sp.create_metadata());
});
console.log('3');

// Starting point for login
app.get("/login", function (req, res) {
    sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
        if (err != null)
            return res.send(500);
        res.redirect(login_url);
    });
});

// Starting point for logout
app.get("/logout", function (req, res) {

    var options = {
        name_id: name_id,
        session_index: session_index
    };

    sp.create_logout_request_url(idp, options, function (err, logout_url) {
        if (err != null)
            return res.send(500);
        res.redirect(logout_url);
    });
});


// Assert endpoint for when login completes
app.post("/assert", function (req, res) {
    console.log(req.body);
    var options = {request_body: req.body};
    sp.post_assert(idp, options, function (err, saml_response) {
        if (err != null)
            return res.send(err);

        // Save name_id and session_index for logout
        // Note:  In practice these should be saved in the user session, not globally.
        name_id = saml_response.user.name_id;
        session_index = saml_response.user.session_index;

        res.send(JSON.stringify(saml_response, null, 2));
    });
});

app.get("/slo", function (req, res) {
    console.log(req.body);
    res.send(req.body);
    
 
});


app.listen(8000);
console.log('10');