package land.moss.cryptoapis.response

class NewConfirmedCoinsTransactionsResponseItem {

    val address: String? = null
    val callbackSecretKey: String? = null
    val callbackUrl: String? = null
    val createdTimestamp: Long? = null
    val eventType: String? = null
    val isActive: Boolean? = null
    val receiveCallbackOn: Int? = null
    val referenceId: String? = null
}

class NewConfirmedCoinsTransactionsResponseData  {
    var item:NewConfirmedCoinsTransactionsResponseItem? = null
}

class NewConfirmedCoinsTransactionsResponse (
) : Response() {
    var data:NewConfirmedCoinsTransactionsResponseData? = null
}