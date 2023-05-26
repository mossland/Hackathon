package land.moss.cryptoapis.reponse

import cryptoapis.Blockchain
import cryptoapis.Network
import cryptoapis.request.Request

class GenerateDepositAddressResponseItem {
    var address:String? = null
    var createdTimestamp:Long? = null
    var label:String? = null
}

class GenerateDepositAddressResponseData {
    var item:GenerateDepositAddressResponseItem? = null
}


class GenerateDepositAddressResponse(
) : Response() {
    var data:GenerateDepositAddressResponseData? = null
}