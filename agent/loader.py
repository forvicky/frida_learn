import time
import frida

device = frida.get_device_manager().add_remote_device("192.168.0.108:8888")
pid=device.spawn("com.android.settings")
device.resume(pid)
time.sleep(1)
session = device.attach(pid)
with open("s1.js") as f:
    script = session.create_script(f.read())

script.load()
input()