package land.moss.provablyfairserver.service

import land.moss.provablyfairserver.Code
import land.moss.provablyfairserver.exception.CodedException
import land.moss.provablyfairserver.model.ProvablyFairResult
import org.springframework.stereotype.Service
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Service
class ApiService  {
    fun generateResult(serverSeed: String, clientSeed: String, nonce: String, size: Int): ProvablyFairResult {

        val serverSeedByteArray = serverSeed.toByteArray(Charsets.UTF_8);

        val hmac = Mac.getInstance("HmacSHA256")
        val secretKeySpec = SecretKeySpec(serverSeedByteArray, "HmacSHA256")
        hmac.init(secretKeySpec)

        val message = "$clientSeed-$nonce"

        val hash = hmac.doFinal(message.toByteArray(Charsets.UTF_8))

        val resultString = hash.joinToString("") { "%02X".format(it) }.substring(0, 5)

        val resultNumber = resultString.toIntOrNull(16)!!

        val number = ((size * ( resultNumber % 65535 ) ).div(65535))

        return ProvablyFairResult(resultString, number)
    }

    fun checkNumber(serverSeed: String, clientSeed: String, nonce: String, size: Int, number: Int) {

        val provablyFairResult = generateResult(serverSeed, clientSeed, nonce, size)
        if ( provablyFairResult.number != number ) {
            throw CodedException(Code.NOT_MATCHED_NUMBER)
        }
    }

}