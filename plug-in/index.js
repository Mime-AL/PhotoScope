const { entrypoints } = require("uxp");
const host = require('uxp').host;
const app = require("photoshop").app;
const fs = require('fs');
const fs2 = require('uxp').storage.localFileSystem;

let initialized = false;
entrypoints.setup({
  panels: {
    scope: {
      show() {
        // panel is already populated from the HTML; do nothing
      },
      menuItems: [
        {id: "connect", label: "Connect"}
      ],
      invokeMenu(id) {
        handleFlyout(id);
      }
    }
  }
});

let scope = null;
let receivedMessages = [];
let systemENV = host.systemEnvironment;
var bitmap = null;
var doc = null;
var gpuScriptPath = "plugin-data:/GPU.bat";
var cpuScriptPath = "plugin-data:/CPU.bat";

function checkWebSocketServer(url, onResult) {
  let ws;
  try {
    ws = new WebSocket(url);
  } catch (e) {
    onResult(false, e);
    return;
  }
  let isOpen = false;
  ws.onopen = function() {
    isOpen = true;
    ws.close();
    onResult(true);
  };
  ws.onerror = function(err) {
    if (!isOpen) onResult(false, err);
  };
}

// 获取安装目录
async function getPluginPath() 
{
  let path = await fs2.getPluginFolder();
  return path.nativePath;
}

getPluginPath().then(nativepath => {
  console.log(nativepath);
  //制作GPU和CPU python启动脚本
  console.log("ScriptPath:", nativepath);
  let gpuScript = localpython + " " + nativepath + "GPU_Scope.py"
  console.log("gpuScript:", gpuScript);
  let cpuScript = localpython + " " + nativepath + "CPU_Scope.py"
  try
  {
    fs.writeFileSync(gpuScriptPath, gpuScript, { encoding: "utf-8" })
  } catch (error)
  {
    console.error("Failed to write GPU script:", error);
  }
  try
  {
    fs.writeFileSync(cpuScriptPath, cpuScript, { encoding: "utf-8" })
  } catch (error)
  {
    console.error("Failed to write CPU script:", error);
  }
});

// 获取本地存储的设置，如果没有则使用默认值
var websocket_url = window.localStorage.getItem("websocket_url")
if (websocket_url == null) {
  websocket_url = "ws://localhost:19789";
  window.localStorage.setItem("websocket_url", websocket_url);
}

var useGPU = window.localStorage.getItem("useGPU")
if (useGPU == null) {
  useGPU = "false";
  window.localStorage.setItem("useGPU", useGPU);
}

var gain = window.localStorage.getItem("gain")
if (gain == null) {
  gain = "1.0";
  window.localStorage.setItem("gain", gain);
}

var scale = window.localStorage.getItem("scale")
if (scale == null) {
  scale = "1.0";
  window.localStorage.setItem("scale", scale);
}

var samplerate = window.localStorage.getItem("samplerate")
if (samplerate == null) {
  samplerate = "10";
  window.localStorage.setItem("samplerate", samplerate);
}

var localServer = window.localStorage.getItem("localServer")
if (localServer == null) {
  localServer = "false";
  window.localStorage.setItem("localServer", localServer);
}

var localpython = window.localStorage.getItem("localpython")
if (localpython == null) {
  localpython = "conda run -n cupy python";
  window.localStorage.setItem("localpython", localpython);
}

document.getElementById('server-checkbox').checked = (localServer === "true");
document.getElementById('url').value = websocket_url;
document.getElementById('device-checkbox').checked = (useGPU === "true");
document.getElementById('gain').value = gain;
document.getElementById('scale').value = scale;
document.getElementById('samprate').value = samplerate;
document.getElementById('python').value = localpython;

log = msg => {
  output.textContent = msg;
}

//使用定时器每秒n次传输图像到ws服务器并获取结果
let intervalId = null;

function startIntercalTask() 
{
  if (intervalId) clearInterval(intervalId);

  const rate = Number(samplerate); // samplerate 为每秒执行次数
  if (isNaN(rate) || rate <= 0) return;
  const interval = 1000 / rate;

  intervalId = setInterval( async () => {
    // 这里写你每次要执行的操作
    doc = app.activeDocument;
    //console.log(doc);
    if (doc !== null)
    {
      console.log("doc opened");
      const doc = app.activeDocument;
      const width = doc.width;      // 单位：像素
      const height = doc.height;    // 单位：像素
      const resolution = doc.resolution; // 单位：像素/英寸
      try
      {
        //bitmap = await doc.capture();
      } catch (error) 
      {
        //console.error("fail to get bit map :", error);
        return;
      }
    }else {
      console.log("no doc opened");
    }
  }, interval);
}

startIntercalTask();

