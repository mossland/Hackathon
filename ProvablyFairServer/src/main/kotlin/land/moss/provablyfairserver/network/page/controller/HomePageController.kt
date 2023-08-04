package com.j3566.ruonine.network.page.controller

import ch.qos.logback.core.model.Model
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/")
class HomePageController {

    @RequestMapping("")
    fun index(model : Model) : String {
        return "index"
    }
}