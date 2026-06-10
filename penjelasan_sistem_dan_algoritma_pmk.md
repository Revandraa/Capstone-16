# RINGKASAN SISTEM & METODE PEMBOBOTAN: PMK MONITOR

**PMK Monitor** adalah sistem cerdas berbasis web dan mobile untuk memantau, mendeteksi, dan mengestimasi tingkat indikasi suspek PMK (Penyakit Mulut dan Kuku) pada sapi. Sistem ini memadukan **Deep Learning MobileNet** (untuk klasifikasi gambar gejala) dan **Analytical Hierarchy Process (AHP) dengan Skala Intensitas/Gradasi** untuk menghasilkan persentase probabilitas suspek secara presisi.

---

## 1. PENDEKATAN AHP DENGAN SKALA INTENSITAS / GRADASI

Metode ini menggunakan **skala intensitas** di mana kontribusi akhir (*Global Weight*) dari masing-masing kriteria tetap terjaga sebagai batas nilai maksimum ($100\%$), namun bobot tersebut dibagi secara proporsional berdasarkan tingkat keparahan (*severity level*) dari opsi jawaban yang dipilih.

### A. Pembagian Bobot Kriteria Utama
1. **Air Liur Sapi (Hipersalivasi)** — Bobot Global: **0.515278 (51.53%)**
2. **Gejala Lepuh (Kaki, Gusi, Lidah)** — Bobot Global: **0.215177 (21.52%)**
   * *Catatan:* Diambil dari nilai tingkat keparahan tertinggi (**Max Value**) di antara Kaki, Gusi, dan Lidah.
3. **Radius Risiko Kasus Aktif** — Bobot Global: **0.111644 (11.16%)**
4. **Nafsu Makan Sapi** — Bobot Global: **0.067311 (6.73%)**
5. **Lalu Lintas Orang** — Bobot Global: **0.040415 (4.04%)**
6. **Suhu Tubuh (Demam)** — Bobot Global: **0.035566 (3.56%)**
7. **Aliran Sungai Terbuka** — Bobot Global: **0.014607 (1.46%)**

---

## 2. MATRIKS SCORING (NILAI KONTRIBUSI SKOR)

Tabel berikut menunjukkan konversi nilai mutlak yang ditambahkan ke total skor suspek berdasarkan pilihan user.

> 💡 *Catatan:* Jika kuesioner dilewati/tidak diisi (unanswered), intensitas bernilai **0.00** (Normal / Tidak Ada Lepuh).

| Variabel Pengaruh | Opsi Jawaban User | Skala Multiplier | Bobot Kontribusi |
| :--- | :--- | :---: | :---: |
| **Kuis 1: Air Liur Sapi** | Liur Sangat Banyak | 1.00 | **0.515278** |
| | Liur Banyak | 0.75 | **0.386459** |
| | Liur Berlebihan | 0.50 | **0.257639** |
| | Liur Normal | 0.25 | **0.128820** |
| | Tidak Diisi (Normal) | 0.00 | **0.000000** |
| **Kuis 2: Gejala Lepuh** <br>*(Max dari Kaki/Gusi/Lidah)* | Luka Parah | 1.00 | **0.215177** |
| | Luka Berlebihan | 0.66 | **0.142017** |
| | Luka Normal | 0.33 | **0.071008** |
| | Tidak Diisi / Tidak Ada Lepuh | 0.00 | **0.000000** |
| **Kuis 3: Radius Risiko** | Sangat Dekat (< 1 km) | 1.00 | **0.111644** |
| | Sedang (1-5 km) | 0.50 | **0.055822** |
| | Jauh / Tidak Diisi | 0.00 | **0.000000** |
| **Kuis 4: Nafsu Makan** | Tidak Makan Sama Sekali | 1.00 | **0.067311** |
| | Menurun | 0.50 | **0.033656** |
| | Normal / Tidak Diisi | 0.00 | **0.000000** |
| **Kuis 5: Lalu Lintas Orang** | Tinggi | 1.00 | **0.040415** |
| | Sedang | 0.50 | **0.020208** |
| | Rendah / Tidak Diisi | 0.00 | **0.000000** |
| **Kuis 6: Suhu Tubuh** | Panas (> 40°C) | 1.00 | **0.035566** |
| | Sedang (39-40°C) | 0.50 | **0.017783** |
| | Normal / Tidak Diisi | 0.00 | **0.000000** |
| **Kuis 7: Aliran Sungai** | Ada (Sangat Berisiko) | 1.00 | **0.014607** |
| | Cukup Berisiko | 0.50 | **0.007304** |
| | Aman / Tidak Diisi | 0.00 | **0.000000** |

