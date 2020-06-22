//frida -U -f com.example.demoso1 -l sohook.js --no-pause

//hook native java层函数
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
            //打印调用栈
            console.log('GetStringUTFChars called from:\n' +
            Thread.backtrace(this.context, Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress).join('\n') + '\n');

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

//主动调用和替换参数
function hook_replace(){
    var addr_NewStringUTF=null;

    //console.log(JSON.stringify(Process.findModuleByName("libart.so").enumerateSymbols()))

    var symbols=Process.findModuleByName("libart.so").enumerateSymbols()

    for(var i=0;i<symbols.length;i++){

        if(symbols[i].name.indexOf("CheckJNI")==-1&&symbols[i].name.indexOf("JNI")>=0)
        if(symbols[i].name.indexOf("NewStringUTF")>=0){
            console.log(symbols[i].name)
            console.log(symbols[i].address)
            addr_NewStringUTF=symbols[i].address
            break;
        }

    }

    console.log("addr_NewStringUTF=",addr_NewStringUTF)

    //jstring also is pointer
    //NativeFunction声明native函数,JniEnv也需要声明，也是pointer
    var NewStringUTF=new NativeFunction(addr_NewStringUTF,'pointer',['pointer','pointer'])
    Java.perform(function(){
        Interceptor.replace(addr_NewStringUTF,new NativeCallback(function(parg0,parg1){
            //Memory.readCString to read char *
            console.log("original args=",parg0,Memory.readCString(parg1))

            //生成新的char *
            var newParg1=Memory.allocUtf8String("hook_replace from frida")

            //主动调用
            var NS=NewStringUTF(parg0,newParg1)
            return NS;

        },'pointer',['pointer','pointer']));



    });

    /*
    var openPtr = Module.getExportByName('libc.so', 'open');
    //第二个是返回值，第三个是参数
    var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    Interceptor.replace(openPtr, new NativeCallback(function (pathPtr, flags) {
      var path = pathPtr.readUtf8String();
      log('Opening "' + path + '"');
      var fd = open(pathPtr, flags);
      log('Got fd: ' + fd);
      return fd;
    }, 'int', ['pointer', 'int']));
    */
}

function hook_libc_replace(){
    var libnative_lib_addr=Module.findBaseAddress("libnative-lib.so");
    console.log("libnative_lib_addr=",libnative_lib_addr)

    if(libnative_lib_addr){
        var Z17detect_frida_loopPv=Module.findExportByName("libnative-lib.so","_Z17detect_frida_loopPv");
        console.log("Z17detect_frida_loopPv=",Z17detect_frida_loopPv)
    }

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

    var pthread_create=new NativeFunction(pthread_create_addr,"int",['pointer','pointer','pointer','pointer']);

    Java.perform(function(){

        Interceptor.replace(pthread_create_addr,new NativeCallback(function(parg0,parg1,parg2,parg3){
            console.log("parg0,parg1,parg2,parg3=",parg0,parg1,parg2,parg3)

            //根据偏移地址来判断检测进程,直接hook不调用就是nop掉了
            if(String(parg2).endsWith("db0")){
                console.log("anti-debug sequence")
            }else{
                console.log("oridinary sequence")
                var PC=pthread_create(parg0,parg1,parg2,parg3)
            }           
            return PC;

        },"int",['pointer','pointer','pointer','pointer']));

    });

    /*
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
*/
}

function inline_hook(){
    var libnative_lib_addr=Module.findBaseAddress("libnative-lib.so");
    console.log("libnative_lib_addr=",libnative_lib_addr)

    if(libnative_lib_addr){
        console.log("libnative_lib_addr=",libnative_lib_addr)
        var addr_101F4=libnative_lib_addr.add(0xFC94);
        console.log("addr_101F4=",addr_101F4)

        Java.perform(function(){
            Interceptor.attach(addr_101F4,{
                onEnter:function(args){
                    //单条地址hook只能打印寄存器的值
                    console.log("addr_101F4 onEnter=",this.context.PC,this.context.x1,this.context.x5,this.context.x10)
                },onLeave:function(retval){
                    console.log("retval is:",retval)
                }
            });


        });
    }


}


function write_reg(){
    var file = new File("/sdcard/reg.dat","w");
    file.write("EoPAoY62@ElRD");
    file.flush();
    file.close();
}


function write_reg2(){

    var fopen_addr = Module.findExportByName("libc.so","fopen");
    var fputs_addr = Module.findExportByName("libc.so","fputs");
    var fclose_addr = Module.findExportByName("libc.so","fclose");

    console.log("fopen:",fopen_addr," fputs :",fputs_addr," fclose :",fclose_addr);

    var fopen = new NativeFunction(fopen_addr,"pointer",["pointer","pointer"]);
    var fputs = new NativeFunction(fputs_addr,"int",["pointer","pointer"])
    var fclose = new NativeFunction(fclose_addr,"int",["pointer"]);

    var filename = Memory.allocUtf8String("/sdcard/reg.dat");
    var file_mode = Memory.allocUtf8String("w+");

    var file = fopen(filename,file_mode );

    var contents = Memory.allocUtf8String("EoPAoY62@ElRD");
    var ret = fputs(contents,file);
    fclose(file);
}

function main(){
    //hook_java();  //hook java层native函数声明
    //hook_native();
    //hook_art();
    //hook_libc();
    //hook_replace();
    //hook_libc_replace();
    inline_hook();
}

setTimeout(main,0)