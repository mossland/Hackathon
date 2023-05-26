package land.moss.http

import org.apache.hc.core5.http.ClassicHttpResponse
import org.apache.hc.core5.http.HttpEntity
import org.apache.hc.core5.http.io.entity.EntityUtils
import org.apache.hc.core5.util.ByteArrayBuffer
import java.io.InputStream

class HttpResponse (

    val statusCode: Int,
    val classicHttpResponse : ClassicHttpResponse ) {
    val httpEntity : HttpEntity = this.classicHttpResponse.entity;

    fun getContent(): InputStream = this.httpEntity.content

    fun getContentString(): String? {
        return HttpResponse.getStringFromInputStream(getContent(), Charsets.UTF_8.name())
    }

    fun shutdown() {
        EntityUtils.consume(this.httpEntity)
    }

    companion object {

        private fun getStringFromInputStream(stream: InputStream, encoding: String?): String? {
            var retString: String? = null
            try {
                val buffer = ByteArrayBuffer(stream.available())
                var readByte = 0
                while (stream.read().also { readByte = it } != -1) buffer.append(readByte)
                retString = String(buffer.toByteArray(), charset(encoding!!))
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return retString
        }
    }
}