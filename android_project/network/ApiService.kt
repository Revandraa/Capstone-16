// ApiService.kt
package com.pmk.monitor.network

import com.pmk.monitor.models.HistoryItem
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API Service untuk PMK Monitor backend (Node.js/Express).
 * Endpoint sesuai dengan server.js di web project.
 */
interface ApiService {

    // === Authentication ===

    @POST("api/login")
    suspend fun login(
        @Body credentials: Map<String, String>
    ): Response<LoginResponse>

    @POST("api/register")
    suspend fun register(
        @Body userData: Map<String, String>
    ): Response<MessageResponse>

    @POST("api/logout")
    suspend fun logout(): Response<MessageResponse>

    @GET("api/profile")
    suspend fun getProfile(): Response<UserResponse>

    // === History ===

    @GET("api/history")
    suspend fun getHistory(): Response<List<HistoryItem>>

    @POST("api/history")
    suspend fun saveHistory(
        @Body data: Map<String, String>
    ): Response<MessageResponse>

    // === AI Detection with Image Upload ===

    @Multipart
    @POST("api/deteksi-pmk")
    suspend fun uploadDetection(
        @Part image: MultipartBody.Part,
        @Part("rate") rate: RequestBody,
        @Part("type") type: RequestBody,
        @Part("ai_summary") aiSummary: RequestBody
    ): Response<DetectionResponse>

    // === Health Check ===

    @GET("api/health")
    suspend fun healthCheck(): Response<HealthResponse>
}

// === Response Data Classes ===

data class LoginResponse(
    val message: String,
    val user: UserResponse
)

data class UserResponse(
    val id: Int,
    val username: String,
    val fullName: String,
    val email: String
)

data class MessageResponse(
    val message: String
)

data class DetectionResponse(
    val success: Boolean,
    val message: String,
    val filename: String?,
    val imagePath: String?,
    val historyId: Int?
)

data class HealthResponse(
    val status: String
)
