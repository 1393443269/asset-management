#!/usr/bin/env python3
"""
EC800M-CN Serial-MQTT Bridge for Asset Management Platform
===========================================================
Reads COM5 serial port, sends AT commands to Quectel EC800M,
publishes GNSS location + telemetry to MQTT broker.

How it works:
  PC (this script) --AT commands--> COM5 --Cellular--> MQTT Broker <-- Platform

Usage:
  python com5_mqtt_bridge.py
"""
import serial
import json
import time
import threading
import queue

# ===== CONFIGURATION =====
COM_PORT = "COM3"
BAUD = 115200
BROKER = "broker.emqx.io"
MQTT_PORT = 1883
DEVICE_TOPIC = "ec800m-sz001"
PUBLISH_INTERVAL = 10  # seconds

STATUS_TOPIC = f"devices/{DEVICE_TOPIC}/status"
TELEMETRY_TOPIC = f"devices/{DEVICE_TOPIC}/telemetry"
CMD_TOPIC = f"devices/{DEVICE_TOPIC}/cmd"

ser = None
gps_data = {"lat": 0, "lng": 0, "speed": 0, "satellites": 0}
rssi = 99

def log(msg):
    print(f"[{time.strftime("%H:%M:%S")}] {msg}")

def at_cmd(cmd, timeout=5):
    """Send AT command and return response"""
    global ser
    if not ser or not ser.is_open:
        return None
    ser.reset_input_buffer()
    ser.write((cmd + "
").encode())
    time.sleep(0.3)
    lines = []
    start = time.time()
    while time.time() - start < timeout:
        if ser.in_waiting:
            line = ser.readline().decode("utf-8", errors="replace").strip()
            if line:
                lines.append(line)
        if "OK" in lines or "ERROR" in lines:
            break
        time.sleep(0.1)
    return "
".join(lines)

def init_serial():
    """Open COM5 serial port"""
    global ser
    try:
        ser = serial.Serial(COM_PORT, BAUD, timeout=2, rtscts=False)
        log(f"COM5 opened at {BAUD} bps")
        return True
    except Exception as e:
        log(f"COM5 ERROR: {e}")
        log("Available ports:")
        import serial.tools.list_ports
        for p in serial.tools.list_ports.comports():
            log(f"  {p.device} - {p.description}")
        return False

def check_module():
    """Test basic AT communication"""
    resp = at_cmd("AT")
    if resp and "OK" in resp:
        log(f"AT OK - Module responding")
        # Get module info
        imei_resp = at_cmd("AT+CGSN")
        log(f"IMEI: {imei_resp}")
        return True
    log("Module not responding to AT")
    return False

def check_network():
    """Check cellular network registration"""
    global rssi
    csq = at_cmd("AT+CSQ")
    if csq:
        log(f"CSQ: {csq}")
        try:
            parts = csq.split(":")[1].strip().split(",")
            rssi = int(parts[0])
        except:
            pass
    creg = at_cmd("AT+CREG?")
    log(f"CREG: {creg}")
    cgatt = at_cmd("AT+CGATT?")
    log(f"CGATT: {cgatt}")
    return rssi > 0 and rssi < 99

def get_gnss_position():
    """Query GNSS position via AT+QGNSS"""
    global gps_data
    # Enable GNSS if not already
    at_cmd("AT+QGNSS=\"gnssconfig\",1", timeout=3)
    time.sleep(1)
    resp = at_cmd("AT+QGNSS=\"loc\"", timeout=10)
    if resp and "+QGNSS" in resp:
        try:
            parts = resp.split("+QGNSS:")[1].split("
")[0].strip().split(",")
            gps_data["lat"] = float(parts[0])
            gps_data["lng"] = float(parts[1])
            gps_data["speed"] = float(parts[3]) if len(parts) > 3 else 0
            gps_data["satellites"] = int(parts[6]) if len(parts) > 6 else 0
            log(f"GNSS: {gps_data["lat"]}, {gps_data["lng"]} ({gps_data["satellites"]} sats)")
            return True
        except Exception as e:
            log(f"GNSS parse error: {e}
{resp}")
    else:
        log(f"GNSS: no fix or not available")
        # Use simulated position for demo
        import random
        gps_data["lat"] = round(22.5431 + random.uniform(-0.01, 0.01), 6)
        gps_data["lng"] = round(113.9432 + random.uniform(-0.01, 0.01), 6)
        log(f"GNSS (demo): {gps_data["lat"]}, {gps_data["lng"]}")
    return False

def setup_mqtt():
    """Configure MQTT via AT commands"""
    log("Setting up MQTT connection...")
    # Check PDP context
    at_cmd("AT+CGATT=1")
    time.sleep(1)
    at_cmd("AT+QIACT=1")
    time.sleep(2)
    # Open MQTT
    resp = at_cmd(f"AT+QMTOPEN=0,\"{BROKER}\",{MQTT_PORT}", timeout=15)
    log(f"QMTOPEN: {resp}")
    # Connect
    resp = at_cmd("AT+QMTCONN=0,\"EC800M_COM5\"", timeout=10)
    log(f"QMTCONN: {resp}")
    if "0,0,0" in resp:
        log("MQTT connected!"); return True
    log("MQTT connection may have failed, continuing in demo mode")
    return False

def publish_mqtt(topic, payload):
    """Publish MQTT message via AT command"""
    escaped = json.dumps(payload).replace(chr(34), chr(92)+chr(34))
    cmd = f"AT+QMTPUB=0,1,1,0,\"{topic}\",\"{escaped}\""
    resp = at_cmd(cmd, timeout=10)
    if resp and "+QMTPUB" in resp:
        return True
    return False

def publish_loop():
    """Main publish loop"""
    log("Starting publish loop...")
    mqtt_ok = setup_mqtt()
    while True:
        try:
            get_gnss_position()
            check_network()
            payload = {
                "online": True,
                "ts": int(time.time()),
                "rssi": rssi,
                "lat": gps_data["lat"],
                "lng": gps_data["lng"],
                "speed": gps_data["speed"],
                "satellites": gps_data["satellites"],
                "source": "EC800M-COM5"
            }
            if mqtt_ok:
                status_ok = publish_mqtt(STATUS_TOPIC, {"online": True, "rssi": rssi, "ts": int(time.time())})
                telem_ok = publish_mqtt(TELEMETRY_TOPIC, payload)
                log(f"MQTT PUB {'OK' if status_ok else 'FAIL'} | {gps_data.get('lat',0):.5f},{gps_data.get('lng',0):.5f} RSSI:{rssi}")
            else:
                log(f"DEMO MODE | {gps_data.get('lat',0):.5f},{gps_data.get('lng',0):.5f} RSSI:{rssi}")
            time.sleep(PUBLISH_INTERVAL)
        except KeyboardInterrupt:
            raise
        except Exception as e:
            log(f"Loop error: {e}")
            time.sleep(5)

def main():
    log("="*55)
    log("  EC800M-CN COM5 Serial-MQTT Bridge")
    log(f"  Port: {COM_PORT}  Broker: {BROKER}:{MQTT_PORT}")
    log(f"  Topic: {DEVICE_TOPIC}")
    log("="*55)
    if not init_serial():
        log("No COM5. Running in DEMO mode (simulated data)...")
        import random
        global gps_data
        gps_data = {"lat": 22.5431, "lng": 113.9432, "speed": 0, "satellites": 0}
    else:
        if not check_module():
            log("Module not responding, running in DEMO mode")
        else:
            check_network()
    try:
        publish_loop()
    except KeyboardInterrupt:
        log("Stopping...")
        at_cmd("AT+QMTDISC=0")
        at_cmd("AT+QMTCLOSE=0")
        if ser:
            ser.close()
        log("Done.")

if __name__ == "__main__":
    main()
