package com.pmk.monitor.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.pmk.monitor.R
import com.pmk.monitor.databinding.FragmentHomeBinding
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk halaman utama (Home).
 */
class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    // Menggunakan activityViewModels agar share state dengan MainActivity
    private val viewModel: MainViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Observasi status User login
        viewModel.currentUser.observe(viewLifecycleOwner) { user ->
            if (user != null) {
                binding.btnLogout.visibility = View.VISIBLE
            } else {
                binding.btnLogout.visibility = View.GONE
            }
        }

        // Klik Mulai Kuis / Deteksi PMK
        binding.cardStartQuiz.setOnClickListener {
            viewModel.resetQuiz()
            findNavController().navigate(R.id.action_home_to_quiz)
        }

        // Klik Riwayat Diagnosa
        binding.cardHistory.setOnClickListener {
            if (viewModel.currentUser.value == null) {
                // Redirect ke login jika belum login
                findNavController().navigate(R.id.action_home_to_login)
                Toast.makeText(requireContext(), "Silakan login terlebih dahulu", Toast.LENGTH_SHORT).show()
            } else {
                findNavController().navigate(R.id.historyFragment)
            }
        }

        // Klik Logout
        binding.btnLogout.setOnClickListener {
            viewModel.logout()
            Toast.makeText(requireContext(), "Berhasil logout", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
