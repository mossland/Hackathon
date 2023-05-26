package land.moss.cryptoapis.callback


class CreateCoinsTransactionRequestCallbackItem {
    val blockchain: String? = null
    val network: String? = null
    val requiredApprovals: Int? = null
    val requiredRejections: Int? = null
    val currentApprovals: Int? = null
    val currentRejections: Int? = null
}

class CreateCoinsTransactionRequestCallbackData : CallbackData() {
    var item : CreateCoinsTransactionRequestCallbackItem? = null
}

class CreateCoinsTransactionRequestCallback : Callback() {
    var data:CreateCoinsTransactionRequestCallbackData? = null
}