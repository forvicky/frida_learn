//

function main(){
    console.log("Entering the Script");
 
    Java.perform(function x(){
        console.log("Inside Java perform");

        var MainActivity=Java.use("com.example.myapplication.MainActivity");
        MainActivity.fun.implementation = function(x,y){
            console.log("original call x="+x+" y="+y);
            var ret_value=this.fun(2,5);
            return ret_value;
        }

    });
    
}

setImmediate(main);