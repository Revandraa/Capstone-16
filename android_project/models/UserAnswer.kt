// UserAnswer.kt
package com.pmk.monitor.models

/**
 * Jawaban user untuk satu pertanyaan kuis.
 * @param index indeks opsi yang dipilih (0-based)
 * @param intensity nilai intensitas dari opsi yang dipilih
 * @param aiProb probabilitas AI (jika menggunakan hybrid AI)
 * @param aiImgUri URI gambar yang di-upload untuk AI (opsional)
 */
data class UserAnswer(
    val index: Int,
    val intensity: Float,
    val aiProb: Float? = null,
    val aiImgUri: String? = null
)
