package land.moss.provablyfairserver.network.page.response

import jakarta.servlet.http.HttpServletRequest
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice(basePackages = ["land.moss.provablyfairserver.network.page.controller"])
class PageExceptionHandler {
    @ExceptionHandler(value = [Exception::class])
    fun handle(ex: Exception, model: Model, request: HttpServletRequest): String {
        ex.printStackTrace()
        return "error";
    }

}