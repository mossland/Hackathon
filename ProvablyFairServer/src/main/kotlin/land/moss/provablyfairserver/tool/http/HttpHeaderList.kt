package com.j3566.lia.http

import org.apache.hc.core5.http.NameValuePair
import org.apache.hc.core5.http.message.BasicNameValuePair

class HttpHeaderList : ArrayList<NameValuePair> {
    constructor() : super() {
    }

    constructor(vararg strings: String) : super() {

        for ( i in strings.indices step 2 ) {
            add( BasicNameValuePair(strings[i], strings[i + 1]) )
        }
    }

    fun add( key:String, value:String ) {
        add( BasicNameValuePair(key, value) )
    }
}