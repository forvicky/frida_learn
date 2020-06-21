//frida -U -f com.example.demoso1 -l sohook.js --no-pause

function hook_java(){

    Java.perform(function(){
        /*
        Java.use("com.example.demoso1.MainActivity").myfirstjniJNI.implementation=function(x){
            var result=this.myfirstjniJNI(x)
            console.log("x,result=",x,result)
            return result;
        }
*/
        Java.choose("com.example.demoso1.MainActivity",{
            onMatch:function(instance){
                console.log("this is init")
                instance.init();
            },onComplete(){
                console.log("this is onComplete")

            }

        })

    })



}

function hook_native(){
    var libnative_lib_addr=Module.findBaseAddress("libnative-lib.so");
    console.log("libnative_lib_addr=",libnative_lib_addr)

    if(libnative_lib_addr){
        var myfirstjni=Module.findExportByName("libnative-lib.so","Java_com_example_demoso1_MainActivity_myfirstjniJNI");
        console.log("myfirstjni=",myfirstjni)
    }

    //根据地址进行函数拦截，这个时机很重要，一开始的时候，so还没加载好，拿不到地址，执行完拦截又无效了
    Interceptor.attach(myfirstjni,{
        onEnter:function(args){
            console.log("args[0],args[1],args[2]=",args[0],args[1],args[2])
            //console.log(hexdump(args[2].readPointer()))  //不知道为啥不行
            console.log("args[2]=",Java.vm.getEnv().getStringUtfChars(args[2],null).readCString())
        },onLeave:function(retval){
            console.log("retval=",retval)
            console.log("args[2]=",Java.vm.getEnv().getStringUtfChars(retval,null).readCString())
            var newRetval=Java.vm.getEnv().newStringUtf("native hook is ok");
            retval.replace(ptr(newRetval)) //替换返回值

        }

    });

}

//有现成的开源库jnitrace
//jni都在libart.so中
//jni函数有mangling，只能枚举条件过滤
function hook_art(){
    var addr_GetStringUTFChars=null;

    //console.log(JSON.stringify(Process.findModuleByName("libart.so").enumerateSymbols()))

    var symbols=Process.findModuleByName("libart.so").enumerateSymbols()

    for(var i=0;i<symbols.length;i++){

        if(symbols[i].name.indexOf("CheckJNI")==-1&&symbols[i].name.indexOf("JNI")>=0)
        if(symbols[i].name.indexOf("GetStringUTFChars")>=0){
            console.log(symbols[i].name)
            console.log(symbols[i].address)
            addr_GetStringUTFChars=symbols[i].address
            break;
        }

    }


    console.log("addr_GetStringUTFChars=",addr_GetStringUTFChars)

    if(addr_GetStringUTFChars!=null)
    Interceptor.attach(addr_GetStringUTFChars,{
        onEnter:function(args){
            console.log("args[0],args[1]",args[0],args[1])

            //jni函数第一个参数是 jnienv 
            console.log("args[1]=",Java.vm.getEnv().getStringUtfChars(args[1],null).readCString())
        },onLeave:function(retval){
            console.log("addr_GetStringUTFChars onLeave=",ptr(retval).readCString())

        }

    });

}



function hook_libc(){
    var pthread_create_addr=null;

    var symbols=Process.findModuleByName("libc.so").enumerateSymbols()

    for(var i=0;i<symbols.length;i++){
        if(symbols[i].name.indexOf("pthread_create")>=0){
            //console.log(symbols[i].name)
            //console.log(symbols[i].address)
            pthread_create_addr=symbols[i].address
        }
    }

    console.log("pthread_create_addr=",pthread_create_addr)

    if(pthread_create_addr!=null)
    Interceptor.attach(pthread_create_addr,{
        onEnter:function(args){
            console.log("args[0],args[1],args[2],args[3]=",args[0],args[1],args[2],args[3])
        },onLeave(retval){
            console.log("retval=",retval)


        }


    })
}



function main(){
    //hook_java();  //hook java层native函数声明
    //hook_native();
    //hook_art();
    hook_libc();
}

setTimeout(main,0)