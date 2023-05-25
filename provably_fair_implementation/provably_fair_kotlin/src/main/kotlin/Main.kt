import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

fun main() {
    // Test #1
    val server = FairServer()
    val hash = server.startSession()

    println("== Test #1 ==")
    println("Hashed server seed: ${hash.joinToString("") { "%02X".format(it) }}")

    repeat(10) {
        val roll = server.roll("My Key")
        println("Client seed + Nonce: ${roll.hmacMessage}, Result: ${roll.roll}")
    }

    val key = server.endSession()
    println("Server Seed: ${key.joinToString("") { "%02X".format(it) }}")


    // Test #2
    val rhc = ReverseHashChain(10, 100)

    println()
    println("== Test #2 ==")

    for (i in rhc.hashList.indices) {
        val rhcr = rhc.hashList[i]
        println("Index: $i, Random: ${rhcr.random}, Hash: ${rhcr.seed.joinToString("") { "%02X".format(it) }}")
    }
}