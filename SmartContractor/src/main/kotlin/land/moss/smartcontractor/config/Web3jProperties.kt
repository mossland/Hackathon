package land.moss.smartcontractor.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.web3j.spring.autoconfigure.Web3jProperties.WEB3J_PREFIX


@ConfigurationProperties(prefix = WEB3J_PREFIX)
class Web3jProperties {
    var clientAddress: String? = null
    var isAdminClient: Boolean? = null
    var networkId: String? = null
    var httpTimeoutSeconds: Long? = null

    companion object {
        const val WEB3J_PREFIX = "web3j"
    }
}

