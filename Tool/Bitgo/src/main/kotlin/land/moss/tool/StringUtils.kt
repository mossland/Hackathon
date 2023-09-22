package land.moss.tool

class StringUtils {

    companion object {

        fun isBlank(str: String?): Boolean = ( str?.isEmpty() ?: true )

        fun isNotBlank(str: String?): Boolean = ( str?.isNotEmpty() ?: false )

    }
}