---

## 3. FORMULA PERHITUNGAN & PEMETAAN KURVA HARAPAN HIDUP

Sistem menghitung total skor suspek ($S$) terlebih dahulu, kemudian memetakannya ke dalam **kurva Harapan Hidup ($H$) pada skala 50% - 95%** agar nilai tidak melampaui batas minimum dan maksimum tersebut.

### Langkah 1: Total Skor Suspek ($S$)
$$S = S_{\text{liur}} + \max(S_{\text{kaki}}, S_{\text{gusi}}, S_{\text{lidah}}) + S_{\text{radius}} + S_{\text{nafsu}} + S_{\text{lalu\_lintas}} + S_{\text{suhu}} + S_{\text{sungai}}$$

### Langkah 2: Pemetaan Kurva Harapan Hidup ($H \in [50\%, 95\%]$)
Fungsi linear memetakan $S \in [0\%, 100\%]$ ke $H \in [50\%, 95\%]$ dengan relasi terbalik (semakin tinggi suspek, semakin rendah harapan hidup):
$$H = 95 - 0.45 \times (S \times 100)$$

---

## 4. CONTOH SIMULASI PERHITUNGAN

### Input Skenario Kasus:
1. **Suhu Tubuh:** Sedang $\rightarrow \mathbf{0.017783}$
2. **Lepuh Kaki:** Luka Normal ($0.33$), **Lepuh Gusi:** Luka Berlebihan ($0.66$), **Lepuh Lidah:** Tidak Diisi ($0.00$). Max = Luka Berlebihan $\rightarrow \mathbf{0.142017}$
3. **Air Liur:** Liur Banyak ($0.75$) $\rightarrow \mathbf{0.386459}$
4. **Nafsu Makan:** Menurun ($0.50$) $\rightarrow \mathbf{0.033656}$
5. **Radius Kasus:** Sangat Dekat ($1.00$) $\rightarrow \mathbf{0.111644}$
6. **Lalu Lintas:** Rendah ($0.00$) $\rightarrow \mathbf{0.000000}$
7. **Aliran Sungai:** Aman ($0.00$) $\rightarrow \mathbf{0.000000}$

### Kalkulasi AHP:
$$\text{Total Skor Suspek } (S) = 0.017783 + 0.142017 + 0.386459 + 0.033656 + 0.111644 + 0.000000 + 0.000000 = \mathbf{0.691559}$$
$$\text{Tingkat Indikasi Suspek} = 0.691559 \times 100\% = \mathbf{69.16\%}$$

### Kalkulasi Kurva Harapan Hidup:
$$H = 95 - 0.45 \times 69.16 = \mathbf{63.88\%}$$

*Status Diagnosa:* **Suspek Tingkat Menengah menuju Tinggi**
*Harapan Hidup Akhir:* **63.88%**

Notes 
1. Perhitungan diambil dari excel pembobotan
2. Perhitungan yang telah diambil, disesuaikan pembobotannya kembali dengan pilihan ganda yang ada. 
3. Pembobotan juga di adjust 
3. Perhitungan yang telah disesuaikan dengan pilihan ganda yang ada, dimasukkan/di adjust kedalam kurva harapan hidup 50%-95%.
4. Terdapat rule mutlak Radius tidak aktif/tidak ada -> Berarti otomatis tidak ada wabah.