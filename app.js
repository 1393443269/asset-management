/**
 * Asset Management - 智能资产管理平台
 * app.js - Application logic, data layer, and UI rendering
 */
(function() {
'use strict';

// ============================================================
// 1. DATA LAYER
// ============================================================
const STORAGE_KEY = 'assethub_v3';

const defaultData = {
  assets: [
    { id:'a1', name:'GPS定位终端A01', model:'GT-800', sn:'SN-2026-0001', type:'定位终端', comPort:'COM4', status:'在线', location:'北京市朝阳区', purchaseDate:'2026-01-15', lat:39.9219, lng:116.4435, remark:'正常运作', createdAt:'2026-01-15 10:00' },
    { id:'a2', name:'GPS定位终端A02', model:'GT-800', sn:'SN-2026-0002', type:'定位终端', comPort:'COM5', status:'在线', location:'上海市浦东新区', purchaseDate:'2026-02-10', lat:31.2304, lng:121.4737, remark:'', createdAt:'2026-02-10 14:30' },
    { id:'a3', name:'GPS定位终端A03', model:'GT-900', sn:'SN-2026-0003', type:'定位终端', comPort:'COM8', status:'离线', location:'广州市天河区', purchaseDate:'2025-11-20', lat:23.1291, lng:113.2644, remark:'SIM卡欠费', createdAt:'2025-11-20 09:00' },
    { id:'a4', name:'温湿度传感器B01', model:'TH-200', sn:'SN-2026-0004', type:'传感器', comPort:'COM13', status:'在线', location:'深圳市南山区', purchaseDate:'2026-03-05', lat:22.5431, lng:113.9432, remark:'仓库监控', createdAt:'2026-03-05 11:00' },
    { id:'a5', name:'通讯模块C01', model:'CM-500', sn:'SN-2026-0005', type:'通讯模块', comPort:'', status:'在线', location:'杭州市西湖区', purchaseDate:'2026-01-22', lat:30.2741, lng:120.1551, remark:'', createdAt:'2026-01-22 08:30' },
    { id:'a6', name:'智能控制设备D01', model:'IC-1000', sn:'SN-2026-0006', type:'控制设备', comPort:'COM4', status:'维修中', location:'成都市武侯区', purchaseDate:'2025-12-01', lat:30.5728, lng:104.0668, remark:'返厂维修中', createdAt:'2025-12-01 15:00' },
    { id:'a7', name:'网关设备E01', model:'GW-300', sn:'SN-2026-0007', type:'网关设备', comPort:'COM7', status:'在线', location:'武汉市洪山区', purchaseDate:'2026-04-10', lat:30.5048, lng:114.4194, remark:'核心网关', createdAt:'2026-04-10 10:00' },
    { id:'a8', name:'GPS定位终端A04', model:'GT-900', sn:'SN-2026-0008', type:'定位终端', comPort:'COM5', status:'在线', location:'南京市鼓楼区', purchaseDate:'2026-05-18', lat:32.0603, lng:118.7969, remark:'', createdAt:'2026-05-18 13:00' },
    { id:'a9', name:'温湿度传感器B02', model:'TH-200', sn:'SN-2026-0009', type:'传感器', comPort:'COM13', status:'离线', location:'重庆市渝北区', purchaseDate:'2026-02-28', lat:29.6018, lng:106.5445, remark:'需现场检查', createdAt:'2026-02-28 16:00' }
  ],
  sims: [
    { id:'s1', iccid:'8986012185100000001', imsi:'460011234567890', operator:'中国移动', plan:'30GB/月', balance:86.50, status:'正常', deviceId:'a1', createdAt:'2026-01-15 10:00' },
    { id:'s2', iccid:'8986012185100000002', imsi:'460021234567891', operator:'中国联通', plan:'50GB/月', balance:120.00, status:'正常', deviceId:'a2', createdAt:'2026-02-10 14:30' },
    { id:'s3', iccid:'8986012185100000003', imsi:'460031234567892', operator:'中国电信', plan:'20GB/月', balance:-5.20, status:'欠费', deviceId:'a3', createdAt:'2025-11-20 09:00' },
    { id:'s4', iccid:'8986012185100000004', imsi:'460011234567893', operator:'中国移动', plan:'100GB/月', balance:256.80, status:'正常', deviceId:'a4', createdAt:'2026-03-05 11:00' },
    { id:'s5', iccid:'8986012185100000005', imsi:'460021234567894', operator:'中国联通', plan:'30GB/月', balance:0, status:'未激活', deviceId:'', createdAt:'2026-05-20 09:00' }
  ],
  recharges: [
    { id:'r1', simId:'s1', amount:100, method:'支付宝', plan:'30GB/月续费', remark:'', operator:'张管理员', createdAt:'2026-05-01 10:00' },
    { id:'r2', simId:'s2', amount:150, method:'微信', plan:'50GB/月续费', remark:'', operator:'张管理员', createdAt:'2026-05-05 14:00' },
    { id:'r3', simId:'s4', amount:300, method:'银行转账', plan:'100GB/月续费', remark:'季度充值', operator:'张管理员', createdAt:'2026-04-20 09:00' },
    { id:'r4', simId:'s1', amount:100, method:'支付宝', plan:'30GB/月续费', remark:'', operator:'张管理员', createdAt:'2026-06-01 11:00' }
  ],
  fences: [
    { id:'f1', name:'北京仓库区', lat:39.9219, lng:116.4435, radius:2000, color:'#ef4444', devices:'a1', createdAt:'2026-03-01 10:00' },
    { id:'f2', name:'上海办事处', lat:31.2304, lng:121.4737, radius:1500, color:'#f59e0b', devices:'a2', createdAt:'2026-03-15 14:00' },
    { id:'f3', name:'深圳研发中心', lat:22.5431, lng:113.9432, radius:1000, color:'#409EFF', devices:'a4', createdAt:'2026-04-01 09:00' }
  ],
  customers: [
    { id:'c1', name:'北京物流科技公司', contact:'李明', phone:'13900001111', email:'liming@bjlog.com', status:'活跃', regDate:'2026-01-20', remark:'长期合作客户', deviceCount:3, createdAt:'2026-01-20 09:00' },
    { id:'c2', name:'上海智慧交通有限公司', contact:'王芳', phone:'13800002222', email:'wangfang@shtrans.com', status:'活跃', regDate:'2026-02-15', remark:'', deviceCount:2, createdAt:'2026-02-15 11:00' },
    { id:'c3', name:'广州冷链物流公司', contact:'赵强', phone:'13700003333', email:'zhaoq@gzcool.com', status:'活跃', regDate:'2025-12-01', remark:'VIP客户', deviceCount:1, createdAt:'2025-12-01 14:00' },
    { id:'c4', name:'成都物联网科技有限公司', contact:'孙丽', phone:'13600004444', email:'sunli@cdiot.com', status:'非活跃', regDate:'2025-10-10', remark:'合同已到期', deviceCount:1, createdAt:'2025-10-10 10:00' }
  ],
  alerts: [
    { id:'al1', severity:'critical', title:'设备离线告警', desc:'GPS定位终端A03 (SN-2026-0003) 在广州天河区离线超过2小时', status:'active', createdAt:'2026-06-02 08:00' },
    { id:'al2', severity:'warning', title:'SIM卡欠费提醒', desc:'SIM卡 8986012185100000003 余额不足，当前余额 -5.20元', status:'active', createdAt:'2026-06-01 14:00' },
    { id:'al3', severity:'critical', title:'围栏入侵告警', desc:'设备A01已离开北京仓库区电子围栏范围', status:'active', createdAt:'2026-06-03 07:30' },
    { id:'al4', severity:'info', title:'设备维护提醒', desc:'智能控制设备D01 (IC-1000) 维修周期已超过30天', status:'active', createdAt:'2026-05-28 09:00' },
    { id:'al5', severity:'warning', title:'数据上报异常', desc:'温湿度传感器B02 在重庆渝北区数据上报中断', status:'active', createdAt:'2026-06-02 18:00' }
  ],
  activities: [
    { id:'act1', action:'设备上线', detail:'GPS定位终端A01 通过COM4端口上线', time:'2026-06-03 10:35' },
    { id:'act2', action:'SIM充值', detail:'为ICCID 8986012185100000001 充值100元', time:'2026-06-03 09:20' },
    { id:'act3', action:'告警触发', detail:'设备A03离线告警已触发', time:'2026-06-03 08:00' },
    { id:'act4', action:'系统备份', detail:'手动备份所有数据完成', time:'2026-06-02 17:00' },
    { id:'act5', action:'设备新增', detail:'新增资产GPS定位终端A04', time:'2026-06-02 10:00' },
    { id:'act6', action:'围栏更新', detail:'更新电子围栏"北京仓库区"范围', time:'2026-06-01 15:30' }
  ],
  commandHistory: [
    { id:'ch1', time:'2026-06-03 10:30', device:'GPS定位终端A01', comPort:'COM4', command:'AT', result:'成功', response:'OK\r\n+CSQ: 28,99' },
    { id:'ch2', time:'2026-06-03 10:15', device:'GPS定位终端A02', comPort:'COM5', command:'CSQ', result:'成功', response:'+CSQ: 22,99' },
    { id:'ch3', time:'2026-06-02 16:00', device:'GPS定位终端A01', comPort:'COM4', command:'LOCATE', result:'成功', response:'+LOC: 39.9219,116.4435' }
  ],
  settings: {
    platformName: 'Asset Management',
    refreshInterval: 30,
    comDetect: true
  },
  profile: {
    username: 'admin',
    name: '张管理员',
    email: 'admin@assethub.cn',
    phone: '13800138000'
  },
  opLogs: [
    { time:'2026-06-03 10:35', action:'登录', detail:'用户admin登录系统', ip:'192.168.1.100' },
    { time:'2026-06-03 09:20', action:'充值', detail:'为SIM卡s1充值100元', ip:'192.168.1.100' },
    { time:'2026-06-02 17:00', action:'备份', detail:'导出完整数据备份', ip:'192.168.1.100' },
    { time:'2026-06-02 10:00', action:'新增资产', detail:'新增资产a8', ip:'192.168.1.100' },
    { time:'2026-06-01 08:30', action:'登录', detail:'用户admin登录系统', ip:'192.168.1.100' }
  ]
};

// State
let data = {};
let currentPage = 'dashboard';
let chartInstances = {};
let maps = {};
let trackAnimTimer = null;
let trackPathCoords = [];
let trackCurrentIdx = 0;
let trackMarker = null;

// ============================================================
// 2. DATA PERSISTENCE
// ============================================================
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      data = JSON.parse(raw);
      // Merge with defaults for any missing keys
      for (let k in defaultData) {
        if (!(k in data)) data[k] = defaultData[k];
      }
    } else {
      data = JSON.parse(JSON.stringify(defaultData));
      saveData();
    }
  } catch(e) {
    data = JSON.parse(JSON.stringify(defaultData));
    saveData();
    showToast('数据加载失败，已恢复默认数据', 'error');
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    showToast('数据保存失败：存储空间不足', 'error');
  }
}

