/**
 * Created by liuhao on 8/17/15.
 */

var user = require('../models/users');

var express = require('express');
var userRouter = express.Router();

//TODO
userRouter.get('/find/:id', user.find);
//userRouter.get(/\/find\/?/, user.find);
userRouter.post('/login', user.login);
userRouter.post('/reg', user.regist);
userRouter.post('/edit', user.edit);

module.exports = userRouter;