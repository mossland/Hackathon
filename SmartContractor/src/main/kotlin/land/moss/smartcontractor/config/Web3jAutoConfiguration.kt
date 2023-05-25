package land.moss.smartcontractor.config

import okhttp3.OkHttp
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.apache.commons.logging.LogFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.web3j.protocol.Web3j
import org.web3j.protocol.Web3jService
import org.web3j.protocol.admin.Admin
import org.web3j.protocol.http.HttpService
import org.web3j.protocol.ipc.UnixIpcService
import org.web3j.protocol.ipc.WindowsIpcService
import org.web3j.spring.actuate.Web3jHealthIndicator
import org.web3j.spring.autoconfigure.Web3jProperties
import java.util.*
import java.util.concurrent.TimeUnit

@Configuration
@ConditionalOnClass(Web3j::class)
@EnableConfigurationProperties(
    Web3jProperties::class
)
class Web3jAutoConfiguration {
    @Autowired
    private val properties: Web3jProperties? = null
    @Bean
    @ConditionalOnMissingBean
    fun web3j(): Web3j {
        val web3jService = buildService(properties!!.clientAddress)
        log.info("Building service for endpoint: " + properties.clientAddress)
        return Web3j.build(web3jService)
    }

    @Bean
    @ConditionalOnProperty(prefix = Web3jProperties.WEB3J_PREFIX, name = ["admin-client"], havingValue = "true")
    fun admin(): Admin {
        val web3jService = buildService(properties!!.clientAddress)
        log.info("Building admin service for endpoint: " + properties.clientAddress)
        return Admin.build(web3jService)
    }

    private fun buildService(clientAddress: String?): Web3jService {
        val web3jService: Web3jService
        web3jService = if (clientAddress == null || clientAddress == "") {
            HttpService(createOkHttpClient())
        } else if (clientAddress.startsWith("http")) {
            HttpService(clientAddress, createOkHttpClient(), false)
        } else if (System.getProperty("os.name").lowercase(Locale.getDefault()).startsWith("win")) {
            WindowsIpcService(clientAddress)
        } else {
            UnixIpcService(clientAddress)
        }
        return web3jService
    }

    private fun createOkHttpClient(): OkHttpClient {
        val builder = OkHttpClient.Builder()
        configureLogging(builder)
        configureTimeouts(builder)
        return builder.build()
    }

    private fun configureTimeouts(builder: OkHttpClient.Builder) {
        val tos = properties!!.httpTimeoutSeconds
        if (tos != null) {
            builder.connectTimeout(tos, TimeUnit.SECONDS)
            builder.readTimeout(tos, TimeUnit.SECONDS) // Sets the socket timeout too
            builder.writeTimeout(tos, TimeUnit.SECONDS)
        }
    }

    @Bean
    @ConditionalOnBean(Web3j::class)
    fun web3jHealthIndicator(web3j: Web3j?): Web3jHealthIndicator {
        return Web3jHealthIndicator(web3j)
    }

    companion object {
        private val log = LogFactory.getLog(
            Web3jAutoConfiguration::class.java
        )

        private fun configureLogging(builder: OkHttpClient.Builder) {
            if (log.isDebugEnabled) {
                val logging = HttpLoggingInterceptor { message: Any? ->
                    log.debug(
                        message
                    )
                }
                logging.setLevel(HttpLoggingInterceptor.Level.BODY)
                builder.addInterceptor(logging)
            }
        }
    }
}

