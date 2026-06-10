// MainActivity.kt
package com.pmk.monitor.ui

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.pmk.monitor.R
import com.pmk.monitor.databinding.ActivityMainBinding

/**
 * Activity utama PMK Monitor.
 * Mengelola bottom navigation dan fragment host untuk NavGraph.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Temukan NavHostFragment dan NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Hubungkan BottomNavigationView dengan NavController
        binding.bottomNav.setupWithNavController(navController)

        // Sembunyikan bottom navigation di halaman kuis, hasil, solusi, dan login/register
        navController.addOnDestinationChangedListener { _, destination, _ ->
            when (destination.id) {
                R.id.quizFragment,
                R.id.resultFragment,
                R.id.solutionFragment,
                R.id.loginFragment,
                R.id.registerFragment -> {
                    binding.bottomNav.visibility = View.GONE
                }
                else -> {
                    binding.bottomNav.visibility = View.VISIBLE
                }
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        return navController.navigateUp() || super.onSupportNavigateUp()
    }
}
