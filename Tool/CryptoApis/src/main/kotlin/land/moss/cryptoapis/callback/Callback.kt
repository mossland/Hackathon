package land.moss.cryptoapis.callback

open class CallbackData {

    var product:String? = null
    var event:String? = null

}

open class Callback {
    var apiVersion:String? = null
    var referenceId:String? = null
    var idempotencyKey:String? = null
}