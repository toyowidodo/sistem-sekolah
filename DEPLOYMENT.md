# Deploy Otomatis

Setiap push ke branch `main` akan otomatis membangun frontend, mengirim kode ke
server, menjalankan migrasi, lalu memastikan situsnya benar-benar hidup.

Workflow-nya ada di [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

---

## Setup sekali di awal

### 1. Matikan git deploy bawaan panel hosting

**Ini wajib.** Panel Hostinger punya git auto-deploy sendiri yang mem-publish
repo ke `public_html`. Kalau dibiarkan aktif, ia akan berebut dengan GitHub
Actions dan saling menimpa.

Masuk hPanel → **Website** → **Git** → hapus/nonaktifkan repository yang
terhubung ke `niswa.online`.

### 2. Salin kunci privat deploy

Kunci khusus untuk CI sudah dibuat di server (terpisah dari kunci pribadi Anda,
jadi bisa dicabut sewaktu-waktu tanpa mengganggu akses Anda sendiri).

Tampilkan kunci privatnya:

```bash
ssh -p 65002 u625839601@145.223.108.15 'cat ~/.ssh/gha_deploy_key'
```

Salin **seluruh** keluarannya, termasuk baris `-----BEGIN...` dan `-----END...`.

### 3. Tambahkan secrets di GitHub

Buka **Settings → Secrets and variables → Actions → New repository secret**,
lalu tambahkan lima secret berikut:

| Nama | Isi |
|---|---|
| `SSH_PRIVATE_KEY` | Hasil salinan dari langkah 2 |
| `SSH_HOST` | `145.223.108.15` |
| `SSH_PORT` | `65002` |
| `SSH_USER` | `u625839601` |
| `SSH_KNOWN_HOSTS` | `[145.223.108.15]:65002 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAII6QTxkUjjhCXv55AjcO7C0hXy5smtcRMmRPfvY9YF5M` |

> `SSH_KNOWN_HOSTS` dipakai untuk memverifikasi identitas server. Ini sengaja
> tidak diganti dengan `StrictHostKeyChecking=no`, supaya deploy menolak jalan
> kalau server yang dihubungi ternyata bukan server Anda.

### 4. Hapus kunci privat dari server

Setelah tersalin ke GitHub, kunci privatnya tidak perlu lagi tersimpan di server:

```bash
ssh -p 65002 u625839601@145.223.108.15 'rm -f ~/.ssh/gha_deploy_key'
```

Kunci publiknya tetap di `authorized_keys` — itu yang dipakai GitHub Actions
untuk masuk.

### 5. Coba jalankan

Buka tab **Actions** → **Deploy ke Produksi** → **Run workflow**.

---

## Apa yang dikerjakan workflow

1. **Build frontend** di runner (server hosting tidak punya Node)
2. **Cadangkan database** ke `~/backups/db-<waktu>.sql`, menyimpan 10 terbaru
3. **Kirim backend** via rsync ke `public_html/backend/`
4. **Kirim frontend** via rsync ke `public_html/`
5. **`composer install`** tanpa dependency dev
6. **Jalankan migrasi**
7. **Cache config & route** untuk performa produksi
8. **Verifikasi** empat endpoint; deploy ditandai gagal kalau ada yang meleset

## Yang tidak pernah disentuh

Sinkronisasi memakai `--delete` supaya berkas lama ikut bersih, tapi hal berikut
dikecualikan karena milik server, bukan repo:

- `backend/.env` — kredensial produksi
- `backend/vendor/` — dipasang di server oleh composer
- `backend/storage/` dan `backend/public/storage/` — **berisi gambar inventaris
  yang diunggah pengguna**, akan hilang permanen kalau ikut terhapus
- `backend/public/uploads/` — **logo sekolah** yang diunggah lewat menu
  Pengaturan. `SettingController` menyimpannya ke sini, di luar `storage/`
- `backend/database/*.sqlite` — sisa lama; produksi memakai MySQL
- `backend/bootstrap/cache/`

> Daftar ini bukan tebakan. Sebelum workflow dipakai, perintah rsync-nya
> dijalankan dengan `--dry-run` terhadap server sungguhan. Hasilnya menunjukkan
> `public/uploads/logos/` akan terhapus — logo sekolah nyaris hilang. Kalau
> Anda menambah fitur unggah baru, jalankan dry-run serupa dulu:
>
> ```bash
> rsync -a --delete --dry-run --itemize-changes <pengecualian...> \
>   backend-api/ user@host:~/domains/niswa.online/public_html/backend/ \
>   | grep '^\*deleting'
> ```

---

## Menjalankan tanpa migrasi

Lewat **Run workflow**, matikan centang *Jalankan migrasi*. Berguna kalau
perubahannya hanya di frontend.

Deploy otomatis lewat push ke `main` **selalu** menjalankan migrasi.

## Kalau deploy gagal

Cadangan database ada di `~/backups/` di server. Untuk mengembalikan kode,
jalankan ulang workflow dari commit yang diketahui baik.

Melihat cadangan yang tersedia:

```bash
ssh -p 65002 u625839601@145.223.108.15 'ls -lht ~/backups | head'
```

## Mencabut akses deploy

Kalau kunci CI perlu dicabut:

```bash
ssh -p 65002 u625839601@145.223.108.15 \
  "sed -i '/github-actions-deploy-sistem-sekolah/d' ~/.ssh/authorized_keys"
```

---

## Catatan struktur

Aplikasi Laravel yang melayani `api.niswa.online` ada di
`public_html/backend/` — **bukan** `backend-api/`. Document root subdomain
diarahkan ke sana lewat panel hosting, jadi workflow menyinkronkan
`backend-api/` (sumber di repo) ke `backend/` (lokasi di server).

Folder `public_html/backend-api/` dan `public_html/frontend-react/` adalah sisa
git deploy lama yang sudah tidak terpakai. Keduanya aman dihapus setelah git
deploy panel dimatikan.
