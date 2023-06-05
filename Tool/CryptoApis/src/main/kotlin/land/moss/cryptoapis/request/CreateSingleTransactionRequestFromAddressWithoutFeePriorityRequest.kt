package land.moss.cryptoapis.request

import land.moss.cryptoapis.FeePriority

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestItem (
    var amount:String,
    var feePriority: FeePriority,
    var recipientAddress:String,

    var callbackSecretKey:String? = null,
    var callbackUrl:String? = null,
    var note:String? = null,
) {
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestData ( var item:CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestItem ) {
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequest (
    val data: CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestData
) : Request() {

    constructor(
        item:CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestItem
    ):this( CreateSingleTransactionRequestFromAddressWithoutFeePriorityRequestData( item ) )

}