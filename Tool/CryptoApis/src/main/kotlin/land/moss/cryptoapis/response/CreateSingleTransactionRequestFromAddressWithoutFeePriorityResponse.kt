package land.moss.cryptoapis.response

import land.moss.cryptoapis.FeePriority
import land.moss.cryptoapis.TransactionRequestStatus

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItemSenders {
    var address:String? = null
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItemRecipient {
    var address:String? = null
    var amount:String? = null
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItem {
    var callbackSecretKey:String? = null
    var callbackUrl:String? = null
    var feePriority: FeePriority? = null
    var note:String? = null
    var recipients:List<CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItemRecipient>? = null
    var senders:CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItemSenders? = null
    var transactionRequestId:String? = null
    var transactionRequestStatus: TransactionRequestStatus? = null
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseData {
    var item:CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseItem? = null
}

class CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponse (
) : Response() {
    var data:CreateSingleTransactionRequestFromAddressWithoutFeePriorityResponseData? = null
}