package land.moss.exception

class CodedException @JvmOverloads constructor(
    var code: Code,
    override var message: String? = null,
    var body: Any? = null
) : Exception(message) {
}