/**
 * Created by liuhao on 8/20/15.
 */

var rest = require('../models/rests');

var express = require('express');
var restRouter = express.Router();

//TODO

restRouter.post('/add', rest.add);
restRouter.post('/edit', rest.edit);
restRouter.post('/remove', rest.remove);
restRouter.get('/detail/:restid', rest.detail);
restRouter.get('/state/:restid', rest.state);
restRouter.get('/restlist/:uid', rest.restlist);
restRouter.get('/binddetail/:restid', rest.binddetail);

module.exports = restRouter;