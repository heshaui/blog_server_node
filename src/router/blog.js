const {SuccessModel,ErrorModel} = require('../model/resModel');
const {getList,getDetail,newBlog,updateBlog,deleteBlog} = require('../controller/blog');

//统一登录验证的函数
const loginCheck = (req) => {
    if(!req.session.username){
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
    
}

const handleBlogRouter = (req,res) => {
    const method = req.method;    
    const id = req.query.id || '';

    //获取博客列表
    if(method === 'GET' && req.path === '/api/blog/list'){
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''
        if(req.query.isadmin){
            //判断登录
            const loginCheckResult = loginCheck(req);
            if(loginCheckResult){
                //未登录
                return loginCheckResult
            }
            //强制查询自己的博客
            author = req.session.username;
        }

        const result = getList(author,keyword)
        return result.then(resultData => {
             return new SuccessModel(resultData)
        })
    }
    //获取博客详情
    if(method === 'GET' && req.path === '/api/blog/detail'){
        const result = getDetail(id)
        return result.then(resultData => {
            return new SuccessModel(resultData);
        })
    }
    //新建一篇博客
    if(method === 'POST' && req.path === '/api/blog/new'){
        //判断登录
        const loginCheckResult = loginCheck(req);
        if(loginCheckResult){
            //未登录
            return loginCheckResult
        }
        req.body.author = req.session.username; //假数据，因为没登录，无法获取用户
        const result = newBlog(req.body);
        return result.then(data => {
            return new SuccessModel(data);
        })
    }
    //更新一篇博客
    if(method === 'POST' && req.path === '/api/blog/update'){
        // const result = updateBlog(id,req.body);
        // if(result){
        //     return new SuccessModel()
        // }else{
        //     return new ErrorModel()
        // }
        const result = updateBlog(id,req.body)
        if(loginCheckResult){
            //未登录
            return loginCheckResult
        }
        return result.then(val => {
            if(val){
                return new SuccessModel()
            }else{
                return new ErrorModel()
            }
        })
    }
    //删除博客
    if(method === 'POST' && req.path === '/api/blog/delete'){
        // const result = deleteBlog(id);
        // if(result){
        //     return new SuccessModel()
        // }else{
        //     return new ErrorModel();
        // }
        if(loginCheckResult){
            //未登录
            return loginCheckResult
        }
        const author = req.session.username; //假数据，因为没登录，无法获取用户
        const result = deleteBlog(id,author)
        return result.then(val => {
            if(val){
                return new SuccessModel()
            }else{
                return new ErrorModel()
            }
        })
    }
}

module.exports = handleBlogRouter;