package com.j3566.stockinsight.tool

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import java.security.MessageDigest

class CookieUtils {

    companion object {

        fun setCookie( key:String, value:String, expiry:Int, response:HttpServletResponse ) {

            val cookie = Cookie(key, value);
            cookie.maxAge = expiry;
            cookie.path = "/";
            cookie.isHttpOnly = false
            cookie.secure = false
            response.addCookie(cookie);
        }

        fun removeCookie( key:String, response:HttpServletResponse ) {

            val cookie = Cookie(key, null);
            cookie.maxAge = 0;
            cookie.path = "/";
            cookie.isHttpOnly = false
            cookie.secure = false
            response.addCookie(cookie);
        }
    }
}

fun HttpServletResponse.setCookie ( key:String, value:String, expiry:Int ) {
    CookieUtils.setCookie(key, value, expiry, this)
}

fun HttpServletResponse.removeCookie ( key:String ) {
    CookieUtils.removeCookie(key, this)
}