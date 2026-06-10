// MainViewModel.kt
package com.pmk.monitor.ui

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pmk.monitor.models.*
import com.pmk.monitor.network.RetrofitClient
import kotlinx.coroutines.launch

/**
 * ViewModel utama PMK Monitor.
 * Mengelola state kuis, perhitungan AHP, autentikasi, dan riwayat diagnosa.
 *
 * Logika perhitungan identik 1:1 dengan scripts.js (web version):
 * - 9 pertanyaan dengan bobot AHP Global Weight
 * - Skala intensitas/gradasi per opsi
 * - Lepuh = Max(kaki, gusi, lidah)
 * - Rule Mutlak: jarak-pmk = 0 → 95% harapan hidup
 * - Kurva Harapan Hidup: H = 95 - 0.45 × S
 */
class MainViewModel : ViewModel() {

    // =============================================
    // QUIZ STATE
    // =============================================
    private val _questions = QuestionRepository.getQuestions()
    val questions: List<Question> get() = _questions

    private val _currentQuestionIndex = MutableLiveData(0)
    val currentQuestionIndex: LiveData<Int> get() = _currentQuestionIndex

    private val _userAnswers = mutableMapOf<String, UserAnswer>()

    private val _isUsingAiInAnyQuestion = MutableLiveData(false)

    // =============================================
    // RESULT STATE
    // =============================================
    data class AHPResult(
        val survivalRate: Double,
        val suspectScore: Double,
        val suspectStatus: String,
        val statusColorHex: String
    )

    private val _result = MutableLiveData<AHPResult?>()
    val result: LiveData<AHPResult?> get() = _result

    // =============================================
    // AUTH STATE
    // =============================================
    private val _currentUser = MutableLiveData<UserProfile?>()
    val currentUser: LiveData<UserProfile?> get() = _currentUser

    private val _authError = MutableLiveData<String?>()
    val authError: LiveData<String?> get() = _authError

    private val _registerSuccess = MutableLiveData<Boolean>()
    val registerSuccess: LiveData<Boolean> get() = _registerSuccess

    fun clearRegisterSuccess() {
        _registerSuccess.value = false
    }

    // =============================================
    // HISTORY STATE
    // =============================================
    private val _historyList = MutableLiveData<List<HistoryItem>>(emptyList())
    val historyList: LiveData<List<HistoryItem>> get() = _historyList

    // =============================================
    // QUIZ NAVIGATION
    // =============================================

    fun getCurrentQuestion(): Question = _questions[_currentQuestionIndex.value ?: 0]

    fun getAnswer(questionId: String): UserAnswer? = _userAnswers[questionId]

    fun saveAnswer(questionId: String, optionIndex: Int) {
        val question = _questions.find { it.id == questionId } ?: return
        _userAnswers[questionId] = UserAnswer(
            index = optionIndex,
            intensity = question.options[optionIndex].intensity
        )
    }

    fun saveAiAnswer(questionId: String, optionIndex: Int, aiProb: Float, imgUri: String) {
        val question = _questions.find { it.id == questionId } ?: return
        _userAnswers[questionId] = UserAnswer(
            index = optionIndex,
            intensity = question.options[optionIndex].intensity,
            aiProb = aiProb,
            aiImgUri = imgUri
        )
        _isUsingAiInAnyQuestion.value = true
    }

    fun nextQuestion(): Boolean {
        val current = _currentQuestionIndex.value ?: 0
        return if (current < _questions.size - 1) {
            _currentQuestionIndex.value = current + 1
            true
        } else {
            // Last question → calculate
            calculateAHP()
            false
        }
    }

    fun prevQuestion(): Boolean {
        val current = _currentQuestionIndex.value ?: 0
        return if (current > 0) {
            _currentQuestionIndex.value = current - 1
            true
        } else {
            false // Already at first question
        }
    }

    fun resetQuiz() {
        _currentQuestionIndex.value = 0
        _userAnswers.clear()
        _result.value = null
        _isUsingAiInAnyQuestion.value = false
    }

    // =============================================
    // AHP CALCULATION (identik dengan scripts.js)
    // =============================================

