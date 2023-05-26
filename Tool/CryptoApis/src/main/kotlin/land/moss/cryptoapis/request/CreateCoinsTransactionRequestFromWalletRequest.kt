package land.moss.cryptoapis.request

import land.moss.cryptoapis.FeePriority

class CreateCoinsTransactionRequestFromWalletRequestItemRecipients (
    var address:String,
    var amount:String
) {
}

class CreateCoinsTransactionRequestFromWalletRequestItem (

    var feePriority:FeePriority,
    var recipients:List<CreateCoinsTransactionRequestFromWalletRequestItemRecipients>,

    var callbackSecretKey:String? = null,
    var callbackUrl:String? = null,
    var note:String? = null,
    var prepareStrategy: PrepareStrategy? = null
) {
}

class CreateCoinsTransactionRequestFromWalletRequestData ( var item:CreateCoinsTransactionRequestFromWalletRequestItem ) {
}

class CreateCoinsTransactionRequestFromWalletRequest (
    val data: CreateCoinsTransactionRequestFromWalletRequestData
) : Request() {

    constructor(
        item:CreateCoinsTransactionRequestFromWalletRequestItem
    ):this( CreateCoinsTransactionRequestFromWalletRequestData( item ) )

}