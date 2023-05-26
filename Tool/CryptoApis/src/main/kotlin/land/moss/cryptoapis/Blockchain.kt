package land.moss.cryptoapis

import com.fasterxml.jackson.annotation.JsonValue

enum class Blockchain ( @get:JsonValue val value: String ) {
    bitcoin("bitcoin"),
    bitcoin_cash("bitcoin-cash"),
    litecoin("litecoin"),
    dogecoin("dogecoin"),
    dash("dash"),
    ethereum("ethereum"),
    ethereum_classic("ethereum-classic"),
    xrp("xrp"),
    zcash("zcash"),
    binance_smart_chain("binance-smart-chain"),
    tron("tron");

    @JsonValue
    fun getSerializedValue(): String = value
}