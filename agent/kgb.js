
//com.tlamb96.spetsnazmessenger
//frida -H 192.168.0.108:8888 -f com.tlamb96.spetsnazmessenger -l kgb.js --no-pause
//codenameduchess
//passwd 彩虹表找到md5原文 guest
function kgb(){
    Java.perform(function(){
        Java.enumerateLoadedClasses({
            onMatch:function(className){
                if(className.indexOf("com.tlamb96.kgbmessenger")<0)
                    return;

                var hookCls=Java.use(className);
                var interFaces=hookCls.class.getInterfaces();
                if(interFaces.length>0){
                    console.log(className);
                    for(var i in interFaces){
                        console.log("\t",interFaces[i].toString())
                    }
                }
            },onComplete(){}
        });


        var sysCLass=Java.use("java.lang.System");
        sysCLass.getProperty.overload('java.lang.String').implementation=function(x){
            console.log("getProperty x="+x);
            return "Russia";
        }

        sysCLass.getenv.overload('java.lang.String').implementation=function(x){
            console.log("getenv x="+x);
            return "RkxBR3s1N0VSTDFOR180UkNIM1J9Cg==";
        }

        /*
        Java.choose("com.tlamb96.kgbmessenger.LoginActivity",{
            onMatch:function(instance){
                console.log("find LoginActivity");
                return false;
            },onComplete(){}
        })
*/
        //hook构造函数
        Java.use("com.tlamb96.kgbmessenger.b.a").$init.implementation=function(x,y,z,m){
            console.log("x,y,z,m=",x,y,z,m)
            this.$init(x,y,z,m)

        }

 

        //动态加载dex
        Java.openClassFile("/data/local/tmp/classes.dex").load();
        const reserverClass=Java.use("com.example.myapplication.Reserver");
        var a=reserverClass.r_a("V@]EAASB\u0012WZF\u0012e,a$7(&am2(3.\u0003")
        console.log("a="+a)

        var b=reserverClass.get_b()
        console.log("b="+b)
    });

}






setImmediate(kgb)