const config = require("../services/config");
const logger = require("../services/spLogs");

exports.routeSso= (app, sessions)=> {


// Assert endpoint for when login completes
    app.post("/:spName/:domain/:apiKey/acs", function (req, res) {
      var idp = config.getIdp(req.params.domain, req.params.apiKey);
      var sp = config.getSp(req.params.spName);

      var options = {request_body: req.body,
        audience:  config.getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true};

      sp.post_assert(idp, options, function (err, saml_response) {
        logger.log(saml_response,"post");
        acs(req.params.spName, req.params.apiKey, err, saml_response);
        res.json({ saml_response:saml_response, err:err});
      });

    });


    app.get("/:spName/:domain/:apiKey/acs", function (req, res) {
      var idp = config.getIdp(req.params.domain, req.params.apiKey);
      var sp = config.getSp(req.params.spName);

      var options = {request_body: req.query,
        audience:  config.getEntityId(req.params.spName),
        ignore_signature: true,
        allow_unencrypted_assertion: true};

      sp.redirect_assert(idp, options, function (err, saml_response) {
        logger.log(saml_response,"get");
        acs(req.params.spName, req.params.apiKey, err, saml_response);
        res.json({ saml_response:saml_response, err:err});
      });
    });

    function acs(spName, apiKey, err, saml_response) {

      // Save name_id and session_index for logout
      // Note:  In practice these should be saved in the user session, not globally.

      if(saml_response && saml_response.user)
      {
        sessions[`${apiKey}_${spName}`] = {
          name_id: saml_response.user.name_id,
          session_index: saml_response.user.session_index
        };
      }

    }
  
};
 