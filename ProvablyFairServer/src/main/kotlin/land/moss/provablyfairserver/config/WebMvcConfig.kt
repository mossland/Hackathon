package land.moss.provablyfairserver.config

import land.moss.provablyfairserver.Constants
import org.springframework.context.annotation.Configuration
import org.springframework.format.FormatterRegistry
import org.springframework.format.datetime.standard.DateTimeFormatterRegistrar
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.time.format.DateTimeFormatter


@Configuration
class WebMvcConfig : WebMvcConfigurer {

    override fun addFormatters(registry: FormatterRegistry) {
        val registrar = DateTimeFormatterRegistrar()
        registrar.setDateFormatter(DateTimeFormatter.ofPattern(Constants.DEFAULT_DATE_FORMAT))
        registrar.setDateTimeFormatter(DateTimeFormatter.ofPattern(Constants.DEFAULT_DATETIME_FORMAT))
        registrar.registerFormatters(registry)
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/res/**").addResourceLocations("classpath:/res/")
        registry.addResourceHandler("/lia/**").addResourceLocations("classpath:/lia/")
    }
}