function addActivity(action, detail) {
  data.activities.unshift({
    id: 'act' + Date.now(),
    action: action,
    detail: detail,
    time: new Date().toLocaleString('zh-CN', {hour12: false})
  });
  if (data.activities.length > 50) data.activities = data.activities.slice(0, 50);
  saveData();
}

function addOpLog(action, detail) {
  data.opLogs.unshift({
    time: new Date().toLocaleString('zh-CN', {hour12: false}),
    action: action,
    detail: detail,
    ip: '192.168.1.100'
  });
  if (data.opLogs.length > 100) data.opLogs = data.opLogs.slice(0, 100);
  saveData();
}

// ============================================================
// 3. UTILITY FUNCTIONS
// ============================================================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function genId(prefix) { return prefix + Date.now() + Math.random().toString(36).substr(2, 4); }
function now() { return new Date().toLocaleString('zh-CN', {hour12: false}); }
function todayStr() { return new Date().toISOString().split('T')[0]; }
function fmtDate(d) { if (!d) return ''; try { return new Date(d).toLocaleDateString('zh-CN'); } catch(e) { return d; } }
function fmtMoney(n) { return '¥' + parseFloat(n || 0).toFixed(2); }

function showToast(msg, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  toast.innerHTML = '<span>' + (icons[type] || '') + '</span> ' + msg;
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3000);
}

function confirmAction(msg, fn) {
  if (confirm(msg)) fn();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function statusBadge(status) {
  var cls = '';
  if (status === '在线' || status === '正常' || status === '活跃') cls = 'online';
  else if (status === '离线' || status === '非活跃' || status === '未激活' || status === 'resolved') cls = 'offline';
  else if (status === '维修中' || status === '欠费' || status === 'warning') cls = 'warning';
  else cls = 'offline';
  return '<span class="status ' + cls + '"><span class="status-dot"></span>' + escapeHtml(status) + '</span>';
}

function alertSeverityLabel(sev) {
  if (sev === 'critical') return '<span style="color:#ef4444;font-weight:600">严重</span>';
  if (sev === 'warning') return '<span style="color:#f59e0b;font-weight:600">警告</span>';
  return '<span style="color:#409EFF;font-weight:600">信息</span>';
}

function destroyChart(key) {
  if (chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key]; }
}

// ============================================================
// 4. NAVIGATION
// ============================================================
var pageTitles = {
  dashboard: '工作台', assets: '资产管理', sim: 'SIM卡管理',
  monitor: '实时监控', fence: '电子围栏', track: '轨迹回放',
  commands: '设备指令', alerts: '告警中心', reports: '报表统计',
  distribution: '设备分布', recharges: '充值管理', customers: '客户管理',
  account: '账户中心', settings: '系统设置'
};

function switchPage(page) {
  currentPage = page;
  // Update nav items
  var items = document.querySelectorAll('.nav-item');
  items.forEach(function(el) {
    el.classList.toggle('active', el.getAttribute('data-page') === page);
  });
  // Update page visibility
  var pages = document.querySelectorAll('.page');
  pages.forEach(function(el) { el.classList.remove('active'); });
  var target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  // Update title
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;
  // Clear search
  document.getElementById('globalSearch').value = '';

  // Render page
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'assets': renderAssetTable(); break;
    case 'sim': renderSimTable(); break;
    case 'monitor': renderMonitor(); break;
    case 'fence': renderFence(); break;
    case 'track': renderTrackPage(); break;
    case 'commands': renderCommandsPage(); break;
    case 'alerts': renderAlerts(); break;
    case 'reports': renderReports(); break;
    case 'distribution': renderDistribution(); break;
    case 'recharges': renderRechargeTable(); break;
    case 'customers': renderCustomerTable(); break;
    case 'account': renderAccount(); break;
    case 'settings': renderSettings(); break;
  }

  // Invalidate map sizes after DOM update
  setTimeout(function() {
    for (var k in maps) {
      if (maps[k]) maps[k].invalidateSize();
    }
  }, 200);
}

// ============================================================
// 5. TOAST (exported to global)
// ============================================================
window.showToast = showToast;

// ============================================================
// 6. DASHBOARD
// ============================================================
function renderDashboard() {
  var assets = data.assets;
  var total = assets.length;
  var online = assets.filter(function(a) { return a.status === '在线'; }).length;
  var offline = assets.filter(function(a) { return a.status === '离线'; }).length;
  var repairing = assets.filter(function(a) { return a.status === '维修中'; }).length;
  var comDevices = assets.filter(function(a) { return a.comPort && a.comPort.trim(); }).length;

  var cardsHtml = [
    { label: '资产总数', num: total, change: '共 ' + total + ' 台设备', cls: 'info' },
    { label: '在线设备', num: online, change: '↑ ' + (total ? Math.round(online/total*100) : 0) + '% 在线率', cls: 'up' },
    { label: '离线设备', num: offline, change: '↓ ' + offline + ' 台需关注', cls: 'down' },
    { label: 'COM端口设备', num: comDevices, change: '共 ' + comDevices + ' 台串口设备', cls: 'info' }
  ].map(function(c) {
    return '<div class="card"><div class="label">' + c.label + '</div><div class="num">' + c.num + '</div><div class="change ' + c.cls + '">' + c.change + '</div></div>';
  }).join('');
  document.getElementById('dashCards').innerHTML = cardsHtml;

  // Trend chart
  destroyChart('trend');
  var range = parseInt(document.getElementById('trendRange').value) || 30;
  var labels = [], trendData = [];
  var now = new Date();
  for (var i = range-1; i >= 0; i--) {
    var d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push((d.getMonth()+1) + '/' + d.getDate());
    trendData.push(Math.floor(Math.random() * 5) + total - 2);
  }
  var ctx = document.getElementById('chartTrend');
  if (ctx) {
    var grad = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(64,158,255,0.3)');
    grad.addColorStop(1, 'rgba(64,158,255,0)');
    chartInstances['trend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '在线设备数', data: trendData, borderColor: '#409EFF', backgroundColor: grad,
          fill: true, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#409EFF', borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#99aabb' } } },
        scales: { x: { ticks: { color: '#6b7d8e', maxTicksLimit: 10 }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' }, min: 0 } }
      }
    });
  }

  // Pie chart
  destroyChart('pie');
  var typeCounts = {};
  assets.forEach(function(a) { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; });
  var types = Object.keys(typeCounts);
  var pieColors = ['#409EFF','#10b987','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
  var ctx2 = document.getElementById('chartPie');
  if (ctx2) {
    chartInstances['pie'] = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: types,
        datasets: [{ data: types.map(function(t) { return typeCounts[t]; }), backgroundColor: pieColors, borderColor: '#1B222D', borderWidth: 2 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#99aabb', padding: 15 } } }
      }
    });
  }

  // Mini map
  renderDashMap();

  // Activity
  var actHtml = data.activities.slice(0, 8).map(function(a) {
    return '<div style="padding:10px 0;border-bottom:1px solid #2A3440;font-size:13px"><div style="color:#e0e6ed">' + escapeHtml(a.action) + '</div><div style="color:#6b7d8e;font-size:12px;margin-top:2px">' + escapeHtml(a.detail) + '</div><div style="color:#556677;font-size:11px;margin-top:2px">' + a.time + '</div></div>';
  }).join('');
  document.getElementById('recentActivity').innerHTML = actHtml || '<div style="color:#6b7d8e;text-align:center;padding:30px">暂无活动记录</div>';

  // Alert badge
  var activeAlerts = data.alerts.filter(function(a) { return a.status === 'active'; }).length;
  var badge = document.getElementById('alertBadge');
  if (activeAlerts > 0) {
    badge.style.display = 'inline';
    badge.textContent = activeAlerts;
  } else {
    badge.style.display = 'none';
  }
}

function renderDashMap() {
  setTimeout(function() {
    var mapEl = document.getElementById('dashMap');
    if (!mapEl) return;
    if (maps['dash']) { maps['dash'].remove(); delete maps['dash']; }
    var m = L.map('dashMap').setView([35.86, 104.19], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM', maxZoom: 18
    }).addTo(m);
    data.assets.forEach(function(a) {
      if (a.lat && a.lng) {
        var color = a.status === '在线' ? '#4ade80' : a.status === '维修中' ? '#f59e0b' : '#ef4444';
        L.circleMarker([parseFloat(a.lat), parseFloat(a.lng)], {
          radius: 7, fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.9
        }).addTo(m).bindPopup('<b>' + escapeHtml(a.name) + '</b><br>状态: ' + a.status + '<br>位置: ' + escapeHtml(a.location));
      }
    });
    maps['dash'] = m;
    setTimeout(function() { m.invalidateSize(); }, 100);
  }, 300);
}

