package land.moss.cryptoapis.request

class NewConfirmedCoinsTransactionsRequestItem (
    var address:String,
    var callbackUrl:String,
    var allowDuplicates:Boolean? = null,
    var callbackSecretKey:String? = null,
    var receiveCallbackOn:Int? = null,
) {
}

class NewConfirmedCoinsTransactionsRequestData ( var item:NewConfirmedCoinsTransactionsRequestItem ) {
}

class NewConfirmedCoinsTransactionsRequest (
    val data: NewConfirmedCoinsTransactionsRequestData
) : Request() {

    constructor(
        item:NewConfirmedCoinsTransactionsRequestItem
    ):this( NewConfirmedCoinsTransactionsRequestData( item ) )

}