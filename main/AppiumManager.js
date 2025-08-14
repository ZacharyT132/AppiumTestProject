const { spawn, exec } = require('child_process');
const axios = require('axios');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const execAsync = promisify(exec);

class AppiumManager {
  constructor() {
    this.servers = new Map();     // deviceId -> {process, port}
    this.sessions = new Map();    // deviceId -> {sessionId}
    this.locks = new Map();        // deviceId -> boolean
    this.nextPort = 4723;
    this.appiumPath = this.findAppium();
  }

  findAppium() {
    // Try local installation first
    const localPaths = [
      path.join(__dirname, '..', 'node_modules', '.bin', 'appium'),
      path.join(__dirname, '..', 'node_modules', '.bin', 'appium.cmd'),
      path.join(__dirname, '..', 'node_modules', 'appium', 'bin', 'appium.js')
    ];
    
    for (const p of localPaths) {
      if (fs.existsSync(p)) {
        console.log('Found appium at:', p);
        return p;
      }
    }
    
    // Fall back to global appium
    console.log('Using global appium');
    return 'appium';
  }

  async getDevices() {
    try {
      const { stdout } = await execAsync('adb devices');
      const devices = stdout.split('\n')
        .slice(1)
        .filter(line => line.includes('\tdevice'))
        .map(line => line.split('\t')[0])
        .filter(id => id.length > 0);
      console.log('Found devices:', devices);
      return devices;
    } catch (error) {
      console.error('ADB error:', error);
      return [];
    }
  }

  async getSession(deviceId) {
    console.log(`Getting session for device: ${deviceId}`);
    if (this.locks.get(deviceId)) {
      console.log(`Device ${deviceId} is locked`);
      return { error: 'Busy' };
    }
    this.locks.set(deviceId, true);
    
    try {
      // Check existing session
      if (this.sessions.has(deviceId)) {
        const { sessionId } = this.sessions.get(deviceId);
        const { port } = this.servers.get(deviceId);
        try {
          await axios.get(`http://127.0.0.1:${port}/wd/hub/session/${sessionId}`);
          console.log(`Reusing session ${sessionId} for ${deviceId}`);
          return { sessionId };
        } catch {
          console.log(`Session ${sessionId} is dead, creating new one`);
          this.sessions.delete(deviceId);
        }
      }

      // Start server if needed
      if (!this.servers.has(deviceId)) {
        const port = this.nextPort++;
        console.log(`Starting Appium server for ${deviceId} on port ${port}`);
        const server = spawn(this.appiumPath, [
          '--address', '127.0.0.1',
          '--port', port.toString(),
          '--base-path', '/wd/hub'
        ], { stdio: 'pipe' });
        
        server.stdout.on('data', (data) => {
          console.log(`[${deviceId}:${port}] ${data}`);
        });
        
        server.stderr.on('data', (data) => {
          console.error(`[${deviceId}:${port}] ERROR: ${data}`);
        });
        
        this.servers.set(deviceId, { process: server, port });
        
        // Wait for server
        console.log(`Waiting for server on port ${port}...`);
        for (let i = 0; i < 30; i++) {
          try {
            await axios.get(`http://127.0.0.1:${port}/wd/hub/status`);
            console.log(`Server on port ${port} is ready`);
            break;
          } catch {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }

      // Clean old UIAutomator2
      console.log(`Cleaning UIAutomator2 for ${deviceId}`);
      await execAsync(`adb -s ${deviceId} uninstall io.appium.uiautomator2.server`).catch(() => {});
      await execAsync(`adb -s ${deviceId} uninstall io.appium.uiautomator2.server.test`).catch(() => {});

      // Create session
      const { port } = this.servers.get(deviceId);
      console.log(`Creating session for ${deviceId} on port ${port}`);
      const { data } = await axios.post(`http://127.0.0.1:${port}/wd/hub/session`, {
        capabilities: {
          alwaysMatch: {
            platformName: 'Android',
            'appium:udid': deviceId,
            'appium:automationName': 'UiAutomator2'
          }
        }
      }, { timeout: 60000 });
      
      const sessionId = data.value.sessionId;
      console.log(`Created session ${sessionId} for ${deviceId}`);
      this.sessions.set(deviceId, { sessionId });
      return { sessionId };
    } catch (error) {
      console.error(`Error creating session for ${deviceId}:`, error.message);
      return { error: error.message };
    } finally {
      this.locks.delete(deviceId);
    }
  }

  async cleanup() {
    console.log('Cleaning up...');
    for (const [deviceId, { sessionId }] of this.sessions) {
      const { port } = this.servers.get(deviceId);
      await axios.delete(`http://127.0.0.1:${port}/wd/hub/session/${sessionId}`).catch(() => {});
    }
    for (const { process } of this.servers.values()) {
      process.kill();
    }
  }
}

module.exports = AppiumManager;