// ============================================================
// 7. ASSET MANAGEMENT
// ============================================================
function renderAssetTable() {
  var search = ($('#assetSearch') && $('#assetSearch').value || '').toLowerCase();
  var statusFilter = ($('#assetStatusFilter') && $('#assetStatusFilter').value || '');
  var typeFilter = ($('#assetTypeFilter') && $('#assetTypeFilter').value || '');

  var filtered = data.assets.filter(function(a) {
    if (search && a.name.toLowerCase().indexOf(search) === -1 && a.sn.toLowerCase().indexOf(search) === -1 && a.model.toLowerCase().indexOf(search) === -1) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    if (typeFilter && a.type !== typeFilter) return false;
    return true;
  });

  var tbody = document.querySelector('#assetTable tbody');
  if (!tbody) return;
  var html = filtered.map(function(a) {
    var comPortHtml = a.comPort ? '<span class="com-port-badge">' + escapeHtml(a.comPort) + '</span>' : '<span style="color:#556677">-</span>';
    return '<tr>' +
      '<td><strong>' + escapeHtml(a.name) + '</strong></td>' +
      '<td>' + escapeHtml(a.model) + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + escapeHtml(a.sn) + '</td>' +
      '<td>' + escapeHtml(a.type) + '</td>' +
      '<td>' + comPortHtml + '</td>' +
      '<td>' + statusBadge(a.status) + '</td>' +
      '<td>' + escapeHtml(a.location) + '</td>' +
      '<td>' + fmtDate(a.purchaseDate) + '</td>' +
      '<td>' +
        '<button class="btn btn-outline btn-sm" onclick="editAsset(\'' + a.id + '\')" title="编辑">✎</button> ' +
        '<button class="btn btn-outline btn-sm" onclick="testComPort(\'' + a.id + '\')" title="测试COM端口" ' + (a.comPort ? '' : 'disabled style="opacity:0.4"') + '>⚡</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteAsset(\'' + a.id + '\')" title="删除">✕</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="9" style="text-align:center;color:#6b7d8e;padding:30px">没有匹配的资产记录</td></tr>';
}

function openAssetModal(id) {
  // Populate device select for sim binding
  populateDeviceSelect();

  var modal = document.getElementById('assetModalOverlay');
  document.getElementById('assetId').value = '';
  document.getElementById('assetName').value = '';
  document.getElementById('assetModel').value = '';
  document.getElementById('assetSn').value = '';
  document.getElementById('assetType').value = '定位终端';
  document.getElementById('assetComPort').value = '';
  document.getElementById('assetStatus').value = '在线';
  document.getElementById('assetLocation').value = '';
  document.getElementById('assetPurchaseDate').value = '';
  document.getElementById('assetLat').value = '';
  document.getElementById('assetLng').value = '';
  document.getElementById('assetRemark').value = '';

  if (id) {
    var a = data.assets.find(function(x) { return x.id === id; });
    if (a) {
      document.getElementById('assetModalTitle').textContent = '编辑资产';
      document.getElementById('assetId').value = a.id;
      document.getElementById('assetName').value = a.name;
      document.getElementById('assetModel').value = a.model;
      document.getElementById('assetSn').value = a.sn;
      document.getElementById('assetType').value = a.type;
      document.getElementById('assetComPort').value = a.comPort || '';
      document.getElementById('assetStatus').value = a.status;
      document.getElementById('assetLocation').value = a.location || '';
      document.getElementById('assetPurchaseDate').value = a.purchaseDate || '';
      document.getElementById('assetLat').value = a.lat || '';
      document.getElementById('assetLng').value = a.lng || '';
      document.getElementById('assetRemark').value = a.remark || '';
    }
  } else {
    document.getElementById('assetModalTitle').textContent = '新增资产';
  }
  modal.style.display = 'flex';
}

function closeAssetModal() {
  document.getElementById('assetModalOverlay').style.display = 'none';
}

function saveAsset() {
  var id = document.getElementById('assetId').value;
  var name = document.getElementById('assetName').value.trim();
  var model = document.getElementById('assetModel').value.trim();
  var sn = document.getElementById('assetSn').value.trim();
  if (!name || !model || !sn) { showToast('请填写设备名称、型号和序列号', 'error'); return; }

  var obj = {
    id: id || genId('a'),
    name: name,
    model: model,
    sn: sn,
    type: document.getElementById('assetType').value,
    comPort: document.getElementById('assetComPort').value.trim(),
    status: document.getElementById('assetStatus').value,
    location: document.getElementById('assetLocation').value.trim(),
    purchaseDate: document.getElementById('assetPurchaseDate').value,
    lat: document.getElementById('assetLat').value.trim(),
    lng: document.getElementById('assetLng').value.trim(),
    remark: document.getElementById('assetRemark').value.trim(),
    createdAt: id ? (data.assets.find(function(x) { return x.id === id; }) || {}).createdAt || now() : now()
  };

  if (id) {
    var idx = data.assets.findIndex(function(x) { return x.id === id; });
    if (idx >= 0) { data.assets[idx] = obj; addActivity('资产编辑', '编辑资产 ' + name); }
  } else {
    data.assets.push(obj);
    addActivity('资产新增', '新增资产 ' + name);
  }
  saveData();
  closeAssetModal();
  renderAssetTable();
  showToast('资产保存成功', 'success');
}

function editAsset(id) { openAssetModal(id); }

function deleteAsset(id) {
  var a = data.assets.find(function(x) { return x.id === id; });
  if (!a) return;
  confirmAction('确定删除资产 "' + a.name + '" 吗？此操作不可恢复。', function() {
    data.assets = data.assets.filter(function(x) { return x.id !== id; });
    // Unbind any SIM
    data.sims.forEach(function(s) { if (s.deviceId === id) s.deviceId = ''; });
    addActivity('资产删除', '删除资产 ' + a.name);
    saveData();
    renderAssetTable();
    showToast('资产已删除', 'success');
  });
}

function batchDeleteAssets() {
  var names = data.assets.map(function(a) { return a.name; }).join('\n');
  confirmAction('确定删除所有资产吗？当前共 ' + data.assets.length + ' 台设备。\n\n此操作不可恢复！', function() {
    data.assets = [];
    data.sims.forEach(function(s) { s.deviceId = ''; });
    addActivity('批量删除', '批量删除所有资产');
    saveData();
    renderAssetTable();
    showToast('所有资产已删除', 'success');
  });
}

function testComPort(id) {
  var a = data.assets.find(function(x) { return x.id === id; });
  if (!a || !a.comPort) { showToast('该设备没有配置COM端口', 'error'); return; }
  showToast('正在测试 ' + a.comPort + ' 端口通讯...', 'info');
  setTimeout(function() {
    var success = Math.random() > 0.3;
    if (success) {
      showToast(a.comPort + ' 端口通讯正常，响应: OK', 'success');
      addActivity('COM测试', a.name + ' ' + a.comPort + ' 端口测试通过');
    } else {
      showToast(a.comPort + ' 端口通讯失败，请检查连接', 'error');
      addActivity('COM测试', a.name + ' ' + a.comPort + ' 端口测试失败');
    }
    saveData();
  }, 1200);
}

// ============================================================
// 8. COM PORT DETECTION
// ============================================================
function detectComPorts() {
  showToast('正在扫描COM端口...', 'info');
  var ports = ['COM4', 'COM5', 'COM7', 'COM8', 'COM13'];
  var results = [];
  setTimeout(function() {
    ports.forEach(function(p) {
      var available = true;
      if (p === 'COM7') available = Math.random() > 0.5;
      results.push({ port: p, available: available });
    });
    var found = results.filter(function(r) { return r.available; });
    var msg = 'COM端口扫描完成：发现 ' + found.length + ' 个可用端口 (' + found.map(function(r) { return r.port; }).join(', ') + ')';
    showToast(msg, 'success');
    addActivity('端口检测', msg);

    // If on commands page, update com port input
    var cmdComPort = document.getElementById('cmdComPort');
    if (cmdComPort && found.length > 0) {
      cmdComPort.value = found[0].port;
    }

    // If on monitor page, update com status
    if (currentPage === 'monitor') renderMonitorComStatus(results);

    // If on assets page, highlight com devices
    if (currentPage === 'assets') {
      renderAssetTable();
      showToast(msg, 'success');
    }
    saveData();
  }, 1500);
}

function renderMonitorComStatus(scanResults) {
  var container = document.getElementById('comStatus');
  if (!container) return;
  var ports = scanResults || [
    { port: 'COM4', available: true },
    { port: 'COM5', available: true },
    { port: 'COM7', available: false },
    { port: 'COM8', available: true },
    { port: 'COM13', available: true }
  ];
  var html = '<div class="stat-mini-row">';
  ports.forEach(function(p) {
    var devices = data.assets.filter(function(a) { return a.comPort === p.port; });
    var cls = p.available ? 'green' : '';
    var label = p.available ? '在线' : '不可用';
    html += '<div class="stat-mini"><div class="stat-mini-label">' + p.port + ' (' + label + ')</div>' +
      '<div class="stat-mini-val ' + cls + '">' + (p.available ? (devices.length + ' 台设备') : '-') + '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ============================================================
// 9. SIM MANAGEMENT
// ============================================================
function populateDeviceSelect() {
  var sel = document.getElementById('simDeviceId');
  if (!sel) return;
  var html = '<option value="">不绑定</option>';
  data.assets.forEach(function(a) {
    html += '<option value="' + a.id + '">' + escapeHtml(a.name) + ' (' + escapeHtml(a.sn) + ')</option>';
  });
  sel.innerHTML = html;
}

function renderSimTable() {
  var search = ($('#simSearch') && $('#simSearch').value || '').toLowerCase();
  var statusFilter = ($('#simStatusFilter') && $('#simStatusFilter').value || '');

  var filtered = data.sims.filter(function(s) {
    if (search && s.iccid.indexOf(search) === -1 && s.imsi.indexOf(search) === -1) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  var tbody = document.querySelector('#simTable tbody');
  if (!tbody) return;
  var html = filtered.map(function(s) {
    var device = data.assets.find(function(a) { return a.id === s.deviceId; });
    var deviceName = device ? escapeHtml(device.name) : '<span style="color:#556677">未绑定</span>';
    var balanceCls = s.balance < 0 ? 'color:#ef4444' : s.balance === 0 ? 'color:#f59e0b' : 'color:#4ade80';
    return '<tr>' +
      '<td style="font-family:monospace;font-size:12px">' + escapeHtml(s.iccid) + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + escapeHtml(s.imsi) + '</td>' +
      '<td>' + escapeHtml(s.operator) + '</td>' +
      '<td>' + escapeHtml(s.plan) + '</td>' +
      '<td><span style="' + balanceCls + ';font-weight:600">' + fmtMoney(s.balance) + '</span></td>' +
      '<td>' + statusBadge(s.status) + '</td>' +
      '<td>' + deviceName + '</td>' +
      '<td>' +
        '<button class="btn btn-outline btn-sm" onclick="editSim(\'' + s.id + '\')">✎</button> ' +
        '<button class="btn btn-outline btn-sm" onclick="bindSimDevice(\'' + s.id + '\')">🔗</button> ' +
        '<button class="btn btn-success btn-sm" onclick="quickRechargeSim(\'' + s.id + '\')">＋充值</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteSim(\'' + s.id + '\')">✕</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;color:#6b7d8e;padding:30px">没有匹配的SIM卡记录</td></tr>';
}

function openSimModal(id) {
  populateDeviceSelect();
  var modal = document.getElementById('simModalOverlay');
  document.getElementById('simId').value = '';
  document.getElementById('simIccid').value = '';
  document.getElementById('simImsi').value = '';
  document.getElementById('simOperator').value = '中国移动';
  document.getElementById('simPlan').value = '';
  document.getElementById('simBalance').value = '';
  document.getElementById('simStatus').value = '正常';
  document.getElementById('simDeviceId').value = '';

  if (id) {
    var s = data.sims.find(function(x) { return x.id === id; });
    if (s) {
      document.getElementById('simModalTitle').textContent = '编辑SIM卡';
      document.getElementById('simId').value = s.id;
      document.getElementById('simIccid').value = s.iccid;
      document.getElementById('simImsi').value = s.imsi;
      document.getElementById('simOperator').value = s.operator;
      document.getElementById('simPlan').value = s.plan;
      document.getElementById('simBalance').value = s.balance;
      document.getElementById('simStatus').value = s.status;
      document.getElementById('simDeviceId').value = s.deviceId || '';
    }
  } else {
    document.getElementById('simModalTitle').textContent = '新增SIM卡';
  }
  modal.style.display = 'flex';
}

function closeSimModal() {
  document.getElementById('simModalOverlay').style.display = 'none';
}

function saveSim() {
  var id = document.getElementById('simId').value;
  var iccid = document.getElementById('simIccid').value.trim();
  if (!iccid) { showToast('请填写ICCID', 'error'); return; }

  var obj = {
    id: id || genId('s'),
    iccid: iccid,
    imsi: document.getElementById('simImsi').value.trim(),
    operator: document.getElementById('simOperator').value,
    plan: document.getElementById('simPlan').value.trim(),
    balance: parseFloat(document.getElementById('simBalance').value) || 0,
    status: document.getElementById('simStatus').value,
    deviceId: document.getElementById('simDeviceId').value,
    createdAt: id ? (data.sims.find(function(x) { return x.id === id; }) || {}).createdAt || now() : now()
  };

  if (id) {
    var idx = data.sims.findIndex(function(x) { return x.id === id; });
    if (idx >= 0) { data.sims[idx] = obj; addActivity('SIM编辑', '编辑SIM卡 ' + iccid); }
  } else {
    data.sims.push(obj);
    addActivity('SIM新增', '新增SIM卡 ' + iccid);
  }
  saveData();
  closeSimModal();
  renderSimTable();
  showToast('SIM卡保存成功', 'success');
}

function editSim(id) { openSimModal(id); }

function deleteSim(id) {
  var s = data.sims.find(function(x) { return x.id === id; });
  if (!s) return;
  confirmAction('确定删除SIM卡 ' + s.iccid + ' 吗？', function() {
    data.sims = data.sims.filter(function(x) { return x.id !== id; });
    addActivity('SIM删除', '删除SIM卡 ' + s.iccid);
    saveData();
    renderSimTable();
    showToast('SIM卡已删除', 'success');
  });
}

function bindSimDevice(simId) {
  var s = data.sims.find(function(x) { return x.id === simId; });
  if (!s) return;
  var currentDevice = s.deviceId ? (data.assets.find(function(a) { return a.id === s.deviceId; }) || {}).name || '无' : '无';
  var deviceNames = data.assets.map(function(a) {
    return a.id + ': ' + a.name + ' (' + a.sn + ')';
  }).join('\n');
  var newDeviceId = prompt('当前绑定设备: ' + currentDevice + '\n\n输入要绑定的设备ID（留空解绑）:\n可用设备:\n' + deviceNames, s.deviceId || '');
  if (newDeviceId === null) return; // cancelled
  if (newDeviceId === '') {
    s.deviceId = '';
    addActivity('SIM解绑', 'SIM卡 ' + s.iccid + ' 已解除设备绑定');
  } else {
    var device = data.assets.find(function(a) { return a.id === newDeviceId.trim(); });
    if (!device) { showToast('设备ID不存在', 'error'); return; }
    s.deviceId = newDeviceId.trim();
    addActivity('SIM绑定', 'SIM卡 ' + s.iccid + ' 绑定到 ' + device.name);
  }
  saveData();
  renderSimTable();
  showToast('绑定更新成功', 'success');
}

function quickRechargeSim(simId) {
  openRechargeModal(simId);
}

function batchRecharge() {
  showToast('请选择要充值的SIM卡，在充值管理页面操作', 'info');
}

// ============================================================
// 10. RECHARGE MANAGEMENT
// ============================================================
function populateRechargeSimSelect() {
  var sel = document.getElementById('rechargeSimId');
  if (!sel) return;
  var html = '';
  data.sims.forEach(function(s) {
    html += '<option value="' + s.id + '">' + escapeHtml(s.iccid) + ' - ' + escapeHtml(s.operator) + ' (' + fmtMoney(s.balance) + ')</option>';
  });
  sel.innerHTML = html;
}

function openRechargeModal(simId) {
  populateRechargeSimSelect();
  document.getElementById('rechargeAmount').value = '';
  document.getElementById('rechargeMethod').value = '支付宝';
  document.getElementById('rechargePlan').value = '';
  document.getElementById('rechargeRemark').value = '';
  if (simId) document.getElementById('rechargeSimId').value = simId;
  document.getElementById('rechargeModalOverlay').style.display = 'flex';
}

function closeRechargeModal() {
  document.getElementById('rechargeModalOverlay').style.display = 'none';
}

function saveRecharge() {
  var simId = document.getElementById('rechargeSimId').value;
  var amount = parseFloat(document.getElementById('rechargeAmount').value);
  if (!simId) { showToast('请选择SIM卡', 'error'); return; }
  if (!amount || amount <= 0) { showToast('请输入有效充值金额', 'error'); return; }

  var rec = {
    id: genId('r'),
    simId: simId,
    amount: amount,
    method: document.getElementById('rechargeMethod').value,
    plan: document.getElementById('rechargePlan').value.trim(),
    remark: document.getElementById('rechargeRemark').value.trim(),
    operator: '张管理员',
    createdAt: now()
  };
  data.recharges.push(rec);

  // Update SIM balance
  var sim = data.sims.find(function(s) { return s.id === simId; });
  if (sim) {
    sim.balance = (parseFloat(sim.balance) || 0) + amount;
    if (sim.status === '欠费' && sim.balance >= 0) sim.status = '正常';
  }

  addActivity('充值', '为SIM卡 ' + (sim ? sim.iccid : simId) + ' 充值 ' + fmtMoney(amount));
  addOpLog('充值', '为SIM卡充值' + fmtMoney(amount));
  saveData();
  closeRechargeModal();
  renderRechargeTable();
  renderSimTable();
  showToast('充值成功！金额: ' + fmtMoney(amount), 'success');
}

function renderRechargeTable() {
  var search = ($('#rechargeSearch') && $('#rechargeSearch').value || '').toLowerCase();
  var methodFilter = ($('#rechargeMethodFilter') && $('#rechargeMethodFilter').value || '');
  var dateStart = ($('#rechargeDateStart') && $('#rechargeDateStart').value || '');
  var dateEnd = ($('#rechargeDateEnd') && $('#rechargeDateEnd').value || '');

  var filtered = data.recharges.slice().reverse().filter(function(r) {
    var sim = data.sims.find(function(s) { return s.id === r.simId; });
    if (search && (r.id.toLowerCase().indexOf(search) === -1) && (!sim || sim.iccid.toLowerCase().indexOf(search) === -1)) return false;
    if (methodFilter && r.method !== methodFilter) return false;
    if (dateStart && r.createdAt < dateStart) return false;
    if (dateEnd && r.createdAt > (dateEnd + 'T23:59:59')) return false;
    return true;
  });

  var tbody = document.querySelector('#rechargeTable tbody');
  if (!tbody) return;
  var html = filtered.map(function(r) {
    var sim = data.sims.find(function(s) { return s.id === r.simId; });
    return '<tr>' +
      '<td style="font-family:monospace;font-size:11px">' + r.id + '</td>' +
      '<td style="font-family:monospace;font-size:12px">' + (sim ? escapeHtml(sim.iccid) : r.simId) + '</td>' +
      '<td><span style="color:#4ade80;font-weight:600">' + fmtMoney(r.amount) + '</span></td>' +
      '<td>' + escapeHtml(r.method) + '</td>' +
      '<td>' + escapeHtml(r.plan || '-') + '</td>' +
      '<td>' + r.createdAt + '</td>' +
      '<td>' + escapeHtml(r.operator) + '</td>' +
      '<td>' + escapeHtml(r.remark || '-') + '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;color:#6b7d8e;padding:30px">没有匹配的充值记录</td></tr>';

  // Also render recharge stats chart
  setTimeout(function() { renderRechargeStatsChart(filtered); }, 100);
}

function renderRechargeStatsChart(records) {
  destroyChart('rechargeStats');
  var monthlyTotals = {};
  var allRecs = records && records.length ? records : data.recharges;
  allRecs.forEach(function(r) {
    var month = r.createdAt.substring(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + r.amount;
  });
  var months = Object.keys(monthlyTotals).sort();
  if (months.length === 0) months = [todayStr().substring(0, 7)];
  var values = months.map(function(m) { return monthlyTotals[m] || 0; });

  var ctx = document.getElementById('chartRechargeStats');
  if (!ctx) return;
  chartInstances['rechargeStats'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{ label: '充值金额(元)', data: values, backgroundColor: '#10b987', borderRadius: 4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#99aabb' } } },
      scales: { x: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e', callback: function(v) { return '¥' + v; } }, grid: { color: '#2A3440' } } }
    }
  });
}

// ============================================================
// 11. MONITOR (REAL-TIME)
// ============================================================
function renderMonitor() {
  renderMonitorMap();
  renderMonitorComStatus();
  renderOnlineTable();
}

function renderMonitorMap() {
  setTimeout(function() {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;
    if (maps['main']) { maps['main'].remove(); delete maps['main']; }
    var m = L.map('map').setView([35.86, 104.19], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM', maxZoom: 18
    }).addTo(m);
    updateMonitorMarkers(m);
    maps['main'] = m;
    setTimeout(function() { m.invalidateSize(); }, 100);
  }, 300);
}

function updateMonitorMarkers(m) {
  data.assets.forEach(function(a) {
    if (a.lat && a.lng) {
      var color = a.status === '在线' ? '#4ade80' : a.status === '维修中' ? '#f59e0b' : '#ef4444';
      var popupContent = '<b>' + escapeHtml(a.name) + '</b><br>型号: ' + escapeHtml(a.model) +
        '<br>序列号: ' + escapeHtml(a.sn) + '<br>状态: ' + a.status +
        '<br>COM端口: ' + (a.comPort || '无') + '<br>位置: ' + escapeHtml(a.location);
      L.circleMarker([parseFloat(a.lat), parseFloat(a.lng)], {
        radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(m).bindPopup(popupContent);
    }
  });
}

function renderOnlineTable() {
  var onlineAssets = data.assets.filter(function(a) { return a.status === '在线'; });
  document.getElementById('onlineCount').textContent = '(' + onlineAssets.length + ' 台在线)';
  var tbody = document.getElementById('onlineTable');
  if (!tbody) return;
  var html = onlineAssets.map(function(a) {
    var signalLevel = a.comPort ? Math.floor(Math.random() * 31).toString() : 'N/A';
    var signalPct = a.comPort ? Math.min(100, Math.round(parseInt(signalLevel || 0) / 31 * 100)) : 0;
    return '<tr>' +
      '<td>' + escapeHtml(a.name) + '</td>' +
      '<td>' + (a.comPort ? '<span class="com-port-badge">' + escapeHtml(a.comPort) + '</span>' : '-') + '</td>' +
      '<td>' + (a.comPort ? signalLevel + ' (' + signalPct + '%)' : '-') + '</td>' +
      '<td>' + now() + '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;color:#6b7d8e;padding:20px">无在线设备</td></tr>';
}

// ============================================================
// 12. GEO-FENCE
// ============================================================
function renderFence() {
  renderFenceMap();
  renderFenceList();
  renderFenceAlarms();
}

function renderFenceMap() {
  setTimeout(function() {
    var mapEl = document.getElementById('fenceMap');
    if (!mapEl) return;
    if (maps['fence']) { maps['fence'].remove(); delete maps['fence']; }
    var m = L.map('fenceMap').setView([33.5, 109.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM', maxZoom: 18
    }).addTo(m);

    data.fences.forEach(function(f) {
      L.circle([parseFloat(f.lat), parseFloat(f.lng)], {
        color: f.color, fillColor: f.color, fillOpacity: 0.15, radius: f.radius
      }).addTo(m).bindPopup('<b>' + escapeHtml(f.name) + '</b><br>半径: ' + f.radius + 'm');
    });

    // Also show asset markers
    data.assets.forEach(function(a) {
      if (a.lat && a.lng) {
        L.circleMarker([parseFloat(a.lat), parseFloat(a.lng)], {
          radius: 5, fillColor: '#409EFF', color: '#fff', weight: 1.5, fillOpacity: 0.8
        }).addTo(m).bindPopup('<b>' + escapeHtml(a.name) + '</b>');
      }
    });

    maps['fence'] = m;
    setTimeout(function() { m.invalidateSize(); }, 100);
  }, 300);
}

function renderFenceList() {
  var container = document.getElementById('fenceList');
  if (!container) return;
  var html = data.fences.map(function(f) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #2A3440">' +
      '<div><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + f.color + ';margin-right:8px"></span>' +
      '<strong>' + escapeHtml(f.name) + '</strong><span style="color:#6b7d8e;font-size:12px;margin-left:8px">半径 ' + f.radius + 'm</span></div>' +
      '<button class="btn btn-danger btn-sm" onclick="deleteFence(\'' + f.id + '\')">✕</button>' +
    '</div>';
  }).join('');
  container.innerHTML = html || '<div style="color:#6b7d8e;text-align:center;padding:20px">暂无围栏</div>';
}

function renderFenceAlarms() {
  var container = document.getElementById('fenceAlarms');
  if (!container) return;
  var fenceAlerts = data.alerts.filter(function(a) { return a.title.indexOf('围栏') >= 0; });
  var html = fenceAlerts.map(function(a) {
    return '<div style="padding:10px 0;border-bottom:1px solid #2A3440;font-size:13px"><strong>' + escapeHtml(a.title) + '</strong><br><span style="color:#6b7d8e">' + escapeHtml(a.desc) + '</span><br><span style="color:#556677;font-size:11px">' + a.createdAt + '</span></div>';
  }).join('');
  container.innerHTML = html || '<div style="color:#6b7d8e;text-align:center;padding:20px">暂无围栏告警记录</div>';
}

function openFenceModal() {
  var name = prompt('围栏名称:');
  if (!name) return;
  var lat = prompt('中心纬度 (默认北京):', '39.9042');
  if (!lat) return;
  var lng = prompt('中心经度 (默认北京):', '116.4074');
  if (!lng) return;
  var radius = parseInt(prompt('半径(米):', '2000'));
  if (!radius || radius <= 0) return;
  var color = prompt('颜色 (#ef4444/#f59e0b/#409EFF/#10b987):', '#409EFF') || '#409EFF';

  var fence = {
    id: genId('f'),
    name: name.trim(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    radius: radius,
    color: color,
    devices: '',
    createdAt: now()
  };
  data.fences.push(fence);
  addActivity('围栏新增', '新建电子围栏 ' + name);
  saveData();
  renderFence();
  showToast('围栏创建成功', 'success');
}

function deleteFence(id) {
  var f = data.fences.find(function(x) { return x.id === id; });
  if (!f) return;
  confirmAction('确定删除围栏 "' + f.name + '" 吗？', function() {
    data.fences = data.fences.filter(function(x) { return x.id !== id; });
    addActivity('围栏删除', '删除围栏 ' + f.name);
    saveData();
    renderFence();
    showToast('围栏已删除', 'success');
  });
}

// ============================================================
// 13. TRACK REPLAY
// ============================================================
function renderTrackPage() {
  var select = document.getElementById('trackDevice');
  var html = '<option value="">选择设备...</option>';
  data.assets.forEach(function(a) {
    if (a.lat && a.lng) {
      html += '<option value="' + a.id + '">' + escapeHtml(a.name) + ' (' + escapeHtml(a.sn) + ')</option>';
    }
  });
  select.innerHTML = html;

  setTimeout(function() {
    var mapEl = document.getElementById('trackMap');
    if (!mapEl) return;
    if (maps['track']) { maps['track'].remove(); delete maps['track']; }
    var m = L.map('trackMap').setView([35.86, 104.19], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM', maxZoom: 18
    }).addTo(m);
    maps['track'] = m;
    setTimeout(function() { m.invalidateSize(); }, 100);
  }, 300);
}

function loadTrackData() {
  var deviceId = document.getElementById('trackDevice').value;
  if (!deviceId) return;
  var device = data.assets.find(function(a) { return a.id === deviceId; });
  if (!device) return;
  var baseLat = parseFloat(device.lat) || 39.9;
  var baseLng = parseFloat(device.lng) || 116.4;

  // Generate simulated track path
  trackPathCoords = [];
  trackCurrentIdx = 0;
  for (var i = 0; i < 50; i++) {
    var lat = baseLat + (Math.random() - 0.5) * 0.05;
    var lng = baseLng + (Math.random() - 0.5) * 0.05;
    trackPathCoords.push([lat, lng]);
  }

  // Draw on map
  var m = maps['track'];
  if (!m) return;
  // Clear previous layers
  m.eachLayer(function(layer) {
    if (layer instanceof L.Polyline || layer instanceof L.CircleMarker || layer instanceof L.Marker) {
      m.removeLayer(layer);
    }
  });

  var polyline = L.polyline(trackPathCoords, { color: '#409EFF', weight: 3, opacity: 0.7 }).addTo(m);
  m.fitBounds(polyline.getBounds(), { padding: [30, 30] });

  document.getElementById('trackInfo').textContent = '轨迹已加载，共 ' + trackPathCoords.length + ' 个轨迹点';
}

function startTrackAnimation() {
  if (trackPathCoords.length === 0) { showToast('请先选择设备并加载轨迹', 'error'); return; }
  if (trackAnimTimer) clearInterval(trackAnimTimer);
  var m = maps['track'];
  if (!m) return;

  // Remove previous marker
  if (trackMarker) { m.removeLayer(trackMarker); }

  trackCurrentIdx = 0;
  trackMarker = L.circleMarker(trackPathCoords[0], {
    radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1
  }).addTo(m);

  var startTime = Date.now();
  trackAnimTimer = setInterval(function() {
    trackCurrentIdx++;
    if (trackCurrentIdx >= trackPathCoords.length) {
      clearInterval(trackAnimTimer);
      trackAnimTimer = null;
      document.getElementById('trackInfo').textContent = '轨迹回放完成';
      showToast('轨迹回放完成', 'success');
      return;
    }
    var pos = trackPathCoords[trackCurrentIdx];
    trackMarker.setLatLng(pos);
    document.getElementById('trackInfo').textContent = '回放中... ' + (trackCurrentIdx + 1) + '/' + trackPathCoords.length +
      ' | 速度: ' + Math.floor(Math.random() * 80 + 20) + ' km/h';
    // Pan map to follow
    m.panTo(pos, { animate: true, duration: 0.3 });
  }, 300);

  // Render speed chart
  renderSpeedChart();
}

function pauseTrackAnimation() {
  if (trackAnimTimer) { clearInterval(trackAnimTimer); trackAnimTimer = null; }
  document.getElementById('trackInfo').textContent = '已暂停';
}

function resetTrackAnimation() {
  if (trackAnimTimer) { clearInterval(trackAnimTimer); trackAnimTimer = null; }
  trackCurrentIdx = 0;
  if (trackMarker && maps['track']) { maps['track'].removeLayer(trackMarker); trackMarker = null; }
  document.getElementById('trackInfo').textContent = '已重置';
  destroyChart('speed');
}

function renderSpeedChart() {
  destroyChart('speed');
  var labels = [];
  var speeds = [];
  for (var i = 0; i < trackPathCoords.length; i++) {
    labels.push('P' + (i + 1));
    speeds.push(Math.floor(Math.random() * 80 + 10));
  }
  var ctx = document.getElementById('chartSpeed');
  if (!ctx) return;
  chartInstances['speed'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{ label: '速度(km/h)', data: speeds, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.3, pointRadius: 1, borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#99aabb' } } },
      scales: { x: { ticks: { color: '#6b7d8e', maxTicksLimit: 15 }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' }, min: 0, max: 120 } }
    }
  });
}

// ============================================================
// 14. DEVICE COMMANDS
// ============================================================
function renderCommandsPage() {
  // Populate device select
  var select = document.getElementById('cmdDevice');
  if (!select) return;
  var html = '<option value="">选择设备...</option>';
  data.assets.forEach(function(a) {
    html += '<option value="' + a.id + '">' + escapeHtml(a.name) + (a.comPort ? ' (' + a.comPort + ')' : '') + '</option>';
  });
  select.innerHTML = html;

  // Render command history
  renderCommandHistory();
}

function renderCommandHistory() {
  var tbody = document.getElementById('cmdHistory');
  if (!tbody) return;
  var html = data.commandHistory.slice().reverse().map(function(h) {
    var resultCls = h.result === '成功' ? 'color:#4ade80' : 'color:#ef4444';
    return '<tr>' +
      '<td>' + h.time + '</td>' +
      '<td>' + escapeHtml(h.device) + '</td>' +
      '<td>' + (h.comPort ? '<span class="com-port-badge">' + escapeHtml(h.comPort) + '</span>' : '-') + '</td>' +
      '<td><strong>' + escapeHtml(h.command) + '</strong></td>' +
      '<td><span style="' + resultCls + '">' + h.result + '</span></td>' +
      '<td style="font-family:monospace;font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + escapeHtml(h.response) + '">' + escapeHtml(h.response) + '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;color:#6b7d8e;padding:20px">暂无指令记录</td></tr>';
}

function sendCommand(cmd) {
  var deviceId = document.getElementById('cmdDevice').value;
  var comPort = document.getElementById('cmdComPort').value.trim();

  if (!deviceId) { showToast('请选择目标设备', 'error'); return; }
  if (!comPort) { showToast('请输入COM端口', 'error'); return; }

  var device = data.assets.find(function(a) { return a.id === deviceId; });
  if (!device) { showToast('设备不存在', 'error'); return; }

  document.getElementById('cmdResult').style.display = 'block';
  document.getElementById('cmdResult').innerHTML = '<span style="color:#f59e0b">正在向 ' + escapeHtml(device.name) + ' (' + comPort + ') 发送 ' + cmd + ' 指令...</span>';

  // Simulated responses
  var responses = {
    'AT': 'OK\r\n+CSQ: 28,99\r\n+CCID: 8986012185100000001\r\nReady',
    'CSQ': '+CSQ: ' + Math.floor(Math.random() * 31) + ',99\r\nOK',
    'LOCATE': '+LOC: ' + (device.lat || '39.9042') + ',' + (device.lng || '116.4074') + '\r\nOK',
    'REBOOT': 'Rebooting...\r\nSystem restart in 3 seconds\r\nOK',
    'STATUS': '+STATUS: ONLINE\r\n+BAT: ' + Math.floor(Math.random() * 100 + 1) + '%\r\n+SIGNAL: ' + Math.floor(Math.random() * 31) + '\r\nOK',
    'RESET': 'Factory reset initiated...\r\nAll settings will be cleared\r\nOK',
    'UPGRADE': 'Firmware upgrade started...\r\nDownloading... 45%\r\nPlease wait...',
    'LOCK': 'Device locked\r\nRemote lock activated\r\nOK'
  };

  setTimeout(function() {
    var success = Math.random() > 0.15;
    var response = success ? (responses[cmd] || 'OK') : 'ERROR: COMMAND_TIMEOUT';
    var result = success ? '成功' : '失败';
    var resultCls = success ? 'color:#4ade80' : 'color:#ef4444';

    document.getElementById('cmdResult').innerHTML = '<div><span style="' + resultCls + ';font-weight:600">' + cmd + ' 指令' + result + '</span></div><div style="margin-top:6px;font-family:monospace;white-space:pre-wrap;background:#12161F;padding:10px;border-radius:4px;font-size:12px">' + escapeHtml(response) + '</div>';

    // Log to history
    data.commandHistory.push({
      id: 'ch' + Date.now(),
      time: now(),
      device: device.name,
      comPort: comPort,
      command: cmd,
      result: result,
      response: response
    });
    if (data.commandHistory.length > 200) data.commandHistory = data.commandHistory.slice(-200);
    addActivity('指令下发', cmd + ' -> ' + device.name + ' (' + comPort + ') ' + result);
    saveData();
    renderCommandHistory();
  }, 1500);
}

// ============================================================
// 15. ALERT CENTER
// ============================================================
function renderAlerts() {
  var sevFilter = ($('#alertSeverityFilter') && $('#alertSeverityFilter').value || '');
  var statusFilter = ($('#alertStatusFilter') && $('#alertStatusFilter').value || '');

  var filtered = data.alerts.slice().reverse().filter(function(a) {
    if (sevFilter && a.severity !== sevFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  var container = document.getElementById('alertList');
  if (!container) return;
  var html = filtered.map(function(a) {
    var sevIcons = { critical: '🔴', warning: '🟡', info: '🔵' };
    var cls = a.severity === 'critical' ? 'critical' : a.severity === 'info' ? 'info' : '';
    var actionsHtml = a.status === 'active' ?
      '<button class="btn btn-outline btn-sm" onclick="resolveAlert(\'' + a.id + '\')">标记已处理</button>' :
      '<span style="color:#4ade80;font-size:12px">✓ 已处理</span>';
    return '<div class="alert-item ' + cls + '">' +
      '<div class="alert-icon">' + (sevIcons[a.severity] || '') + '</div>' +
      '<div class="alert-content">' +
        '<div class="alert-title">' + alertSeverityLabel(a.severity) + ' ' + escapeHtml(a.title) + '</div>' +
        '<div class="alert-desc">' + escapeHtml(a.desc) + '</div>' +
        '<div class="alert-time">' + a.createdAt + '</div>' +
        '<div class="alert-actions">' + actionsHtml + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  container.innerHTML = html || '<div style="text-align:center;color:#6b7d8e;padding:30px">暂无告警记录</div>';
}

function resolveAlert(id) {
  var alert = data.alerts.find(function(a) { return a.id === id; });
  if (!alert) return;
  alert.status = 'resolved';
  addActivity('告警处理', '已处理告警: ' + alert.title);
  saveData();
  renderAlerts();
  showToast('告警已标记为已处理', 'success');
}

function resolveAllAlerts() {
  var active = data.alerts.filter(function(a) { return a.status === 'active'; });
  if (active.length === 0) { showToast('没有未处理的告警', 'info'); return; }
  confirmAction('确定将所有 ' + active.length + ' 条未处理告警标记为已处理吗？', function() {
    data.alerts.forEach(function(a) { if (a.status === 'active') a.status = 'resolved'; });
    addActivity('告警处理', '批量处理 ' + active.length + ' 条告警');
    saveData();
    renderAlerts();
    showToast('已处理 ' + active.length + ' 条告警', 'success');
  });
}

// ============================================================
// 16. STATISTICAL REPORTS
// ============================================================
function renderReports() {
  setTimeout(function() {
    // Monthly bar chart
    destroyChart('monthly');
    var months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    var onlineData = months.map(function() { return Math.floor(Math.random() * 4) + 4; });
    var offlineData = months.map(function() { return Math.floor(Math.random() * 2); });
    var ctx1 = document.getElementById('chartMonthly');
    if (ctx1) {
      chartInstances['monthly'] = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            { label: '在线设备', data: onlineData, backgroundColor: '#4ade80', borderRadius: 3 },
            { label: '离线设备', data: offlineData, backgroundColor: '#ef4444', borderRadius: 3 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#99aabb' } } },
          scales: { x: { stacked: true, ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } }, y: { stacked: true, ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } } }
        }
      });
    }

    // Depreciation line
    destroyChart('depreciation');
    var years = ['2023','2024','2025','2026','2027','2028'];
    var values = [120000, 96000, 72000, 48000, 24000, 0];
    var ctx2 = document.getElementById('chartDepreciation');
    if (ctx2) {
      chartInstances['depreciation'] = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{ label: '资产净值(元)', data: values, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.3, pointRadius: 4, borderWidth: 2 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#99aabb' } } },
          scales: { x: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e', callback: function(v) { return '¥' + v.toLocaleString(); } }, grid: { color: '#2A3440' } } }
        }
      });
    }

    // SIM usage
    destroyChart('simUsage');
    var operators = ['中国移动','中国联通','中国电信'];
    var opCounts = operators.map(function(op) { return data.sims.filter(function(s) { return s.operator === op; }).length; });
    var ctx3 = document.getElementById('chartSimUsage');
    if (ctx3) {
      chartInstances['simUsage'] = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: operators,
          datasets: [{ data: opCounts, backgroundColor: ['#409EFF','#10b987','#f59e0b'], borderColor: '#1B222D', borderWidth: 2 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#99aabb' } } }
        }
      });
    }

    // Procurement pie
    destroyChart('procurement');
    var types = ['定位终端','通讯模块','传感器','控制设备','网关设备'];
    var typeCounts = types.map(function(t) { return data.assets.filter(function(a) { return a.type === t; }).length; });
    var ctx4 = document.getElementById('chartProcurement');
    if (ctx4) {
      chartInstances['procurement'] = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: types,
          datasets: [{ label: '设备数量', data: typeCounts, backgroundColor: ['#409EFF','#10b987','#f59e0b','#ef4444','#8b5cf6'], borderRadius: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          plugins: { legend: { labels: { color: '#99aabb' } } },
          scales: { x: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } } }
        }
      });
    }
  }, 200);
}

// ============================================================
// 17. DEVICE DISTRIBUTION
// ============================================================
function renderDistribution() {
  setTimeout(function() {
    renderDistMap();
    renderProvinceChart();
    renderCityRankTable();
  }, 200);
}

function renderDistMap() {
  var mapEl = document.getElementById('distMap');
  if (!mapEl) return;
  if (maps['dist']) { maps['dist'].remove(); delete maps['dist']; }
  var m = L.map('distMap').setView([35.86, 104.19], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OSM', maxZoom: 18
  }).addTo(m);

  var cityCounts = {};
  data.assets.forEach(function(a) {
    var key = a.location || '未知';
    if (!cityCounts[key]) cityCounts[key] = { count: 0, lat: parseFloat(a.lat), lng: parseFloat(a.lng), online: 0 };
    cityCounts[key].count++;
    if (a.status === '在线') cityCounts[key].online++;
  });

  Object.keys(cityCounts).forEach(function(k) {
    var c = cityCounts[k];
    if (c.lat && c.lng) {
      var radius = Math.min(20, c.count * 6);
      L.circleMarker([c.lat, c.lng], {
        radius: radius, fillColor: '#409EFF', color: '#fff', weight: 1.5, fillOpacity: 0.7
      }).addTo(m).bindPopup('<b>' + escapeHtml(k) + '</b><br>设备数: ' + c.count + '<br>在线: ' + c.online);
    }
  });
  maps['dist'] = m;
  setTimeout(function() { m.invalidateSize(); }, 100);
}

function renderProvinceChart() {
  destroyChart('province');
  var provinces = ['北京','上海','广东','浙江','四川','湖北','江苏','重庆','福建','山东'];
  var counts = provinces.map(function() { return Math.floor(Math.random() * 5) + 1; });
  var ctx = document.getElementById('chartProvince');
  if (ctx) {
    chartInstances['province'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: provinces,
        datasets: [{ label: '设备数量', data: counts, backgroundColor: '#409EFF', borderRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#99aabb' } } },
        scales: { x: { ticks: { color: '#6b7d8e' }, grid: { color: '#2A3440' } }, y: { ticks: { color: '#6b7d8e', stepSize: 1 }, grid: { color: '#2A3440' } } }
      }
    });
  }
}

function renderCityRankTable() {
  var tbody = document.getElementById('cityRankTable');
  if (!tbody) return;
  var cities = [
    { name: '北京', province: '北京', total: 5, online: 4 },
    { name: '上海', province: '上海', total: 3, online: 3 },
    { name: '深圳', province: '广东', total: 3, online: 2 },
    { name: '杭州', province: '浙江', total: 2, online: 2 },
    { name: '成都', province: '四川', total: 2, online: 1 },
    { name: '武汉', province: '湖北', total: 2, online: 2 },
    { name: '南京', province: '江苏', total: 1, online: 1 },
    { name: '广州', province: '广东', total: 1, online: 0 }
  ];
  var html = cities.map(function(c, i) {
    var rate = c.total > 0 ? Math.round(c.online / c.total * 100) : 0;
    var rateCls = rate >= 80 ? 'color:#4ade80' : rate >= 50 ? 'color:#f59e0b' : 'color:#ef4444';
    return '<tr><td>' + (i+1) + '</td><td><strong>' + c.name + '</strong></td><td>' + c.province + '</td><td>' + c.total + '</td><td>' + c.online + '</td><td><span style="' + rateCls + ';font-weight:600">' + rate + '%</span></td></tr>';
  }).join('');
  tbody.innerHTML = html;
}

// ============================================================
// 18. CUSTOMER MANAGEMENT
// ============================================================
function renderCustomerTable() {
  var search = ($('#customerSearch') && $('#customerSearch').value || '').toLowerCase();
  var statusFilter = ($('#customerStatusFilter') && $('#customerStatusFilter').value || '');

  var filtered = data.customers.filter(function(c) {
    if (search && c.name.toLowerCase().indexOf(search) === -1 && c.contact.toLowerCase().indexOf(search) === -1) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  // Update device counts
  filtered.forEach(function(c) {
    c.deviceCount = data.assets.filter(function(a) { return a.remark && a.remark.indexOf(c.name) >= 0; }).length || c.deviceCount;
  });

  var tbody = document.querySelector('#customerTable tbody');
  if (!tbody) return;
  var html = filtered.map(function(c) {
    return '<tr>' +
      '<td><strong>' + escapeHtml(c.name) + '</strong></td>' +
      '<td>' + escapeHtml(c.contact) + '</td>' +
      '<td>' + escapeHtml(c.phone) + '</td>' +
      '<td>' + escapeHtml(c.email) + '</td>' +
      '<td>' + (c.deviceCount || 0) + '</td>' +
      '<td>' + statusBadge(c.status) + '</td>' +
      '<td>' + fmtDate(c.regDate) + '</td>' +
      '<td>' +
        '<button class="btn btn-outline btn-sm" onclick="editCustomer(\'' + c.id + '\')">✎</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteCustomer(\'' + c.id + '\')">✕</button>' +
      '</td>' +
    '</tr>';
  }).join('');
  tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;color:#6b7d8e;padding:30px">没有匹配的客户记录</td></tr>';
}

function openCustomerModal(id) {
  var modal = document.getElementById('customerModalOverlay');
  document.getElementById('customerId').value = '';
  document.getElementById('customerName').value = '';
  document.getElementById('customerContact').value = '';
  document.getElementById('customerPhone').value = '';
  document.getElementById('customerEmail').value = '';
  document.getElementById('customerStatus').value = '活跃';
  document.getElementById('customerRegDate').value = '';
  document.getElementById('customerRemark').value = '';

  if (id) {
    var c = data.customers.find(function(x) { return x.id === id; });
    if (c) {
      document.getElementById('customerModalTitle').textContent = '编辑客户';
      document.getElementById('customerId').value = c.id;
      document.getElementById('customerName').value = c.name;
      document.getElementById('customerContact').value = c.contact || '';
      document.getElementById('customerPhone').value = c.phone || '';
      document.getElementById('customerEmail').value = c.email || '';
      document.getElementById('customerStatus').value = c.status;
      document.getElementById('customerRegDate').value = c.regDate || '';
      document.getElementById('customerRemark').value = c.remark || '';
    }
  } else {
    document.getElementById('customerModalTitle').textContent = '新增客户';
  }
  modal.style.display = 'flex';
}

function closeCustomerModal() {
  document.getElementById('customerModalOverlay').style.display = 'none';
}

function saveCustomer() {
  var id = document.getElementById('customerId').value;
  var name = document.getElementById('customerName').value.trim();
  if (!name) { showToast('请填写客户名称', 'error'); return; }

  var obj = {
    id: id || genId('c'),
    name: name,
    contact: document.getElementById('customerContact').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    email: document.getElementById('customerEmail').value.trim(),
    status: document.getElementById('customerStatus').value,
    regDate: document.getElementById('customerRegDate').value,
    remark: document.getElementById('customerRemark').value.trim(),
    deviceCount: id ? (data.customers.find(function(x) { return x.id === id; }) || {}).deviceCount || 0 : 0,
    createdAt: id ? (data.customers.find(function(x) { return x.id === id; }) || {}).createdAt || now() : now()
  };

  if (id) {
    var idx = data.customers.findIndex(function(x) { return x.id === id; });
    if (idx >= 0) { data.customers[idx] = obj; addActivity('客户编辑', '编辑客户 ' + name); }
  } else {
    data.customers.push(obj);
    addActivity('客户新增', '新增客户 ' + name);
  }
  saveData();
  closeCustomerModal();
  renderCustomerTable();
  showToast('客户保存成功', 'success');
}

function editCustomer(id) { openCustomerModal(id); }

function deleteCustomer(id) {
  var c = data.customers.find(function(x) { return x.id === id; });
  if (!c) return;
  confirmAction('确定删除客户 "' + c.name + '" 吗？', function() {
    data.customers = data.customers.filter(function(x) { return x.id !== id; });
    addActivity('客户删除', '删除客户 ' + c.name);
    saveData();
    renderCustomerTable();
    showToast('客户已删除', 'success');
  });
}

// ============================================================
// 19. ACCOUNT CENTER
// ============================================================
function renderAccount() {
  document.getElementById('acctUser').value = data.profile.username;
  document.getElementById('acctName').value = data.profile.name;
  document.getElementById('acctEmail').value = data.profile.email;
  document.getElementById('acctPhone').value = data.profile.phone;

  // Operational logs
  var tbody = document.getElementById('opLogs');
  if (tbody) {
    var html = data.opLogs.slice(0, 20).map(function(l) {
      return '<tr><td>' + l.time + '</td><td>' + escapeHtml(l.action) + '</td><td>' + escapeHtml(l.detail) + '</td><td>' + l.ip + '</td></tr>';
    }).join('');
    tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;color:#6b7d8e;padding:20px">暂无操作日志</td></tr>';
  }
}

function saveProfile() {
  data.profile.username = document.getElementById('acctUser').value.trim();
  data.profile.name = document.getElementById('acctName').value.trim();
  data.profile.email = document.getElementById('acctEmail').value.trim();
  data.profile.phone = document.getElementById('acctPhone').value.trim();
  saveData();
  addOpLog('资料修改', '更新个人信息');
  showToast('个人信息已保存', 'success');
}

function changePassword() {
  var oldPwd = document.getElementById('oldPwd').value;
  var newPwd = document.getElementById('newPwd').value;
  var confirmPwd = document.getElementById('confirmPwd').value;
  if (!oldPwd || !newPwd) { showToast('请填写密码', 'error'); return; }
  if (newPwd !== confirmPwd) { showToast('两次密码不一致', 'error'); return; }
  if (newPwd.length < 6) { showToast('密码长度不能少于6位', 'error'); return; }
  document.getElementById('oldPwd').value = '';
  document.getElementById('newPwd').value = '';
  document.getElementById('confirmPwd').value = '';
  addOpLog('密码修改', '修改登录密码');
  saveData();
  showToast('密码修改成功', 'success');
}

// ============================================================
// 20. SYSTEM SETTINGS
// ============================================================
function renderSettings() {
  document.getElementById('setPlatformName').value = data.settings.platformName || 'Asset Management';
  document.getElementById('setRefreshInterval').value = data.settings.refreshInterval || 30;
  document.getElementById('setComDetect').checked = data.settings.comDetect !== false;
}

function saveSettings() {
  data.settings.platformName = document.getElementById('setPlatformName').value.trim() || 'Asset Management';
  data.settings.refreshInterval = parseInt(document.getElementById('setRefreshInterval').value) || 30;
  data.settings.comDetect = document.getElementById('setComDetect').checked;

  // Update platform title
  document.title = data.settings.platformName + ' - 智能资产管理平台';
  addOpLog('设置修改', '更新系统设置');
  saveData();
  showToast('系统设置已保存', 'success');
}

// ============================================================
// 21. GLOBAL SEARCH
// ============================================================
function handleGlobalSearch(e) {
  if (e.key !== 'Enter') return;
  var query = e.target.value.trim().toLowerCase();
  if (!query) { showToast('请输入搜索关键词', 'info'); return; }

  var results = [];
  // Search assets
  data.assets.forEach(function(a) {
    if (a.name.toLowerCase().indexOf(query) >= 0 || a.sn.toLowerCase().indexOf(query) >= 0 || a.model.toLowerCase().indexOf(query) >= 0) {
      results.push({ type: '资产', text: a.name + ' (' + a.sn + ')', page: 'assets' });
    }
  });
  // Search sims
  data.sims.forEach(function(s) {
    if (s.iccid.indexOf(query) >= 0) {
      results.push({ type: 'SIM卡', text: s.iccid, page: 'sim' });
    }
  });
  // Search customers
  data.customers.forEach(function(c) {
    if (c.name.toLowerCase().indexOf(query) >= 0) {
      results.push({ type: '客户', text: c.name, page: 'customers' });
    }
  });

  if (results.length === 0) {
    showToast('未找到匹配结果', 'info');
  } else if (results.length === 1) {
    switchPage(results[0].page);
    showToast('已跳转到: ' + results[0].text, 'success');
  } else {
    var msg = '找到 ' + results.length + ' 个结果:\n' + results.slice(0, 5).map(function(r) { return '[' + r.type + '] ' + r.text; }).join('\n');
    if (results.length > 5) msg += '\n...还有 ' + (results.length - 5) + ' 个结果';
    alert(msg);
    // Navigate to first result's page
    switchPage(results[0].page);
  }
}

// ============================================================
// 22. EXCEL EXPORT
// ============================================================
function exportExcel() {
  var csv = '﻿'; // BOM for Chinese
  csv += '设备名称,型号,序列号,类型,COM端口,状态,位置,采购日期,备注\r\n';
  data.assets.forEach(function(a) {
    csv += [a.name, a.model, a.sn, a.type, a.comPort || '', a.status, a.location || '', a.purchaseDate || '', a.remark || ''].map(function(v) { return '"' + String(v).replace(/"/g,'""') + '"'; }).join(',') + '\r\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'assets_export_' + todayStr() + '.csv';
  link.click();
  URL.revokeObjectURL(url);
  addOpLog('导出', '导出资产数据到CSV');
  saveData();
  showToast('资产数据已导出为CSV文件', 'success');
}

// ============================================================
// 23. JSON BACKUP / RESTORE
// ============================================================
function backupData() {
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = 'assethub_backup_' + todayStr() + '.json';
  link.click();
  URL.revokeObjectURL(url);
  addOpLog('备份', '导出JSON备份文件');
  saveData();
  showToast('数据备份已导出', 'success');
}

function restoreData(input) {
  var file = input.files[0];
  if (!file) return;
  confirmAction('确定要恢复数据吗？当前所有数据将被覆盖！', function() {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var restored = JSON.parse(e.target.result);
        // Validate structure
        if (!restored.assets || !restored.sims) {
          showToast('备份文件格式无效', 'error');
          return;
        }
        data = restored;
        saveData();
        addOpLog('恢复', '从JSON备份文件恢复数据');
        saveData();
        showToast('数据恢复成功！正在刷新页面...', 'success');
        setTimeout(function() { location.reload(); }, 1000);
      } catch(err) {
        showToast('备份文件解析失败: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });
  input.value = '';
}

// ============================================================
// 24. INITIALIZATION
// ============================================================
function init() {
  loadData();
  // Apply settings
  document.title = (data.settings.platformName || 'Asset Management') + ' - 智能资产管理平台';

  // Render initial page
  switchPage('dashboard');

  // Periodic refresh
  if (data.settings.refreshInterval > 0) {
    setInterval(function() {
      if (currentPage === 'monitor') renderOnlineTable();
    }, data.settings.refreshInterval * 1000);
  }

  // Add modal overlay click-to-close
  document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });
  });
}

// Start app
document.addEventListener('DOMContentLoaded', init);

// Expose functions to global scope for onclick handlers in HTML
window.switchPage = switchPage;
window.openAssetModal = openAssetModal;
window.closeAssetModal = closeAssetModal;
window.saveAsset = saveAsset;
window.editAsset = editAsset;
window.deleteAsset = deleteAsset;
window.batchDeleteAssets = batchDeleteAssets;
window.testComPort = testComPort;
window.detectComPorts = detectComPorts;
window.openSimModal = openSimModal;
window.closeSimModal = closeSimModal;
window.saveSim = saveSim;
window.editSim = editSim;
window.deleteSim = deleteSim;
window.bindSimDevice = bindSimDevice;
window.quickRechargeSim = quickRechargeSim;
window.batchRecharge = batchRecharge;
window.openRechargeModal = openRechargeModal;
window.closeRechargeModal = closeRechargeModal;
window.saveRecharge = saveRecharge;
window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.saveCustomer = saveCustomer;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.openFenceModal = openFenceModal;
window.deleteFence = deleteFence;
window.startTrackAnimation = startTrackAnimation;
window.pauseTrackAnimation = pauseTrackAnimation;
window.resetTrackAnimation = resetTrackAnimation;
window.loadTrackData = loadTrackData;
window.sendCommand = sendCommand;
window.resolveAlert = resolveAlert;
window.resolveAllAlerts = resolveAllAlerts;
window.saveProfile = saveProfile;
window.changePassword = changePassword;
window.saveSettings = saveSettings;
window.backupData = backupData;
window.restoreData = restoreData;
window.exportExcel = exportExcel;
window.handleGlobalSearch = handleGlobalSearch;
window.renderDashboard = renderDashboard;
window.renderAssetTable = renderAssetTable;
window.renderSimTable = renderSimTable;
window.renderRechargeTable = renderRechargeTable;
window.renderCustomerTable = renderCustomerTable;
window.renderAlerts = renderAlerts;

})();
