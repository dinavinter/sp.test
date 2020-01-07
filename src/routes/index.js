// routes/index.js
import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic' });
  
});

router.get('/:spName', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic',spName:req.params.spName });

});

router.get('/:spName/:domain/', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic',spName:req.params.spName, domain:req.params.domain });

});

router.get('/:spName/:domain/:apiKey', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic', spName:req.params.spName, domain:req.params.domain , apiKey:req.params.apiKey });

});

router.post('/config', function(req, res, next) {
  res.redirect(`/${req.body.spName}/${req.body.domain}/${req.body.apiKey}`);
 
});

export default router;
 