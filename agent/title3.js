
//99999
//flag 99998
function title3(){
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
            if(String(parg2).endsWith("e9c")){
                console.log("anti-debug sequence")
            }else{
                console.log("oridinary sequence")
                var PC=pthread_create(parg0,parg1,parg2,parg3)
            }           
            return PC;

        },"int",['pointer','pointer','pointer','pointer']));

    });

    test();
        



}


function title2(){
    console.log("Entering the Script");

    Java.perform(function(){
/*
        Java.enumerateClassLoaders({
            onMatch:function(loader){
                try{
                    console.log("loader=",loader);

                    //动态加载的dex,需要查找对应的classloader并赋值给虚拟机
                    if(loader.findClass("com.kanxue.pediy1.VVVVV")){
                        console.log("find loader");
                        Java.classFactory.loader=loader;
                    }
                }catch(error){
                    console.log("find error:"+error);
                }
            },onComplete(){}
        });
*/
        Java.use("dalvik.system.DexClassLoader").$init.implementation=function(x,y,z,w){
            this.$init(x,y,z,w)

            Java.choose("dalvik.system.DexClassLoader",{
                onMatch:function(instance){
                    console.log("instance=",instance)
                    Java.classFactory.loader=instance;
                },onComplete:function(){}
            })
    
    
            var classVVVVV=Java.use("com.kanxue.pediy1.VVVVV")
    
            console.log("classVVVVV=",classVVVVV);


    
            classVVVVV.VVVV.overload('java.lang.String').implementation=function(args1){
                console.log("args1=",args1)
                var currentApplication=Java.use('android.app.ActivityThread').currentApplication();
                var context=currentApplication.getApplicationContext();
    
                for(var i=10000;i<=99999;i++){
                    var result=this.VVVV(i+"");
    
                    console.log("i=",i)
                    if(result){
                        console.log("flag="+i)
                        return true;
        
                    }
        
                }
    
                return false;
    
            }

        }

    })

}


function test(){

    Java.perform(function(){
        Java.use("com.kanxue.pediy1.MainActivity").stringFromJNI.implementation=function(str){
            console.log("str=",str)

            for(var i=10000;i<=99999;i++){
                console.log("i=",i)

                var result=this.stringFromJNI(i+"")
                if(result==99999){
                    console.log("flag=",i)
                    return result;
                }
                    
    
            }
 
            return 0;
        }


    });

}

setImmediate(title3)