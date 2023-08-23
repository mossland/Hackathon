package land.moss.provablyfairserver.network.api.controller

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import land.moss.provablyfairserver.service.ApiService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api", produces = ["application/json;charset=UTF-8"])
class ApiController : BaseApiController() {

    @Autowired
    private lateinit var apiService: ApiService

    @PostMapping("/generateResult")
    fun generateResult(

        @RequestParam serverSeed: String,
        @RequestParam clientSeed: String,
        @RequestParam nonce: String,
        @RequestParam size: Int,

        request: HttpServletRequest,
        response: HttpServletResponse
    ) : Any? {

        val item = apiService.generateResult(
            serverSeed,
            clientSeed,
            nonce,
            size
        )

        return createSuccessResponse(request, item)
    }


}