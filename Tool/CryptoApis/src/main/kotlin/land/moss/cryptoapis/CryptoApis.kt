package land.moss.cryptoapis

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import land.moss.cryptoapis.request.*
import land.moss.tool.StringUtils
import land.moss.cryptoapis.response.CreateCoinsTransactionRequestFromAddressResponse
import land.moss.cryptoapis.response.GenerateDepositAddressResponse
import land.moss.cryptoapis.response.CreateCoinsTransactionRequestFromWalletResponse
import land.moss.cryptoapis.response.NewConfirmedCoinsTransactionsResponse
import land.moss.http.HttpConnector
import land.moss.http.HttpHeaderList
import land.moss.http.HttpMethod
import land.moss.http.HttpResponse

class CryptoApis( val apiKey: String ) {

    val mapper = jacksonObjectMapper()

    companion object {

        const val BASE_URL = "https://rest.cryptoapis.io"
    }
    fun generateDepositAddress(
        blockchain: Blockchain,
        network: Network,
        walletId: String,
        request: GenerateDepositAddressRequest): GenerateDepositAddressResponse {

        val url = "${CryptoApis.BASE_URL}/wallet-as-a-service/wallets/${walletId}/${blockchain.value}/${network.name}/addresses"
        return this.request( HttpMethod.POST, url, request )
    }

    fun createCoinsTransactionRequestFromWallet(
        blockchain: Blockchain,
        network: Network,
        walletId: String,
        request: CreateCoinsTransactionRequestFromWalletRequest
    ): CreateCoinsTransactionRequestFromWalletResponse {

        val url = "${CryptoApis.BASE_URL}/wallet-as-a-service/wallets/${walletId}/${blockchain.value}/${network.name}/transaction-requests"
        return this.request( HttpMethod.POST, url, request )
    }

    fun createCoinsTransactionRequestFromAddress(
        blockchain: Blockchain,
        network: Network,
        walletId: String,
        address: String,
        request: CreateCoinsTransactionRequestFromAddressRequest
    ): CreateCoinsTransactionRequestFromAddressResponse {

        val url = "${CryptoApis.BASE_URL}/wallet-as-a-service/wallets/${walletId}/${blockchain.value}/${network.name}/addresses/${address}/transaction-requests"
        return this.request( HttpMethod.POST, url, request )
    }

    
    fun newConfirmedCoinsTransactionsRequest(
        blockchain: Blockchain,
        network: Network,
        request: NewConfirmedCoinsTransactionsRequest
    ): NewConfirmedCoinsTransactionsResponse {

        val url = "${CryptoApis.BASE_URL}/blockchain-events/${blockchain}/${network.name}/subscriptions/address-coins-transactions-confirmed"
        return this.request( HttpMethod.POST, url, request )
    }


    private inline fun <reified T> request(method:String, url:String, request: Request) : T {

        val httpConnector = HttpConnector( method, url )

        httpConnector.httpHeaderList = HttpHeaderList(
            "Content-Type", "application/json",
            "X-API-Key", this.apiKey
        )

        httpConnector.httpRequestBody = this.mapper.writeValueAsString( request )
        val httpResponse:HttpResponse = httpConnector.request()
        val responseString:String = this.extractResponseString( httpResponse )
        val response = this.mapper.readValue<T>(responseString)
        httpResponse.shutdown();
        httpConnector.shutdown();
        return response;

    }

    private fun extractResponseString( httpResponse:HttpResponse ): String {

        val response:String? = httpResponse.getContentString();
        if ( StringUtils.isBlank(response)) {
            throw CryptoApisException("response is empty")
        }

        return response!!
    }




}

