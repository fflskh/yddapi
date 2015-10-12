/**
 * Created by liuhao on 8/21/15.
 */

var dish = require('../models/dishes');

var express = require('express');
var dishRouter = express.Router();

//菜品类型
//菜品操作前，先要判断菜品类型及餐厅id是否合法
dishRouter.post('/add', dish.add);
dishRouter.post('/edit', dish.edit);
dishRouter.post('/remove/:dishid', dish.remove);
dishRouter.get('/detail/:dishid', dish.detail);

module.exports = dishRouter;