const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');
const querystring = require('querystring');
const { access } = require('./src/utils/log');

//session 数据
const SESSION_DATA = {};

//获取cookie 的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24*60*60*1000))
    console.log(`d.toGMTString ${d.toGMTString()}`)
    return d.toGMTString()
}

//处理 post data
const getPostData = (req) =>{
    return new Promise((resolve,reject) => {
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json'){
            resolve({})
            return
        }
        let postData = '';
        req.on('data',chunk => {
            postData += chunk.toString();
        })
        req.on('end',()=>{
            if(!postData){
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData)
            )
        })
    })
}

const serverCallback = (req,res) => {
    //记录访问日志
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

    //设置返回格式
    res.setHeader('Content-Type','application/json');
    
    //获取url
    const url = req.url;
    req.path = url.split('?')[0];

    //解析query
    req.query = querystring.parse(url.split('?')[1]);

    //解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || ''; //k1=v1; k2=v2
    cookieStr.split(';').forEach(item => {
        if(!item)  return
        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();
        req.cookie[key] = val;
    })

    //解析session
    let needSetCookie = false;
    let userId = req.cookie.userid;
    if(userId){
        if(!SESSION_DATA[userId]){
            SESSION_DATA[userId] = {};
        }
    }else{
        needSetCookie = true;
        userId = `${Date.now()}_${Math.random()}`;
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId];

    //处理post data
    getPostData(req).then(postData => {
        req.body = postData;
        //处理bolg路由
        // const blogData = handleBlogRouter(req,res);
        // if(blogData){
        //     res.end(
        //         JSON.stringify(blogData)
        //     )
        //     return
        // }
        const resultBlog = handleBlogRouter(req,res);
        if(resultBlog){
            resultBlog.then(blogData => {
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }
        //处理user路由
        // const userData = handleUserRouter(req,res);
        // if(userData){
        //     res.end(
        //         JSON.stringify(userData)
        //     )
        //     return
        // }
        const resultUser = handleUserRouter(req,res);
        if(resultUser){
            resultUser.then(userData => {
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }
        //未命中，返回404
        res.writeHeader(404,{'Content-Type':'text/plain'});
        res.write("404 NON FOUND");
        res.end();
    });

}

module.exports = serverCallback;