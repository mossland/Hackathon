package land.moss.cryptoapis.response

import land.moss.cryptoapis.FeePriority
import land.moss.cryptoapis.TransactionRequestStatus

class CreateCoinsTransactionRequestFromWalletResponseItemRecipient {
    var address:String? = null
    var amount:String? = null
}

class CreateCoinsTransactionRequestFromWalletResponseItem {
    var callbackSecretKey:String? = null
    var callbackUrl:String? = null
    var feePriority:FeePriority? = null
    var note:String? = null
    var recipients:List<CreateCoinsTransactionRequestFromWalletResponseItemRecipient>? = null
    var totalTransactionAmount:String? = null
    var transactionRequestId:String? = null
    var transactionRequestStatus:TransactionRequestStatus? = null
}

class CreateCoinsTransactionRequestFromWalletResponseData {
    var item:CreateCoinsTransactionRequestFromWalletResponseItem? = null
}

class CreateCoinsTransactionRequestFromWalletResponse(
) : Response() {
    var data:CreateCoinsTransactionRequestFromWalletResponseData? = null
}