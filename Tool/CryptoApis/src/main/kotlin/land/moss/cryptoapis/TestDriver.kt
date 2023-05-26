package land.moss.cryptoapis

import cryptoapis.reponse.GenerateDepositAddressResponse
import cryptoapis.request.GenerateDepositAddressRequest
import cryptoapis.request.GenerateDepositAddressRequestItem


fun main() {

    val cryptoApis = CryptoApis("9bd9eba495c9dc246786a6c7742ad580a05c6ae8");

    val response:GenerateDepositAddressResponse = cryptoApis.generateDepositAddress(
        Blockchain.bitcoin,
        Network.testnet,
        "646c669318923a00079bf389",
        GenerateDepositAddressRequest( "test" ))

    print(response)
}