//响应保存按键
const saveButton = document.getElementById('save-settings');
saveButton.addEventListener('click', function() {
  // 这里写点击后的处理逻辑
  let localServer = document.getElementById('server-checkbox').checked;
  let useGPU = document.getElementById('device-checkbox').checked;
  let now_websocket_url = document.getElementById('url').value;
  let now_gain = document.getElementById('gain').value;
  let now_scale = document.getElementById('scale').value;
  let now_samplerate = document.getElementById('samprate').value;
  // 验证URL格式
  try  
  {
    new URL(now_websocket_url); 
    websocket_url = now_websocket_url;
  } catch (error) 
  {
    document.getElementById('url').value = websocket_url; // 恢复到之前的值
    console.error("无效的WebSocket URL:", now_websocket_url);
  }
  // 检查gain
  if (!(Number(now_gain) == null || Number(now_gain) <= 0))
  {
    gain = now_gain;
  }else {
    console.error("无效的增益值:", now_gain);
    document.getElementById('gain').value = gain;
  }
  // 检查scale
  if (!(Number(now_scale) == null || Number(now_scale) <= 0))
  {
    if (Number(now_scale) > 1) { 
      now_scale = "1"; // 限制最大值为1
      document.getElementById('scale').value = now_scale;
    }
    scale = now_scale;
  }else {
    console.error("无效的缩放值:", now_scale);
    document.getElementById('scale').value = scale;
  }
  // 检查采样率
  if (!(Number(now_samplerate) == null || Number(now_samplerate) <= 0))
  {
    if (Number(now_samplerate) > 30) { 
      now_samplerate = "30"; // 最大刷新率为30
      document.getElementById('samprate').value = now_samplerate;
    }
    samplerate = now_samplerate;
  }else {
    console.error("无效的采样率值:", now_samplerate);
    document.getElementById('samprate').value = samplerate;
  }
  window.localStorage.setItem("websocket_url", websocket_url);
  window.localStorage.setItem("useGPU", useGPU);
  window.localStorage.setItem("gain", gain);
  window.localStorage.setItem("scale", scale);
  window.localStorage.setItem("samplerate", samplerate);
  window.localStorage.setItem("localServer", localServer);
  startIntercalTask();
  console.log('保存设置:', websocket_url, useGPU, gain, scale, samplerate, localServer);
  // 这里可以添加保存设置的逻辑，比如发送到服务器或存储到本地
});

//响应校验按钮
const validateButton = document.getElementById('validate');
validateButton.addEventListener('click', function() {
checkWebSocketServer("ws://localhost:19789", function(isAlive, err) {
  if (isAlive) {
    console.log("WebSocket服务器可用");
  } else {
    console.log("WebSocket服务器不可用", err);
  }
});
});

/* connectButton.onclick = () => {
  if (websocket) {
    log("Already connected; disconnect first.");
    return;
  }
  receivedMessages = [];
  websocket = new WebSocket(url.value, "test-protocol");
  websocket.onopen = evt => {
    state.className="positive";
    state.textContent = "Connected";
    const menuItem = entrypoints.getPanel("websocket").menuItems.getItemAt(0);
    menuItem.label = "Disconnect";
    log("Connected");
  }
  websocket.onclose = evt => {
    state.className="negative";
    state.textContent = "Disconnected";
    const menuItem = entrypoints.getPanel("websocket").menuItems.getItemAt(0);
    menuItem.label = "Connect";
    log("Disconnected");
    websocket = null;
  }
  websocket.onmessage = evt => {
    const [cmd, ...args] = evt.data.split("=");
    receivedMessages.push(evt.data);
    switch (cmd) {
      case "text":
        log(args.join("="));
        break;
      case "err":
        log(`Error from server: ${args.join("=")}`)
        break;
      default:
        log(`Don't know how to ${cmd}`);
    }
  }
  websocket.onerror = evt => {
    log(`Error: ${evt.data}`);
  }

} 

disconnectButton.onclick = () => {
  if (scope) {
    Scope.close();
  } else {
    log("Already disconnected.");
  }
  scope = null;
}

validateButton.onclick = () => {
  if (!scope) {
    log("Connect first!");
    return;
  }
  scope.send(`validate=${receivedMessages.join("\n")}`)
}

messageText.addEventListener("keydown", evt => {
  if (evt.key === "Enter") {
    if (!scope) {
      log("Connect first!");
      return;
    }
    Scope.send(messageText.value);
    messageText.value = "";
  }
});

randCheckbox.onclick = evt => {
  if (!scope) {
    log("Connect first!");
    return;
  }
  const value = evt.target.checked ? "on" : "off";
  Scope.send(`rand=${value}`);
}

fastCheckbox.onclick = evt => {
  if (!scope) {
    log("Connect first!");
    return;
  }
  const value = evt.target.checked ? "on" : "off";
  Scope.send(`fast=${value}`);
}

function handleFlyout(id) {
  switch (id) {
    case "connect": {
      if (Scope) {
        scope.close();
      } else {
        connectButton.onclick();
      }
    }
  }
} */
