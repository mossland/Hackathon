package land.moss.provablyfairserver.network.api.controller

import jakarta.servlet.http.HttpServletRequest
import land.moss.provablyfairserver.Code
import land.moss.provablyfairserver.network.api.response.ApiResponse
import land.moss.provablyfairserver.network.api.response.ApiResponseFactory
import org.springframework.beans.factory.annotation.Autowired

open class BaseApiController {

    @Autowired
    private lateinit var apiResponseFactory : ApiResponseFactory;

    fun createSuccessResponse(
        request: HttpServletRequest,
        body:Any? = null,
    ) : ApiResponse =  apiResponseFactory.create(Code.SUCCESS, body, null, request)

}