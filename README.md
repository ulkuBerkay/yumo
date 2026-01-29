# Yumo Project Setup Guide

Bu projeyi yeni bir bilgisayara kurduğunuzda aşağıdaki adımları takip edebilirsiniz.

## Gereksinimler

- PHP 8.2+
- Composer
- Node.js & npm
- MySQL (veya kullandığınız veritabanı)
- Git

## Kurulum Adımları

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/ulkuBerkay/yumo.git
cd yumo
```

### 2. Backend Kurulumu

Backend klasörüne gidin:
```bash
cd backend
```

Bağımlılıkları yükleyin:
```bash
composer install
```

Çevre değişkeni dosyasını oluşturun:
```bash
cp .env.example .env
```
> **Önemli:** `.env` dosyasını açıp veritabanı bilgilerinizi (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) kendi sisteminize göre düzenleyin.

Uygulama anahtarını oluşturun:
```bash
php artisan key:generate
```

Veritabanı tablolarını ve örnek verileri yükleyin:
```bash
php artisan migrate --seed
```

Storage bağlantısını yapın (resimler için gerekli):
```bash
php artisan storage:link
```

Sunucuyu başlatın:
```bash
php artisan serve
```

### 3. Frontend Kurulumu

Yeni bir terminal açın ve frontend klasörüne gidin:
```bash
cd frontend
```

Bağımlılıkları yükleyin:
```bash
npm install
```

Sunucuyu başlatın:
```bash
npm run dev
```

## Docker ile Kurulum (Opsiyonel)

Eğer Docker kullanıyorsanız, ana dizinde şu komutu çalıştırarak projeyi ayağa kaldırabilirsiniz:

```bash
docker-compose up -d --build
```
