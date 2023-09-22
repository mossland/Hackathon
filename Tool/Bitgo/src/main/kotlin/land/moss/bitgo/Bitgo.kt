package land.moss.bitgo

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import land.moss.bitgo.BitgoResult
import land.moss.exception.Code
import land.moss.exception.CodedException
import land.moss.tool.LogUtils
import land.moss.http.HttpConnector
import land.moss.http.HttpHeaderList
import land.moss.http.HttpMethod
import land.moss.http.HttpParameterList
import org.apache.hc.core5.http.HttpStatus

class Bitgo (
    private val url:String,
    private val accessToken:String
) {

    private val objectMapper = ObjectMapper()

    fun request(method:String, url:String, httpParameterList: HttpParameterList? = null) : BitgoResult {

        val httpConnector = HttpConnector(method, url)
        httpConnector.httpHeaderList = HttpHeaderList(
            "Authorization", "Bearer $accessToken"
        )

        if ( httpParameterList != null ) {
            httpConnector.httpParameterList = httpParameterList
        }

        val httpResponse = httpConnector.request()

        val contentString = httpResponse.getContentString()
        val success = httpResponse.statusCode == HttpStatus.SC_SUCCESS

        LogUtils.log("Bitgo.request() - $method $url - $success - $contentString")

        httpResponse.shutdown()
        httpConnector.shutdown()

        val result = BitgoResult(success, contentString)
        if ( !result.success ) {
            throw CodedException(Code.BITGO_API_ERROR)
        }

        return result
    }

    fun createAddress(
        coin: String,
        walletId: String
    ): BitgoAddress {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/address"

        val result = request(HttpMethod.POST, apiUrl)

        val response = result.body ?: throw CodedException(Code.BITGO_API_ERROR)

        return objectMapper.readValue<BitgoAddress>(response)
    }

    fun consolidateAccountBalance(
        coin: String,
        walletId: String
    ) {

        val apiUrl = "$url/api/v2/{$coin/wallet/$walletId/consolidateAccount/build"
        request(HttpMethod.POST, apiUrl)
    }

    fun addWalletWebhook(coin: String, walletId: String, bitgoWebhookUrl: String) {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/webhooks"

        request(HttpMethod.POST, apiUrl, HttpParameterList(
            "url", bitgoWebhookUrl,
            "type", "transfer"
        ))
    }

    fun removeWalletWebhook(coin: String,
                            walletId: String,
                            bitgoWebhookUrl: String,
                            webhookId: String) {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/webhooks"

        request(HttpMethod.DELETE, apiUrl, HttpParameterList(
            "url", bitgoWebhookUrl,
            "type", "transfer",
            "id", webhookId
        ))
    }

    fun listWalletWebhooks(coin: String,
                            walletId: String) : BitgoWebhooks {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/webhooks"

        val result = request(HttpMethod.GET, apiUrl)

        val response = result.body ?: throw CodedException(Code.BITGO_API_ERROR)

        return objectMapper.readValue<BitgoWebhooks>(response)
    }

    fun getTransfer(coin: String, walletId: String, transferId: String): BitgoTransfer {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/transfer/$transferId"

        val result = request(HttpMethod.GET, apiUrl)

        val response = result.body ?: throw CodedException(Code.BITGO_API_ERROR)

        val bitgoTransfer = objectMapper.readValue<BitgoTransfer>(response)

        bitgoTransfer.json = response

        return bitgoTransfer
    }

    fun sendCoins(coin: String, walletId: String, address: String, amount: Long, walletPassphrase: String?): BitgoCoinsSending {

        val apiUrl = "$url/api/v2/$coin/wallet/$walletId/sendcoins"

        val httpParameterList = HttpParameterList(
            "address", address,
            "amount", amount.toString()
        )

        if ( walletPassphrase != null ) {
            httpParameterList.add("walletPassphrase", walletPassphrase)
        }

        val result = request(HttpMethod.POST, apiUrl)

        val response = result.body ?: throw CodedException(Code.BITGO_API_ERROR)

        val bitgoCoinsSending = objectMapper.readValue<BitgoCoinsSending>(response)

        bitgoCoinsSending.json = response

        return bitgoCoinsSending
    }
}