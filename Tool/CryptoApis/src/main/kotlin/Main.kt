import land.moss.cryptoapis.Blockchain
import land.moss.cryptoapis.CryptoApis
import land.moss.cryptoapis.Network
import land.moss.cryptoapis.reponse.GenerateDepositAddressResponse
import land.moss.cryptoapis.request.GenerateDepositAddressRequest

fun main(args: Array<String>) {

    val apiKey = "YOUR_API_KEY"
    val walletId = "YOUR_WALLET_ID"

    val cryptoApis = CryptoApis(apiKey);

    val response: GenerateDepositAddressResponse = cryptoApis.generateDepositAddress(
        Blockchain.bitcoin,
        Network.testnet,
        walletId,
        GenerateDepositAddressRequest( "test" )
    )

    print(response)
}