package land.moss.cryptoapis.callback

class NewConfirmedTokensTransactionsCallbackItemMinedInBlock {
    var height: Int? = null
    var hash: String? = null
    var timestamp: Long? = null
}

class NewConfirmedTokensTransactionsCallbackItemToken {
    var name: String? = null
    var symbol: String? = null
    var decimals: String? = null
    var amount: String? = null
    var contractAddress: String? = null
}

class NewConfirmedTokensTransactionsCallbackItem {
    var blockchain: String? = null
    var network: String? = null
    var address: String? = null
    var minedInBlock: NewConfirmedTokensTransactionsCallbackItemMinedInBlock? = null
    var transactionId: String? = null
    var tokenType: String? = null
    var token: NewConfirmedTokensTransactionsCallbackItemToken? = null
    var direction: String? = null
}

class NewConfirmedTokensTransactionsCallbackData : CallbackData() {
    var item : NewConfirmedTokensTransactionsCallbackItem? = null
}

class NewConfirmedTokensTransactionsCallback : Callback() {
    var data:NewConfirmedTokensTransactionsCallbackData? = null
}