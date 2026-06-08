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


// Device auth middleware (uses X-Device-Key header or sn param)
function deviceAuth(req,res,next){
  const key=req.headers['x-device-key']||req.query.key||'';
  const sn=req.headers['x-device-sn']||req.query.sn||req.body.sn||'';
  const d=readData();
  const device=d.assets.find(x=>x.sn===sn);
  if(!device&&key!=='iot-gateway-key-2026')return res.status(403).json({code:403,msg:'设备未注册'});
  req.device=device;next();
}

// ============ IoT Device APIs (无需登录) ============

// Device heartbeat + location update
app.post('/api/device/heartbeat',deviceAuth,(req,res)=>{
  const d=readData();
  const {sn,lat,lng,rssi,battery,speed,satellites}=req.body;
  const i=d.assets.findIndex(x=>x.sn===sn);
  if(i>=0){
    d.assets[i].lat=lat||d.assets[i].lat;
    d.assets[i].lng=lng||d.assets[i].lng;
    d.assets[i].rssi=rssi;
    d.assets[i].battery=battery;
    d.assets[i].speed=speed;
    d.assets[i].satellites=satellites;
    d.assets[i].status='在线';
    d.assets[i].lastOnline=new Date().toISOString();
    writeData(d);
    // Check for pending commands
    const cmds=d.pendingCommands?d.pendingCommands.filter(x=>x.sn===sn):[];
    res.json({code:0,ts:Date.now(),cmds:cmds||[]});
  }else res.json({code:1,msg:'设备不存在'});
});

// Device telemetry upload (full data package)
app.post('/api/device/telemetry',deviceAuth,(req,res)=>{
  const d=readData();
  const {sn,...telemetry}=req.body;
  const i=d.assets.findIndex(x=>x.sn===sn);
  if(i>=0){
    d.assets[i].telemetry={...telemetry,ts:Date.now()};
    d.assets[i].status='在线';
    d.assets[i].lastOnline=new Date().toISOString();
    writeData(d);
    res.json({code:0});
  }else res.json({code:1,msg:'设备不存在'});
});

// Device registration (auto-register on first connect)
app.post('/api/device/register',(req,res)=>{
  const d=readData();
  const {sn,name,model,type,lat,lng}=req.body;
  if(!sn)return res.json({code:1,msg:'缺少设备序列号'});
  const exists=d.assets.find(x=>x.sn===sn);
  if(exists)return res.json({code:0,msg:'设备已注册',id:exists.id});
  const device={
    id:'a'+Date.now(),sn,name:name||('设备-'+sn.slice(-6)),
    model:model||'未知',type:type||'通讯模块',
    status:'在线',location:'未知',lat:lat||0,lng:lng||0,
    createdAt:new Date().toISOString(),lastOnline:new Date().toISOString()
  };
  d.assets.unshift(device);
  writeData(d);
  res.json({code:0,msg:'注册成功',id:device.id});
});

// Device command dispatch (web -> device)
app.post('/api/device/command',auth,(req,res)=>{
  const d=readData();
  const {sn,cmd,params}=req.body;
  if(!d.pendingCommands)d.pendingCommands=[];
  d.pendingCommands.push({sn,cmd,params:params||{},ts:Date.now(),status:'pending'});
  if(d.pendingCommands.length>1000)d.pendingCommands=d.pendingCommands.slice(-500);
  writeData(d);
  res.json({code:0,msg:'指令已下发,设备下次心跳时获取'});
});

// Get command status
app.get('/api/device/command/:sn',deviceAuth,(req,res)=>{
  const d=readData();
  const cmds=(d.pendingCommands||[]).filter(x=>x.sn===req.params.sn);
  res.json({code:0,cmds});
});

// MQTT broker config for devices
app.get('/api/device/config',deviceAuth,(req,res)=>{
  res.json({code:0,broker:'broker.emqx.io',port:1883,wsPort:8084,
    topicStatus:'devices/{sn}/status',topicTelemetry:'devices/{sn}/telemetry',
    topicCmd:'devices/{sn}/cmd',keepAlive:60,qos:1});
});

// Static files
app.use(express.static(__dirname));

app.listen(PORT,'0.0.0.0',()=>{console.log('Asset Management Server: http://localhost:'+PORT);console.log('Login: http://localhost:'+PORT+'/login.html');});
