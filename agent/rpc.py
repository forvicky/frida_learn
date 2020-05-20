import time
import frida

device = frida.get_usb_device()
#pid=device.spawn(["com.example.myapplication"])  # Java.choose not find
pid=26356
device.resume

def my_message_handler(message,payload):
    print(message)
    print(payload)

time.sleep(2)


session=device.attach(pid)
with open("rpc.js") as f:
    script = session.create_script(f.read())

script.on("message",my_message_handler)
script.load()



command = ""
while 1==1:
    command = input("Enter command:")
    if command == "1":
        break;
    elif command=="2":
        script.exports.callsecretfunction()