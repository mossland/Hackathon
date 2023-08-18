package com.j3566.stockinsight.tool

import java.io.PrintWriter
import java.io.StringWriter

class ExceptionUtils {

    companion object {

        fun extractStackTraceString(e: Throwable): String {

            val sw = StringWriter()
            val pw = PrintWriter(sw)
            e.printStackTrace(pw)
            return sw.toString()
        }
    }
}