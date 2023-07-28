package land.moss.http

import com.fasterxml.jackson.annotation.JsonValue
import java.net.http.HttpClient

class HttpMethod {

    companion object {
        const val GET =  "GET"
        const val POST = "POST"
        const val PUT = "PUT"
        const val DELETE = "DELETE"
    }

}