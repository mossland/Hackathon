import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

data class Result(val hmacMessage: String?, val roll: Float?)

class FairServer {
    private var serverKey: ByteArray? = null
    private var nonce: ULong = 0u

    fun startSession(): ByteArray {
        if (serverKey != null)
            throw IllegalStateException("You must call EndSession before starting a new session")

        // Generate a new server key.
        val rng = SecureRandom()
        serverKey = ByteArray(128)
        rng.nextBytes(serverKey)

        nonce = 0u

        // Hash the server key and return it to the player.
        val sha = MessageDigest.getInstance("SHA-256")
        return sha.digest(serverKey)
    }

    fun roll(userKey: String): Result {
        if (serverKey == null)
            throw IllegalStateException("You must call StartSession first")
        if (nonce == ULong.MAX_VALUE)
            throw IllegalStateException("Ran out of Nonce values, you must start a new session.")

        val hmac = Mac.getInstance("HmacSHA256")
        val secretKeySpec = SecretKeySpec(serverKey, "HmacSHA256")
        hmac.init(secretKeySpec)

        var roll: Float? = null
        var message: String? = null
        while (roll == null) {
            message = "$userKey-$nonce"
            nonce++

            val data = message.toByteArray(Charsets.UTF_8)
            val hash = hmac.doFinal(data)
            roll = getNumberFromByteArray(hash)
        }
        return Result(message, roll)
    }

    private fun getNumberFromByteArray(hash: ByteArray): Float? {
        val hashString = hash.joinToString("") { "%02X".format(it) }
        val chars = 5
        for (i in 0..hashString.length - chars step chars) {
            val substring = hashString.substring(i, i + chars)
            val number = substring.toIntOrNull(16)
            if (number != null && number <= 999999)
                return (number % 10000) / 100.0f
        }
        return null
    }

    fun endSession(): ByteArray {
        val key = serverKey
        serverKey = null
        return key ?: throw IllegalStateException("No active session to end")
    }
}