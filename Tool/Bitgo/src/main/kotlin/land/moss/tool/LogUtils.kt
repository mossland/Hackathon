package land.moss.tool

import org.slf4j.LoggerFactory

class LogUtils {

    companion object {

        private val LOGGER = LoggerFactory.getLogger(LogUtils::class.java)

        fun log(message:String?) {
            LOGGER.info(message)
        }
    }
}