const config = require("../services/config");
const logger = require("../services/spLogs");

exports.routeMetadata = (app) => {

    app.get("/:spName/:domain/:apiKey/metadata.xml", function (req, res) {
        res.type('application/xml');
        var sp = config.getSp(req.params.spName);
        sp.assert_endpoint = `${config.getUrl(req.params.domain, req.params.apiKey, req.params.spName)}/acs`,
            res.send(sp.create_metadata());
    });

    app.get("/:spName/:domain/:apiKey/config", function (req, res) {

        var idp = config.getIdp(req.params.domain, req.params.apiKey);
        var sp = config.getSp(req.params.spName);

        res.json({
            "name": req.params.spName,
            "entityID": config.getEntityId(req.params.spName),
            "assertionConsumerServiceURL": `${config.getUrl(req.params.domain, req.params.apiKey, req.params.spName)}/acs`,
            "singleLogoutServiceURL": `${config.getUrl(req.params.domain, req.params.apiKey, req.params.spName)}/slo`,
            "singleLogoutServiceBinding": "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
            "authnRequestSigned": false,
            "wantAssertionSigned": false,
            "encryptAssertions": false,
            "nameIDMapping": {},
            "sessionLifetime": 1440,
            "attributeMapping": [
                {
                    "attributeName": "My-name",
                    "gigyaField": "profile.firstName",
                    "attributeType": "urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified"
                }
            ]
        });
    });
};