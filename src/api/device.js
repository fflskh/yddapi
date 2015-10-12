/**
 * Created by liuhao on 8/18/15.
 */

var dev = require('../models/devices');

var express = require('express');
var devRouter = express.Router();

//TODO
devRouter.get('/check/:id', dev.check);
devRouter.get('/bind/:devid/:restid', dev.bind);
devRouter.get('/unbind/:devid/:restid', dev.unbind);


module.exports = devRouter;