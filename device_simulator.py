#!/usr/bin/env python3
"""MQTT IoT Device Simulator - makes devices appear online in Asset Management"""
import json, time, random
import paho.mqtt.client as mqtt

BROKER = 'broker.emqx.io'
PORT = 1883
INTERVAL = 5

DEVICES = [
    {'name':'GPS终端A01','topic':'sensor-temp-001','lat':39.9219,'lng':116.4435,'rssi':-65,'bat':92},
    {'name':'温湿度传感器B01','topic':'warehouse-scanner-004','lat':22.5431,'lng':113.9432,'rssi':-58,'bat':78},
    {'name':'工业机器人ABB','topic':'factory-robot-008','lat':31.2304,'lng':121.4737,'rssi':-72,'bat':95},
    {'name':'Quectel EC800','topic':'factory-5gmodem-009','lat':31.2350,'lng':121.4750,'rssi':-55,'bat':88},
    {'name':'网关E01','topic':'gateway-hub-007','lat':30.5048,'lng':114.4194,'rssi':-80,'bat':100},
]

def on_connect(client, userdata, flags, rc, props=None):
    if rc == 0:
        print(f'MQTT connected to {BROKER}')
        for d in DEVICES:
            client.subscribe(f"devices/{d['topic']}/cmd", qos=1)

def on_message(client, userdata, msg):
    print(f'CMD [{msg.topic}]: {msg.payload.decode()}')

def main():
    print(f'=== Device Simulator ({len(DEVICES)} devices) ===')
    client = mqtt.Client(client_id=f'sim-{random.randint(1000,9999)}', protocol=mqtt.MQTTv5, callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    time.sleep(1)
    try:
        while True:
            for d in DEVICES:
                d['rssi'] = max(-95, min(-40, d['rssi'] + random.randint(-3, 3)))
                d['bat'] = max(5, min(100, d['bat'] - random.random() * 0.1))
                lat = round(d['lat'] + random.uniform(-0.002, 0.002), 6)
                lng = round(d['lng'] + random.uniform(-0.002, 0.002), 6)
                ts = int(time.time())
                client.publish(f"devices/{d['topic']}/status", json.dumps({'online':True,'rssi':d['rssi'],'ts':ts}), qos=1)
                client.publish(f"devices/{d['topic']}/telemetry", json.dumps({'rssi':d['rssi'],'battery':d['bat'],'lat':lat,'lng':lng,'ts':ts}, ensure_ascii=False), qos=1)
                client.publish(f"devices/{d['topic']}/online", '1', qos=1)
                print(f"PUB [{d['topic']}] online rssi={d['rssi']}dBm bat={d['bat']:.0f}%")
                time.sleep(0.5)
            print(f'--- Cycle done ---')
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        print('Stopping...')
        for d in DEVICES:
            client.publish(f"devices/{d['topic']}/status", '{"online":false}', qos=1)
        client.loop_stop()
        client.disconnect()
        print('Done.')

if __name__ == '__main__':
    main()
