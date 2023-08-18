package land.moss.provablyfairserver.exception

import land.moss.provablyfairserver.Code

class CodedException @JvmOverloads constructor(
    var code: Code,
    override var message: String? = null,
    var body: Any? = null
) : Exception(message) {
}