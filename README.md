# Drive Mini

## Deskripsi Proyek

Drive Mini merupakan aplikasi berbasis web yang dikembangkan sebagai proyek akhir mata kuliah Cloud Computing. Aplikasi ini berfungsi sebagai media penyimpanan file (cloud storage) sederhana yang memungkinkan pengguna untuk mengelola file secara online.

Dalam pengembangannya, Drive Mini memanfaatkan teknologi container menggunakan Docker sehingga proses instalasi dan menjalankan aplikasi menjadi lebih mudah, konsisten, dan dapat digunakan pada berbagai perangkat tanpa perlu melakukan konfigurasi lingkungan secara manual.

---

# Tujuan Proyek

Tujuan dari pembuatan aplikasi Drive Mini adalah:

- Membangun aplikasi penyimpanan file berbasis web.
- Mengimplementasikan konsep Cloud Computing.
- Menggunakan Docker sebagai media containerisasi aplikasi.
- Menggunakan MinIO sebagai Object Storage.
- Menggunakan MySQL sebagai Database.
- Mempermudah proses deployment dan kolaborasi dalam pengembangan aplikasi.

---

# Fitur Aplikasi

Fitur yang tersedia pada aplikasi Drive Mini meliputi:

- Upload File
- Download File
- Penyimpanan File menggunakan MinIO
- Penyimpanan Data menggunakan MySQL
- Antarmuka pengguna berbasis Web
- REST API sebagai komunikasi antara Frontend dan Backend
- Containerization menggunakan Docker

---

# Teknologi yang Digunakan

## Frontend
- HTML
- CSS
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MySQL 8

## Object Storage
- MinIO

## Containerization
- Docker
- Docker Compose

## Version Control
- Git
- GitHub

---

# Arsitektur Sistem

```
                 Browser
                     │
                     ▼
              Frontend (Web)
                     │
                     ▼
             Backend (Node.js)
               │            │
               ▼            ▼
            MySQL        MinIO
               │            │
               └──── Docker ────┘
```

Seluruh service dijalankan menggunakan Docker Compose sehingga setiap komponen dapat saling berkomunikasi dalam satu jaringan Docker.

---

# Cara Menjalankan Project

## 1. Clone Repository

```bash
git clone https://github.com/GdeRyan/Kelompok2CloudIMK.git
```

Masuk ke folder project.

```bash
cd Kelompok2CloudIMK
```

---

## 2. Jalankan Docker

Pastikan Docker Desktop sudah berjalan.

Kemudian jalankan:

```bash
docker compose up -d
```

Docker akan secara otomatis:

- Membuat Container
- Membuat Network
- Membuat Volume
- Menjalankan MinIO
- Menjalankan MySQL

---

## 3. Mengecek Container

```bash
docker compose ps
```

---

## 4. Menghentikan Container

```bash
docker compose down
```

---

# Akses Service

## MinIO Console

```
http://localhost:9001
```

### Login

Username

```
cloudklp2
```

Password

```
123456789
```

---

## MinIO API

```
http://localhost:9000
```

---

## MySQL

Host

```
localhost
```

Port

```
3306
```

Username

```
root
```

Password

```
123456789
```

---

# Struktur Project

```
Kelompok2CloudIMK
│
├── backend/
├── frontend/
├── docker-compose.yaml
├── README.md
└── .gitignore
```

---

# Pembagian Tugas Tim

| Nama | NIM | Peran |
|------|------------|------------------------------|
| Afrizal Dwika Febdiansyah | 2425323018 | Setup Docker (Container, Volume, Network) |
| Muhammad Imtyas Latif Abbas | 2415323032 | Konfigurasi Garage S3 / MinIO |
| I Gede Ryan Harkadanova | 2415323042 | Tampilan, Fitur, UI/UX |
| Kadek Anom | 2415323010 | Backend (CRUD dan API) |

---

# Deployment

**Status Deployment:** Belum dilakukan deployment ke layanan cloud publik.

Project saat ini dijalankan pada lingkungan lokal (Local Development) menggunakan **Docker Compose**.

---

# Kontribusi

Seluruh anggota tim berkontribusi sesuai dengan pembagian tugas masing-masing dalam proses perancangan, pengembangan, pengujian, serta dokumentasi proyek.

---

# Repository

Repository GitHub:

https://github.com/GdeRyan/Kelompok2CloudIMK

---

# Mata Kuliah

Cloud Computing

Politeknik Negeri Bali

Tahun Akademik 2025/2026

---

# Lisensi

Project ini dibuat untuk keperluan akademik sebagai tugas mata kuliah Cloud Computing dan tidak diperuntukkan untuk penggunaan komersial.
