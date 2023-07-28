package land.moss.cryptoapis.response

class NewConfirmedTransactionsResponseItem {

    val address: String? = null
    val callbackSecretKey: String? = null
    val callbackUrl: String? = null
    val createdTimestamp: Long? = null
    val eventType: String? = null
    val isActive: Boolean? = null
    val receiveCallbackOn: Int? = null
    val referenceId: String? = null
}

class NewConfirmedTransactionsResponseData  {
    var item:NewConfirmedTransactionsResponseItem? = null
}

class NewConfirmedTransactionsResponse (
) : Response() {
    var data:NewConfirmedTransactionsResponseData? = null
}