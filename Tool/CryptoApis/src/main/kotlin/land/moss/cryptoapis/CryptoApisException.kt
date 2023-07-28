package land.moss.cryptoapis

class CryptoApisException  @JvmOverloads constructor(
    override var message: String? = null,
) : Exception(message) {
}