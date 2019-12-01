var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
 

function getSp(spName) {

    var sp_options = {
        entity_id: getEntityId(spName),
        private_key: fs.readFileSync("server.pem").toString(),
        certificate: fs.readFileSync("server.crt").toString(),
        assert_endpoint: "https://sp.one.com/acs"
    };
    return new saml2.ServiceProvider(sp_options);
     
}

function getEntityId(spName) {return `https://${spName}.com/metadata.xml`; }

var sessions= {};

function getIdp(apiKey) {
  
    var idp_options = {
        sso_login_url: `https://fidm.us1.gigya.com/saml/v2.0/${apiKey}/idp/sso`,
        sso_logout_url: `https://fidm.us1.gigya.com/saml/v2.0/${apiKey}/idp/slo`
        //certificates: [fs.readFileSync("cert-file.crt").toString()]
    };
    return new saml2.IdentityProvider(idp_options);

}

// Endpoint to retrieve metadata
app.get("/", function (req, res) {
     res.send("hi");
});

// Endpoint to retrieve metadata
app.get("/:spName/metadata.xml", function (req, res) {
    res.type('application/xml');
    var sp= getSP(req.params.spName);
    res.send(sp.create_metadata());
});
 
// Starting point for login
app.get("/:spName/:apiKey/login", function (req, res) {
 
    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);
 
    sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
        if (err != null)
            return res.send(500);
        res.redirect(login_url);
    });
});

// Starting point for logout
app.get("/:spName/:apiKey/logout", function (req, res) {

    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);
    var session=sessions[`${req.params.apiKey}_${req.params.spName}`];
    if(!session)
        return res.send(`User is not loggedin!  loggedin sps: ${Object.keys(sessions)} `);

    var options = {
        name_id:  session.name_id,
        session_index: session.session_index
    };

    sp.create_logout_request_url(idp, options, function (err, logout_url) {
        if (err != null)
            return res.send(err);
        res.redirect(logout_url);
    });
});


// Assert endpoint for when login completes
app.post("/:spName/:apiKey/acs", function (req, res) {
    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);

    var options = {request_body: req.body,
        audience:  getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true};

    sp.post_assert(idp, options, function (err, saml_response) {
        acs(req.params.spName, req.params.apiKey, err, saml_response);
        res.json({ saml_response:saml_response, err:err});
    });
    
});


app.get("/:spName/:apiKey/acs", function (req, res) {
    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);

    var options = {request_body: req.query,
        audience:  getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true};

      sp.redirect_assert(idp, options, function (err, saml_response) { 
          acs(req.params.spName, req.params.apiKey, err, saml_response);  
          res.json({ saml_response:saml_response, err:err});
    });
});

function acs(spName, apiKey, err, saml_response) {
    
    // Save name_id and session_index for logout
    // Note:  In practice these should be saved in the user session, not globally.

    if(saml_response.user)
    {
        sessions[`${apiKey}_${spName}`] = {
            name_id: saml_response.user.name_id,
            session_index: saml_response.user.session_index
        }; 
    }

}


function slo(saml_response, sp, idp, options, res, err) {
    if (saml_response && saml_response.type == 'logout_request') {
        sp.create_logout_response_url(idp, options, function (url_err, logout_url) {
            if (url_err != null)
                return res.send(url_err);
            res.redirect(logout_url);
        });
    } else {
        if (err != null)
            return res.send(err);
        res.json(saml_response);
    }
}

app.post("/:spName/:apiKey/slo", function (req, res) {
   
    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);

    var options = {request_body: req.body,
        audience:  getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true}; 

     sp.post_assert(idp, options, function (err, saml_response) {
         return slo(saml_response, sp, idp, options, res, err);
        
 
    });
 

});


app.get("/:spName/:apiKey/slo", function (req, res) {

    var idp = getIdp(req.params.apiKey);
    var sp = getSp(req.params.spName);

    var options = {request_body: req.query,
        audience:  getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true};

    sp.redirect_assert(idp, options, function (err, saml_response) {
        return slo(saml_response, sp, idp, options, res, err);
 
    });
 

});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
 