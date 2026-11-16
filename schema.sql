-- =========================================================================
-- Cloudflare D1 Database Schema - ระบบทะเบียนคุมรับ-จ่ายวัสดุคงคลัง
-- สำหรับใช้งานร่วมกับ Cloudflare Pages / Workers (D1 SQL Database)
-- =========================================================================

-- 1. ตารางการตั้งค่าระบบ (Settings)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางผู้ใช้งานระบบ (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT NOT NULL,
    position TEXT,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางทะเบียนวัสดุ (Materials)
CREATE TABLE IF NOT EXISTS materials (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    spec TEXT,
    unit TEXT NOT NULL,
    price REAL DEFAULT 0,
    opening_stock REAL DEFAULT 0,
    opening_stock_date TEXT,
    opening_stock_year TEXT DEFAULT '2568',
    min_stock REAL DEFAULT 0,
    storage_location TEXT,
    status TEXT DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางประวัติการรับเข้าวัสดุ (Receipts)
CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no TEXT NOT NULL,
    doc_ref_no TEXT,
    date TEXT NOT NULL,
    supplier TEXT,
    material_code TEXT NOT NULL,
    material_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    quantity REAL NOT NULL,
    total_amount REAL NOT NULL,
    receiver TEXT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_code) REFERENCES materials(code)
);

-- 5. ตารางประวัติใบเบิกพัสดุ - หัวเอกสาร (Requisitions)
CREATE TABLE IF NOT EXISTS requisitions (
    req_no TEXT PRIMARY KEY,
    fiscal_year TEXT DEFAULT '2570',
    date TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    requester_position TEXT,
    department TEXT,
    purpose TEXT,
    substitute_name TEXT,
    officer_name TEXT,
    officer_position TEXT,
    approver_name TEXT,
    approver_position TEXT,
    item_count INTEGER DEFAULT 1,
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'approved',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางรายการวัสดุในใบเบิก (Requisition Items)
CREATE TABLE IF NOT EXISTS requisition_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    req_no TEXT NOT NULL,
    item_index INTEGER NOT NULL,
    material_code TEXT NOT NULL,
    material_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    quantity REAL NOT NULL,
    amount REAL NOT NULL,
    remark TEXT,
    FOREIGN KEY (req_no) REFERENCES requisitions(req_no) ON DELETE CASCADE,
    FOREIGN KEY (material_code) REFERENCES materials(code)
);

-- สร้าง Indexes เพื่อความรวดเร็วในการค้นหา
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_receipts_mat_code ON receipts(material_code);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
CREATE INDEX IF NOT EXISTS idx_requisitions_date ON requisitions(date);
CREATE INDEX IF NOT EXISTS idx_req_items_req_no ON requisition_items(req_no);

-- =========================================================================
-- ข้อมูลเริ่มต้น (Initial Data / Seed Data)
-- =========================================================================

