# HEAL-M — Heart Disease Early Alert

HEAL-M adalah prototipe aplikasi web Flask untuk mendemonstrasikan prediksi kelas penyakit jantung menggunakan parameter klinis terstruktur dan artefak machine-learning tersimpan. Aplikasi menyediakan halaman informasi dan formulir prediksi. Server memproses satu pengiriman formulir, lalu menampilkan kelas prediksi serta persentase probabilitas yang dihitung dari keluaran model.

> **Penting — bukan alat diagnosis.** Hasil model bersifat informatif dan tidak menggantikan pemeriksaan, diagnosis, atau nasihat tenaga medis. Jangan mengambil keputusan medis berdasarkan hasil aplikasi ini saja. Akurasi klinis dan kelayakan penggunaan nyata tidak dapat disimpulkan dari kode antarmuka atau keberhasilan model dimuat.

## Fitur aplikasi

- Halaman landing page dengan informasi produk, layanan, mitra, dan anggota tim.
- Formulir untuk memasukkan 11 parameter kesehatan.
- Pipeline inference: kategorikal dienkode dengan `OneHotEncoder`, fitur numerik dan encoded digabung, data diskalakan dengan `StandardScaler`, kemudian diprediksi oleh `RandomForestClassifier`.
- Tampilan label prediksi, persentase probabilitas kelas, dan pesan penjelas pada halaman hasil.
- Antarmuka responsif dengan pilihan tema terang dan gelap yang tersimpan di browser.
- Aset statis di `public/static/` agar dapat disajikan dari CDN Vercel maupun Flask saat lokal.

## Teknologi dan dependensi

- Python dan Flask untuk aplikasi web serta routing.
- pandas untuk membentuk data input; joblib untuk memuat artefak scikit-learn.
- NumPy, SciPy, scikit-learn, dan dependensi terkait ditentukan di `requirements.txt`.
- Bootstrap, Font Awesome, dan Google Fonts dimuat dari CDN pada halaman HTML.

**Versi model:** metadata artefak yang sebelumnya diperiksa menunjukkan encoder, scaler, dan model disimpan dengan scikit-learn `1.5.2`. `requirements.txt` mematok scikit-learn `1.5.2`. Menjalankan artefak dengan versi scikit-learn lain dapat memunculkan `InconsistentVersionWarning`; kompatibilitas pickle lintas versi tidak dijamin. Instalasi sebaiknya memakai versi Python yang kompatibel dengan seluruh versi paket di requirements, lalu verifikasi versi di environment tempat aplikasi dijalankan. Jangan mengubah versi scikit-learn secara terpisah tanpa menguji artefak.

## Struktur direktori

```text
.
├── app.py                         # Inisialisasi Flask, load artefak, preprocessing, routes
├── requirements.txt               # Dependensi dan pin versi Python
├── model/
│   ├── model_heart.pkl            # RandomForestClassifier
│   ├── encoder_heart.pkl          # OneHotEncoder untuk 5 fitur kategorikal
│   └── scaler_heart.pkl           # StandardScaler untuk 20 fitur hasil preprocessing
├── public/
│   └── static/                    # CSS, JavaScript, gambar, ikon, dan logo
├── templates/
│   ├── index.html                 # Beranda, layanan, mitra, tim, catatan penggunaan
│   └── aplikasi.html              # Form input dan panel hasil
├── .python-version                # Runtime Python 3.12
└── vercel.json                    # Memasukkan artefak model ke function
```

Direktori virtual environment seperti `venv/` adalah environment lokal, bukan bagian dari aplikasi untuk deployment. Jangan mengunggahnya sebagai pengganti instalasi dependensi dari `requirements.txt`.

## Route dan alur request

| Method | Route | Perilaku |
|---|---|---|
| `GET` | `/` | Merender landing page `templates/index.html`. |
| `GET` | `/aplikasi` | Merender formulir prediksi `templates/aplikasi.html`. |
| `POST` | `/predict` | Membaca field formulir, mengubah tipe nilai, melakukan preprocessing, inferensi, dan merender hasil pada halaman aplikasi. |

Pada saat modul `app.py` dimuat, tiga artefak joblib dicoba dimuat dari `model/` relatif terhadap lokasi file aplikasi. Jika proses load gagal, exception dicatat dan ketiga variabel artefak dijadikan `None`; route prediksi lalu menampilkan pesan bahwa model tidak tersedia. Saat prediksi, kegagalan konversi input, preprocessing, atau inferensi dicatat ke log dan pengguna menerima pesan error umum.

