#!/usr/bin/env python3
"""EC800M Bridge - COM3 AT + COM6 GPS -> Server API"""
import serial, time, threading, requests, logging

COM_PORT, BAUD, SN = "COM3", 115200, "869598078703629"
SERVER, INTERVAL = "http://localhost:8090", 10

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
log = logging.getLogger('bridge')

class DeviceBridge:
    def __init__(self):
        self.ser, self.nmea = None, None
        self.lat, self.lng, self.sats = 0.0, 0.0, 0
        self.running = True
        self.session = requests.Session()
        try:
            r = self.session.post(f"{SERVER}/api/login", json={"username":"admin","password":"admin123"})
            log.info(f"Login: {r.json().get('msg','?')}")
        except: log.warning("Server unavailable")

    def open_serial(self):
        try:
            self.ser = serial.Serial(COM_PORT, BAUD, timeout=3)
            log.info("COM3 opened"); return True
        except Exception as e: log.error(f"COM3: {e}"); return False

    def open_nmea(self):
        try:
            self.nmea = serial.Serial('COM6', 115200, timeout=1)
            def read():
                while self.running and self.nmea:
                    try:
                        if self.nmea.in_waiting:
                            line = self.nmea.readline().decode('utf-8', errors='replace').strip()
                            if line.startswith('$GNRMC') or line.startswith('$GPRMC'):
                                p = line.split(',')
                                if len(p) >= 6 and p[2] == 'A':
                                    lat_d = float(p[3][:2]) + float(p[3][2:]) / 60
                                    if p[4] == 'S': lat_d = -lat_d
                                    lng_d = float(p[5][:3]) + float(p[5][3:]) / 60
                                    if p[6] == 'W': lng_d = -lng_d
                                    self.lat, self.lng = round(lat_d, 6), round(lng_d, 6)
                            elif line.startswith('$GNGGA') or line.startswith('$GPGGA'):
                                p = line.split(',')
                                if len(p) > 7 and p[6] != '0': self.sats = int(p[7])
                        else: time.sleep(0.1)
                    except: time.sleep(0.5)
            threading.Thread(target=read, daemon=True).start()
            log.info("COM6 GPS opened")
        except Exception as e: log.warning(f"COM6: {e}")

    def at(self, cmd, t=5):
        if not self.ser or not self.ser.is_open: return None
        try:
            self.ser.reset_input_buffer(); self.ser.write((cmd+'\r\n').encode()); time.sleep(0.4)
            lines, t0 = [], time.time()
            while time.time()-t0 < t:
                if self.ser.in_waiting:
                    line = self.ser.readline().decode('utf-8', errors='replace').strip()
                    if line: lines.append(line)
                if any('OK' in l or 'ERROR' in l for l in lines): break
                time.sleep(0.1)
            return '\n'.join(lines)
        except: return None

    def read(self):
        d = {'sn': SN, 'ts': int(time.time())}
        if self.nmea and self.lat != 0: d['lat'], d['lng'], d['satellites'] = self.lat, self.lng, self.sats
        csq = self.at('AT+CSQ')
        if csq and '+CSQ:' in csq:
            try: d['rssi'] = int(csq.split(':')[1].split(',')[0].strip())
            except: d['rssi'] = -99
        return d

    def beat(self, d):
        try:
            r = requests.post(f"{SERVER}/api/device/heartbeat", json=d, timeout=5)
            if r.json().get('code') == 0:
                gps = f"GPS:{d.get('lat',0):.5f},{d.get('lng',0):.5f}" if d.get('lat') else "GPS:waiting"
                log.info(f"OK RSSI:{d.get('rssi','?')} {gps} sats:{d.get('satellites',0)}")
        except: pass

    def run(self):
        self.open_serial(); self.open_nmea()
        log.info(f"Bridge started SN:{SN}")
        while self.running:
            try: self.beat(self.read()); time.sleep(INTERVAL)
            except KeyboardInterrupt: break
            except Exception as e: log.error(f"{e}"); time.sleep(5)
        if self.ser: self.ser.close()
        if self.nmea: self.nmea.close()
        log.info("Stopped")

DeviceBridge().run()
