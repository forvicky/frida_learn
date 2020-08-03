function main(){
    Java.perform(function(){

        var recvfrom_addr=Module.findExportByName("libc.so","recvfrom")
        var sendto_addr=Module.findExportByName("libc.so","sendto")

        console.log("recvfrom sendto addr are:",recvfrom_addr,sendto_addr)

        Interceptor.attach(recvfrom_addr,{
            onEnter:function(args){
                console.log("called from:",Thread.backtrace(this.context,Backtracer.FUZZY))
                console.log("recvfrom content:",hexdump(ptr(args[1])))
            },onLeave(retval){

            }
        })
    })

}

setImmediate(main)