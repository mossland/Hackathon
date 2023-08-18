package land.moss.provablyfairserver.network.api.response

import jakarta.servlet.http.HttpServletRequest
import land.moss.provablyfairserver.Code
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.MessageSource
import org.springframework.stereotype.Component

@Component
class ApiResponseFactory {

    @Autowired
    private lateinit var messageSource:MessageSource;

    @JvmOverloads fun create(code: Code, body: Any? = null, message:String? = null, httpServletRequest: HttpServletRequest? = null): ApiResponse {

            val apiResponse = ApiResponse()
            apiResponse.code = code
            apiResponse.body = body

            if ( message == null ) {

                // 성공 아닐때만 메세지 내려주자.
                if ( code != Code.SUCCESS ) {
                    apiResponse.message = code.name
                }

            } else {
                apiResponse.message = message
            }

            return apiResponse;
        }
}