package land.moss.cryptoapis.request

import land.moss.cryptoapis.FeePriority

class CreateCoinsTransactionRequestFromAddressRequestItem (
    var amount:String,
    var feePriority: FeePriority,
    var recipientAddress:String,

    var callbackSecretKey:String? = null,
    var callbackUrl:String? = null,
    var note:String? = null,
) {
}

class CreateCoinsTransactionRequestFromAddressRequestData ( var item:CreateCoinsTransactionRequestFromAddressRequestItem ) {
}

class CreateCoinsTransactionRequestFromAddressRequest (
    val data: CreateCoinsTransactionRequestFromAddressRequestData
) : Request() {

    constructor(
        item:CreateCoinsTransactionRequestFromAddressRequestItem
    ):this( CreateCoinsTransactionRequestFromAddressRequestData( item ) )

}