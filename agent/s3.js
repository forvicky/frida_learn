//frida -H 192.168.0.108:8888 com.example.androiddemo -l s3.js

function login(){

    Java.perform(function(){
        Java.use("com.example.androiddemo.Activity.LoginActivity").a.overload('java.lang.String', 'java.lang.String').implementation=function(str,str2){
            
            var result=this.a(str,str2);
            console.log("str="+str+" str2="+str2+" result="+result);
            return result;
        };
    });

}


function step1(){
    Java.perform(function(){
        var step1Activity=Java.use("com.example.androiddemo.Activity.FridaActivity1");
        var str=Java.use("java.lang.String");
        step1Activity.a.implementation=function(bArr){
            //返回string需要用string类构造一下，不能直接返回“xx”
            return str.$new("R4jSLLLLLLLLLLOrLE7/5B+Z6fsl65yj6BgC6YWz66gO6g2t65Pk6a+P65NK44NNROl0wNOLLLL=");
        };
    });

}

function step2(){
    Java.perform(function(){
        var step2Activity=Java.use("com.example.androiddemo.Activity.FridaActivity2");
        //静态函数可以直接用Java.use调用
        step2Activity.setStatic_bool_var();

        //普通函数需要用Java.choose找到实例才能调用
        Java.choose("com.example.androiddemo.Activity.FridaActivity2",{
            onMatch:function(instance){
                console.log("find FridaActivity2");
                instance.setBool_var();

            },onComplete(){

            }
        });

    });

}

function step3(){
    Java.perform(function(){
        var step3Activity=Java.use("com.example.androiddemo.Activity.FridaActivity3");

        //静态变量也是可以直接调用
        step3Activity.static_bool_var.value=true;
        Java.choose("com.example.androiddemo.Activity.FridaActivity3",{
            onMatch:function(instance){
                console.log("find FridaActivity3");
                //普通变量需要Java.choose
                instance.bool_var.value=true;
                //变量和函数重名，则需要再变量名前加_
                instance._same_name_bool_var.value=true;

            },onComplete(){

            }
        });

    });
}

function step4(){
    Java.perform(function(){
        var class_name="com.example.androiddemo.Activity.FridaActivity4$InnerClasses";
        var InnerClass=Java.use(class_name);
        //用反射遍历类的所有函数
        var all_methods=InnerClass.class.getDeclaredMethods();
        console.log(all_methods+"\n");
        for(var i=0;i<all_methods.length;i++){
            var method=all_methods[i];
            console.log(method+"\n");
            var methodStr=method.toString();
            var substring=methodStr.substr(methodStr.indexOf(class_name)+class_name.length+1);
            console.log("methodStr="+methodStr+" substring="+substring);
            var finalFuncName=substring.substr(0,substring.indexOf("("));

            //?
            //var finalFuncName=methodStr.substr(methodStr.indexOf(class_name)+class_name.length+1,methodStr.indexOf("("));

            console.log(finalFuncName);
            InnerClass[finalFuncName].implementation=function(){return true};
        }


    });


}

function step5(){
    Java.perform(function(){

        var FridaActivity5=Java.use("com.example.androiddemo.Activity.FridaActivity5");
        Java.enumerateClassLoaders({
            onMatch:function(loader){
                try{
                    //动态加载的dex,需要查找对应的classloader并赋值给虚拟机
                    if(loader.findClass("com.example.androiddemo.Dynamic.DynamicCheck")){
                        console.log("find loader");
                        Java.classFactory.loader=loader;
                    }
                }catch(error){
                    console.log("find error:"+error);
                }
            },onComplete(){}
        });

        var DynamicCheck=Java.use("com.example.androiddemo.Dynamic.DynamicCheck");
        DynamicCheck.check.implementation=function(){return true;};

    });


}

function step6(){

    Java.perform(function(){
        Java.enumerateLoadedClasses({
            onMatch:function(name,handler){
                //console.log("name="+name+" handler="+handler);

                //枚举当前已加载的类，要让3个类都加载进内存中需要连续点击3次才可以
                if(name.indexOf("com.example.androiddemo.Activity.Frida6")>=0){
                    console.log("enter name="+name+" handler="+handler);
                    Java.use(name).check.implementation=function(){
                        return true;
                    }
                }
            },onComplete:function(){}
        });

    });

}

setImmediate(step6)