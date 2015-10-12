/**
 * Created by liuhao on 8/17/15.
 */
var express = require('express');
var router = express.Router();

var user = require('../api/user');
var dev = require('../api/device');
var auth = require('../api/auth');
var rest = require('../api/rest');
var dishcate = require('../api/dishcate');
var dishmenmu = require('../api/dishmenmu');

//TODO
router.use('/user', user);
router.use('/dev', dev);
router.use('/auth', auth);
router.use('/rest', rest);
router.use('/dishcate', dishcate);
router.use('/dishmenmu', dishmenmu);

module.exports = router;