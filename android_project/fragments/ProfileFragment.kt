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
import com.pmk.monitor.databinding.FragmentProfileBinding
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk halaman profil pengguna.
 */
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Observasi user data
        viewModel.currentUser.observe(viewLifecycleOwner) { user ->
            if (user == null) {
                // Redirect ke login jika tidak ada user session
                findNavController().navigate(R.id.action_profile_to_login)
                Toast.makeText(requireContext(), "Silakan login terlebih dahulu", Toast.LENGTH_SHORT).show()
            } else {
                binding.tvProfileName.text = user.fullName
                binding.tvProfileUsername.text = "@${user.username}"
                binding.tvProfileEmail.text = user.email
            }
        }

        // Klik logout
        binding.btnLogout.setOnClickListener {
            viewModel.logout()
            Toast.makeText(requireContext(), "Berhasil logout", Toast.LENGTH_SHORT).show()
            findNavController().navigate(R.id.action_profile_to_login)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
