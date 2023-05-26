package land.moss.cryptoapis.response

import land.moss.cryptoapis.FeePriority

class CreateCoinsTransactionRequestFromAddressResponseItemSenders {
    var address:String? = null
}

class CreateCoinsTransactionRequestFromAddressResponseItemRecipient {
    var address:String? = null
    var addressTag:Long? = null
    var amount:String? = null
    var classicAddress:String? = null
}

class CreateCoinsTransactionRequestFromAddressResponseItem {
    var addressTag:Long? = null
    var callbackSecretKey:String? = null
    var callbackUrl:String? = null
    var classicAddress:String? = null
    var feePriority:FeePriority? = null
    var note:String? = null
    var recipients:List<CreateCoinsTransactionRequestFromAddressResponseItemRecipient>? = null
    var senders:CreateCoinsTransactionRequestFromAddressResponseItemSenders? = null
    var transactionRequestId:String? = null
    var transactionRequestStatus:String? = null
}

class CreateCoinsTransactionRequestFromAddressResponseData {
    var item:GenerateDepositAddressResponseItem? = null
}

class CreateCoinsTransactionRequestFromAddressResponse(
) : Response() {
    var data:GenerateDepositAddressResponseData? = null
}