package com.pmk.monitor.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.pmk.monitor.R
import com.pmk.monitor.databinding.FragmentHistoryBinding
import com.pmk.monitor.databinding.ItemHistoryBinding
import com.pmk.monitor.models.HistoryItem
import com.pmk.monitor.ui.MainViewModel

/**
 * Fragment untuk menampilkan daftar riwayat diagnosa.
 */
class HistoryFragment : Fragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    private val viewModel: MainViewModel by activityViewModels()
    private lateinit var adapter: HistoryAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup RecyclerView
        binding.rvHistory.layoutManager = LinearLayoutManager(requireContext())
        adapter = HistoryAdapter()
        binding.rvHistory.adapter = adapter

        // Observasi daftar riwayat
        viewModel.historyList.observe(viewLifecycleOwner) { history ->
            if (history.isNullOrEmpty()) {
                binding.tvEmptyHistory.visibility = View.VISIBLE
                binding.rvHistory.visibility = View.GONE
            } else {
                binding.tvEmptyHistory.visibility = View.GONE
                binding.rvHistory.visibility = View.VISIBLE
                adapter.submitList(history)
            }
        }

        // Fetch data histori
        viewModel.fetchHistory()
    }

    override fun onResume() {
        super.onResume()
        viewModel.fetchHistory()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // =============================================
    // RECYCLERVIEW ADAPTER
    // =============================================
    private class HistoryAdapter : RecyclerView.Adapter<HistoryAdapter.ViewHolder>() {

        private val items = mutableListOf<HistoryItem>()

        fun submitList(newItems: List<HistoryItem>) {
            items.clear()
            items.addAll(newItems)
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val binding = ItemHistoryBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.bind(items[position])
        }

        override fun getItemCount(): Int = items.size

        class ViewHolder(private val binding: ItemHistoryBinding) : RecyclerView.ViewHolder(binding.root) {
            fun bind(item: HistoryItem) {
                // Tampilkan persentase harapan hidup
                binding.tvRate.text = "${item.rate}% Harapan Hidup"

                // Format Tipe Diagnosa
                binding.tvTypeBadge.text = item.type
                if (item.type.contains("AI", ignoreCase = true)) {
                    binding.tvTypeBadge.setBackgroundResource(R.drawable.bg_badge_red)
                    binding.tvTypeBadge.setTextColor(ColorStateListHelper.getColor(binding.root.context, R.color.primary_red))
                } else {
                    binding.tvTypeBadge.setBackgroundResource(R.drawable.bg_badge_gray)
                    binding.tvTypeBadge.setTextColor(ColorStateListHelper.getColor(binding.root.context, R.color.text_gray))
                }

                // Format Tanggal (Format dari server, bersihkan format ISO8601 jika perlu)
                val cleanDate = item.date.split("T").firstOrNull() ?: item.date
                binding.tvDate.text = cleanDate

                // Load Thumbnail (menggunakan Glide)
                if (!item.imagePath.isNullOrEmpty()) {
                    val fullUrl = if (item.imagePath.startsWith("http")) item.imagePath else "http://10.0.2.2:3000/${item.imagePath}"
                    Glide.with(binding.ivThumb.context)
                        .load(fullUrl)
                        .placeholder(R.drawable.pmk_monitor_logo)
                        .error(R.drawable.pmk_monitor_logo)
                        .into(binding.ivThumb)
                } else {
                    binding.ivThumb.setImageResource(R.drawable.pmk_monitor_logo)
                }
            }
        }
    }
}

/**
 * Helper class untuk membaca warna resource dengan kompatibilitas versi Android.
 */
object ColorStateListHelper {
    fun getColor(context: android.content.Context, colorResId: Int): Int {
        return androidx.core.content.ContextCompat.getColor(context, colorResId)
    }
}
