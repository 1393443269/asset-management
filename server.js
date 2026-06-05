const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 8090;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors({origin:true,credentials:true}));
app.use(express.json());
app.use(session({secret:'asset-mgmt-secret-key-2026',resave:false,saveUninitialized:false,cookie:{maxAge:86400000}}));

// Auth middleware
function auth(req,res,next){if(req.session.user)next();else res.status(401).json({code:401,msg:'请先登录'});}

// Data helpers
function readData(){if(!fs.existsSync(DATA_FILE)){const d={assets:[{id:'a1',name:'EC800M-CN 通信模组',model:'EC800M-CN',sn:'869598078703629',type:'通讯模块',status:'在线',location:'桂林',lat:25.2736,lng:110.2902,createdAt:new Date().toISOString()}],sims:[],customers:[],alerts:[],activities:[]};fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2));return d;}return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));}
function writeData(d){fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2));}

// Login
app.post('/api/login',(req,res)=>{
  const {username,password}=req.body;
  if(username==='admin'&&password==='admin123'){req.session.user={username,role:'admin'};res.json({code:0,msg:'登录成功',user:req.session.user});}
  else res.json({code:1,msg:'用户名或密码错误'});
});
app.get('/api/logout',(req,res)=>{req.session.destroy();res.json({code:0});});
app.get('/api/session',(req,res)=>{res.json({code:0,user:req.session.user||null});});

// Assets API
app.get('/api/assets',auth,(req,res)=>{const d=readData();res.json({code:0,data:d.assets});});
app.post('/api/assets',auth,(req,res)=>{const d=readData();const a={...req.body,id:req.body.id||('a'+Date.now()),createdAt:new Date().toISOString()};const i=d.assets.findIndex(x=>x.id===a.id);if(i>=0)d.assets[i]=a;else d.assets.unshift(a);writeData(d);res.json({code:0,data:a});});
app.delete('/api/assets/:id',auth,(req,res)=>{const d=readData();d.assets=d.assets.filter(x=>x.id!==req.params.id);writeData(d);res.json({code:0});});

// SIMs API
app.get('/api/sims',auth,(req,res)=>{const d=readData();res.json({code:0,data:d.sims});});
app.post('/api/sims',auth,(req,res)=>{const d=readData();const s={...req.body,id:req.body.id||('s'+Date.now()),createdAt:new Date().toISOString()};const i=d.sims.findIndex(x=>x.id===s.id);if(i>=0)d.sims[i]=s;else d.sims.push(s);writeData(d);res.json({code:0,data:s});});

// Customers API
app.get('/api/customers',auth,(req,res)=>{const d=readData();res.json({code:0,data:d.customers});});
app.post('/api/customers',auth,(req,res)=>{const d=readData();const c={...req.body,id:req.body.id||('c'+Date.now()),createdAt:new Date().toISOString()};const i=d.customers.findIndex(x=>x.id===c.id);if(i>=0)d.customers[i]=c;else d.customers.push(c);writeData(d);res.json({code:0,data:c});});

// Device location report
app.post('/api/report',auth,(req,res)=>{const d=readData();const {sn,lat,lng,status='在线'}=req.body;const i=d.assets.findIndex(x=>x.sn===sn);if(i>=0){d.assets[i].lat=lat;d.assets[i].lng=lng;d.assets[i].status=status;d.assets[i].lastOnline=new Date().toISOString();writeData(d);}res.json({code:0});});

// Static files
app.use(express.static(__dirname));

app.listen(PORT,'0.0.0.0',()=>{console.log('Asset Management Server: http://localhost:'+PORT);console.log('Login: http://localhost:'+PORT+'/login.html');});
