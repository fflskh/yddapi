/**
 * Created by 勇 on 2015/8/28.
 * 一些实列用来说明q.js的用法
 */
var q = require('q');
var fs=require('fs');

function ReSuccess(callback) {
    console.log('In ReSuccess Fn!');
    callback(null, 'Retrun ReSuccess!');
}
function ReError(callback) {
    console.log('In ReError Fn!');
    callback('Retrun ReError!');
}
/**
 * q.nfcall
 * 用来将标准Nodejs风格的函数，Promise化，如：
 * fn(cb){
 * cb(err,resulte);
 * }
 */
q.nfcall(ReSuccess).then(function (success) {
    console.log(success);
    //q.nfcall(ReError);//不返回，将不能进行下一步；
    return q.nfcall(ReError);//如果要串行化执行，应当返回promise
}).fail(function (err) {
    console.log(err);
});
function ReObject(callback){
    callback(null,{
        name:"name",
        age:1
    });
}
q.nfcall(ReObject).then(function (o) {
    return o['name'];
});
q.nfcall(ReObject).get('name').then(function(name){
    console.log(name);
}).fail(function(err){

});
function QPost(callback){
    console.log("QPost Fn");
    callback(null,{
        post:function(args1,args2){
            console.log(args1,args2);
            return args1;
        }
    })
}
q.nfcall(QPost).post('post','args1','args2').then(function(args1){
console.log(args1);
});
q.nfcall(ReObject).keys().then(function(array){
    console.log(array);
})
/**
 * promise.fbind(...args) (deprecated)
 * 返回一个新的函数用给定的可变参数异步调用一个函数,并返回一个承诺。
 * 值得注意的是,任何同步返回值或抛出异常改变,分别为实现的承诺或拒绝原因返回这个新功能。
 * 这种方法静态形式包装函数来确保他们总是异步是特别有用的,任何抛出异常(故意或意外的)都会适当地转换为返回拒绝承诺。
 **/
var getUserData = q.fbind(function (userName) {
    if (!userName) {
        throw new Error("userName must be truthy!");
    }

    if (userName=='coojee') {
        return userName;
    }

    return getUserFromCloud(userName);
});
function getUserFromCloud(username){
    return 'this name is : '+username;
}
getUserData().then(function(result){
    console.log(result);
}).fail(function(err){
    console.log(err);
});
getUserData('coojee').then(function(result){
    console.log(result);
}).fail(function(err){
    console.log(err);
});
getUserData('hanmeimei').then(function(result){
    console.log(result);
}).fail(function(err){
    console.log(err);
});
/**
 * promise.timeout(ms, message)
 * 判定promise在给定的时间内是否返回了实现
 **/
function timeoutFn(callback){
    setTimeout(function(){
        callback(null,'3000ms');
    },3000);
}
q.nfcall(timeoutFn).timeout(2000).then(function(results){
    console.log(results);
}).fail(function(err){
    console.log(err);
});
q.nfcall(timeoutFn).timeout(3000).then(function(results){
    console.log(results);
}).fail(function(err){
    console.log(err);
});
q.nfcall(timeoutFn).timeout(4000).then(function(results){
    console.log(results);
}).fail(function(err){
    console.log(err);
});
/**
 * promise.delay(ms)
 * 在延迟指定的时间后，返回promise的结果
 */
getUserData('coojee2015').delay(3000).then(function(result){
    console.log('3000ms delay:',result);
}).fail(function(err){
    console.log('3000ms delay:',err);
});
getUserData().delay(3000).then(function(result){
    console.log('3000ms delay:',result);
}).fail(function(err){
    console.log('3000ms delay:',err);
});
/**
 * q.delay(ms)
 * 延迟Nms后执行后面的事情
 */
q.delay(5000).then(function() {
    return getUserData('coojee2016');
}).then(function(result){
    console.log('5000ms delay:',result);
}).fail(function(err){
    console.log('5000ms delay:',err);
});
/**
 * q(value)
 * 如果value是一个Q承诺,返回该承诺。
 * 如果vale是另一个库中的一个承诺，将强制转化为Q承诺(在可能的情况下)。
 * 如果值不是一个承诺,返回一个承诺实现其值为value。
 */
