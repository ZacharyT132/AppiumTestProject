const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sessionBtn = document.getElementById('sessionBtn');
const statusDiv = document.getElementById('status');
const portInput = document.getElementById('port');
const platformSelect = document.getElementById('platform');
const capabilitiesTextarea = document.getElementById('capabilities');
const devicesSelect = document.getElementById('devices');
const refreshBtn = document.getElementById('refreshBtn');

let detectedDevices = { android: [], ios: [] };

function log(message, isError = false) {
  const timestamp = new Date().toLocaleTimeString();
  const className = isError ? 'error' : 'success';
  statusDiv.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
  statusDiv.scrollTop = statusDiv.scrollHeight;
}

startBtn.addEventListener('click', async () => {
  const port = parseInt(portInput.value);
  startBtn.disabled = true;
  
  log('Starting Appium server...');
  const result = await window.appiumAPI.startServer(port);
  
  if (result.success) {
    log(result.message);
    stopBtn.disabled = false;
    sessionBtn.disabled = false;
  } else {
    log(result.message, true);
    startBtn.disabled = false;
  }
});

async function refreshDevices() {
  log('Detecting devices...');
  detectedDevices = await window.appiumAPI.getDevices();
  
  devicesSelect.innerHTML = '<option value="">Select a device</option>';
  const allDevices = [...detectedDevices.android, ...detectedDevices.ios];
  
  if (allDevices.length === 0) {
    devicesSelect.innerHTML = '<option value="">No devices detected</option>';
    log('No devices found', true);
  } else {
    allDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.id;
      option.textContent = `${device.name} (${device.type})`;
      option.dataset.type = device.type;
      devicesSelect.appendChild(option);
    });
    log(`Found ${allDevices.length} device(s)`);
  }
}

refreshBtn.addEventListener('click', refreshDevices);

devicesSelect.addEventListener('change', () => {
  const selectedOption = devicesSelect.options[devicesSelect.selectedIndex];
  if (!selectedOption.value) return;
  
  const deviceType = selectedOption.dataset.type;
  const deviceId = selectedOption.value;
  const deviceName = selectedOption.textContent.split(' (')[0];
  
  platformSelect.value = deviceType;
  
  const capabilities = deviceType === 'android' ? {
    platformName: "Android",
    "appium:deviceName": deviceId,
    "appium:automationName": "UiAutomator2"
  } : {
    platformName: "iOS",
    "appium:deviceName": deviceName,
    "appium:udid": deviceId,
    "appium:automationName": "XCUITest"
  };
  
  capabilitiesTextarea.value = JSON.stringify(capabilities, null, 2);
});

// Auto-detect devices on startup
refreshDevices();

stopBtn.addEventListener('click', async () => {
  stopBtn.disabled = true;
  
  log('Stopping Appium server...');
  const result = await window.appiumAPI.stopServer();
  
  if (result.success) {
    log(result.message);
    startBtn.disabled = false;
    sessionBtn.disabled = true;
  } else {
    log(result.message, true);
  }
  stopBtn.disabled = false;
});

async function refreshDevices() {
  log('Detecting devices...');
  detectedDevices = await window.appiumAPI.getDevices();
  
  devicesSelect.innerHTML = '<option value="">Select a device</option>';
  const allDevices = [...detectedDevices.android, ...detectedDevices.ios];
  
  if (allDevices.length === 0) {
    devicesSelect.innerHTML = '<option value="">No devices detected</option>';
    log('No devices found', true);
  } else {
    allDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.id;
      option.textContent = `${device.name} (${device.type})`;
      option.dataset.type = device.type;
      devicesSelect.appendChild(option);
    });
    log(`Found ${allDevices.length} device(s)`);
  }
}

refreshBtn.addEventListener('click', refreshDevices);

devicesSelect.addEventListener('change', () => {
  const selectedOption = devicesSelect.options[devicesSelect.selectedIndex];
  if (!selectedOption.value) return;
  
  const deviceType = selectedOption.dataset.type;
  const deviceId = selectedOption.value;
  const deviceName = selectedOption.textContent.split(' (')[0];
  
  platformSelect.value = deviceType;
  
  const capabilities = deviceType === 'android' ? {
    platformName: "Android",
    "appium:deviceName": deviceId,
    "appium:automationName": "UiAutomator2"
  } : {
    platformName: "iOS",
    "appium:deviceName": deviceName,
    "appium:udid": deviceId,
    "appium:automationName": "XCUITest"
  };
  
  capabilitiesTextarea.value = JSON.stringify(capabilities, null, 2);
});

