//frida -U -f com.example.myapplication -l s1.js --no-pause      //-U usb -f force -l script 
//frida -U com.example.myapplication -l s1.js                  //delay to find,so can find
function main(){
    console.log("Entering the Script");
 
    Java.perform(function x(){
        console.log("Inside Java perform");

        var MainActivity=Java.use("com.example.myapplication.MainActivity");
        MainActivity.fun.overload('int','int').implementation = function(x,y){
            console.log("original call x="+x+" y="+y);
            var ret_value=this.fun(2,5);
            return ret_value;
        }

        MainActivity.fun.overload('java.lang.String').implementation = function(str){
            console.log("original call str="+str);
            var newStr=Java.use('java.lang.String').$new("zdd");
            var ret_value=this.fun(newStr);
            return ret_value;
        }

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

setImmediate(main);