q(1).then(function(result){
    console.log('q():',result);
}).fail(function(err){
    console.log('q():',err);
});
/**
 * q.reject(reason)
 * 返回一个拒绝的承诺
 */
q().then(function(){
    return q.reject('直接拒绝');
}).fail(function(err){
    console.log(err);
});

/**
 * q.Promise(resolver)
 * 参数:resolver是一个异步调用的函数resolver(resolve, reject, notify)
 * 0.97版本后请用
 * q.promise(resolver)小写的p
 */
q().then(function(){
    return q.promise(getUserData);
}).then(function(v){
    console.log('q.promise:',v);
}).fail(function(err){
    console.log('q.promise:',err);
});

/**
 * q.nfbind 将类Node回调模式的异步程序Promise化。
 * 请注意,如果你有一个方法,使用nodejs回调模式,而不仅仅是机能缺失,传递到nfbind之前您需要绑定this值,像这样:
 * var Kitty = mongoose.model("Kitty");
 * var findKitties = Q.nfbind(Kitty.find.bind(Kitty));
 * 更好的建议是使用nbind方法。
 */
var readFile = q.nfbind(fs.readFile);
readFile("forRead.txt", "utf-8").then(function (text) {
console.log(text);
});
/**
 * q.nbind(nodeMethod, thisArg, ...args)
 * 从一个nodejs回调模式的函数返回一个promise,可选择绑定给定的可变参数
 */
q.nbind(fs.readFile)("forRead.txt", "utf-8").then(function (text) {
    console.log('nbind:',text);
});
/**
 * q.nfapply(nodeFunc, args)
 * 将给定的一个数组参数传递给一个nodejs回调模式的函数，并返回promise
 * 缺陷：如果给定不是韩式而是对象的方法，需要先实例化该对象，建议:Q.npost
 * Q.nfapply(redisClient.get.bind(redisClient), ["user:1:id"]).done(function (user) {});
 */
 q.nfapply(fs.readFile, ["forRead.txt", "utf-8"]).then(function (text) {
     console.log('nfapply:',text);
 });
/**
 * Q.nfcall(func, ...args)
 *  动态参数传递给一个nodejs回调模式的函数，并返回promise
 * 缺陷：如果给定不是韩式而是对象的方法，需要先实例化该对象,建议:Q.ninvoke
 */
q.nfcall(fs.readFile, "forRead.txt", "utf-8").then(function (text) {
    console.log('nfcall:',text);
});

/**
 * Q.npost(object, methodName, args)
 * 将给定的一个数组参数传递给一个nodejs回调模式的对象的方法，并返回promise
 * Q.npost(redisClient, "get", ["user:1:id"]).done(function (user) {});
 */


/**
 * Q.ninvoke(object, methodName, ...args)
 * 动态参数传递给一个nodejs回调模式的对象的方法，并返回promise
 * Q.npost(redisClient, "get", ["user:1:id"]).done(function (user) {});
 */

/**
 * promise.all()
 *返回一个承诺,履行一个数组,其中包含实现每一个承诺的价值,或者是先用相同的拒绝理由拒绝承诺被拒绝。
 *这种方法是常用的静态数组的形式承诺,为了同时执行许多操作和所有成功时得到通知。
 * 如果任何一个失败，返回拒绝
 */

q.all([q.nfcall(fs.readFile,"forRead.txt", "utf-8"),q.nfcall(fs.readFile,"forRead1.txt", "utf-8")]).then(function(values){
   console.log('all:',values) ;
}).fail(function(err){
    console.log('all:',err);
});
/**
 * promise.allSettled()
 * 履行数组承诺快照,但只有所有的承诺已经谈妥后才返回一个承诺,,即：履行或拒绝。
 * 这种方法是常用的静态数组的形式承诺,为了同时执行许多操作和通知他们都完成时,不管成功或失败
 */
q.allSettled([q.nfcall(fs.readFile,"forRead.txt", "utf-8"),q.nfcall(fs.readFile,"forRead1.txt", "utf-8")]).then(function(values){
    console.log('allSettled:',values) ;
}).fail(function(err){
    console.log('allSettled:',err);
});