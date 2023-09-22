package land.moss.http

import org.apache.hc.client5.http.classic.methods.HttpHead
import org.apache.hc.client5.http.config.ConnectionConfig
import org.apache.hc.client5.http.entity.UrlEncodedFormEntity
import org.apache.hc.client5.http.entity.mime.FileBody
import org.apache.hc.client5.http.entity.mime.HttpMultipartMode
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient
import org.apache.hc.client5.http.impl.classic.HttpClients
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder
import org.apache.hc.core5.http.ContentType
import org.apache.hc.core5.http.io.entity.StringEntity
import org.apache.hc.core5.http.io.support.ClassicRequestBuilder
import org.apache.hc.core5.util.Timeout
import java.io.File
import java.net.URI
import java.nio.charset.StandardCharsets


class HttpConnector (

    val method : String,
    val url : String,
    val timeoutSeconds : Long? = null
) {

    val httpClient : CloseableHttpClient

    var httpHeaderList: HttpHeaderList? = null
    var httpParameterList: HttpParameterList? = null;
    var fileHttpParameterList: HttpParameterList? = null;
    var httpRequestBody : String? = null;

    init {

        val httpClientBuilder = HttpClients.custom()

        if ( this.timeoutSeconds != null ) {

            val connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setDefaultConnectionConfig(
                    ConnectionConfig.custom()
                        .setConnectTimeout(Timeout.ofMinutes(this.timeoutSeconds))
                        .build()
                )
                .build()

            httpClientBuilder.setConnectionManager(connectionManager)
        }

        this.httpClient = httpClientBuilder.build()
    }

    fun request(): HttpResponse {

        val classicRequestBuilder = ClassicRequestBuilder.create(this.method);
        classicRequestBuilder.uri = URI.create(this.url)

        // GET 방식일때 파라미터를 주소 쪽으로 넘김
        if (this.method == HttpMethod.GET && this.httpParameterList != null) {

            val httpParameterList = this.httpParameterList!!
            for (nameValuePair in httpParameterList) {
                classicRequestBuilder.addParameter(nameValuePair.name, nameValuePair.value)
            }
        }

        // body가 있으면 무조건 이거부터
        if (this.httpRequestBody != null) {

            classicRequestBuilder.setEntity(
                StringEntity(
                    this.httpRequestBody,
                    Charsets.UTF_8
                )
            )

        } else if (this.fileHttpParameterList != null) {

            val builder: MultipartEntityBuilder = MultipartEntityBuilder.create()
            builder.setMode(HttpMultipartMode.EXTENDED)
            builder.setCharset(Charsets.UTF_8)

            val httpParameterList = this.httpParameterList!!
            for (nameValuePair in httpParameterList) {
                builder.addTextBody(nameValuePair.name, nameValuePair.value)
            }

            val fileHttpParameterList = this.fileHttpParameterList!!
            for (nameValuePair in fileHttpParameterList) {

                val file = File(nameValuePair.value)
                val originalFilename = file.name

                builder.addPart(
                    nameValuePair.name,
                    FileBody(
                        file,
                        ContentType.DEFAULT_BINARY,
                        originalFilename
                    )
                )
            }

            classicRequestBuilder.setEntity(builder.build())

        } else if (this.httpParameterList != null) {

            classicRequestBuilder.setEntity(
                UrlEncodedFormEntity(
                    this.httpParameterList,
                    StandardCharsets.UTF_8
                )
            )
        }

        // TODO: 요청 우선 서버쪽에서도 끊도록 요청 할지 체크
//        classicRequestBuilder.addHeader("Connection", "Close")

        if ( this.httpHeaderList != null ) {

            val httpHeaderList: HttpHeaderList = this.httpHeaderList!!

            for ( nameValuePair in httpHeaderList ) {
                classicRequestBuilder.addHeader(nameValuePair.name, nameValuePair.value)
            }
        }

        val request = classicRequestBuilder.build()

        val httpClientResponse = this.httpClient.executeOpen(null, request, null);
        return HttpResponse(httpClientResponse.code, httpClientResponse)
    }

    fun shutdown() {
        this.httpClient.close()
    }
}