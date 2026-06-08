#!/usr/bin/env python3
"""
EC800M Device Bridge - COM3 Serial <-> Server API
=================================================
Reads device data from COM3, posts to server.
Polls for remote commands, executes via AT.
"""
import serial, time, json, threading, queue, requests
import logging

# Config
COM_PORT = "COM3"
BAUD = 115200
SN = "869598078703629"
SERVER = "http://localhost:8090"
INTERVAL = 10  # seconds

log = logging.getLogger('bridge')
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

class DeviceBridge:
    def __init__(self):
        self.ser = None
        self.running = True
        self.cmd_queue = queue.Queue()
        self.session = requests.Session()
        # Login first
        try:
            r = self.session.post(f"{SERVER}/api/login", json={"username":"admin","password":"admin123"})
            log.info(f"Server login: {r.json().get('msg','unknown')}")
        except Exception as e:
            log.warning(f"Server login failed (will use device endpoints): {e}")

    def open_serial(self):
        try:
            self.ser = serial.Serial(COM_PORT, BAUD, timeout=3)
            log.info(f"COM3 opened @ {BAUD}")
            return True
        except Exception as e:
            log.error(f"COM3 open failed: {e}")
            return False

    def at_cmd(self, cmd, timeout=5):
        """Send AT command and return response"""
        if not self.ser or not self.ser.is_open:
            return None
        try:
            self.ser.reset_input_buffer()
            self.ser.write((cmd + '\r\n').encode())
            time.sleep(0.4)
            lines = []
            t0 = time.time()
            while time.time() - t0 < timeout:
                if self.ser.in_waiting:
                    line = self.ser.readline().decode('utf-8', errors='replace').strip()
                    if line: lines.append(line)
                if any('OK' in l or 'ERROR' in l for l in lines):
                    break
                time.sleep(0.1)
            return '\n'.join(lines)
        except:
            return None

    def read_device_data(self):
        """Read current device state from COM3"""
        data = {'sn': SN, 'ts': int(time.time())}
        # Signal strength
        csq = self.at_cmd('AT+CSQ')
        if csq and '+CSQ:' in csq:
            try: data['rssi'] = int(csq.split(':')[1].split(',')[0].strip()); 
            except: data['rssi'] = -99
        # Network registration
        creg = self.at_cmd('AT+CREG?')
        data['registered'] = '+CREG: 0,1' in creg if creg else False
        # Operator
        cops = self.at_cmd('AT+COPS?')
        if cops and '+COPS:' in cops:
            try: data['operator'] = cops.split('"')[1]
            except: pass
        return data

    def post_heartbeat(self, data):
        """Send heartbeat to server"""
        try:
            r = requests.post(f"{SERVER}/api/device/heartbeat", json=data, timeout=5)
            resp = r.json()
            if resp.get('code') == 0:
                log.info(f"Heartbeat OK | RSSI:{data.get('rssi','?')} | {data.get('operator','?')}")
                # Check for commands
                for cmd in resp.get('cmds', []):
                    self.execute_command(cmd)
            else:
                log.warning(f"Heartbeat failed: {resp.get('msg')}")
        except Exception as e:
            log.error(f"Heartbeat error: {e}")

    def post_telemetry(self, data):
        """Post full telemetry to server"""
        try:
            r = requests.post(f"{SERVER}/api/device/telemetry", json=data, timeout=5)
            if r.json().get('code') == 0:
                log.info(f"Telemetry OK")
        except Exception as e:
            log.error(f"Telemetry error: {e}")

    def execute_command(self, cmd_obj):
        """Execute a command from server on the device"""
        cmd = cmd_obj.get('cmd', '')
        params = cmd_obj.get('params', {})
        log.info(f"Executing command: {cmd}")
        result = ''
        if cmd == 'AT': result = self.at_cmd('AT')
        elif cmd == 'CSQ': result = self.at_cmd('AT+CSQ')
        elif cmd == 'LOCATE': result = self.at_cmd('AT+QGNSS="loc"')
        elif cmd == 'REBOOT': result = self.at_cmd('AT+CFUN=1,1')
        elif cmd == 'STATUS': result = self.at_cmd('AT+CPAS')
        elif cmd == 'INFO': result = self.at_cmd('ATI')
        else: result = f'Unknown command: {cmd}'
        log.info(f"Command result: {result[:100] if result else 'N/A'}")
        return result

    def poll_commands(self):
        """Check for pending commands from server"""
        try:
            r = requests.get(f"{SERVER}/api/device/command/{SN}", timeout=5)
            cmds = r.json().get('cmds', [])
            for cmd in cmds:
                self.execute_command(cmd)
        except: pass

    def run(self):
        if not self.open_serial():
            log.warning("COM3 not available - running in network-only mode")
        log.info(f"Device Bridge started | SN:{SN} | Server:{SERVER}")
        while self.running:
            try:
                data = self.read_device_data()
                self.post_heartbeat(data)
                if self.ser:
                    self.poll_commands()
                time.sleep(INTERVAL)
            except KeyboardInterrupt:
                break
            except Exception as e:
                log.error(f"Loop error: {e}")
                time.sleep(5)
        if self.ser:
            self.ser.close()
        log.info("Bridge stopped")

if __name__ == '__main__':
    bridge = DeviceBridge()
    bridge.run()
