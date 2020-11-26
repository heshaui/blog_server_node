const {SuccessModel,ErrorModel} = require('../model/resModel')
const {login } = require('../controller/user')

const handleUserRouter = (req,res) => {
    const method = req.method; 

    //登录
    if(method === 'POST' && req.path === '/api/user/login'){
        const {username,password} = req.body;
        const result =login(username,password);
        return result.then(data => {
            if(data.username){
                //设置session
                req.session.username = data.username;
                req.session.realname = data.realname;
                console.log(`req.session ${JSON.stringify(req.session)}`)
                return new SuccessModel()
            }else{
                return new ErrorModel()
            }
        })
        // if(result){
        //     return  new SuccessModel();
        // }else{
        //     return new ErrorModel();
        // }
    }

    //登录测试
    if(method === 'GET' && req.path === '/api/user/login-test'){
        if(req.session.username){
            return Promise.resolve(
                new SuccessModel({
                    username:req.session
                })
            )
        }
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

module.exports = handleUserRouter;