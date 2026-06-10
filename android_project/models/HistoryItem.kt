// HistoryItem.kt
package com.pmk.monitor.models

/**
 * Item riwayat diagnosa.
 * Digunakan untuk menampilkan data dari API backend maupun local storage.
 */
data class HistoryItem(
    val id: Int,
    val rate: Double,
    val date: String,
    val type: String = "Manual AHP",
    val imagePath: String? = null,
    val aiSummary: String? = null
)

/**
 * Data user yang sedang login.
 */
data class UserProfile(
    val id: Int,
    val username: String,
    val fullName: String,
    val email: String
)
