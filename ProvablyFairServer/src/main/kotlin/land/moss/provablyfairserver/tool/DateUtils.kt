package com.j3566.stockinsight.tool

import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.TimeZone

class DateUtils {
    companion object {
        fun nowUtc(): LocalDateTime {
            return LocalDateTime.now(ZoneOffset.UTC)
        }

        fun now(): LocalDateTime {
            return LocalDateTime.now()
        }

        fun format( localDateTime: LocalDateTime, format:String ): String {

            val formatter = DateTimeFormatter.ofPattern(format)
            return localDateTime.format(formatter)
        }
    }
}