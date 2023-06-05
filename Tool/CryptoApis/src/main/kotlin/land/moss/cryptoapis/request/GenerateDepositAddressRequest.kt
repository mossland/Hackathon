package land.moss.cryptoapis.request


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