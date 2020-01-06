const config = require("../services/config");
const logger = require("../services/spLogs");
import express from 'express';
import sessions from '../services/sessions';

var router = express.Router();
 
router.get("/:spName/:domain/:apiKey/login", function (req, res) {

    var idp = config.getIdp(req.params.domain, req.params.apiKey);
    var sp = config.getSp(req.params.spName);

    sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
        if (err != null)
            return res.send(500);
        res.redirect(login_url);
    });
});

// Starting point for logout
router.get("/:spName/:domain/:apiKey/logout", function (req, res) {

    var idp = config.getIdp(req.params.domain, req.params.apiKey);
    var sp = config.getSp(req.params.spName);
    var session = sessions[`${req.params.apiKey}_${req.params.spName}`];
    if (!session) {
        return res.send(`User is not logged in!  logged in sps: ${Object.keys(sessions)} `);
    }

    var options = {
        name_id: session.name_id,
        session_index: session.session_index
    };

    sp.create_logout_request_url(idp, options, function (err, logout_url) {
        if (err != null)
            return res.send(err);
        res.redirect(logout_url);
    });
});

export default router;