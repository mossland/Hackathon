package land.moss.cryptoapis.request

import land.moss.cryptoapis.Blockchain
import land.moss.cryptoapis.Network


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