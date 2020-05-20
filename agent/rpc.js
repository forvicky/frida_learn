//frida -U -f com.example.myapplication -l s1.js --no-pause      //-U usb -f force -l script   spawn
//frida -U com.example.myapplication -l s1.js                  //delay to find,so can find     attach
function callSecretFunc(){
    console.log("Entering the Script");
 
    Java.perform(function x(){
        console.log("Inside Java perform");
 

        Java.choose("com.example.myapplication.MainActivity",{
            onMatch:function(instance) {
                console.log("found instance="+instance);
                console.log("Result of func="+instance.secret());
            },
            onComplete:function(){
                console.log("complete");
            }
        });
    });
    
}
 
rpc.exports={
    callsecretfunction:callSecretFunc        //py:js
}