package land.moss.bitgo


class BitgoTransferEntry {

    var address: String? = null
    var wallet: String? = null
    var value: Long? = null
    var valueString : String? = null
    var isChange : Boolean? = null
    var isPayGo : Boolean? = null
}

class BitgoTransfer() {

    var id: String? = null
    var txid: String? = null
    var type: String? = null
    var state: String? = null
    var confirmations: Int? = null
    val value: Long? = null
    val valueString: String? = null
    val entries: List<BitgoTransferEntry>? = null

    var json: String? = null
}