"""
EC800M-CN QuecPython MQTT Client for Asset Management Platform

Directly on module. Publishes GNSS + telemetry via MQTT.
Subscribes to cmd topics for remote control.
"""
import modem, net, mqtt, quecgnss, ujson, utime, _thread
from machine import Pin, ADC

CFG = {
    "broker": "broker.emqx.io",
    "port": 1883,
    "client_id": "EC800M-" + modem.getDevImei()[-8:],
    "topic_status": "devices/ec800m-gnss-001/status",
    "topic_telemetry": "devices/ec800m-gnss-001/telemetry",
    "topic_cmd": "devices/ec800m-gnss-001/cmd",
    "publish_interval": 10,
    "gnss_enabled": True,
}

def mqtt_callback(topic, msg):
    print("[MQTT RX] %s: %s" % (topic.decode(), msg.decode()))
    try:
        cmd = ujson.loads(msg.decode())
        handle_command(cmd)
    except:
        print("[CMD] Raw: %s" % msg.decode())

def handle_command(cmd):
    action = cmd.get("cmd", "")
    params = cmd.get("params", {})
    if action == "LOCATE":
        publish_gnss_data()
    elif action == "REBOOT":
        utime.sleep(2)
        modem.restart()
    elif action == "STATUS":
        publish_status()
    elif action == "CSQ":
        print("[CMD] CSQ: %s" % str(net.csqQueryPoll()))
    elif action == "INTERVAL":
        CFG["publish_interval"] = max(5, min(3600, params.get("seconds", 10)))
    elif action == "SLEEP":
        utime.sleep(params.get("seconds", 60))

def init_gnss():
    try:
        quecgnss.init()
        quecgnss.GnssSetNMEAMode(0x0F)
        print("[GNSS] OK GPS+BDS+GLONASS+Galileo")
        CFG["gnss_enabled"] = True
    except Exception as e:
        print("[GNSS] Failed: %s" % e)
        CFG["gnss_enabled"] = False

def get_gnss_position():
    if not CFG["gnss_enabled"]:
        return None
    try:
        info = quecgnss.getGnssInfo()
        if info and len(info) >= 3 and info[1] != 0 and info[2] != 0:
            lat, lng = info[1], info[2]
            speed = info[3] if len(info) > 3 else 0
            heading = info[4] if len(info) > 4 else 0
            sats = info[5] if len(info) > 5 else 0
            return (lat, lng, speed, heading, sats)
    except:
        pass
    return None

def publish_status():
    csq = net.csqQueryPoll()
    payload = ujson.dumps({"online": True, "rssi": csq[0] if csq else -99, "ts": utime.time()})
    mqtt_client.publish(CFG["topic_status"], payload, qos=1)

def publish_gnss_data():
    pos = get_gnss_position()
    csq = net.csqQueryPoll()
    data = {"ts": utime.time(), "rssi": csq[0] if csq else -99, "imei": modem.getDevImei(), "imsi": modem.getDevImsi(), "network": str(net.getNetworkInfo())}
    if pos:
        data.update({"lat": pos[0], "lng": pos[1], "speed": pos[2], "heading": pos[3], "satellites": pos[4]})
    try:
        adc = ADC(0)
        data["battery"] = round(adc.read() * 4.2 / 4095, 2)
    except:
        data["battery"] = -1
    mqtt_client.publish(CFG["topic_telemetry"], ujson.dumps(data), qos=1)
    print("[PUB] %s RSSI:%d" % (("%.5f,%.5f" % (pos[0], pos[1])) if pos else "no_fix", csq[0] if csq else -99))

def main():
    global mqtt_client
    print("=" * 40)
    print("  EC800M-CN MQTT Asset Tracker")
    print("  IMEI: %s" % modem.getDevImei())
    print("=" * 40)
    print("[NET] Waiting for network...")
    while net.getState()[0] != 1:
        utime.sleep(2)
    print("[NET] Registered")
    net.setModemFun(1, 1)
    utime.sleep(3)
    init_gnss()
    print("[MQTT] Connecting %s:%d..." % (CFG["broker"], CFG["port"]))
    mqtt_client = mqtt.client(client_id=CFG["client_id"], server=CFG["broker"], port=CFG["port"], user="", password="", keepalive=60, ssl=False)
    mqtt_client.set_callback(mqtt_callback)
    mqtt_client.connect()
    print("[MQTT] Connected as %s" % CFG["client_id"])
    mqtt_client.subscribe(CFG["topic_cmd"], qos=1)
    publish_status()
    while True:
        try:
            publish_status()
            if CFG["gnss_enabled"]:
                publish_gnss_data()
            mqtt_client.loop()
            utime.sleep(CFG["publish_interval"])
        except Exception as e:
            print("[ERR] %s" % e)
            utime.sleep(5)
            try:
                mqtt_client.disconnect()
            except:
                pass
            try:
                mqtt_client.connect()
                mqtt_client.subscribe(CFG["topic_cmd"], qos=1)
            except:
                pass

main()
