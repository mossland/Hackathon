package land.moss.cryptoapis.response

import land.moss.cryptoapis.FeePriority

class CreateAutomaticCoinsForwardingResponseItem {
    var callbackUrl:String? = null
    var confirmationsCount:String? = null
    var createdTimestamp:Long? = null
    var feePriority: FeePriority? = null
    var fromAddress:String? = null
    var minimumTransferAmount:String? = null
    var referenceId:String? = null
    var toAddress:String? = null
}

class CreateAutomaticCoinsForwardingResponseData  {
    var item:CreateAutomaticCoinsForwardingResponseItem? = null
}

class CreateAutomaticCoinsForwardingResponse (
) : Response() {
    var data:CreateAutomaticCoinsForwardingResponseData? = null
}