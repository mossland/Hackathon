package land.moss.cryptoapis.request

class NewConfirmedTransactionsRequestItem (
    var address:String,
    var callbackUrl:String,
    var allowDuplicates:Boolean? = null,
    var callbackSecretKey:String? = null,
    var receiveCallbackOn:Int? = null,
) {
}

class NewConfirmedTransactionsRequestData ( var item:NewConfirmedTransactionsRequestItem ) {
}

class NewConfirmedTransactionsRequest (
    val data: NewConfirmedTransactionsRequestData
) : Request() {

    constructor(
        item:NewConfirmedTransactionsRequestItem
    ):this( NewConfirmedTransactionsRequestData( item ) )

}