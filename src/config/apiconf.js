/**
 * Created by Administrator on 2015/8/18 0018.
 */

module.exports = {
    //监听端口
    listenport : 3000,
    locale:'zh_cn',
    //redis配置
    redis : {
        host:"127.0.0.1",
        port:6379,
        pass:"test",
        expire: 60*10     //失效时间，单位秒(S)
    },

    apiURLs : {
        'checkdev': {
            host: '127.0.0.1',
            port: 18088,
            path: '/api/device/getgenlist'
        },
        'binddetail':{
            host: '127.0.0.1',
            port: 18088,
            path: '/api/customer/getbindlist'
        },
        'bindrest' : {
            host: '127.0.0.1',
            port: 18088,
            path: '/api/customer/bind'
        },
        'unbindrest' : {
            host: '127.0.0.1',
            port: 18088,
            path: '/api/customer/unbind'
        },
        'getDishMenmuById':{
            host: '123.56.100.237',
            port: 18082,
            path: '/api/customer/unbind'
        }
    },

    //其他系统的appid和appkey
    appauth : [
        {appname:'', appid: 'appid1',appkey: 'appkey1'},
        {appname:'', appid: 'appid2',appkey: 'appkey2'},
        {appname:'', appid: 'appid3',appkey: 'appkey3'},
        {appname:'', appid: 'appid4',appkey: 'appkey4'}
    ],

    //指定哪些api接口越过token校验
    skipTokenURLs : {

    },

    //用户管理系统的URL
    userURLs : {

    },

    //餐厅数据库配置
    restInfo : {
        host : '127.0.0.1',
        port : 3306,
        username : 'ydd',
        passwd : '123456',
        dbname : 'jie99_rest'
    },

    //菜品数据库配置
    dishDb : {
        host : '127.0.0.1',
        port : 3306,
        username : 'ydd',
        passwd : '123456',
        dbname : 'jie99_rest'
    },

    //餐厅详细信息
    restDetail : {
        host : '127.0.0.1',
        port : 3306,
        username : 'ydd',
        passwd : '123456',
        dbname : 'jie99_main'
    }
};