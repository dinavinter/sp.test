const logs = [];

exports.log = (saml_message, method ) => {   logs.push({msg:saml_message, method});};

 