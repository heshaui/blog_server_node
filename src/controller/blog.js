const {exec} = require('../db/mysql')
const xss = require('xss');
//博客列表
const getList = (author, keyword) => {
    //返回数据
    let sql = `select * from blogs where state='1'`
    if(author){
        sql += `and author='${author}'`
    }
    if(keyword){
        sql += `and title like '%${keyword}%'`
    }
    sql += `order by createtime desc;`
    return exec(sql)
}

//博客详情
const getDetail = (id) => {
    //返回假数据
    let sql = `select * from blogs where state='1'`
    if(id){
        sql += `and id=${id};`
    }
    return exec(sql).then(rows => {
        return rows[0]
    })
}

//新建博客
const newBlog = (blogData = {}) => {
    //blogData是一个博客对象,包含title,content,author 属性
    const title = xss(blogData.title)
    const content = xss(blogData.content)
    const author = blogData.author
    const createtime = Date.now()

    const sql = `
        insert into blogs (title,content,createtime,author) 
        values ('${title}','${content}','${createtime}','${author}')
    `
    //返回新建博客的id
    return exec(sql).then(insertData => {
        //console.log(`insertData is ${JSON.stringify(insertData)}`)
        return {
            id:insertData.insertId
        }
    })
}

//更新博客
const updateBlog = (id,blogData={}) => {
    //id 要更新博客的id
    //blogData 是更新的内容, 更新title，content
    // console.log(`id:${id},blogData:${JSON.stringify(blogData)}`);
    // return true
    const title = blogData.title
    const content = blogData.content
    const sql = `
        update blogs set title='${title}', content='${content}' where id=${id}
    `
    return exec(sql).then(updateData => {
        console.log(`updateData ${JSON.stringify(updateData)}`)
        if(updateData.affectedRows > 0){
            return true
        }
    })
}

//删除博客
const deleteBlog = (id,author) => {
    //博客id
    //软删除
    const sql = `update blogs set state='0' where id=${id} and author='${author}'`
    //完全删除
    //const sql = `delete from blogs where id=${id}`
    return exec(sql).then(deleteData => {
        console.log(`deleteData ${JSON.stringify(deleteData)}`)
        if(deleteData.affectedRows > 0){
            return true
        }
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
}
