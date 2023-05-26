package land.moss.cryptoapis.request

import cryptoapis.Blockchain
import cryptoapis.Network


class GenerateDepositAddressRequestItem ( var label:String ) {
}

class GenerateDepositAddressRequestData ( var item:GenerateDepositAddressRequestItem ) {
}




class GenerateDepositAddressRequest(
    val data: GenerateDepositAddressRequestData
) : Request() {

    constructor(
        label:String
    ):this( GenerateDepositAddressRequestData(GenerateDepositAddressRequestItem( label ) ) )
}