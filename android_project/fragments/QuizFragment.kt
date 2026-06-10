package com.pmk.monitor.ui.fragments

import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.setPadding
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.pmk.R
import com.pmk.monitor.databinding.FragmentQuizBinding
import com.pmk.monitor.databinding.ItemOptionGridBinding
import com.pmk.monitor.databinding.ItemOptionTextBinding
import com.pmk.monitor.models.Question
import com.pmk.monitor.models.QuestionType
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment kuis interaktif 9 pertanyaan dengan fitur Hybrid AI.
 */
class QuizFragment : Fragment() {

    private var _binding: FragmentQuizBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()

    // Launcher untuk memilih gambar dari galeri/kamera untuk simulasi AI
    private val selectImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            processImageWithAi(uri)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentQuizBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Tombol Kembali di Header
        binding.btnBack.setOnClickListener {
            findNavController().navigate(com.pmk.monitor.R.id.action_quiz_to_home)
        }

        // Tombol Kiri (Sebelumnya)
        binding.btnPrev.setOnClickListener {
            val hasPrev = viewModel.prevQuestion()
            if (hasPrev) {
                renderCurrentQuestion()
            } else {
                findNavController().navigate(com.pmk.monitor.R.id.action_quiz_to_home)
            }
        }

        // Tombol Kanan (Selanjutnya)
        binding.btnNext.setOnClickListener {
            val hasNext = viewModel.nextQuestion()
            if (hasNext) {
                renderCurrentQuestion()
            } else {
                // Di akhir pertanyaan kuis, navigasi ke halaman hasil
                findNavController().navigate(com.pmk.monitor.R.id.action_quiz_to_result)
            }
        }

        // Dropzone AI click
        binding.aiDropzone.setOnClickListener {
            selectImageLauncher.launch("image/*")
        }

