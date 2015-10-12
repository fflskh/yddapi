/**
 * Created by 勇 on 2015/8/28.
 */
var dishmenmu = require('../models/dishmenmu');

var express = require('express');
var router = express.Router();

//TODO

router.all('/get/:id',dishmenmu.GetByID);
router.all('/find/:name',dishmenmu.GetByName);


module.exports = router;