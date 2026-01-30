# Yumo Projesi Kurulum & Dağıtım Rehberi (Cloudflare + Hetzner)

Bu doküman, projenizi sıfırdan canlıya (production) almak için gereken tüm adımları içerir.

---

## 1. Domain ve Cloudflare Ayarları
1.  **Cloudflare Hesabı:** Cloudflare'e giriş yapın ve `yumobag.net` domainini ekleyin.
2.  **Nameservers:** Domain satın aldığınız panelden (Namecheap, GoDaddy vb.) nameserver'ları Cloudflare'in size verdiği `ns1.cloudflare.com` ve `ns2.cloudflare.com` adreslerine yönlendirin.
3.  **DNS Ayarları:** Cloudflare panelinde **DNS** sekmesine gelin.
    *   **Tip:** `A`
    *   **Ad (Name):** `@` (veya `yumobag.net`)
    *   **İçerik (Content):** Hetzner'den aldığınız sunucunun **IP Adresini** yazın.
    *   **Proxy Status:** `Proxied` (Turuncu Bulut) olmalı.
4.  **SSL/TLS Ayarları:** **SSL/TLS** sekmesine gidin.
    *   Modu **Flexible** olarak seçin. (Bu çok önemlidir, sunucuda ekstra SSL ayarı yapmadan HTTPS kullanmanızı sağlar).

---

## 2. Hetzner Sunucu Kurulumu
1.  **Sunucu Oluşturma:** Hetzner Cloud panelinden yeni bir sunucu oluşturun.
    *   **Konum:** Falkenstein veya Helsinki (Tr'ye yakınlık açısından).
    *   **Image:** **Ubuntu 24.04** (veya 22.04).
    *   **Tip:** CPX11 veya üzeri (En az 2GB RAM tavsiye edilir).
2.  **SSH Bağlantısı:** Terminalinizden sunucuya bağlanın:
    ```bash
    ssh root@SUNUCU_IP_ADRESI
    ```

---

## 3. Sunucu Hazırlığı (Docker Kurulumu)

Sunucuda aşağıdaki komutları sırasıyla çalıştırarak Docker ve gerekli araçları kurun:

```bash
# Sistemi güncelle
apt update && apt upgrade -y

# Gerekli paketleri kur
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Docker GPG anahtarını ekle
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker reposunu ekle
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker'ı kur
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Node.js ve NPM Kurulumu (Frontend Build işlemi için sunucuda gerekmese de kolaylık sağlar)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

---

## 4. Projeyi Sunucuya Çekme

```bash
# Web klasörüne git
mkdir -p /var/www
cd /var/www

# Projeyi klonla (Kendi repo adresinizi yazın)
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git yumo

# Klasöre gir
cd yumo
```

*Not: Eğer repo gizliyse SSH key oluşturup GitHub'a eklemeniz gerekir veya HTTPS token kullanabilirsiniz.*

---

## 5. Çevresel Değişkenleri Ayarlama (.env)

Backend için `.env` dosyasını oluşturun.

```bash
cd backend
cp .env.example .env
nano .env
```

Aşağıdaki ayarları `.env` içinde güncelleyin/kontrol edin:

```ini
APP_NAME=Yumobag
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yumobag.net

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=yumo_db
DB_USERNAME=yumo
DB_PASSWORD=cok_gizli_sifre_belirleyin

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
```

**ÖNEMLİ:** `DB_PASSWORD` kısmına yazdığınız şifreyi bir kenara not edin, birazdan `docker-compose` dosyasında da kullanacağız (veya .env'den okumasını sağlayacağız).

---

## 6. Frontend Build (Derleme)

Frontend dosyalarını statik hale getirmemiz lazım.

```bash
# Ana dizine dön
cd /var/www/yumo/frontend

# Paketleri yükle ve build al
npm install
npm run build
```

Bu işlem sonucunda `frontend/dist` klasörü oluşacaktır. Sunucu bu klasörü yayınlayacak.

---

## 7. Uygulamayı Başlatma

Docker Compose kullanarak sistemi ayağa kaldıracağız. `deploy` klasöründeki üretim ayarlarını kullanacağız.

```bash
# Ana dizine dön
cd /var/www/yumo

# Docker'ı başlat
# Not: production yml dosyasını kullanıyoruz
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

### Son Ayarlar (İlk Kurulumda)

Uygulama çalıştıktan sonra veritabanı tablolarını oluşturun ve storage bağlantısını yapın:

```bash
# Laravel container'ına bağlanıp komutları çalıştır
docker exec -it yumo-app php artisan key:generate
docker exec -it yumo-app php artisan migrate --force
docker exec -it yumo-app php artisan storage:link
docker exec -it yumo-app php artisan db:seed --class=DatabaseSeeder # (Opsiyonel: Başlangıç verileri için)
```

**Dosya İzinleri:**
Görsel yüklemelerinde sorun yaşamamak için izinleri düzeltin:
```bash
docker exec -it yumo-app chown -R www-data:www-data /var/www/storage
docker exec -it yumo-app chmod -R 775 /var/www/storage
```

---

## 8. Güncelleme Yapılacağı Zaman

Projeye yeni bir özellik eklediğinizde sunucuda yapmanız gerekenler:

```bash
cd /var/www/yumo

# 1. Kodu çek
git pull

# 2. Frontend'i tekrar derle (Eğer frontend değişikliği varsa)
cd frontend
npm install
npm run build
cd ..

# 3. Docker'ı yeniden başlat (Backend değişikliği varsa)
docker compose -f deploy/docker-compose.prod.yml restart app

# Veya komple yeniden derleyip başlatmak için:
docker compose -f deploy/docker-compose.prod.yml up -d --build
```
