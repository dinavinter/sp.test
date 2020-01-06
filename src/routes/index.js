// routes/index.js
import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic' });
  
});

router.get('/:spName', function(req, res, next) {
  res.render('index', { title: 'Welcome to SP Magic' });

});
export default router;
 