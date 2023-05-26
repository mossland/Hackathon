package land.moss.cryptoapis

import com.fasterxml.jackson.annotation.JsonValue

enum class TransactionRequestStatus ( @get:JsonValue val value: String ) {
    created("created"),
    await_approval("await-approval"),
    pending("pending"),
    prepared("prepared"),
    signed("signed"),
    broadcasted("broadcasted"),
    success("success"),
    failed("failed"),
    rejected("rejected"),
    mined("mined");

    @JsonValue
    fun getSerializedValue(): String = value
}