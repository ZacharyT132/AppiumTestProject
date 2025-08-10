// UI state management
const state = {
  serverRunning: false,
  devices: []
};

// DOM elements
const els = {
  port: document.getElementById('port'),
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  devices: document.getElementById('devices'),
  refreshBtn: document.getElementById('refreshBtn'),
  platform: document.getElementById('platform'),
  capabilities: document.getElementById('capabilities'),
  sessionBtn: document.getElementById('sessionBtn'),
  status: document.getElementById('status')
};

// Update UI based on server state
function updateUI() {
  els.startBtn.disabled = state.serverRunning;
  els.stopBtn.disabled = !state.serverRunning;
  els.sessionBtn.disabled = !state.serverRunning;
}

// Log message to status
function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
  els.status.innerHTML += `<div class="${className}">[${time}] ${msg}</div>`;
  els.status.scrollTop = els.status.scrollHeight;
}

// Start server
els.startBtn.addEventListener('click', async () => {
  const port = parseInt(els.port.value);
  log(`Starting server on port ${port}...`);
  
  const result = await window.appiumAPI.startServer(port);
  if (result.success) {
    state.serverRunning = true;
    log(result.message, 'success');
  } else {
    log(result.message, 'error');
  }
  updateUI();
});

// Stop server
els.stopBtn.addEventListener('click', async () => {
  log('Stopping server...');
  
  const result = await window.appiumAPI.stopServer();
  if (result.success) {
    state.serverRunning = false;
    log(result.message, 'success');
  } else {
    log(result.message, 'error');
  }
  updateUI();
});

// Create session
els.sessionBtn.addEventListener('click', async () => {
  try {
    const caps = JSON.parse(els.capabilities.value);
    log('Creating session...');
    
    const result = await window.appiumAPI.createSession(caps);
    if (result.success) {
      log(`Session created: ${result.sessionId}`, 'success');
    } else {
      log(result.message, 'error');
    }
  } catch (e) {
    log(`Invalid JSON: ${e.message}`, 'error');
  }
});

// Refresh devices
async function refreshDevices() {
  log('Scanning for devices...');
  const devices = await window.appiumAPI.getDevices();
  state.devices = [...devices.android, ...devices.ios];
  
  els.devices.innerHTML = '';
  if (state.devices.length === 0) {
    els.devices.innerHTML = '<option value="">No devices detected</option>';
  } else {
    state.devices.forEach(device => {
      const opt = document.createElement('option');
      opt.value = device.id;
      opt.textContent = `${device.name} (${device.type})`;
      els.devices.appendChild(opt);
    });
  }
  
  log(`Found ${state.devices.length} device(s)`, 'success');
}

// Device selection updates capabilities
els.devices.addEventListener('change', () => {
  const deviceId = els.devices.value;
  const device = state.devices.find(d => d.id === deviceId);
  if (!device) return;
  
  const caps = JSON.parse(els.capabilities.value);
  if (device.type === 'android') {
    caps.platformName = 'Android';
    caps['appium:deviceName'] = device.id;
    caps['appium:automationName'] = 'UiAutomator2';
  } else {
    caps.platformName = 'iOS';
    caps['appium:deviceName'] = device.name;
    caps['appium:udid'] = device.id;
    caps['appium:automationName'] = 'XCUITest';
  }
  els.capabilities.value = JSON.stringify(caps, null, 2);
});

// Platform change updates template
els.platform.addEventListener('change', () => {
  const template = els.platform.value === 'android' ? {
    platformName: 'Android',
    'appium:platformVersion': '13',
    'appium:deviceName': 'emulator-5554',
    'appium:automationName': 'UiAutomator2',
    'appium:app': '/path/to/app.apk'
  } : {
    platformName: 'iOS',
    'appium:platformVersion': '16.0',
    'appium:deviceName': 'iPhone 14',
    'appium:automationName': 'XCUITest',
    'appium:app': '/path/to/app.ipa'
  };
  els.capabilities.value = JSON.stringify(template, null, 2);
});

// Refresh button
els.refreshBtn.addEventListener('click', refreshDevices);

// Initial setup
updateUI();
refreshDevices();
