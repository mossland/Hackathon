package com.j3566.stockinsight.tool

import java.security.MessageDigest
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

class CryptoUtils {

    companion object {

        fun sha512(input: String): String {

            val md = MessageDigest.getInstance("SHA-512")
            val digest = md.digest(input.toByteArray())
            return digest.fold("") { str, it -> str + "%02x".format(it) }
        }

        fun sha256(input: String): String {

            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(input.toByteArray())
            return digest.fold("") { str, it -> str + "%02x".format(it) }
        }


        private val HEX_CHAR_ARRAY = "0123456789ABCDEF".toCharArray()

        fun bytesToHexString(bytes: ByteArray): String {
            val result = CharArray(bytes.size * 2)

            var index = 0
            for (byte in bytes) {
                val octet = byte.toInt() and 0xFF
                result[index++] = HEX_CHAR_ARRAY[octet ushr 4]
                result[index++] = HEX_CHAR_ARRAY[octet and 0x0F]
            }

            return String(result)
        }

        fun aseEncrypt(data: String, key: String, iv: String): ByteArray {
            val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
            val secretKeySpec = SecretKeySpec(key.toByteArray(Charsets.UTF_8), "AES")
            val ivParameterSpec = IvParameterSpec(iv.toByteArray(Charsets.UTF_8))

            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivParameterSpec)
            return cipher.doFinal(data.toByteArray(Charsets.UTF_8))
        }

        fun aesEncryptWithBase64(data: String, key: String, iv: String): String =
            Base64.getEncoder().encodeToString(CryptoUtils.aseEncrypt(data, key, iv))

        fun aesEncryptWithHex(data: String, key: String, iv: String): String =
            CryptoUtils.bytesToHexString(CryptoUtils.aseEncrypt(data, key, iv))


        fun hexStringToBytes(hexString: String): ByteArray {
            val length = hexString.length
            if (length % 2 != 0) {
                throw IllegalArgumentException("Invalid hex stringr")
            }

            val result = ByteArray(length / 2)
            var i = 0
            var j = 0

            while (i < length) {
                val digit1 = CryptoUtils.hexCharToInt(hexString[i])
                val digit2 = CryptoUtils.hexCharToInt(hexString[i + 1])
                result[j++] = ((digit1 shl 4) or digit2).toByte()
                i += 2
            }

            return result
        }

        private fun hexCharToInt(hexChar: Char): Int {
            return when (hexChar) {
                in '0'..'9' -> hexChar - '0'
                in 'A'..'F' -> hexChar - 'A' + 10
                in 'a'..'f' -> hexChar - 'a' + 10
                else -> throw IllegalArgumentException("Invalid hex char: $hexChar")
            }
        }

        fun aesDecrypt(encryptedData: ByteArray, key: String, iv: String): String {
            val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
            val secretKeySpec = SecretKeySpec(key.toByteArray(Charsets.UTF_8), "AES")
            val ivParameterSpec = IvParameterSpec(iv.toByteArray(Charsets.UTF_8))

            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec)
            val decryptedBytes = cipher.doFinal(encryptedData)

            return String(decryptedBytes)
        }

        fun aesDecryptWithBase64(encrypted: String, key: String, iv: String): String =
            CryptoUtils.aesDecrypt(Base64.getDecoder().decode(encrypted), key, iv)


        fun aesDecryptWithHex(encrypted: String, key: String, iv: String): String =
            CryptoUtils.aesDecrypt(CryptoUtils.hexStringToBytes(encrypted), key, iv)

    }
}