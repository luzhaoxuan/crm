var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.listen(5595);
app.use(express.static(__dirname));
app.get('/',function (req,res) {
    res.renderFile('./index.html',{root:__dirname})
});
function setStudents(students,callback) {
    //将我们存放好的书写入到json文件中
    fs.writeFile('./students.json',JSON.stringify(students),callback);
}
function getStudents(callback) {
    fs.readFile('./students.json','utf8',function (err,data) {
        var students = [];
        if(err){
            callback(students);//如果有错误默认为空数组
        }else{
            try{
                students = JSON.parse(data);
            }catch(e){
                students = [];
            }
            callback(students);
        }
    });
}
app.get('/students',function (req,res) {
    var query=req.query;
    var n=query.n;
    var ary=[{
        totalPage:null,
        nowPage:null,
        students:null
    }];
    getStudents(function (students) {
        ary[0].totalPage=Math.ceil(students.length/10);
        ary[0].students=students.slice((n-1)*10,n*10);
        ary[0].nowPage=n;
        res.send(ary)
    })
});
app.post('/students',function (req,res) {
    var student = req.body;
    getStudents(function (students) {
        student.id =students.length?students[students.length-1].id+1:1;
        students.push(student);
        setStudents(students,function () {
            res.send(student)
        })
    })
});
app.get('/students/:id',function (req,res) {
    var id = req.params.id;
    getStudents(function (data) {
        //在所有书中找到某一个 ，将某一本数返回给前台
        var student = data.find(function (item) {
            return item.id == id;
        });
        res.send(student);
    })
});
app.put('/students/:id',function (req,res) {
    var id = req.params.id;
    var student= req.body;
    getStudents(function (sudents) {
        //在所有书中找到某一个 ，将某一本数返回给前台
        var students = sudents.map(function (item) {
            if(item.id == id){
                return student
            }else{
                return item
            }
        });
        setStudents(students,function () {
            res.send(student);//修改后 将修改的那一本身书返回
        });
    })
});
app.delete('/students/:id',function (req,res) {
    var id=req.params.id;
    getStudents(function (data) {
        var students = data.filter(function (item) {
            return item.id!=id;
        });
        setStudents(students,function () {
            res.send({}); //删除后默认返回空对象
        })
    })
});