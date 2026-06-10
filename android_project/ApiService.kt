// ApiService.kt
package com.pmk.monitor.api

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface ApiService {
    @Multipart
    @POST("api/deteksi-pmk")
    suspend fun uploadImage(
        @Part image: MultipartBody.Part
    ): Response<DetectionResponse>
}

data class DetectionResponse(
    val success: Boolean,
    val message: String,
    val mock_detection: String
)