### Field formulir

| Nama field HTTP | Kolom data | Tipe/formulir | Pilihan kategori |
|---|---|---|---|
| `age` | `Age` | Integer | — |
| `sex` | `Sex` | Kategori | `M`, `F` |
| `chest_pain_type` | `ChestPainType` | Kategori | `ATA`, `NAP`, `ASY`, `TA` |
| `resting_bp` | `RestingBP` | Integer | — |
| `cholesterol` | `Cholesterol` | Integer | — |
| `fasting_bs` | `FastingBS` | Integer | `0`, `1` |
| `resting_ecg` | `RestingECG` | Kategori | Formulir: `Normal`, `ST`, `T` |
| `max_hr` | `MaxHR` | Integer | — |
| `exercise_angina` | `ExerciseAngina` | Kategori | `Y`, `N` |
| `oldpeak` | `Oldpeak` | Float | — |
| `st_slope` | `ST_Slope` | Kategori | `Up`, `Flat`, `Down` |

Field wajib di HTML ditandai `required`; `oldpeak` menerima langkah desimal `0.1`. Backend mengonversi angka ke `int`/`float`, tetapi tidak menetapkan rentang validasi medis atau validasi kategori terpisah.

## Metadata dan urutan fitur model

Metadata artefak yang sudah diperiksa:

- Encoder: `OneHotEncoder`, 5 kolom input kategorikal dalam urutan `Sex`, `ChestPainType`, `RestingECG`, `ExerciseAngina`, `ST_Slope`; `handle_unknown='ignore'` dan `drop=None`.
- Kategori encoder: `Sex` = `F`, `M`; `ChestPainType` = `ASY`, `ATA`, `NAP`, `TA`; `RestingECG` = `LVH`, `Normal`, `ST`; `ExerciseAngina` = `N`, `Y`; `ST_Slope` = `Down`, `Flat`, `Up`.
- Scaler: `StandardScaler`, 20 fitur dengan urutan `Age`, `RestingBP`, `Cholesterol`, `FastingBS`, `MaxHR`, `Oldpeak`, lalu fitur one-hot `Sex_F`, `Sex_M`, `ChestPainType_ASY`, `ChestPainType_ATA`, `ChestPainType_NAP`, `ChestPainType_TA`, `RestingECG_LVH`, `RestingECG_Normal`, `RestingECG_ST`, `ExerciseAngina_N`, `ExerciseAngina_Y`, `ST_Slope_Down`, `ST_Slope_Flat`, `ST_Slope_Up`.
- Model: `RandomForestClassifier`, 20 input features, `classes_ = [0, 1]`.

Perbandingan input contoh dengan `scaler.feature_names_in_` menunjukkan urutan kolom yang dibentuk oleh `preprocess_input()` saat ini **cocok** dengan urutan scaler. Transformasi contoh berhasil dan menghasilkan array 20 fitur. Temuan ini hanya membuktikan konsistensi urutan/shape untuk artefak yang diperiksa, bukan bahwa model akurat atau bahwa label klinis tiap kelas sudah benar.

**Kategori EKG perlu diperhatikan:** formulir mengirim `T` untuk pilihan berlabel “Left Ventricular Hypertrophy”, sedangkan encoder mengharapkan `LVH`. Karena `handle_unknown='ignore'`, nilai `T` tidak menghasilkan error tetapi semua indikator kategori EKG-nya menjadi nol. Pastikan arti dan representasi ini sesuai data pelatihan. Bila `T` memang dimaksudkan sebagai LVH, penyamaan nilai harus dilakukan dengan sengaja di aplikasi atau pada artefak, lalu diuji.

## Persentase dan interpretasi output

Kode mengambil probabilitas dari kolom indeks `1` hasil `predict_proba()`. Untuk artefak yang diperiksa, `model.classes_` bernilai `[0, 1]`, sehingga kolom indeks satu sesuai kelas `1`. Kode memperlakukan kelas `0` sebagai “Tidak ada penyakit jantung” dan kelas `1` sebagai “Ada penyakit jantung”. Makna ini harus cocok dengan label target pada proses training; metadata classifier saja tidak membuktikan definisi klinis label.

Label hasil diambil dari `predict()`, sementara persentasenya ditampilkan sebagai probabilitas kelas yang terpilih. Nilai probabilitas model bukan jaminan keyakinan klinis atau kalibrasi risiko.

