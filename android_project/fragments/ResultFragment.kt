package com.pmk.monitor.ui.fragments

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.pmk.monitor.R
import com.pmk.monitor.databinding.FragmentResultBinding
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk menampilkan hasil diagnosis persentase harapan hidup & tingkat suspek PMK.
 */
class ResultFragment : Fragment() {

    private var _binding: FragmentResultBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentResultBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Observasi hasil kalkulasi AHP
        viewModel.result.observe(viewLifecycleOwner) { result ->
            if (result != null) {
                binding.tvSurvivalRate.text = "${result.survivalRate}%"
                binding.tvSuspectScore.text = "Tingkat Indikasi Suspek PMK: ${result.suspectScore}%"
                binding.tvSuspectStatus.text = "Status: ${result.suspectStatus}"
                try {
                    binding.tvSuspectStatus.setTextColor(Color.parseColor(result.statusColorHex))
                } catch (e: Exception) {
                    binding.tvSuspectStatus.setTextColor(Color.RED)
                }
            }
        }

        // Tombol kembali di header
        binding.btnBackResult.setOnClickListener {
            findNavController().navigate(R.id.action_result_to_home)
        }

        // Tombol SOLUSI
        binding.btnSolusi.setOnClickListener {
            findNavController().navigate(R.id.action_result_to_solution)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
