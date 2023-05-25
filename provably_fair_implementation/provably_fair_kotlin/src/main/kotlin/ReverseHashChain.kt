import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

data class ReverseHashChainResult(
    val index: Int,
    val seed: ByteArray,
    val random: Float?
)

class ReverseHashChain(private val hashSize: Int, private val maxRandomValue: Int) {
    val hashList: MutableList<ReverseHashChainResult> = mutableListOf()

    private val salt: ByteArray
    private val seed: ByteArray

    init {
        // Generate a new seed hash.
        val rng = SecureRandom()

        seed = ByteArray(128)
        rng.nextBytes(seed)

        salt = ByteArray(128)
        rng.nextBytes(salt)

        // Create a reverse hash-chain.
        var hash = seed

        val hmac = Mac.getInstance("HmacSHA256")
        val secretKeySpec = SecretKeySpec(salt, "HmacSHA256")
        hmac.init(secretKeySpec)

        for (i in 0 until hashSize) {
            val result = ReverseHashChainResult(hashSize - i, hash, getNumberFromByteArray(hash)?.times(maxRandomValue))
            hashList.add(result)

            hash = hmac.doFinal(hash)
        }

        hashList.reverse()
    }

    private fun getNumberFromByteArray(hash: ByteArray): Float? {
        val hashString = hash.joinToString("") { "%02X".format(it) }
        val chars = 5
        for (i in 0..hashString.length - chars step chars) {
            val substring = hashString.substring(i, i + chars)
            val number = substring.toIntOrNull(16)
            if (number != null && number <= 999999)
                return (number % 10000) / 10000.0f
        }
        return null
    }
}