package land.moss.cryptoapis.callback


class CreateCoinsTransactionRequestCallbackItem {
    var blockchain: String? = null
    var network: String? = null
    var requiredApprovals: Int? = null
    var requiredRejections: Int? = null
    var currentApprovals: Int? = null
    var currentRejections: Int? = null
    var errorMessage: String? = null
}

class CreateCoinsTransactionRequestCallbackData : CallbackData() {
    var item : CreateCoinsTransactionRequestCallbackItem? = null
}

class CreateCoinsTransactionRequestCallback : Callback() {
    var data:CreateCoinsTransactionRequestCallbackData? = null
}