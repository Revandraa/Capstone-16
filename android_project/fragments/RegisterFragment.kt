package com.pmk.monitor.ui.fragments

import android.os.Bundle
import android.text.Html
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.pmk.monitor.R
import com.pmk.monitor.databinding.FragmentRegisterBinding
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk halaman pendaftaran akun (Register).
 */
class RegisterFragment : Fragment() {

    private var _binding: FragmentRegisterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup text "Sudah memiliki akun? Login disini"
        binding.tvGoLogin.text = Html.fromHtml("Sudah memiliki akun? <font color='#D00000'><b>Login disini</b></font>", Html.FROM_HTML_MODE_LEGACY)
        binding.tvGoLogin.setOnClickListener {
            findNavController().navigate(R.id.action_register_to_login)
        }

        // Klik tombol daftar
        binding.btnRegister.setOnClickListener {
            val fullName = binding.etRegName.text.toString().trim()
            val username = binding.etRegUsername.text.toString().trim()
            val password = binding.etRegPassword.text.toString().trim()

            if (fullName.isEmpty() || username.isEmpty() || password.isEmpty()) {
                Toast.makeText(requireContext(), "Semua kolom harus diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.register(fullName, username, password)
        }

        // Observasi status registrasi sukses
        viewModel.registerSuccess.observe(viewLifecycleOwner) { success ->
            if (success == true) {
                Toast.makeText(requireContext(), "Pendaftaran berhasil! Silakan login", Toast.LENGTH_SHORT).show()
                viewModel.clearRegisterSuccess()
                findNavController().navigate(R.id.action_register_to_login)
            }
        }

        // Observasi error autentikasi
        viewModel.authError.observe(viewLifecycleOwner) { error ->
            if (error != null) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_SHORT).show()
                viewModel.clearAuthError()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
