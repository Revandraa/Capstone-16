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
import com.pmk.monitor.databinding.FragmentLoginBinding
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk halaman Login.
 */
class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup text "Belum punya akun? Daftar disini"
        binding.tvGoRegister.text = Html.fromHtml("Belum memiliki akun? <font color='#D00000'><b>Daftar disini</b></font>", Html.FROM_HTML_MODE_LEGACY)
        binding.tvGoRegister.setOnClickListener {
            findNavController().navigate(R.id.action_login_to_register)
        }

        // Klik tombol login
        binding.btnLogin.setOnClickListener {
            val username = binding.etLoginUsername.text.toString().trim()
            val password = binding.etLoginPassword.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(requireContext(), "Semua kolom harus diisi", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.login(username, password)
        }

        // Observasi user login sukses
        viewModel.currentUser.observe(viewLifecycleOwner) { user ->
            if (user != null) {
                Toast.makeText(requireContext(), "Selamat datang, ${user.fullName}!", Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_login_to_home)
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
