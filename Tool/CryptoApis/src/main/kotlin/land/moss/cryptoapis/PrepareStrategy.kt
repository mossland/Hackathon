package land.moss.cryptoapis

import com.fasterxml.jackson.annotation.JsonValue


enum class PrepareStrategy ( @get:JsonValue val value: String ) {
    minimize_dust("minimize-dust"),
    await_optimize_size("await-optimize-size");
    @JsonValue
    fun getSerializedValue(): String = value
}