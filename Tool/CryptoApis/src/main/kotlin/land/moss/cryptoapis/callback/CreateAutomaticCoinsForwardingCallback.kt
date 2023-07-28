package land.moss.cryptoapis.callback

class CreateAutomaticCoinsForwardingCallbackItem {
    var blockchain: String? = null
    var network: String? = null
    var fromAddress: String? = null
    var toAddress: String? = null
    var forwardedAmount: String? = null
    var forwardedUnit: String? = null
    var spentFeesUnit: String? = null
    var triggerTransactionId: String? = null
    var forwardingTransactionId: String? = null

    var errorCode: String? = null
    var errorMessage: String? = null
}

class CreateAutomaticCoinsForwardingCallbackData : CallbackData() {
    var item : CreateAutomaticCoinsForwardingCallbackItem? = null
}

class CreateAutomaticCoinsForwardingCallback : Callback() {
    var data:CreateAutomaticCoinsForwardingCallbackData? = null
}