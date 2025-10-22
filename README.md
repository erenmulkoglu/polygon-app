
## POLYGON APP -  POLİGON UYGULAMASI

Polygon App, kullanıcıların harita üzerinde çokgen (poligon) çizimleri yapmasını, kaydetmesini, düzenlemesini ve görüntülemesini sağlayan bir web uygulamasıdır. Her kullanıcı yalnızca kendi poligonlarını yönetebilir.

(Polygon App is a web application that allows users to draw, save, edit and view polygons (polygons) on the map. Each user can only manage their own polygons.)

NodeJs, Angular, TypeScript, CSS, HTML, Bootstrap, MongoDB teknolojilerini kullanarak poligon çizim uygulamasını sıfırdan inşa ettim. Bu uygulamayla üyelik oluşturabilirsiniz. O üyeliğe giriş yapıp kullanıcı profilinizi düzenleyebilirsiniz. Herhangi bir ülkede (Örn; Türkiye) bir alan belirleyip bölge, sınır, tarla çizimi yapıp veritabanına koordinat olarak kaydedebilirsiniz. Tarlada ekim yapıyorsanız bu alanın daha önce kullanılıp kullanılmadığının tespitini yapabilirsiniz.

(I built a polygon drawing application from scratch using NodeJs, Angular, TypeScript, CSS, HTML, Bootstrap, MongoDB technologies. You can create a membership with this application. You can log in to that membership and edit your user profile. You can determine an area in any country (e.g. Turkey) and draw a region, border, field and save it as a coordinate in the database. If you are planting in the field, you can determine whether this area has been used before.)



### Özellikler:

-  Giriş & Kayıt sistemi (JWT tabanlı)

- Harita üzerinde poligon çizimi

- Alan büyüklüğüne göre otomatik renk atama

- Kesişen poligonların siyaha dönüşmesi

- Katmanları aç/kapa sekmesinde Altlıklar adlı menüden katman seçimi (OSM, Uydu, Arazi)

- MongoDB ile kullanıcı ve poligon verisi kaydı

- Şifre güncelleme (mevcut şifre kontrolü ile)

- Poligon istatistikleri (alan, çevre, merkez)

- Side-bar kısmında meta verileri (Harita Adı, İl ve İlçe) girip filtrelemeyi gelişmiş şekilde yapabilirsiniz.

- Mesafe ölçme, poligon sıfırlama, temizleme ve sürükleme özellikleri aktif.


## Kullanılan Teknolojiler

### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- bcrypt & JWT
- CORS & dotenv

### Frontend:
- Angular
- OpenLayers (harita çizimi için)
- Bootstrap / Tailwind (opsiyonel)
- ngx-multiselect-dropdown

## ⚙️ Kurulum

### 1. Klonla:

```bash
git clone https://github.com/kullanici-adi/polygon-app.git
cd polygon-app
```
### 2. Backend Kurulumu:
```bash
cd backend
npm install
npm run dev
```
.env dosyası oluştur ve aşağıdakileri ekle:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/polygon-app
JWT_SECRET=senin-gizli-anahtarın
```

### 3. Frontend Kurulumu:
```bash
cd frontend
npm install
ng serve --open
```

Uygulama http://localhost:4200 adresinde çalışacaktır.


![image](https://github.com/user-attachments/assets/94d5d2e8-90da-444d-b1f5-e88d6939b534)


## Geliştirici
Eren Mülkoğlu

LinkedIn: https://www.linkedin.com/in/erenmulkoglu96/

E-Posta: erenmulkoglu@gmail.com

Twitter: https://x.com/erenmulkoglu96
