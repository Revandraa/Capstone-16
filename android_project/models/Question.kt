// Question.kt
package com.pmk.monitor.models

import com.pmk.monitor.R

/**
 * Tipe pertanyaan kuis.
 * GRID = menampilkan gambar (untuk gejala klinis visual)
 * TEXT_ONLY = pilihan teks saja (untuk gejala non-visual & faktor lingkungan)
 */
enum class QuestionType {
    GRID,
    TEXT_ONLY
}

/**
 * Opsi jawaban untuk setiap pertanyaan.
 * @param label teks yang ditampilkan ke user
 * @param intensity skala intensitas (0.0 - 1.0) untuk perhitungan AHP
 * @param imgResId resource ID gambar (hanya untuk tipe GRID)
 */
data class QuestionOption(
    val label: String,
    val intensity: Float,
    val imgResId: Int? = null
)

/**
 * Pertanyaan kuis.
 * @param id identifier unik (sesuai web: 'air-liur', 'gusi', dst.)
 * @param title judul/pertanyaan
 * @param type tipe tampilan (GRID atau TEXT_ONLY)
 * @param options daftar opsi jawaban
 * @param weight bobot AHP Global Weight
 * @param noAI jika true, tidak menampilkan opsi upload AI
 * @param note catatan tambahan (opsional, ditampilkan di bawah judul)
 */
data class Question(
    val id: String,
    val title: String,
    val type: QuestionType,
    val options: List<QuestionOption>,
    val weight: Float,
    val noAI: Boolean = false,
    val note: String? = null
)

/**
 * Daftar lengkap 9 pertanyaan kuis PMK Monitor.
 * Bobot & intensitas 100% identik dengan scripts.js di web.
 *
 * Pertanyaan 1-4: Gejala klinis (GRID dengan gambar)
 * Pertanyaan 5-6: Gejala klinis (TEXT_ONLY)
 * Pertanyaan 7-9: Faktor risiko lingkungan (TEXT_ONLY)
 */
object QuestionRepository {

