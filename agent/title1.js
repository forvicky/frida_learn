//flag 66888 ,hook住以后需要流程执行到以后才会执行hook的内容
//int+""   change to string
function title1(){
    console.log("Entering the Script");

    Java.perform(function(){

        var classVVVVV=Java.use("com.kanxue.pediy1.VVVVV")

        console.log("classVVVVV=",classVVVVV);

        classVVVVV.VVVV.overload('android.view.View$OnClickListener','java.lang.String').implementation=function(args1,args2){
            console.log("args1,args2=",args1,args2)
            var currentApplication=Java.use('android.app.ActivityThread').currentApplication();
            var context=currentApplication.getApplicationContext();

            for(var i=10000;i<=99999;i++){
                var result=this.VVVV(args1,i+"");

                console.log("i=",i)
                if(result){
                    console.log("flag="+i)
                    return true;
    
                }
    
            }

            return false;

        }
    })

}







setImmediate(title1)