package land.moss.cryptoapis.callback

class NewConfirmedCoinsTransactionsCallbackItemMinedInBlock {
    var height: Int? = null
    var hash: String? = null
    var timestamp: Long? = null
}

class NewConfirmedCoinsTransactionsCallbackItem {
    var blockchain: String? = null
    var network: String? = null
    var address: String? = null
    var minedInBlock: NewConfirmedCoinsTransactionsCallbackItemMinedInBlock? = null
    var transactionId: String? = null
    var amount: String? = null
    var unit: String? = null
    var direction: String? = null
}

class NewConfirmedCoinsTransactionsCallbackData : CallbackData() {
    var item : NewConfirmedCoinsTransactionsCallbackItem? = null
}

class NewConfirmedCoinsTransactionsCallback : Callback() {
    var data:NewConfirmedCoinsTransactionsCallbackData? = null
}