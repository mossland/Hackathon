package com.j3566.stockinsight.tool

import jakarta.servlet.http.HttpServletRequest
import java.util.*

class NetworkUtils {

    companion object {

        const val UNKNOWN_IP_ADDRESS = "unknown"

        fun getClientIpAddress(httpServletRequest: HttpServletRequest): String {

            val headerNames = httpServletRequest.headerNames
            var ipAddress: String? = null

            // X-Forwarded-For 헤더 값으로 찾아보기
            while (headerNames.hasMoreElements()) {

                val headerName = headerNames.nextElement()
                if (headerName.equals("X-Forwarded-For", ignoreCase = true)) {
                    ipAddress = httpServletRequest.getHeader(headerName)
                }

                if (StringUtils.isNotBlank(ipAddress) && !"unknown".equals(ipAddress, ignoreCase = true)) {
                    break
                }
            }

            // 여전히 찾아진 값이 없는 경우 기타 헤더 값으로 찾기
            if (StringUtils.isBlank(ipAddress) || "unknown".equals(ipAddress, ignoreCase = true)) {

                while (headerNames.hasMoreElements()) {

                    val headerName = headerNames.nextElement()
                    if (
                        headerName.equals("Proxy-Client-IP", ignoreCase = true) ||
                        headerName.equals("WL-Proxy-Client-IP", ignoreCase = true) ||
                        headerName.equals("HTTP_CLIENT_IP", ignoreCase = true) ||
                        headerName.equals("HTTP_X_FORWARDED_FOR", ignoreCase = true) ||
                        headerName.equals("X-Real-IP", ignoreCase = true) ||
                        headerName.equals("REMOTE_ADDR", ignoreCase = true)
                    ) {
                        ipAddress = httpServletRequest.getHeader(headerName)
                    }

                    if (StringUtils.isNotBlank(ipAddress) && !"unknown".equals(ipAddress, ignoreCase = true)) {
                        break
                    }
                }
            }

            // 여전히 값이 나오지 않는 경우 RemoteAddr 함수로 호출
            if (StringUtils.isBlank(ipAddress) || "unknown".equals(ipAddress, ignoreCase = true)) {
                ipAddress = httpServletRequest.getRemoteAddr()
            }

            // 여전히 값이 나오지 않는 경우 UNKNOWN 처리
            if (StringUtils.isBlank(ipAddress)) {
                ipAddress = NetworkUtils.UNKNOWN_IP_ADDRESS
            }

            // , 찍혀서 들어오는 경우도 있으므로 첫번째 값으로 처리하자
            val ipAddresses = ipAddress!!.split(",".toRegex())
            if (ipAddresses.size >= 2) {
                ipAddress = ipAddresses[0]
            }

            return ipAddress.trim()
        }
    }

}