## Menjalankan lokal di Windows

Pastikan Python yang dipakai kompatibel dengan pinned dependencies, kemudian dari direktori root proyek:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python app.py
```

Buka `http://127.0.0.1:5000/`; formulir berada di `http://127.0.0.1:5000/aplikasi`. Hentikan server dengan `Ctrl+C`.

Path artefak di `app.py` ditentukan dari lokasi file aplikasi, sehingga tidak bergantung pada current working directory.

## Deployment

### Vercel

Vercel mengenali objek Flask bernama `app` di `app.py`. Konfigurasi `vercel.json` memasukkan berkas `model/` ke dalam Python Function; aset di `public/static/` disajikan sebagai aset statis. `.python-version` memilih Python `3.12`, dan `requirements.txt` mematok scikit-learn `1.5.2`.

Hubungkan repository ke Vercel atau jalankan `vercel` dari root proyek untuk membuat deployment. Untuk menjalankan alur lokal Vercel, gunakan `vercel dev`. Periksa build log dan runtime log setelah deployment, terutama proses pemuatan artefak model dan permintaan `POST /predict`.

### PythonAnywhere

Pastikan web app menunjuk ke source directory yang benar dan virtualenv yang sudah dipasangi requirements; WSGI application harus mengimpor objek Flask `app` dari modul aplikasi. Setelah mengubah kode atau dependensi, reload web app dan periksa error log. Gunakan versi Python/dependensi yang kompatibel dengan artefak model.

Saat dijalankan langsung, `app.py` memakai development server Flask tanpa debug mode dan bind `0.0.0.0:5000`. Jangan gunakan development server tersebut untuk layanan publik.

## Batasan dan hal yang perlu ditingkatkan

1. **Validasi input sisi server terbatas.** Atribut HTML `required` dapat dilewati oleh client; backend belum memeriksa rentang/format klinis, kategori yang diizinkan, atau input numerik negatif/tidak wajar.
2. **Mapping EKG belum konsisten.** Form mengirim `T`, encoder mengenali `LVH`; unknown diabaikan sehingga informasi kategori hilang tanpa exception.
3. **Asumsi label model tertanam di kode.** Kode menganggap kelas 0 berarti tidak sakit dan kelas 1 berarti sakit. Pertahankan pemeriksaan terhadap `model.classes_` dan mapping target dari training.
4. **Form tidak mengisi ulang nilai setelah hasil/error.** Pengguna perlu memasukkan ulang seluruh data untuk mencoba kembali.
5. **Klaim keamanan di tampilan tidak sama dengan kontrol teknis.** Aplikasi yang ditinjau tidak memakai database dan tidak menyimpan input prediksi, tetapi hal itu bukan bukti adanya enkripsi atau jaminan keamanan menyeluruh. CDN eksternal juga menerima permintaan browser.
6. **Tidak ada kode training atau evaluasi model di snapshot aplikasi ini.** Data training, definisi target, metrik, validasi silang, kalibrasi probabilitas, dan provenance artefak tidak dapat diverifikasi dari berkas yang tersedia.
7. **Artefak joblib/pickle harus dipercaya.** Memuat pickle dari sumber yang tidak tepercaya dapat mengeksekusi kode. Gunakan hanya artefak yang dihasilkan dan diverifikasi oleh pemilik proyek.

## Pemeriksaan manual dasar

Setelah dependency dan artefak tersedia:

1. Jalankan `python app.py` dari root proyek dan pastikan log menyatakan artefak berhasil dimuat.
2. Buka `/` dan `/aplikasi`; periksa halaman serta asetnya.
3. Kirim data uji melalui formulir dan pastikan hasil muncul tanpa error.
4. Periksa log server untuk warning versi scikit-learn dan error preprocessing.
5. Pastikan environment deployment melaporkan versi scikit-learn yang sesuai dengan versi saat artefak dibuat.

Belum ada suite test otomatis yang tercantum dalam struktur proyek ini; langkah-langkah di atas adalah pemeriksaan manual, bukan bukti validasi klinis.

## Lisensi dan atribusi

Berkas sumber yang ditinjau belum menetapkan lisensi proyek secara keseluruhan. Beberapa aset frontend/vendor memiliki atribusi atau lisensi masing-masing; periksa lisensi sumbernya sebelum redistribusi atau penggunaan komersial.
