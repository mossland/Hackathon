package land.moss.smartcontractor

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SmartContractorApplication

fun main(args: Array<String>) {
    runApplication<SmartContractorApplication>(*args)
}
