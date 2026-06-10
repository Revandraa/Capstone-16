package com.pmk.monitor.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.pmk.monitor.R
import com.pmk.monitor.databinding.FragmentSolutionBinding

/**
 * Fragment untuk menampilkan saran solusi penanganan PMK sapi.
 */
class SolutionFragment : Fragment() {

    private var _binding: FragmentSolutionBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSolutionBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Tombol kembali di header
        binding.btnBackSolution.setOnClickListener {
            findNavController().navigate(R.id.action_solution_to_home)
        }

        // Tombol kembali besar di bawah
        binding.btnBackHome.setOnClickListener {
            findNavController().navigate(R.id.action_solution_to_home)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