// Auto-detect devices on startup
refreshDevices();

sessionBtn.addEventListener('click', async () => {
  try {
    const capabilities = JSON.parse(capabilitiesTextarea.value);
    sessionBtn.disabled = true;
    
    log('Creating session...');
    const result = await window.appiumAPI.createSession(capabilities);
    
    if (result.success) {
      log(`Session created: ${result.sessionId}`);
    } else {
      log(result.message, true);
    }
  } catch (error) {
    log(`Invalid JSON: ${error.message}`, true);
  } finally {
    sessionBtn.disabled = false;
  }
});

async function refreshDevices() {
  log('Detecting devices...');
  detectedDevices = await window.appiumAPI.getDevices();
  
  devicesSelect.innerHTML = '<option value="">Select a device</option>';
  const allDevices = [...detectedDevices.android, ...detectedDevices.ios];
  
  if (allDevices.length === 0) {
    devicesSelect.innerHTML = '<option value="">No devices detected</option>';
    log('No devices found', true);
  } else {
    allDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.id;
      option.textContent = `${device.name} (${device.type})`;
      option.dataset.type = device.type;
      devicesSelect.appendChild(option);
    });
    log(`Found ${allDevices.length} device(s)`);
  }
}

refreshBtn.addEventListener('click', refreshDevices);

devicesSelect.addEventListener('change', () => {
  const selectedOption = devicesSelect.options[devicesSelect.selectedIndex];
  if (!selectedOption.value) return;
  
  const deviceType = selectedOption.dataset.type;
  const deviceId = selectedOption.value;
  const deviceName = selectedOption.textContent.split(' (')[0];
  
  platformSelect.value = deviceType;
  
  const capabilities = deviceType === 'android' ? {
    platformName: "Android",
    "appium:deviceName": deviceId,
    "appium:automationName": "UiAutomator2"
  } : {
    platformName: "iOS",
    "appium:deviceName": deviceName,
    "appium:udid": deviceId,
    "appium:automationName": "XCUITest"
  };
  
  capabilitiesTextarea.value = JSON.stringify(capabilities, null, 2);
});

// Auto-detect devices on startup
refreshDevices();

platformSelect.addEventListener('change', () => {
  const platform = platformSelect.value;
  const defaultCaps = platform === 'android' ? {
    platformName: "Android",
    "appium:platformVersion": "13",
    "appium:deviceName": "emulator-5554",
    "appium:automationName": "UiAutomator2",
    "appium:app": "/path/to/app.apk"
  } : {
    platformName: "iOS",
    "appium:platformVersion": "17.0",
    "appium:deviceName": "iPhone 15",
    "appium:automationName": "XCUITest",
    "appium:app": "/path/to/app.ipa"
  };
  
  capabilitiesTextarea.value = JSON.stringify(defaultCaps, null, 2);
});

async function refreshDevices() {
  log('Detecting devices...');
  detectedDevices = await window.appiumAPI.getDevices();
  
  devicesSelect.innerHTML = '<option value="">Select a device</option>';
  const allDevices = [...detectedDevices.android, ...detectedDevices.ios];
  
  if (allDevices.length === 0) {
    devicesSelect.innerHTML = '<option value="">No devices detected</option>';
    log('No devices found', true);
  } else {
    allDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.id;
      option.textContent = `${device.name} (${device.type})`;
      option.dataset.type = device.type;
      devicesSelect.appendChild(option);
    });
    log(`Found ${allDevices.length} device(s)`);
  }
}

refreshBtn.addEventListener('click', refreshDevices);

devicesSelect.addEventListener('change', () => {
  const selectedOption = devicesSelect.options[devicesSelect.selectedIndex];
  if (!selectedOption.value) return;
  
  const deviceType = selectedOption.dataset.type;
  const deviceId = selectedOption.value;
  const deviceName = selectedOption.textContent.split(' (')[0];
  
  platformSelect.value = deviceType;
  
  const capabilities = deviceType === 'android' ? {
    platformName: "Android",
    "appium:deviceName": deviceId,
    "appium:automationName": "UiAutomator2"
  } : {
    platformName: "iOS",
    "appium:deviceName": deviceName,
    "appium:udid": deviceId,
    "appium:automationName": "XCUITest"
  };
  
  capabilitiesTextarea.value = JSON.stringify(capabilities, null, 2);
});

// Auto-detect devices on startup
refreshDevices();
