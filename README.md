# PMK Monitor (Capstone 16)

Sistem Pemantauan Tingkat Harapan Hidup & Indikasi Suspek Penyakit Mulut dan Kuku (PMK) Sapi berbasis Hybrid AI + AHP (Analytic Hierarchy Process). Proyek ini mencakup dua platform utama: **Web Application (Vite + Node.js)** dan **Native Mobile App (Kotlin Android)**.

---

## 🌟 Gambaran Umum
**PMK Monitor** dirancang untuk membantu peternak mendiagnosa secara dini kesehatan sapi mereka dari infeksi Penyakit Mulut dan Kuku (PMK). Sistem ini memadukan:
1. **AI MobileNet (Image Classification)**: Klasifikasi otomatis intensitas gejala klinis visual (air liur berlebihan, luka gusi, lidah, dan kaki) dari foto yang diunggah.
2. **AHP (Analytic Hierarchy Process)**: Metode pembobotan keputusan terstruktur untuk mengintegrasikan gejala klinis dan faktor risiko lingkungan guna menghitung persentase harapan hidup (skala 50% - 95%) dan tingkat suspek.

---

## 🛠️ Arsitektur Sistem & Algoritma

### 1. Pembobotan AHP Global Weight
Sistem menggunakan bobot prioritas kriteria klinis dan non-klinis berikut:
* **Air Liur**: 51.52% (0.515278)
* **Lepuh (Maksimum dari Luka Kaki, Gusi, atau Lidah)**: 21.51% (0.215177)
* **Suhu Tubuh**: 3.55% (0.035566)
* **Nafsu Makan**: 6.73% (0.067311)
* **Jarak Kasus PMK Aktif (Radius)**: 11.16% (0.111644)
* **Mobilitas Orang/Lalu Lintas**: 4.04% (0.040415)
* **Aliran Sungai**: 1.46% (0.014607)

### 2. Aturan Mutlak (Rule Mutlak)
* Jika kriteria **Jarak dari Kasus PMK Aktif** bernilai **Jauh (> 5 km)** / intensitas = `0.0`, maka sistem otomatis menyatakan **tidak ada wabah**.
* Hasil akhir otomatis: **Harapan Hidup = 95.00%** & **Tingkat Suspek = 0.00% (Aman)**.

### 3. Pemetaan Kurva Harapan Hidup
Skor AHP diubah ke persentase suspek (0% - 100%), lalu dipetakan ke kurva harapan hidup dengan rentang dinamis **50% hingga 95%** menggunakan rumus:
$$H = 95 - (S \times 0.45)$$
Di mana $H$ adalah Harapan Hidup (%) dan $S$ adalah Skor Suspek (%).

---

## 💻 Tech Stack

### Web Application
* **Frontend**: HTML5, Vanilla CSS3 (Custom Design), JavaScript (ES6+), TailwindCSS (opsional), TensorFlow.js & MobileNet (klasifikasi offline di sisi klien).
* **Backend**: Node.js, Express, SQLite (untuk penyimpanan riwayat diagnosa dan autentikasi user).
* **Build Tool**: Vite.

### Native Mobile App
* **Bahasa**: Kotlin.
* **UI & Navigasi**: XML Layouts (Material Design), Jetpack Navigation Component (Bottom Navigation, NavHostFragment).
* **Networking**: Retrofit, OkHttp dengan cookie-based session management (kompatibel dengan Express backend).
* **Image Loader**: Glide.
* **Arsitektur**: MVVM (Model-View-ViewModel) dengan Kotlin Coroutines.

---

## 📁 Struktur Direktori
* `/android_project` : Source code lengkap proyek Android Native (Kotlin).
* `/public` : Aset publik web, contoh gambar (samples), dan file bobot model AI.
* `/uploads` : Folder penyimpanan lokal untuk file gambar hasil unggah diagnosa.
* `server.js` : Backend server Node.js & REST API endpoints.
* `scripts.js` : Logika interaksi frontend web, kalkulator AHP, dan model TensorFlow.js.
* `styles.css` : Desain antarmuka kustom (Premium Red/Pink theme).
* `package.json` : Konfigurasi dependensi Node.js.

---

## 🚀 Cara Menjalankan

### Menjalankan Web App
1. Install dependensi:
   ```bash
   npm install
   ```
2. Jalankan server backend (Express):
   ```bash
   node server.js
   ```
3. Jalankan server frontend (Vite):
   ```bash
   npm run dev
   ```

### Menjalankan Native Android App
1. Buka folder `android_project` menggunakan **Android Studio**.
2. Sinkronkan Gradle (`Sync Project with Gradle Files`).
3. Sesuaikan alamat IP komputer Anda pada `RetrofitClient.kt` jika Anda menguji menggunakan perangkat fisik (secara default menggunakan `http://10.0.2.2:3000/` untuk emulator Android).
4. Run/jalankan aplikasi di emulator atau perangkat fisik Anda.
