package com.j3566.stockinsight.tool

import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.TimeZone

class FilenameUtils {
    companion object {
        fun getFileExtension(filename: String?): String? {

            if ( StringUtils.isBlank(filename) ) {
                return null
            }

            val lastDotIndex = filename!!.lastIndexOf(".")
            return if (lastDotIndex != -1) {
                filename.substring(lastDotIndex + 1)
            } else {
                null
            }
        }
    }
}