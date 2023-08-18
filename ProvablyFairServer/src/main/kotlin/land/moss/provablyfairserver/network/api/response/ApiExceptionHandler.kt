package land.moss.provablyfairserver.network.api.response

import jakarta.servlet.http.HttpServletRequest
import land.moss.provablyfairserver.Code
import land.moss.provablyfairserver.exception.CodedException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException

@RestControllerAdvice(basePackages = ["land.moss.provablyfairserver.network.api.controller"])
class ApiExceptionHandler {

    @Autowired
    private lateinit var apiResponseFactory: ApiResponseFactory;

    @ExceptionHandler(value = [Exception::class])
    fun handle(ex: Exception, request: HttpServletRequest): ApiResponse {

        val code: Code;
        var message: String? = null;
        var body: Any? = null;

        if (ex is CodedException) {
            code = ex.code;
            message = ex.message
            body = ex.body;
        } else {

            if (
                ex is MissingServletRequestParameterException ||
                ex is MethodArgumentTypeMismatchException
            ) {
                code = Code.INVALID_PARAMETER;
            } else {
                code = Code.ETC;
            }

            // TODO 디버깅 모드일때만 출력할지 체크 필요
            ex.printStackTrace();
        }

        return apiResponseFactory.create(code, body, message, request);
    }

}