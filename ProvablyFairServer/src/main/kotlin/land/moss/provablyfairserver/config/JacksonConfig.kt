package land.moss.provablyfairserver.config

import land.moss.provablyfairserver.helper.JacksonHelper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder

@Configuration
class JacksonConfig {

    @Bean
    fun jackson2ObjectMapperBuilder(): Jackson2ObjectMapperBuilder {
        return JacksonHelper.createJackson2ObjectMapperBuilder()
    }
}