-- Settings
INSERT OR REPLACE INTO settings (key, value, description) VALUES
('org_name', 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก', 'ชื่อหน่วยงาน'),
('org_dept', 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร', 'ชื่อสังกัด/ส่วนงาน'),
('fiscal_year', '2570', 'ปีงบประมาณปัจจุบัน'),
('officer_name', 'นางรุจิรา บุสดี', 'เจ้าหน้าที่พัสดุ'),
('officer_position', 'เจ้าหน้าที่พัสดุ', 'ตำแหน่งเจ้าหน้าที่พัสดุ'),
('approver_name', 'นางสาวจุฑารัตน์ จันทรมณี', 'ผู้มีอำนาจสั่งจ่าย'),
('approver_position', 'พยาบาลวิชาชีพชำนาญการ รักษาการในตำแหน่ง ผอ.รพ.สต.', 'ตำแหน่งผู้สั่งจ่าย'),
('report_officer_name', 'นางรุจิรา บุสดี', 'ชื่อผู้รายงาน (รายงานคงเหลือ)'),
('report_officer_position', 'นักวิชาการสาธารณสุขปฏิบัติการ', 'ตำแหน่งผู้รายงาน'),
('report_checker_name', 'นางสาวบุษบา สิงห์เรือง', 'ชื่อเจ้าหน้าที่ตรวจสอบพัสดุ'),
('report_checker_position', 'นักวิชาการสาธารณสุข', 'ตำแหน่งผู้ตรวจสอบพัสดุ');

-- Users
INSERT OR REPLACE INTO users (id, username, password, fullname, position, role, status) VALUES
('U001', 'admin', 'admin123', 'ผู้ดูแลระบบ (ADMIN)', 'หัวหน้างานพัสดุและคลัง', 'ADMIN', 'active'),
('U002', 'user', 'user123', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'พนักงานบริการ', 'USER', 'active'),
('U003', 'user2', 'user123', 'นายสมคิด จิตแจ่มใส', 'นักวิชาการสาธารณสุข', 'USER', 'active');

-- Materials (ข้อมูลเริ่มต้นตามระบบจริง)
INSERT OR REPLACE INTO materials (code, name, category, spec, unit, price, opening_stock, opening_stock_date, opening_stock_year, min_stock, storage_location, status) VALUES
('K-001', 'ผงซักฟอก ขนาด 2400 กรัม บรีส เอกเซล', 'วัสดุงานบ้านงานครัว', 'ขนาด 2400 กรัม บรีส', 'ห่อ', 225.00, 5, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-004', 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', 'วัสดุงานบ้านงานครัว', 'ขนาด 3.2 ลิตร', 'แกลลอน', 210.00, 3, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-005', 'สบู่เหลวล้างมือ ขนาด 3.8 ลิตร โปรช้อย', 'วัสดุงานบ้านงานครัว', 'ขนาด 3.8 ลิตร 3m', 'แกลลอน', 190.00, 2, '2024-10-01', '2568', 3, 'ห้องเก็บของ 1', 'active'),
('K-006', 'น้ำยาดันฝุ่น ขนาด 3.8 ลิตร 3m', 'วัสดุงานบ้านงานครัว', 'ขนาด 3.8 ลิตร 3m', 'แกลลอน', 390.00, 2, '2024-10-01', '2568', 2, 'ห้องเก็บของ 1', 'active'),
('K-007', 'น้ำยาล้างห้องน้ำ ขนาด 3.5 ลิตร เป็ด', 'วัสดุงานบ้านงานครัว', 'ขนาด 3.5 ลิตร เป็ด', 'แกลลอน', 240.00, 3, '2024-10-01', '2568', 3, 'ห้องเก็บของ 1', 'active'),
('K-008', 'ถุงขยะดำ ขนาด 18x20 นิ้ว', 'วัสดุงานบ้านงานครัว', '18x20 นิ้ว', 'กก', 60.00, 16, '2024-10-01', '2568', 10, 'ห้องเก็บของ 1', 'active'),
('K-009', 'ถุงขยะดำ ขนาด 28x36 นิ้ว', 'วัสดุงานบ้านงานครัว', '28x36 นิ้ว', 'กก', 60.00, 4, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-010', 'ถุงขยะแดง ขนาด 18x20 นิ้ว', 'วัสดุงานบ้านงานครัว', '18x20 นิ้ว ถุงขยะติดเชื้อ', 'กก', 65.00, 20, '2024-10-01', '2568', 10, 'ห้องเก็บของ 1', 'active'),
('K-011', 'กระดาษชำระม้วนเล็ก ซิลค์', 'วัสดุงานบ้านงานครัว', 'ซิลค์ ม้วนเล็ก', 'ม้วน', 8.00, 104, '2024-10-01', '2568', 50, 'ห้องเก็บของ 1', 'active'),
('K-012', 'กระดาษชำระม้วนใหญ่ Savepak', 'วัสดุงานบ้านงานครัว', 'ม้วนใหญ่ Savepak', 'ม้วน', 110.00, 2, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-013', 'ผ้าเช็ดตัว ขนาด 27x54 นิ้ว', 'วัสดุงานบ้านงานครัว', 'ขนาด 27x54 นิ้ว', 'ผืน', 110.00, 4, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-014', 'ไม้กวาดดอกหญ้า', 'วัสดุงานบ้านงานครัว', 'ด้ามไม้ไผ่', 'ด้าม', 45.00, 10, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-015', 'ไม้กวาดทางมะพร้าว (ไม่ตัดปลาย)', 'วัสดุงานบ้านงานครัว', 'ทางมะพร้าว', 'ด้าม', 65.00, 10, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active'),
('K-016', 'ไม้กวาดขนไก่ 50 ซม. SUN BRAND', 'วัสดุงานบ้านงานครัว', '50 ซม. SUN BRAND', 'ด้าม', 135.00, 2, '2024-10-01', '2568', 2, 'ห้องเก็บของ 1', 'active'),
('K-017', 'น้ำยาเช็ดกระจก รุ่นหัวฉีด ขนาด 520 มล. Mr MUSCLE', 'วัสดุงานบ้านงานครัว', 'หัวฉีด 520 มล.', 'ขวด', 95.00, 2, '2024-10-01', '2568', 3, 'ห้องเก็บของ 1', 'active'),
('K-018', 'แปรงขัดพื้นด้ามยาว', 'วัสดุงานบ้านงานครัว', 'ด้ามยาว', 'ด้าม', 85.00, 3, '2024-10-01', '2568', 2, 'ห้องเก็บของ 1', 'active'),
('K-019', 'แปรงขัดโถสุขภัณฑ์ชนิดพลาสติก ด้ามสั้น กระทิง', 'วัสดุงานบ้านงานครัว', 'ด้ามสั้น ตรากระทิง', 'ด้าม', 70.00, 3, '2024-10-01', '2568', 2, 'ห้องเก็บของ 1', 'active'),
('K-020', 'แปรงขัดโถสุขภัณฑ์ชนิดใยขัด ด้ามสั้น TIGER BRTE', 'วัสดุงานบ้านงานครัว', 'ด้ามสั้น TIGER BRTE', 'ด้าม', 45.00, 3, '2024-10-01', '2568', 2, 'ห้องเก็บของ 1', 'active'),
('K-021', 'สเปรย์กำจัดแมลง ขนาด 600 มล. อาท', 'วัสดุงานบ้านงานครัว', '600 มล. อาท', 'กระป๋อง', 85.00, 5, '2024-10-01', '2568', 3, 'ห้องเก็บของ 1', 'active'),
('MAT-003', 'กระดาษถ่ายเอกสาร A4 80 แกรม Double A', 'วัสดุสำนักงาน', 'A4 80 แกรม', 'รีม', 135.00, 50, '2024-10-01', '2568', 10, 'ห้องพัสดุ ชั้น 1', 'active'),
('MAT-004', 'ปากกาลูกลื่น 0.5 มม. น้ำเงิน', 'วัสดุสำนักงาน', '0.5 มม. หมึกน้ำเงิน', 'ด้าม', 12.00, 120, '2024-10-01', '2568', 20, 'ตู้เครื่องเขียน A', 'active'),
('MAT-005', 'หมึกพิมพ์ HP Laser 85A', 'วัสดุคอมพิวเตอร์', 'CE285A สีดำ', 'กล่อง', 1850.00, 4, '2024-10-01', '2568', 2, 'ตู้ไอที ชั้น 2', 'active'),
('MAT-006', 'แฟลชไดรฟ์ Kingston 64GB USB 3.2', 'วัสดุคอมพิวเตอร์', '64GB Kingston', 'อัน', 189.00, 15, '2024-10-01', '2568', 3, 'ตู้ไอที ชั้น 2', 'active');