    fun getQuestions(): List<Question> = listOf(
        // === PERTANYAAN 1: Air Liur (Hipersalivasi) ===
        Question(
            id = "air-liur",
            title = "Bagaimana kondisi air liur sapi Anda?",
            type = QuestionType.GRID,
            note = "Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini",
            options = listOf(
                QuestionOption("Liur Normal", 0.25f, R.drawable.air_liur_1),
                QuestionOption("Liur Berlebihan", 0.50f, R.drawable.air_liur_2),
                QuestionOption("Liur Banyak", 0.75f, R.drawable.air_liur_3),
                QuestionOption("Liur Sangat Banyak", 1.00f, R.drawable.air_liur_4)
            ),
            weight = 0.515278f
        ),

        // === PERTANYAAN 2: Gusi ===
        Question(
            id = "gusi",
            title = "Bagaimana kondisi gusi sapi Anda?",
            type = QuestionType.GRID,
            note = "Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini",
            options = listOf(
                QuestionOption("Luka Normal", 0.33f, R.drawable.gusi_1),
                QuestionOption("Luka Berlebihan", 0.66f, R.drawable.gusi_2),
                QuestionOption("Luka Parah", 1.00f, R.drawable.gusi_3)
            ),
            weight = 0.215177f
        ),

        // === PERTANYAAN 3: Kaki ===
        Question(
            id = "kaki",
            title = "Bagaimana kondisi kaki sapi Anda?",
            type = QuestionType.GRID,
            note = "Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini",
            options = listOf(
                QuestionOption("Luka Normal", 0.33f, R.drawable.kaki_1),
                QuestionOption("Luka Berlebihan", 0.66f, R.drawable.kaki_2),
                QuestionOption("Luka Parah", 1.00f, R.drawable.kaki_3)
            ),
            weight = 0.215177f
        ),

        // === PERTANYAAN 4: Lidah ===
        Question(
            id = "lidah",
            title = "Bagaimana kondisi lidah sapi Anda?",
            type = QuestionType.GRID,
            note = "Notes: Jika kondisi sapi anda normal, tidak ada gejala yang sesuai seperti digambar, silahkan skip kuis bagian ini",
            options = listOf(
                QuestionOption("Luka Normal", 0.33f, R.drawable.lidah_1),
                QuestionOption("Luka Berlebihan", 0.66f, R.drawable.lidah_2),
                QuestionOption("Luka Parah", 1.00f, R.drawable.lidah_3)
            ),
            weight = 0.215177f
        ),

        // === PERTANYAAN 5: Suhu Tubuh ===
        Question(
            id = "suhu-tubuh",
            title = "Berapa suhu tubuh sapi anda?",
            type = QuestionType.TEXT_ONLY,
            noAI = true,
            note = "Note: Jika tidak ada termometer untuk mengukur, cukup lihat apakah sapi anda menggigil atau tidak",
            options = listOf(
                QuestionOption("A. Panas, >40 C", 1.00f),
                QuestionOption("B. Sedang, 40-39 C", 0.50f),
                QuestionOption("C. Normal 37-38 C", 0.00f)
            ),
            weight = 0.035566f
        ),

        // === PERTANYAAN 6: Nafsu Makan ===
        Question(
            id = "nafsu-makan",
            title = "Bagaimana pola nafsu makan pada sapi?",
            type = QuestionType.TEXT_ONLY,
            noAI = true,
            options = listOf(
                QuestionOption("A. Normal", 0.00f),
                QuestionOption("B. Menurun nafsu makan", 0.50f),
                QuestionOption("C. Tidak mau makan sama sekali", 1.00f)
            ),
            weight = 0.067311f
        ),

        // === PERTANYAAN 7: Jarak dari PMK Aktif ===
        Question(
            id = "jarak-pmk",
            title = "Berapa jarak/radius lokasi peternakan Anda dari kasus PMK aktif yang terkonfirmasi terdekat?",
            type = QuestionType.TEXT_ONLY,
            noAI = true,
            options = listOf(
                QuestionOption("A. Sangat Dekat (< 1 km dari kasus PMK aktif)", 1.00f),
                QuestionOption("B. Sedang (1–5 km dari kasus PMK aktif)", 0.50f),
                QuestionOption("C. Jauh (> 5 km dari kasus PMK aktif)", 0.00f)
            ),
            weight = 0.111644f
        ),

        // === PERTANYAAN 8: Mobilitas Orang ===
        Question(
            id = "mobilitas-orang",
            title = "Bagaimana intensitas atau mobilitas orang (peternak lain, pedagang, mantri) yang keluar masuk area kandang?",
            type = QuestionType.TEXT_ONLY,
            noAI = true,
            options = listOf(
                QuestionOption("A. Tinggi (> 10 kali kunjungan orang luar per minggu)", 1.00f),
                QuestionOption("B. Sedang (3–10 kali kunjungan orang luar per minggu)", 0.50f),
                QuestionOption("C. Rendah (< 3 kali kunjungan orang luar per minggu)", 0.00f)
            ),
            weight = 0.040415f
        ),

        // === PERTANYAAN 9: Aliran Sungai ===
        Question(
            id = "aliran-sungai",
            title = "Apakah terdapat aliran sungai atau saluran air terbuka yang melewati pemukiman/peternakan lain yang terinfeksi sebelum mencapai kandang Anda?",
            type = QuestionType.TEXT_ONLY,
            noAI = true,
            options = listOf(
                QuestionOption("A. Ada (aliran air langsung dari area terinfeksi ke kandang)", 1.00f),
                QuestionOption("B. Cukup Beresiko (ada saluran air terbuka, namun tidak langsung dari area terinfeksi)", 0.50f),
                QuestionOption("C. Aman (tidak ada aliran air dari area terinfeksi yang mencapai kandang)", 0.00f)
            ),
            weight = 0.014607f
        )
    )
}
