# คู่มือการนำระบบขึ้น Cloudflare Pages และเชื่อมต่อฐานข้อมูล Cloudflare D1

ระบบได้รับการจัดเตรียมไฟล์สำหรับการนำขึ้น **Cloudflare Hosting (Cloudflare Pages)** และเชื่อมต่อกับ **Cloudflare D1 (Serverless Relational SQL Database)** เรียบร้อยแล้ว 100%

---

## ไฟล์ที่ระบบเตรียมไว้ให้ในโฟลเดอร์นี้

1. **`schema.sql`** : ไฟล์โครงสร้างฐานข้อมูล SQL และข้อมูลตั้งต้น 19 รายการ สำหรับรันบน Cloudflare D1
2. **`functions/api/data.js`** : Cloudflare Pages Functions (API Backend) ทำหน้าที่เชื่อมโยงระหว่างหน้าเว็บกับฐานข้อมูล D1
3. **`wrangler.toml`** : ไฟล์คอนฟิกมาตรฐานสำหรับ Cloudflare Pages และ D1 Binding
4. **`app.js`** : อัปเดตให้รองรับการเชื่อมต่อกับ Cloudflare D1 อัตโนมัติเมื่อรันบน Cloudflare

---

## ขั้นตอนการติดตั้งและ Deploy (ทำตาม 3 ขั้นตอนง่ายๆ)

### ขั้นตอนที่ 1: สร้างฐานข้อมูล Cloudflare D1

1. ล็อกอินเข้าสู่แดชบอร์ด [dash.cloudflare.com](https://dash.cloudflare.com)
2. เมนูด้านซ้าย เลือก **Storage & Databases** > **D1 SQL Database**
3. คลิกปุ่ม **Create database**
   - ตั้งชื่อฐานข้อมูล: `inventory-db`
   - เลือก Location: **Asia Pacific (APAC)**
   - คลิก **Create**
4. เมื่อสร้างเสร็จ คลิกเข้าไปที่ฐานข้อมูล `inventory-db` -> เลือกแท็บ **Console**
5. เปิดไฟล์ `schema.sql` ในเครื่องของคุณ คัดลอกโค้ดทั้งหมด มาวางในช่อง Console แล้วคลิก **Execute**
   *(ระบบจะสร้างตาราง `materials`, `receipts`, `requisitions`, `users`, `settings` พร้อมลงข้อมูลตั้งต้นให้ทันที)*

---

### ขั้นตอนที่ 2: นำเว็บไซต์ขึ้น Cloudflare Pages (Hosting)

1. ในแดชบอร์ด Cloudflare เมนูด้านซ้าย เลือก **Workers & Pages**
2. คลิกปุ่ม **Create application** > เลือกแท็บ **Pages**
3. เลือกหัวข้อ **Upload assets** (อัปโหลดโดยตรง)
4. ตั้งชื่อ Project Name: เช่น `inventory-system`
5. ลากโฟลเดอร์โปรเจกต์นี้ทั้งหมด (ที่มี `index.html`, `app.js`, โฟลเดอร์ `functions`, `logo.png` ฯลฯ) มาวางในกรอบอัปโหลด
6. คลิก **Deploy site**

---

### ขั้นตอนที่ 3: ผูกฐานข้อมูล D1 เข้ากับ Cloudflare Pages

1. เมื่อ Deploy เสร็จ ให้คลิกเข้าไปที่โปรเจกต์ Pages นั้น
2. ไปที่แท็บ **Settings** > เมนูด้านซ้ายเลือก **Functions**
3. เลื่อนลงมาที่หัวข้อ **D1 Database Bindings**
4. คลิก **Add binding**:
   - **Variable name**: พิมพ์คำว่า `DB` (ตัวพิมพ์ใหญ่ 2 ตัว)
   - **D1 database**: เลือกฐานข้อมูล `inventory-db` ที่สร้างไว้
5. คลิก **Save**
6. ไปที่แท็บ **Deployments** คลิก **Create new deployment** หรืออัปโหลดซ้ำอีกครั้ง เพื่อให้ Binding มีผล

---

## ผลลัพธ์ที่ได้
* คุณจะได้ URL เว็บไซต์ เช่น `https://inventory-system.pages.dev` ที่เปิดใช้งานได้ทันทีทั่วโลก
* ข้อมูลทั้งหมด (รับเข้า, เบิกจ่าย, ทะเบียนคุม) จะถูกจัดเก็บและซิงค์ผ่าน Cloudflare D1 Database แบบ Real-time ที่รวดเร็ว ปลอดภัย และไม่มีค่าใช้จ่ายเซิร์ฟเวอร์

