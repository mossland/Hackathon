package land.moss.provablyfairserver.network.api.response

import com.fasterxml.jackson.annotation.JsonInclude
import land.moss.provablyfairserver.Code

@JsonInclude(JsonInclude.Include.NON_NULL)
class ApiResponse() {

    var code: Code? = null
    var message:String? = null;
    var body:Any? = null;
}