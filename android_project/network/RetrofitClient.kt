// RetrofitClient.kt
package com.pmk.monitor.network

import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.CookieManager
import java.net.CookiePolicy
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit client untuk koneksi ke backend Node.js.
 *
 * Fitur:
 * - Cookie jar untuk session management (express-session)
 * - HTTP logging untuk debug
 * - Timeout 30 detik
 *
 * BASE_URL harus diubah sesuai alamat server backend:
 * - Emulator Android: http://10.0.2.2:3000/
 * - Device fisik (LAN): http://<IP_KOMPUTER>:3000/
 */
object RetrofitClient {

    // Ubah sesuai alamat backend Anda
    private const val BASE_URL = "http://10.0.2.2:3000/"

    private val cookieManager = CookieManager().apply {
        setCookiePolicy(CookiePolicy.ACCEPT_ALL)
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .cookieJar(JavaNetCookieJar(cookieManager))
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
