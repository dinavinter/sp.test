const ServiceProvider = require("saml2-js").ServiceProvider;
const IdentityProvider = require("saml2-js").IdentityProvider;
const fs = require("fs");

exports.getIdp =(domain, apiKey)=> {

    var idp_options = {
        sso_login_url: `https://fidm.${domain}.gigya.com/saml/v2.0/${apiKey}/idp/sso`,
        sso_logout_url: `https://fidm.${domain}.gigya.com/saml/v2.0/${apiKey}/idp/slo`
        //certificates: [fs.readFileSync("cert-file.crt").toString()]
    };
    return new IdentityProvider(idp_options);

};


exports.getSp = (spName)=> {

     var sp_options = {
        entity_id: exports.getEntityId(spName),
        private_key: fs.readFileSync('./resources/server.pem').toString(),
        certificate: fs.readFileSync('./resources/server.crt').toString(),
        assert_endpoint: "https://sp.one.com/acs"
    }
    return new ServiceProvider(sp_options);

};

exports.getEntityId= (spName)=>  `https://${spName}.com/metadata.xml`; 
exports.getUrl=(domain, apiKey ,spName)=>  `https://sp-gigya-test.herokuapp.com/${spName}/${domain}/${apiKey}`; 
