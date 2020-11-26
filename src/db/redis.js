const redis = require('redis');
const {REDIS_CONF} = require('../conf/db');

//创建客户端
const redisClient = redis.createClient(REDIS_CONF.port,REDIS.CONF.host);
redusClient.on('error',err => {
    console.log(err)
})

//封装新建读取
function set(key,val){
    if(typeof val === 'object'){
        val = JSON.stringify(val);
    }
    redisClient.set(key,val,redis.print);
}

function get(key){
    return new Promise((resolve,reject) => {
        redisClient.get(key, (err,val) => {
            if(err){
                reject(err)
                return
            }
            if(val === null){
                resolve(null)
                return
            }
            try{
                resolve(JSON.parse(val))
            }catch(ex){
                resolve(val)
            }
        })
    })
}

module.exports = {
    get,
    set
}