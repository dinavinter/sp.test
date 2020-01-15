const config = require("../services/config");
const logger = require("../services/spLogs");
import express from 'express';

const router = express.Router();

import sessions from '../services/sessions';


router.post("/:spName/:domain/:apiKey/slo", function (req, res) {

    var idp = config.getIdp(req.params.domain, req.params.apiKey);
    var sp = config.getSp(req.params.spName);
 
    var options = {
        request_body: req.body,
        audience: config.getEntityId(req.params.spName),
        ignore_signature: false,
        allow_unencrypted_assertion: true
    };

    sp.post_assert(idp, options, function (err, saml_response) {
        logger.log(saml_response, "post");
        return slo(saml_response, sp, idp, options, res, err);


    });


});


router.get("/:spName/:domain/:apiKey/slo", function (req, res) {

    var idp = config.getIdp(req.params.domain, req.params.apiKey);
    var sp = config.getSp(req.params.spName);

    var options = {
        request_body: req.query,
        audience: config.getEntityId(req.params.spName),
        ignore_signature: false,
        allow_unencrypted_assertion: true
    };

    sp.redirect_assert(idp, options, function (err, saml_response) {
        logger.log(saml_response, "get");
        return slo(saml_response, sp, idp, options, res, err);

    });


});


function slo(saml_response, sp, idp, o, res, err) {
    if (saml_response && saml_response.type == 'logout_request') {

        var options = {in_response_to: saml_response.response_header.id,  sign_get_request: true};
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

export default router;