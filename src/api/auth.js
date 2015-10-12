/**
 * Created by liuhao on 8/19/15.
 */

var auth = require('../models/auths');

var express = require('express');
var authRouter = express.Router();

//TODO
//authRouter.get('/token', auth.genToken);
authRouter.post('/token', auth.getToken);

module.exports = authRouter;