        // Tampilkan pertanyaan pertama
        renderCurrentQuestion()
    }

    /**
     * Memproses gambar dengan model AI MobileNet secara lokal (Simulasi).
     */
    private fun processImageWithAi(uri: Uri) {
        // Tampilkan loading state
        binding.optionsContainer.visibility = View.INVISIBLE
        binding.aiSection.visibility = View.GONE
        Toast.makeText(requireContext(), "🤖 AI sedang menganalisis foto...", Toast.LENGTH_SHORT).show()

        // Simulasi delay klasifikasi 1.5 detik
        Handler(Looper.getMainLooper()).postDelayed({
            if (isAdded && _binding != null) {
                val question = viewModel.getCurrentQuestion()
                // Pilih level acak (misal level 2 atau 3 dengan probabilitas tinggi)
                val detectedIndex = if (question.options.size > 2) 2 else question.options.size - 1
                val probability = 0.85f + (Math.random().toFloat() * 0.12f)

                // Simpan jawaban AI dan update state
                viewModel.saveAiAnswer(question.id, detectedIndex, probability, uri.toString())
                viewModel.saveAnswer(question.id, detectedIndex)

                binding.optionsContainer.visibility = View.VISIBLE
                binding.aiSection.visibility = View.VISIBLE
                Toast.makeText(requireContext(), "AI mendeteksi: ${question.options[detectedIndex].label}", Toast.LENGTH_LONG).show()

                renderCurrentQuestion()
            }
        }, 1500)
    }

    /**
     * Menggambar/merender pertanyaan aktif saat ini.
     */
    private fun renderCurrentQuestion() {
        val question = viewModel.getCurrentQuestion()
        val index = viewModel.currentQuestionIndex.value ?: 0
        val totalQuestions = viewModel.questions.size

        // Judul & Teks Pertanyaan
        binding.tvQuizTitle.text = "Pertanyaan ${index + 1}"
        binding.tvQuestionText.text = question.title

        // Notes/Catatan Pertanyaan
        if (!question.note.isNullOrEmpty()) {
            binding.tvQuestionNote.text = question.note
            binding.tvQuestionNote.visibility = View.VISIBLE
        } else {
            binding.tvQuestionNote.visibility = View.GONE
        }

        // Update Progress Bar
        binding.progressBar.progress = ((index + 1) * 100) / totalQuestions

        // Bersihkan kontainer opsi dinamis
        binding.optionsContainer.removeAllViews()

        // Pilihan Jawaban
        val savedAnswer = viewModel.getAnswer(question.id)

        if (question.type == QuestionType.TEXT_ONLY) {
            // Render Pilihan Teks Secara Vertikal
            for (i in question.options.indices) {
                val option = question.options[i]
                val optionBinding = ItemOptionTextBinding.inflate(layoutInflater, binding.optionsContainer, false)

                optionBinding.tvOptionLabel.text = option.label

                // Cek apakah opsi ini dipilih
                val isSelected = savedAnswer?.index == i
                if (isSelected) {
                    optionBinding.optionContainer.setBackgroundResource(com.pmk.monitor.R.drawable.bg_option_text_selected)
                    optionBinding.radioCircle.setBackgroundResource(com.pmk.monitor.R.drawable.radio_circle_selected)
                } else {
                    optionBinding.optionContainer.setBackgroundResource(com.pmk.monitor.R.drawable.bg_option_text_unselected)
                    optionBinding.radioCircle.setBackgroundResource(com.pmk.monitor.R.drawable.radio_circle_unselected)
                }

                optionBinding.optionContainer.setOnClickListener {
                    viewModel.saveAnswer(question.id, i)
                    renderCurrentQuestion()
                }

                binding.optionsContainer.addView(optionBinding.root)
            }
        } else {
            // Render Pilihan Gambar / GRID 2 kolom
            val gridLayout = GridLayout(requireContext()).apply {
                columnCount = 2
                rowCount = (question.options.size + 1) / 2
                alignmentMode = GridLayout.ALIGN_BOUNDS
                useDefaultMargins = false
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            }

            for (i in question.options.indices) {
                val option = question.options[i]
                val optionBinding = ItemOptionGridBinding.inflate(layoutInflater, gridLayout, false)

                optionBinding.tvOptionLabel.text = option.label
                optionBinding.ivOptionImage.setImageResource(option.imgResId ?: com.pmk.monitor.R.drawable.pmk_monitor_logo)

                val isSelected = savedAnswer?.index == i
                if (isSelected) {
                    optionBinding.radioCircle.setBackgroundResource(com.pmk.monitor.R.drawable.radio_circle_selected)
                } else {
                    optionBinding.radioCircle.setBackgroundResource(com.pmk.monitor.R.drawable.radio_circle_unselected)
                }

                optionBinding.root.setOnClickListener {
                    viewModel.saveAnswer(question.id, i)
                    renderCurrentQuestion()
                }

                // Layout parameters for equal width 2 columns
                val param = GridLayout.LayoutParams(
                    GridLayout.spec(GridLayout.UNDEFINED, 1f),
                    GridLayout.spec(GridLayout.UNDEFINED, 1f)
                ).apply {
                    width = 0
                    height = ViewGroup.LayoutParams.WRAP_CONTENT
                }
                optionBinding.root.layoutParams = param

                gridLayout.addView(optionBinding.root)
            }

            binding.optionsContainer.addView(gridLayout)
        }

        // Tampilkan / Sembunyikan Bagian Dropzone AI
        if (question.noAI) {
            binding.aiSection.visibility = View.GONE
        } else {
            binding.aiSection.visibility = View.VISIBLE

            // Update status dropzone AI jika sudah diunggah citranya
            val titleView = binding.aiDropzone.getChildAt(1) as? android.widget.TextView
            val subtitleView = binding.aiDropzone.getChildAt(2) as? android.widget.TextView

            if (savedAnswer != null && savedAnswer.aiProb != null) {
                val percentage = (savedAnswer.aiProb * 100).toInt()
                titleView?.text = "Terdeteksi AI: ${question.options[savedAnswer.index].label}"
                subtitleView?.text = "Keyakinan AI: $percentage% (Klik untuk ganti foto)"
            } else {
                titleView?.text = "Unggah Foto Organ Ini"
                subtitleView?.text = "Biar AI MobileNet yang mendeteksi gejala"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
