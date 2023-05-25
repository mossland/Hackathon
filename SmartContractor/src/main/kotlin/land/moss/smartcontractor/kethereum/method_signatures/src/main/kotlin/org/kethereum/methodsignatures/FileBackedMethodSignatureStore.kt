package org.kethereum.methodsignatures

import org.kethereum.abi.model.EthereumFunction
import org.kethereum.methodsignatures.model.HexMethodSignature
import org.kethereum.methodsignatures.model.TextMethodSignature
import java.io.File

private fun toStringSet(file: File) = semicolonSeparatedStringArray(file).toHashSet()
private fun toTextSignatureSet(file: File) = semicolonSeparatedStringArray(file).map {
    TextMethodSignature(it)
}.toHashSet()

private fun semicolonSeparatedStringArray(file: File) = file.readText().split(";")

class FileBackedMethodSignatureStore(private val storeDir: File) {

    fun upsert(signatureHash: String, signatureText: String): Boolean {
        val file = File(storeDir, signatureHash)
        val isNewEntry = !file.exists()
        return isNewEntry.also {
            val res = if (isNewEntry) {
                HashSet()
            } else {
                toStringSet(file)
            }
            res.add(signatureText)
            file.writeText(res.joinToString(";"))
        }
    }

    fun upsert(signatureHash: HexMethodSignature, signatureText: TextMethodSignature) = upsert(signatureHash.hex, signatureText.normalizedSignature)
    fun upsert(function: EthereumFunction) = function.toTextMethodSignature().let { foo -> upsert(foo.toHexSignature(), foo) }

    fun get(signatureHash: String) = toTextSignatureSet(toFile(signatureHash))
    fun has(signatureHash: String) = toFile(signatureHash).exists()
    fun all() = storeDir.list()?.toList()?: emptyList()
    private fun toFile(signatureHash: String) = File(storeDir, signatureHash)

}