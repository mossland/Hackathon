package land.moss.provablyfairserver.helper

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer
import land.moss.provablyfairserver.Constants
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import java.time.format.DateTimeFormatter

class JacksonHelper {

    companion object {

        fun createJackson2ObjectMapperBuilder(): Jackson2ObjectMapperBuilder {

            return Jackson2ObjectMapperBuilder()
                .propertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE)
                .serializationInclusion(JsonInclude.Include.NON_NULL)
                .serializers(LocalDateTimeSerializer(DateTimeFormatter.ofPattern(Constants.DEFAULT_DATETIME_FORMAT)))
                .serializers(LocalDateSerializer(DateTimeFormatter.ofPattern(Constants.DEFAULT_DATE_FORMAT)))
        }

        fun createJackson2ObjectMapper(): ObjectMapper {
            return createJackson2ObjectMapperBuilder().build()
        }


    }
}