package land.moss.cryptoapis.request

import land.moss.cryptoapis.FeePriority

class CreateAutomaticCoinsForwardingRequestItem (
    var callbackSecretKey:String,
    var callbackUrl:String,
    var confirmationsCount:Int,
    var feePriority: FeePriority,
    var minimumTransferAmount:String,
    var toAddress:String
) {
}

class CreateAutomaticCoinsForwardingRequestData ( var item:CreateAutomaticCoinsForwardingRequestItem ) {
}

class CreateAutomaticCoinsForwardingRequest (
    val data: CreateAutomaticCoinsForwardingRequestData
) : Request() {

    constructor(
        item:CreateAutomaticCoinsForwardingRequestItem
    ):this( CreateAutomaticCoinsForwardingRequestData( item ) )

}