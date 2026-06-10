# DETAIL PERHITUNGAN SCORING AHP PMK MONITOR

Dokumen ini menjelaskan alur kalkulasi detail menggunakan metode **Analytical Hierarchy Process (AHP) dengan Skala Intensitas/Gradasi** pada sistem PMK Monitor, yang kemudian dipetakan ke dalam kurva harapan hidup 50% - 95%.

---

## 1. STRUKTUR KRITERIA & GLOBAL WEIGHTS

Matriks AHP mengidentifikasi 7 kriteria utama dengan pembobotan akhir (*Global Weights*) sebagai berikut:

*   **W1 (Air Liur):** $0.515278$ (Sangat penting/indikasi utama)
*   **W2 (Lepuh Kaki/Gusi/Lidah):** $0.215177$ (Indikator klinis fisik)
*   **W3 (Radius Risiko):** $0.111644$ (Faktor sebaran lingkungan)
*   **W4 (Nafsu Makan):** $0.067311$ (Indikator sistemik)
*   **W5 (Lalu Lintas Orang):** $0.040415$ (Faktor mobilitas penularan)
*   **W6 (Suhu Tubuh):** $0.035566$ (Gejala demam sekunder)
*   **W7 (Aliran Sungai):** $0.014607$ (Faktor sanitasi lingkungan)

---

## 2. METODE SKALA INTENSITAS (MULTIPLIER)

Skor per kriteria didasarkan pada tingkat keparahan yang dipilih, dikalikan dengan bobot kriteria. Jika kuesioner dilewati/tidak diisi, intensitas bernilai **0.00**.

### Rumus Kontribusi Skor
$$\text{Skor Kriteria}_i = \text{Bobot Global}_i \times \text{Multiplier Opsi}$$

### 1. Air Liur (W = 0.515278) - 4 Pilihan di UI
*   **Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Liur Normal:** Multiplier $0.25 \rightarrow \mathbf{0.128820}$
*   **Liur Berlebihan:** Multiplier $0.50 \rightarrow \mathbf{0.257639}$
*   **Liur Banyak:** Multiplier $0.75 \rightarrow \mathbf{0.386459}$
*   **Liur Sangat Banyak:** Multiplier $1.00 \rightarrow \mathbf{0.515278}$

### 2. Gejala Lepuh (W = 0.215177) - 3 Pilihan di UI
*Diambil dari nilai intensitas tertinggi di antara Kaki, Gusi, dan Lidah.*
*   **Tidak Diisi / Tidak Ada Lepuh:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Luka Normal:** Multiplier $0.33 \rightarrow \mathbf{0.071008}$
*   **Luka Berlebihan:** Multiplier $0.66 \rightarrow \mathbf{0.142017}$
*   **Luka Parah:** Multiplier $1.00 \rightarrow \mathbf{0.215177}$

### 3. Radius Risiko (W = 0.111644)
*   **Jauh / Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Sedang:** Multiplier $0.50 \rightarrow \mathbf{0.055822}$
*   **Sangat Dekat:** Multiplier $1.00 \rightarrow \mathbf{0.111644}$

### 4. Nafsu Makan (W = 0.067311)
*   **Normal / Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Menurun:** Multiplier $0.50 \rightarrow \mathbf{0.033656}$
*   **Tidak Makan Sama Sekali:** Multiplier $1.00 \rightarrow \mathbf{0.067311}$

### 5. Lalu Lintas Orang (W = 0.040415)
*   **Rendah / Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Sedang:** Multiplier $0.50 \rightarrow \mathbf{0.020208}$
*   **Tinggi:** Multiplier $1.00 \rightarrow \mathbf{0.040415}$

### 6. Suhu Tubuh (W = 0.035566)
*   **Normal / Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Sedang:** Multiplier $0.50 \rightarrow \mathbf{0.017783}$
*   **Panas:** Multiplier $1.00 \rightarrow \mathbf{0.035566}$

### 7. Aliran Sungai (W = 0.014607)
*   **Aman / Tidak Diisi:** Multiplier $0.00 \rightarrow \mathbf{0.000000}$
*   **Cukup Berisiko:** Multiplier $0.50 \rightarrow \mathbf{0.007304}$
*   **Ada:** Multiplier $1.00 \rightarrow \mathbf{0.014607}$

---

## 3. PEMETAAN KURVA HARAPAN HIDUP (50% - 95%)

Total skor suspek AHP ($S \in [0\%, 100\%]$) dipetakan secara terbalik ke dalam kurva harapan hidup ($H \in [50\%, 95\%]$) dengan formula:

$$H = 95 - 0.45 \times S$$

*   **Sapi Sehat Sempurna ($S = 0\%$):** Harapan Hidup = $95\%$
*   **Sapi PMK Kritis ($S = 100\%$):** Harapan Hidup = $50\%$

---

## 4. CONTOH SIMULASI UTUH

Jika seekor sapi memiliki kondisi:
*   Air Liur: **Liur Banyak** (Score = $0.75 \times 0.515278 = 0.386459$)
*   Kaki: **Luka Normal** (intensity $0.33$)
*   Gusi: **Luka Berlebihan** (intensity $0.66$)
*   Lidah: **Tidak Diisi** (intensity $0.00$)
    *   *Lepuh Terpilih:* $\max(0.33, 0.66, 0.00) = 0.66$ (Score = $0.66 \times 0.215177 = 0.142017$)
*   Suhu Tubuh: **Sedang** (Score = $0.50 \times 0.035566 = 0.017783$)
*   Nafsu Makan: **Menurun** (Score = $0.50 \times 0.067311 = 0.033656$)
*   Radius Risiko: **Sangat Dekat** (Score = $1.00 \times 0.111644 = 0.111644$)
*   Lalu Lintas: **Rendah** (Score = $0.00$)
*   Aliran Sungai: **Aman** (Score = $0.00$)

### Perhitungan:
1.  **Total Skor Suspek AHP ($S$):** $0.386459 + 0.142017 + 0.017783 + 0.033656 + 0.111644 + 0 + 0 = 0.691559 \rightarrow \mathbf{69.16\%}$
2.  **Pemetaan Harapan Hidup Akhir ($H$):** $95 - (0.45 \times 69.16) = \mathbf{63.88\%}$

*Status:* **Suspek Tingkat Menengah menuju Tinggi**
*Harapan Hidup Akhir:* **63.88%**

---

## 5. CATATAN PERHITUNGAN & ATURAN MUTLAK (RULE MUTLAK)

1. Perhitungan diambil dari excel pembobotan.
2. Perhitungan yang telah diambil, disesuaikan pembobotannya kembali dengan pilihan ganda yang ada.
3. Perhitungan yang telah disesuaikan dengan pilihan ganda yang ada, dimasukkan/di-adjust ke dalam kurva harapan hidup 50%-95%.
4. **Rule Mutlak:** Jika Radius tidak aktif/tidak ada (Jauh / tidak diisi), maka otomatis tidak ada wabah. Pada sistem, skor suspek diatur langsung ke **0%** dan angka harapan hidup diatur ke **95%** (mengabaikan kriteria lainnya).

