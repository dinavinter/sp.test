import {IdentityProvider, ServiceProvider} from "saml2-js";
import path from "path";

const fs = require("fs");

export function getIdp(domain, apiKey) {

    var idp_options = {
        sso_login_url: `https://fidm.${domain}.gigya.com/saml/v2.0/${apiKey}/idp/sso`,
        sso_logout_url: `https://fidm.${domain}.gigya.com/saml/v2.0/${apiKey}/idp/slo`
        //certificates: [fs.readFileSync("cert-file.crt").toString()]
    };
    return new IdentityProvider(idp_options);

}


export function getSp(spName) {
    
     var sp_options = {
        entity_id: getEntityId(spName),
      
        private_key: fs.readFileSync(`./resources/server.pem` ).toString(),
        certificate: fs.readFileSync(`./resources/server.crt`).toString(),
        assert_endpoint: "https://sp.one.com/acs"
    }
    return new ServiceProvider(sp_options);

}

export function getEntityId(spName) {
    return `https://${spName}.com/metadata.xml`;
}

export function getUrl(domain, apiKey, spName) {
    return `https://sp-gigya-test.herokuapp.com/${spName}/${domain}/${apiKey}`;
} 
