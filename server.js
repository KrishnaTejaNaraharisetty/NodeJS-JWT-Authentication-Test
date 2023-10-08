const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
const { verify } = require('crypto');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


var TokenValidity = function(req,res,next)
{
    var tdata = req.header('authorization').split(" ")[1];
    if(!tdata)
        return res.status(400).send({data: "No Token found"});
    var av = req.header('authorization').split(" ")[1];
    if(av){
        check = av;
        try {
            Status = jwt.verify(check, secretKey);
            if(!Status){
                return res.status(400).send("No token available to check");
            }
            if(!Status.username){
                return res.status(400).send("Unauthorized User");
            }
            next();
          } catch(err) {
            res.json({
                success: false,
                myContent: err.toString() + " Please login again!"
            });
          }
    }
    else {
        return res.status(400).send("No header present");
    }
};

let users = [
    {
        id: 1,
        username: 'krishna',
        password: '123'
    },
    {
        id: 2,
        username: 'teja',
        password: '456'
    }
];

//let flag=0;
let flag=false;
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    for(let user of users) {
        if(username==user.username && password==user.password) {
            //flag=1;
            let token=jwt.sign({ id:user.id,username:user.username},secretKey,{expiresIn:'3m'});
            flag=true;
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
    }
    if(flag===false){
            res.status(401).json({
                success:false,
                token:null,
                err:'username or Password is incorrect'
            });
        }
});

app.get('/api/dashboard', TokenValidity, (req,res)=>{
    //if(flag){
    res.json({
        success:true,
        myContent:'Secret content that only logged in people can see!!!'
    });
//}
});

app.get('/api/prices', TokenValidity, (req,res)=>{
    res.json({
        success:true,
        myContent:'This is the price $5.99'
    });
});

app.get('/api/settings', TokenValidity, (req, res) => {
    //if(flag){
    res.json({
        success:true,
        myContent:'This is the settings page'
    });
//}
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});

app.use(function (err, req, res, next) {
    console.log(err.name==='UnauthorizedError');
    console.log(err);
    if(err.name==='UnauthorizedError') {
        res.status(401).json({
            success:false,
            officialError:err,
            err:'username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on post ${PORT}`);
});