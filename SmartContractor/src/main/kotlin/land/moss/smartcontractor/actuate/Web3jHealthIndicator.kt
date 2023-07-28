package land.moss.smartcontractor.actuate

import org.springframework.boot.actuate.health.AbstractHealthIndicator
import org.springframework.boot.actuate.health.Health
import org.springframework.util.Assert
import org.web3j.protocol.Web3j
import org.web3j.protocol.core.methods.response.*
import java.util.concurrent.CompletableFuture

class Web3jHealthIndicator(web3j: Web3j) : AbstractHealthIndicator() {
    private val web3j: Web3j

    init {
        Assert.notNull(web3j, "Web3j must not be null")
        this.web3j = web3j
    }

    @Throws(Exception::class)
    override fun doHealthCheck(builder: Health.Builder) {
        try {
            val listening = web3j.netListening().send().isListening
            if (!listening) {
                builder.down()
            } else {
                builder.up()
                val futures: MutableList<CompletableFuture<*>> = ArrayList()
                futures.add(web3j.netVersion()
                    .sendAsync()
                    .thenApply { netVersion: NetVersion ->
                        builder.withDetail(
                            "netVersion",
                            netVersion.netVersion
                        )
                    })
                futures.add(web3j.web3ClientVersion()
                    .sendAsync()
                    .thenApply { web3ClientVersion: Web3ClientVersion ->
                        builder.withDetail(
                            "clientVersion",
                            web3ClientVersion.web3ClientVersion
                        )
                    })
                futures.add(web3j.ethBlockNumber()
                    .sendAsync()
                    .thenApply { ethBlockNumber: EthBlockNumber ->
                        builder.withDetail(
                            "blockNumber",
                            ethBlockNumber.blockNumber
                        )
                    })
                futures.add(web3j.ethProtocolVersion()
                    .sendAsync()
                    .thenApply { ethProtocolVersion: EthProtocolVersion ->
                        builder.withDetail(
                            "protocolVersion",
                            ethProtocolVersion.protocolVersion
                        )
                    })
                futures.add(web3j.netPeerCount()
                    .sendAsync()
                    .thenApply { netPeerCount: NetPeerCount ->
                        builder.withDetail(
                            "netPeerCount",
                            netPeerCount.quantity
                        )
                    })
                CompletableFuture.allOf(*futures.toTypedArray<CompletableFuture<*>>()).get()
            }
        } catch (ex: Exception) {
            builder.down(ex)
        }
    }
}

