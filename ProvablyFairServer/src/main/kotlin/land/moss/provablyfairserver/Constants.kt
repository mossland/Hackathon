package land.moss.provablyfairserver

class Constants {
    companion object {

        val DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss"
        val DEFAULT_DATE_FORMAT = "yyyy-MM-dd"
        val SESSION_EXPIRY_TIME = Int.MAX_VALUE
        var SESSION_COOKIE_NAME = "access_token"
    }
}