    /**
     * Menghitung AHP Weighted Sum dan Kurva Harapan Hidup.
     *
     * Formula:
     * 1. Total Skor Suspek (S) = Σ (intensity × weight)
     *    - Lepuh menggunakan MAX dari kaki, gusi, lidah
     * 2. Kurva Harapan Hidup: H = 95 - (S × 100 × 0.45)
     *
     * Rule Mutlak:
     * - Jika jarak-pmk intensity = 0.0 (Jauh) → H = 95%, S = 0%
     */
    fun calculateAHP() {
        // 1. Get normalized input values (default 0.0 jika tidak dijawab/skip)
        val iLiur = _userAnswers["air-liur"]?.intensity ?: 0.0f
        val iGusi = _userAnswers["gusi"]?.intensity ?: 0.0f
        val iKaki = _userAnswers["kaki"]?.intensity ?: 0.0f
        val iLidah = _userAnswers["lidah"]?.intensity ?: 0.0f
        val iSuhu = _userAnswers["suhu-tubuh"]?.intensity ?: 0.0f
        val iNafsu = _userAnswers["nafsu-makan"]?.intensity ?: 0.0f
        val iJarak = _userAnswers["jarak-pmk"]?.intensity ?: 0.0f
        val iMobilitas = _userAnswers["mobilitas-orang"]?.intensity ?: 0.0f
        val iSungai = _userAnswers["aliran-sungai"]?.intensity ?: 0.0f

        // Rule Mutlak: Jika Radius tidak aktif/tidak ada (Jauh / 0.0)
        // → Otomatis tidak ada wabah (Suspek = 0.00%, Harapan Hidup = 95.00%)
        if (iJarak == 0.0f) {
            _result.value = AHPResult(
                survivalRate = 95.00,
                suspectScore = 0.00,
                suspectStatus = "Suspek Tingkat Rendah (Aman)",
                statusColorHex = "#2e7d32"
            )
            saveToHistory(95.00)
            return
        }

        // 2. AHP Weighted Sum based on Option Scale
        val scoreSuhu = iSuhu * 0.035566f
        val scoreLepuh = maxOf(iKaki, iGusi, iLidah) * 0.215177f
        val scoreLiur = iLiur * 0.515278f
        val scoreNafsu = iNafsu * 0.067311f
        val scoreRadius = iJarak * 0.111644f
        val scoreLaluLintas = iMobilitas * 0.040415f
        val scoreSungai = iSungai * 0.014607f

        val totalScore = scoreSuhu + scoreLepuh + scoreLiur + scoreNafsu +
                scoreRadius + scoreLaluLintas + scoreSungai

        // Scale AHP score to percentage (0 - 100)
        var suspectScore = (Math.round(totalScore * 10000.0f) / 100.0).coerceIn(0.0, 100.0)

        // Map suspectScore (0% - 100%) to survivalRate curve (50% - 95%)
        // Formula: survivalRate = 95 - (suspectScore * 0.45)
        var survivalRate = 95.0 - (suspectScore * 0.45)
        survivalRate = Math.round(survivalRate * 100.0) / 100.0

        val (status, colorHex) = getSuspectStatus(suspectScore)

        _result.value = AHPResult(
            survivalRate = survivalRate,
            suspectScore = suspectScore,
            suspectStatus = status,
            statusColorHex = colorHex
        )

        saveToHistory(survivalRate)
    }

    /**
     * Menentukan status suspek berdasarkan skor.
     * Identik dengan fungsi getSuspectStatus() di scripts.js.
     */
    private fun getSuspectStatus(rate: Double): Pair<String, String> {
        return when {
            rate < 30 -> "Suspek Tingkat Rendah (Aman)" to "#2e7d32"
            rate < 60 -> "Suspek Tingkat Menengah" to "#ef6c00"
            rate < 80 -> "Suspek Tingkat Menengah menuju Tinggi" to "#d84315"
            else -> "Suspek Tingkat Tinggi (Sangat Berbahaya)" to "#c62828"
        }
    }

    // =============================================
    // AUTHENTICATION
    // =============================================

    fun login(username: String, password: String) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.login(
                    mapOf("username" to username, "password" to password)
                )
                if (response.isSuccessful) {
                    val body = response.body()
                    body?.user?.let {
                        _currentUser.value = UserProfile(
                            id = it.id,
                            username = it.username,
                            fullName = it.fullName,
                            email = it.email
                        )
                    }
                    _authError.value = null
                } else {
                    _authError.value = "Username atau password salah"
                }
            } catch (e: Exception) {
                _authError.value = "Gagal terhubung ke server"
            }
        }
    }

    fun register(fullName: String, username: String, password: String) {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.register(
                    mapOf(
                        "fullName" to fullName,
                        "username" to username,
                        "password" to password,
                        "email" to "$username@example.com"
                    )
                )
                if (response.isSuccessful) {
                    _authError.value = null
                    _registerSuccess.value = true
                } else {
                    _authError.value = "Username sudah digunakan"
                    _registerSuccess.value = false
                }
            } catch (e: Exception) {
                _authError.value = "Gagal terhubung ke server"
                _registerSuccess.value = false
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                RetrofitClient.apiService.logout()
            } catch (_: Exception) {}
            _currentUser.value = null
        }
    }

    fun clearAuthError() {
        _authError.value = null
    }

    // =============================================
    // HISTORY
    // =============================================

    fun fetchHistory() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.getHistory()
                if (response.isSuccessful) {
                    _historyList.value = response.body() ?: emptyList()
                }
            } catch (_: Exception) {
                // Fallback: keep existing list
            }
        }
    }

    private fun saveToHistory(rate: Double) {
        val detectType = if (_isUsingAiInAnyQuestion.value == true) "Hybrid AI + AHP" else "Manual AHP"

        viewModelScope.launch {
            try {
                RetrofitClient.apiService.saveHistory(
                    mapOf(
                        "rate" to rate.toString(),
                        "type" to detectType,
                        "ai_summary" to ""
                    )
                )
            } catch (_: Exception) {
                // Fail silently for guests
            }
        }
    }
}
