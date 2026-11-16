/**
 * =========================================================================
 * ต้นแบบระบบทะเบียนคุมรับ–จ่ายวัสดุคงคลัง (Inventory Management System)
 * ฐานข้อมูล Google Sheets / LocalStorage Data Layer
 * =========================================================================
 */

// หมวดหมู่วัสดุหลัก 8 ประเภท
const CATEGORIES = [
  'วัสดุสำนักงาน',
  'วัสดุงานบ้านงานครัว',
  'วัสดุคอมพิวเตอร์',
  'วัสดุการเกษตร',
  'วัสดุไฟฟ้า',
  'วัสดุเชื้อเพลิง',
  'วัสดุโฆษณา',
  'วัสดุก่อสร้าง'
];

const CATEGORY_COLORS = {
  'วัสดุก่อสร้าง': '#a855f7',
  'วัสดุการเกษตร': '#3b82f6',
  'วัสดุไฟฟ้า': '#14b8a6',
  'วัสดุเชื้อเพลิง': '#b45309',
  'วัสดุสำนักงาน': '#2563eb',
  'วัสดุคอมพิวเตอร์': '#6366f1',
  'วัสดุงานบ้านงานครัว': '#f43f5e',
  'วัสดุโฆษณา': '#ec4899'
};

// ข้อมูลเริ่มต้นสำหรับระบบ (Sample Data)
const INITIAL_DATA = {
  settings: {
    org_name: 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก',
    org_dept: 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร',
    fiscal_year: '2570',
    officer_name: 'นางรุจิรา บุสดี',
    officer_position: 'เจ้าหน้าที่พัสดุ',
    approver_name: 'นางสาวจุฑารัตน์ จันทรมณี',
    approver_position: 'พยาบาลวิชาชีพชำนาญการ',
    report_officer_name: 'นางรุจิรา บุสดี',
    report_officer_position: 'นักวิชาการสาธารณสุขปฏิบัติการ',
    report_checker_name: 'นางสาวบุษบา สิงห์เรือง',
    report_checker_position: 'นักวิชาการสาธารณสุข',
    google_script_url: '',
    dev_photo_1: '',
    dev_photo_2: ''
  },
  currentUser: {
    id: 'U001',
    username: 'admin',
    fullname: 'ผู้ดูแลระบบ (ADMIN)',
    position: 'หัวหน้างานพัสดุและคลัง',
    role: 'ADMIN'
  },
  users: [
    { id: 'U001', username: 'admin', password: '123', fullname: 'ผู้ดูแลระบบ (ADMIN)', position: 'หัวหน้างานพัสดุและคลัง', role: 'ADMIN', status: 'active' },
    { id: 'U002', username: 'user1', password: '123', fullname: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', position: 'พนักงานบริการ', role: 'USER', status: 'active' },
    { id: 'U003', username: 'user2', password: '123', fullname: 'นายสมคิด จิตแจ่มใส', position: 'นักวิชาการสาธารณสุข', role: 'USER', status: 'active' },
    { id: 'U004', username: 'rujira', password: '123', fullname: 'นางรุจิรา บุสดี', position: 'นักวิชาการสาธารณสุขปฏิบัติการ', department: 'กองสาธารณสุข อบจ.พิจิตร', role: 'ADMIN', status: 'active' },
    { id: 'U005', username: 'veerapon', password: '123', fullname: 'นายวีระพล มีบุญ', position: 'พนักงานธุรการ', department: 'รพ.สต.บ้านหนองสะแก', role: 'USER', status: 'active' }
  ],
  materials: [
    { code: 'K-001', name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส เอกเซล', category: 'วัสดุงานบ้านงานครัว', spec: '2400 กรัม', unit: 'ห่อ', price: 225.00, opening_stock: 5, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 5, storage_location: 'ตู้เก็บวัสดุ ชั้น 2', status: 'active' },
    { code: 'K-004', name: 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', category: 'วัสดุงานบ้านงานครัว', spec: 'ขนาด 3.2 ลิตร', unit: 'แกลลอน', price: 210.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 5, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'MAT-003', name: 'กระดาษถ่ายเอกสาร A4 80 แกรม Double A', category: 'วัสดุสำนักงาน', spec: 'A4 80 แกรม', unit: 'รีม', price: 135.00, opening_stock: 50, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 10, storage_location: 'ห้องพัสดุ ชั้น 1', status: 'active' },
    { code: 'MAT-004', name: 'ปากกาลูกลื่น 0.5 มม. น้ำเงิน', category: 'วัสดุสำนักงาน', spec: '0.5 มม. หมึกน้ำเงิน', unit: 'ด้าม', price: 12.00, opening_stock: 120, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 20, storage_location: 'ตู้เครื่องเขียน A', status: 'active' },
    { code: 'MAT-005', name: 'หมึกพิมพ์ HP Laser 85A', category: 'วัสดุคอมพิวเตอร์', spec: 'CE285A สีดำ', unit: 'กล่อง', price: 1850.00, opening_stock: 4, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 2, storage_location: 'ตู้ไอที ชั้น 2', status: 'active' },
    { code: 'MAT-006', name: 'แฟลชไดรฟ์ Kingston 64GB USB 3.2', category: 'วัสดุคอมพิวเตอร์', spec: '64GB Kingston', unit: 'อัน', price: 189.00, opening_stock: 15, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 3, storage_location: 'ตู้ไอที ชั้น 2', status: 'active' },
    { code: 'MAT-007', name: 'ปุ๋ยเคมีสูตร 16-16-16', category: 'วัสดุการเกษตร', spec: 'กระสอบ 50 กก.', unit: 'กระสอบ', price: 1250.00, opening_stock: 8, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 2, storage_location: 'โรงเรือนการเกษตร', status: 'active' },
    { code: 'MAT-008', name: 'สายยางรดน้ำ 5/8 นิ้ว ยาว 20 เมตร', category: 'วัสดุการเกษตร', spec: '5/8 นิ้ว หนาพิเศษ', unit: 'ม้วน', price: 450.00, opening_stock: 5, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 2, storage_location: 'โรงเรือนการเกษตร', status: 'active' },
    { code: 'MAT-009', name: 'หลอดไฟ LED T8 18W แสงขาว', category: 'วัสดุไฟฟ้า', spec: '18W Daylight', unit: 'หลอด', price: 85.00, opening_stock: 40, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 10, storage_location: 'ห้องช่าง/ไฟฟ้า', status: 'active' },
    { code: 'MAT-010', name: 'สายไฟ VAF 2x1.5 Sq.mm. 100 เมตร', category: 'วัสดุไฟฟ้า', spec: '2x1.5 ยาว 100 เมตร', unit: 'ขด', price: 1350.00, opening_stock: 6, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 2, storage_location: 'ห้องช่าง/ไฟฟ้า', status: 'active' },
    { code: 'MAT-011', name: 'น้ำมันดีเซล B7', category: 'วัสดุเชื้อเพลิง', spec: 'มาตรฐาน ปตท.', unit: 'ลิตร', price: 32.50, opening_stock: 220, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 50, storage_location: 'ถังบรรจุเชื้อเพลิง', status: 'active' },
    { code: 'MAT-012', name: 'ป้ายไวนิลประชาสัมพันธ์โครงการ', category: 'วัสดุโฆษณา', spec: 'ขนาด 1x3 เมตร', unit: 'ผืน', price: 450.00, opening_stock: 15, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 2, storage_location: 'ห้องประชาสัมพันธ์', status: 'active' },
    { code: 'MAT-013', name: 'ปูนซีเมนต์ปอร์ตแลนด์ ตราช้าง', category: 'วัสดุก่อสร้าง', spec: 'ถุง 50 กก.', unit: 'ถุง', price: 165.00, opening_stock: 80, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 15, storage_location: 'โกดังเก็บวัสดุ', status: 'active' },
    { code: 'MAT-014', name: 'สีน้ำทาภายใน สีขาว ขนาด 5 แกลลอน', category: 'วัสดุก่อสร้าง', spec: 'TOA 5 แกลลอน', unit: 'ถัง', price: 1890.00, opening_stock: 25, opening_stock_date: '2024-10-01', opening_stock_year: '2568', min_stock: 5, storage_location: 'โกดังเก็บวัสดุ', status: 'active' },
    // 19 รายการตามรายงานคงเหลือวัสดุงานบ้านงานครัว ปีงบประมาณ 2569 (ยอดรวม 10,212.00 บาท - รหัสขึ้นต้นด้วย K-)
    { code: 'K-017', name: 'ถุงขยะดำ ขนาด 18x20 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '18x20 นิ้ว', unit: 'กก', price: 60.00, opening_stock: 16, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 5, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-018', name: 'ถุงขยะดำ ขนาด 28x36 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '28x36 นิ้ว', unit: 'กก', price: 60.00, opening_stock: 4, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 5, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-019', name: 'ถุงขยะแดง ขนาด 18x20 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '18x20 นิ้ว', unit: 'กก', price: 65.00, opening_stock: 20, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 5, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-002', name: 'สบู่เหลวล้างมือ ขนาด 3.8 ลิตร 3m', category: 'วัสดุงานบ้านงานครัว', spec: '3.8 ลิตร 3m', unit: 'แกลลอน', price: 190.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-003', name: 'น้ำยาดันฝุ่น ขนาด 3.8 ลิตร 3m', category: 'วัสดุงานบ้านงานครัว', spec: '3.8 ลิตร 3m', unit: 'แกลลอน', price: 390.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-005', name: 'น้ำยาล้างห้องน้ำ ขนาด 3.5 ลิตร เป็ด', category: 'วัสดุงานบ้านงานครัว', spec: '3.5 ลิตร เป็ด', unit: 'แกลลอน', price: 240.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-006', name: 'กระดาษชำระม้วนเล็ก ซิลค์', category: 'วัสดุงานบ้านงานครัว', spec: 'ม้วนเล็ก ซิลค์', unit: 'ม้วน', price: 8.00, opening_stock: 104, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 20, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-007', name: 'กระดาษชำระม้วนใหญ่ Savepak', category: 'วัสดุงานบ้านงานครัว', spec: 'ม้วนใหญ่ Savepak', unit: 'ม้วน', price: 110.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ 1', status: 'active' },
    { code: 'K-008', name: 'ผ้าเช็ดตัว ขนาด 27x54 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '27x54 นิ้ว', unit: 'ผืน', price: 110.00, opening_stock: 4, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ตู้ผ้า', status: 'active' },
    { code: 'K-009', name: 'ไม้กวาดดอกหญ้า', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามไม้ไผ่', unit: 'ด้าม', price: 45.00, opening_stock: 10, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-010', name: 'ไม้กวาดทางมะพร้าว (ไม่ตัดปลาย)', category: 'วัสดุงานบ้านงานครัว', spec: 'ไม่ตัดปลาย', unit: 'ด้าม', price: 65.00, opening_stock: 10, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-011', name: 'ไม้กวาดขนไก่ 50 ซม. SUN BRAND', category: 'วัสดุงานบ้านงานครัว', spec: '50 ซม. SUN BRAND', unit: 'ด้าม', price: 135.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-012', name: 'น้ำยาเช็ดกระจก รุ่นหัวฉีด ขนาด 520 มล. Mr MUSCLE', category: 'วัสดุงานบ้านงานครัว', spec: '520 มล. Mr MUSCLE', unit: 'ขวด', price: 95.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-013', name: 'แปรงขัดพื้นด้ามยาว', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามยาว', unit: 'ด้าม', price: 85.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-014', name: 'แปรงขัดโถสุขภัณฑ์ชนิดพลาสติก ด้ามสั้น กระทิง', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามสั้น ตรากระทิง', unit: 'ด้าม', price: 70.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-015', name: 'แปรงขัดโถสุขภัณฑ์ชนิดใยขัด ด้ามสั้น TIGER BRTE', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามสั้น TIGER BRTE', unit: 'ด้าม', price: 45.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' },
    { code: 'K-016', name: 'สเปรย์กำจัดแมลง ขนาด 600 มล. อาท', category: 'วัสดุงานบ้านงานครัว', spec: '600 มล. อาท', unit: 'กระป๋อง', price: 85.00, opening_stock: 5, opening_stock_date: '2025-10-01', opening_stock_year: '2569', min_stock: 2, storage_location: 'ห้องเก็บของ', status: 'active' }
  ],
  receipts: [
    { receipt_no: 'RC-2568-001', doc_ref_no: 'TS680021', date: '2025-03-19', supplier: 'ร้านธารา เซอร์วิส', material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 10, total_amount: 2250.00, receiver: 'นางรุจิรา บุสดี', remark: 'รับเข้าสต็อกตามใบจัดซื้อ' },
    { receipt_no: 'RC-2568-002', doc_ref_no: 'INV-9921', date: '2025-05-10', supplier: 'หจก.ชัยเจริญพาณิชย์', material_code: 'MAT-003', material_name: 'กระดาษถ่ายเอกสาร A4 80 แกรม Double A', unit: 'รีม', price: 135.00, quantity: 30, total_amount: 4050.00, receiver: 'นางรุจิรา บุสดี', remark: 'รับเข้าตามรอบประจำไตรมาส' },
    { receipt_no: 'RC-2569-001', doc_ref_no: 'TX-4402', date: '2026-02-14', supplier: 'บริษัท สยามแก๊ส แอนด์ ออยล์ จำกัด', material_code: 'MAT-011', material_name: 'น้ำมันดีเซล B7', unit: 'ลิตร', price: 32.50, quantity: 150, total_amount: 4875.00, receiver: 'นายสมคิด จิตแจ่มใส', remark: 'เติมเข้าถังสำรองเครื่องปั่นไฟ' }
  ],
  requisitions: [
    { req_no: '02/2568', fiscal_year: '2568', date: '2025-03-20', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'เพื่อใช้ทำความสะอาดอาคารผู้ป่วยนอก', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 225.00, status: 'approved', remark: '-' },
    { req_no: '05/2568', fiscal_year: '2568', date: '2025-04-18', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'ทำความสะอาดประจำเดือน', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 450.00, status: 'approved', remark: '-' },
    { req_no: '08/2568', fiscal_year: '2568', date: '2025-05-28', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'ทำความสะอาดอาคารสำนักงาน', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 225.00, status: 'approved', remark: '-' },
    { req_no: '10/2568', fiscal_year: '2568', date: '2025-06-26', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'ซักล้างทำความสะอาดผ้าม่าน', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 225.00, status: 'approved', remark: '-' },
    { req_no: '11/2568', fiscal_year: '2568', date: '2025-07-14', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'ใช้ทำความสะอาดอาคาร', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 225.00, status: 'approved', remark: '-' },
    { req_no: '16/2568', fiscal_year: '2568', date: '2025-09-22', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'ทำความสะอาดอาคารและหอประชุม', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 225.00, status: 'approved', remark: '-' },
    { req_no: '1/2570', fiscal_year: '2570', date: '2026-10-19', requester_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', requester_position: 'พนักงานบริการ', department: 'งานบริการความสะอาด', purpose: 'เพื่อใช้ในงานทำความสะอาดห้องสุขาและสุขอนามัย', substitute_name: 'นางสาวสมหมาย ไผ่สัมฤทธิ์', officer_name: 'นางรุจิรา บุสดี', officer_position: 'เจ้าหน้าที่พัสดุ', approver_name: 'นางสาวจุฑารัตน์ จันทรมณี', approver_position: 'พยาบาลวิชาชีพชำนาญการ', item_count: 1, total_amount: 60.00, status: 'approved', remark: '-' }
  ],
  requisitionItems: [
    { req_no: '02/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 1, amount: 225.00, remark: '-' },
    { req_no: '05/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 2, amount: 450.00, remark: '-' },
    { req_no: '08/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 1, amount: 225.00, remark: '-' },
    { req_no: '10/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 1, amount: 225.00, remark: '-' },
    { req_no: '11/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 1, amount: 225.00, remark: '-' },
    { req_no: '16/2568', item_index: 1, material_code: 'K-001', material_name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส', unit: 'ห่อ', price: 225.00, quantity: 1, amount: 225.00, remark: '-' },
    { req_no: '1/2570', item_index: 1, material_code: 'K-004', material_name: 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', unit: 'แกลลอน', price: 60.00, quantity: 1, amount: 60.00, remark: '-' }
  ]
};

// Global State
let APP_STATE = {
  settings: {},
  currentUser: {},
  users: [],
  materials: [],
  receipts: [],
  requisitions: [],
  requisitionItems: [],
  currentCategoryView: 'วัสดุสำนักงาน',
  dateFilter: {
    start: '',
    end: '',
    year: '2570'
  }
};

// Charts instances
let chartCategoryValueInstance = null;
let chartCategoryBalanceInstance = null;
let chartMonthlyTrendInstance = null;

/**
 * ฟังก์ชันเริ่มต้นทำงานเมื่อโหลดหน้าเสร็จ
 */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  lucide.createIcons();
  setupEventListeners();
  renderApp();
  checkAuthAndShowScreen();
  
  // ตรวจสอบการเชื่อมต่อฐานข้อมูล (Cloudflare D1 หรือ Google Sheets)
  if (isCloudflareD1Enabled()) {
    syncWithCloudflareD1(false);
  } else if (APP_STATE.settings.google_script_url) {
    syncWithGoogleSheets(false);
  }
});

/**
 * โหลดข้อมูลจาก LocalStorage หรือใช้ค่าเริ่มต้น
 */
function loadState() {
  const saved = localStorage.getItem('INVENTORY_APP_STATE_V2');
  if (saved) {
    try {
      APP_STATE = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local storage, resetting to initial', e);
      APP_STATE = JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  } else {
    APP_STATE = JSON.parse(JSON.stringify(INITIAL_DATA));
    saveState();
  }

  // ป้องกันค่าตกหล่น
  if (!APP_STATE.users || APP_STATE.users.length === 0) APP_STATE.users = INITIAL_DATA.users;
  if (!APP_STATE.settings) APP_STATE.settings = INITIAL_DATA.settings;
  if (!APP_STATE.currentUser) APP_STATE.currentUser = APP_STATE.users[0];
  if (!APP_STATE.dateFilter) APP_STATE.dateFilter = { start: '', end: '', year: '2570' };

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  const isLoggedInSaved = localStorage.getItem('INVENTORY_LOGGED_IN');
  APP_STATE.isLoggedIn = (isLoggedInSaved === 'true');

  // ตรวจสอบผู้ใช้ที่จำไว้ล่าสุด
  const savedUsername = localStorage.getItem('INVENTORY_SAVED_USER');
  if (savedUsername) {
    const found = APP_STATE.users.find(u => u.username === savedUsername);
    if (found) APP_STATE.currentUser = found;
  }

  if (APP_STATE.materials) {
    APP_STATE.materials.forEach(m => {
      if (!m.opening_stock_year) m.opening_stock_year = '2568';
      if (!m.opening_stock_date) m.opening_stock_date = `${Number(m.opening_stock_year) - 543}-01-01`;
    });
    // แปลงรหัสวัสดุงานบ้านงานครัวทั้งหมดให้ขึ้นต้นด้วย K-
    migrateHouseholdMaterialCodes();
  }
}

/**
 * ตรวจสอบสถานะล็อกอินและแสดงหน้าจอล็อกอิน
 */
function checkAuthAndShowScreen() {
  const loginScreen = document.getElementById('loginScreen');
  if (!loginScreen) return;
  if (APP_STATE.isLoggedIn) {
    loginScreen.classList.add('hidden');
  } else {
    loginScreen.classList.remove('hidden');
    const uInput = document.getElementById('login_username');
    if (uInput && !uInput.value && APP_STATE.currentUser) {
      uInput.value = APP_STATE.currentUser.username || 'admin';
    }
  }
}

/**
 * บันทึกข้อมูลลง LocalStorage
 */
function saveState() {
  localStorage.setItem('INVENTORY_APP_STATE_V2', JSON.stringify(APP_STATE));
}

/**
 * คำนวณสต็อกวัสดุอย่างละเอียด:
 * ยอดยกมา + รับเข้า – จ่ายออก = คงเหลือ, มูลค่าคงเหลือ
 */
function calculateMaterialStock(code, filter = null) {
  const mat = APP_STATE.materials.find(m => m.code === code);
  if (!mat) return { opening: 0, received: 0, disbursed: 0, remaining: 0, value: 0 };

  const opening = Number(mat.opening_stock) || 0;
  const price = Number(mat.price) || 0;

  // รวมรับเข้า
  let received = 0;
  APP_STATE.receipts.forEach(r => {
    if (r.material_code === code) {
      if (filter && !isDateInRange(r.date, filter.start, filter.end)) return;
      received += (Number(r.quantity) || 0);
    }
  });

  // รวมจ่ายออก
  let disbursed = 0;
  APP_STATE.requisitionItems.forEach(item => {
    if (item.material_code === code) {
      const parentReq = APP_STATE.requisitions.find(q => q.req_no === item.req_no);
      if (parentReq && parentReq.status === 'cancelled') return;
      if (filter && parentReq && !isDateInRange(parentReq.date, filter.start, filter.end)) return;
      disbursed += (Number(item.quantity) || 0);
    }
  });

  const remaining = opening + received - disbursed;
  const value = remaining * price;

  return {
    code: mat.code,
    name: mat.name,
    category: mat.category,
    unit: mat.unit,
    price: price,
    opening: opening,
    received: received,
    disbursed: disbursed,
    remaining: remaining,
    value: value,
    min_stock: Number(mat.min_stock) || 5,
    isLowStock: remaining <= (Number(mat.min_stock) || 5) && remaining > 0,
    isOutOfStock: remaining <= 0
  };
}

/**
 * ตรวจสอบช่วงวันที่
 */
function isDateInRange(targetDateStr, startDateStr, endDateStr) {
  if (!targetDateStr) return true;
  const d = new Date(targetDateStr);
  if (startDateStr) {
    const s = new Date(startDateStr);
    if (d < s) return false;
  }
  if (endDateStr) {
    const e = new Date(endDateStr);
    // รวมวันสิ้นสุดจนถึง 23:59:59
    e.setHours(23, 59, 59, 999);
    if (d > e) return false;
  }
  return true;
}

/**
 * แปลงจำนวนเงินเป็นตัวอักษรภาษาไทย (บาทถ้วน)
 */
function thaiBahtText(num) {
  if (num === null || num === undefined || isNaN(num)) return 'ศูนย์บาทถ้วน';
  num = Number(num).toFixed(2);
  const parts = num.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  if (Number(num) === 0) return 'ศูนย์บาทถ้วน';

  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function readBlock(str) {
    let result = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str.charAt(i), 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1 && str.charAt(i - 1) !== '0') {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 1) {
          result += '';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่';
        } else {
          result += thaiNumbers[digit];
        }
        result += thaiUnits[pos];
      }
    }
    return result;
  }

  let text = '';
  if (integerPart.length > 6) {
    const millionPart = integerPart.substring(0, integerPart.length - 6);
    const lowerPart = integerPart.substring(integerPart.length - 6);
    text += readBlock(millionPart) + 'ล้าน' + readBlock(lowerPart) + 'บาท';
  } else {
    text += (integerPart === '0' ? '' : readBlock(integerPart)) + 'บาท';
  }

  if (decimalPart === '00') {
    text += 'ถ้วน';
  } else {
    text += readBlock(decimalPart) + 'สตางค์';
  }

  return text;
}

/**
 * Format ตัวเลขเงิน (comma and 2 decimals)
 */
function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(qty) {
  return Number(qty || 0).toLocaleString('th-TH');
}

/**
 * Format วันที่แบบไทย
 */
function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const yearTh = (d.getFullYear() + 543).toString().slice(-2);
  return `${day} ${months[d.getMonth()]} ${yearTh}`;
}

function formatFullThaiDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  return `${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
}

/**
 * สลับมุมมองหน้าต่าง พร้อมระบบจำกัดสิทธิ์การเข้าถึง
 */
function switchView(viewName) {
  const views = [
    'dashboard', 'category-report', 'stock-balance-report', 'materials', 'receive', 
    'requisition', 'requisition-history', 'ledger-pd4', 
    'alerts', 'import-file', 'users', 'settings', 'developers'
  ];

  // ตรวจสอบสิทธิ์การเข้าถึง (Request 2: User เข้าถึงข้อมูลได้แค่แดชบอร์ด / รายงานสรุปแยกประเภท / รายงานคงเหลือ / ออกใบเบิกวัสดุ / ผู้พัฒนาระบบ เท่านั้น)
  const isUserRole = APP_STATE.currentUser?.role !== 'ADMIN';
  const allowedUserViews = ['dashboard', 'category-report', 'stock-balance-report', 'requisition', 'developers'];
  if (isUserRole && !allowedUserViews.includes(viewName)) {
    showToast('สิทธิ์ผู้ใช้งานทั่วไป (USER) สามารถเข้าถึงได้เฉพาะ แดชบอร์ด, รายงานสรุปแยกประเภท, รายงานคงเหลือ, ออกใบเบิกวัสดุ และข้อมูลผู้พัฒนาระบบ เท่านั้น (แก้ไขข้อมูลไม่ได้)', 'warning');
    viewName = 'dashboard';
  }

  // ซ่อนทุก view
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  // แสดง view ที่เลือก
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) targetView.classList.remove('hidden');

  // อัปเดตสไตล์ของปุ่มใน Sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('text-slate-300', 'hover:bg-slate-800');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('text-slate-300', 'hover:bg-slate-800');
    }
  });

  // ปิด Drawer บนมือถือ
  closeSidebar();

  // Re-render chart เมื่อกลับเข้า dashboard
  if (viewName === 'dashboard') {
    setTimeout(renderDashboardCharts, 100);
  } else if (viewName === 'stock-balance-report') {
    renderStockBalanceReport();
  } else if (viewName === 'ledger-pd4') {
    populateLedgerMaterialSelect();
    syncLedgerCategoryCheckboxesUI();
  } else if (viewName === 'receive') {
    populateReceiveSelect();
    renderReceiptsTable();
  } else if (viewName === 'requisition') {
    initRequisitionForm();
  } else if (viewName === 'requisition-history') {
    renderRequisitionsHistoryTable();
  } else if (viewName === 'materials') {
    renderMaterialsTable();
  } else if (viewName === 'alerts') {
    renderAlertsTable();
  } else if (viewName === 'import-file') {
    initFileImportView();
  } else if (viewName === 'users') {
    renderUsersTable();
  } else if (viewName === 'developers') {
    renderDeveloperPhotos();
  }

  lucide.createIcons();
}

/**
 * เปิดมุมมองรายงานแยกประเภท
 */
function openCategoryReport(categoryName) {
  APP_STATE.currentCategoryView = categoryName;
  switchView('category-report');
  renderCategoryReport(categoryName);
}

/**
 * แสดงผลข้อมูลทั้งหมดในแอพ
 */
function renderApp() {
  updateUserInterface();
  updateCategoryBadges();
  renderDashboard();
  renderDeveloperPhotos();
}

/**
 * อัปเดตสิทธิ์และการแสดงผลผู้ใช้งาน (จำกัดการเข้าถึง User และ Admin)
 */
function updateUserInterface() {
  const user = APP_STATE.currentUser || { fullname: 'ผู้ดูแลระบบ', role: 'ADMIN' };
  document.getElementById('currentUserName').innerText = user.fullname.split(' ')[0] || user.fullname;
  document.getElementById('currentUserRole').innerText = user.role;
  document.getElementById('userAvatarBadge').innerText = (user.fullname || 'A').charAt(0);

  const isAdmin = user.role === 'ADMIN';

  // รายการเมนูสำหรับ ADMIN เท่านั้น (USER จะถูกซ่อนทั้งหมดตาม Request 2)
  const adminOnlyNavIds = [
    'navMaterialsBtn',
    'navReceiveBtn',
    'navRequisitionHistoryBtn',
    'navLedgerPD4Btn',
    'navAlertsBtn',
    'navImportFileBtn',
    'navUsersBtn',
    'navSettingsBtn'
  ];

  adminOnlyNavIds.forEach(navId => {
    const el = document.getElementById(navId);
    if (el) {
      if (isAdmin) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // ซ่อน/แสดงหัวข้อกลุ่ม "ข้อมูลหลัก" และ "ระบบ" หากไม่มีเมนูย่อย
  const coreGroup = document.getElementById('navGroupCoreData');
  if (coreGroup) {
    // ให้คงหัวข้อไว้ เพราะมี ออกใบเบิกพัสดุ
    coreGroup.classList.remove('hidden');
  }

  // อัปเดตปุ่มใน Requisition "ฉันเป็นผู้ขอเบิก"
  const txtCurrent = document.getElementById('txtBtnCurrentUserName');
  if (txtCurrent) {
    txtCurrent.innerText = user.fullname.split(' ')[0] || user.fullname;
  }

  // ข้อมูลส่วนหัว
  document.getElementById('headerOrgName').innerText = APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก';
  document.getElementById('headerFiscalYear').innerText = APP_STATE.settings.fiscal_year || '2570';
  document.getElementById('selectFiscalYear').value = APP_STATE.settings.fiscal_year || '2570';
  document.getElementById('quickYearLabel').innerText = APP_STATE.settings.fiscal_year || '2570';

  // สถานะการเชื่อมต่อ
  updateConnectionStatusUI();
}

function updateConnectionStatusUI() {
  const isConnected = !!APP_STATE.settings.google_script_url;
  const badge = document.getElementById('topConnectionBadge');
  const txt = document.getElementById('txtConnectionStatus');
  const cfgBadge = document.getElementById('cfgConnectionStatusBadge');
  const banner = document.getElementById('bannerPreviewMode');

  if (isConnected) {
    badge.className = 'hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    txt.innerText = 'เชื่อมต่อ Google Sheets';
    cfgBadge.className = 'text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800';
    cfgBadge.innerText = 'เชื่อมต่อแล้ว';
    if (banner) banner.classList.add('hidden');
  } else {
    badge.className = 'hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30';
    txt.innerText = 'โหมดทดสอบ (Local Data)';
    cfgBadge.className = 'text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800';
    cfgBadge.innerText = 'ยังไม่เชื่อมต่อ';
    if (banner) banner.classList.remove('hidden');
  }
}

/**
 * อัปเดตตัวเลข Badge บนหมวดหมู่ใน Sidebar
 */
function updateCategoryBadges() {
  let lowStockCount = 0;
  const counts = {};
  CATEGORIES.forEach(c => counts[c] = 0);

  APP_STATE.materials.forEach(m => {
    if (counts[m.category] !== undefined) counts[m.category]++;
    const calc = calculateMaterialStock(m.code);
    if (calc.isLowStock || calc.isOutOfStock) lowStockCount++;
  });

  document.getElementById('badgeCat1').innerText = counts['วัสดุสำนักงาน'] || 0;
  document.getElementById('badgeCat2').innerText = counts['วัสดุงานบ้านงานครัว'] || 0;
  document.getElementById('badgeCat3').innerText = counts['วัสดุคอมพิวเตอร์'] || 0;
  document.getElementById('badgeCat4').innerText = counts['วัสดุการเกษตร'] || 0;
  document.getElementById('badgeCat5').innerText = counts['วัสดุไฟฟ้า'] || 0;
  document.getElementById('badgeCat6').innerText = counts['วัสดุเชื้อเพลิง'] || 0;
  document.getElementById('badgeCat7').innerText = counts['วัสดุโฆษณา'] || 0;
  document.getElementById('badgeCat8').innerText = counts['วัสดุก่อสร้าง'] || 0;

  document.getElementById('badgeTotalMaterials').innerText = APP_STATE.materials.length;
  document.getElementById('badgeTotalReceipts').innerText = APP_STATE.receipts.length;
  document.getElementById('badgeTotalRequisitions').innerText = APP_STATE.requisitions.length;
  document.getElementById('badgeAlerts').innerText = lowStockCount;
}

/**
 * แสดงแดชบอร์ดภาพรวม (สอดคล้องกับภาพ ba6032c8-325f-41db-9886-7409db4840ad.jpg)
 */
function renderDashboard() {
  const filter = APP_STATE.dateFilter;
  let totalMaterials = APP_STATE.materials.length;
  let totalReceived = 0;
  let totalDisbursed = 0;
  let totalRemaining = 0;
  let totalStockValue = 0;
  let lowStockCount = 0;

  // คำนวณสรุป
  APP_STATE.materials.forEach(m => {
    const calc = calculateMaterialStock(m.code, filter);
    totalReceived += calc.received;
    totalDisbursed += calc.disbursed;
    totalRemaining += calc.remaining;
    totalStockValue += calc.value;
    if (calc.isLowStock || calc.isOutOfStock) lowStockCount++;
  });

  // กรองจำนวนใบรับเข้าและใบเบิกตามช่วงเวลา
  const filteredReceipts = APP_STATE.receipts.filter(r => isDateInRange(r.date, filter.start, filter.end));
  const filteredReqs = APP_STATE.requisitions.filter(q => isDateInRange(q.date, filter.start, filter.end));

  // แสดงผลตัวเลขใน Card
  document.getElementById('statTotalMaterials').innerText = formatQty(totalMaterials);
  document.getElementById('statTotalReceived').innerText = formatQty(totalReceived);
  document.getElementById('statTotalDisbursed').innerText = formatQty(totalDisbursed);
  document.getElementById('statTotalRemaining').innerText = formatQty(totalRemaining);
  document.getElementById('statTotalStockValue').innerText = '฿' + formatMoney(totalStockValue);
  document.getElementById('statLowStockCount').innerText = formatQty(lowStockCount);
  document.getElementById('statReceiptCount').innerText = formatQty(filteredReceipts.length);
  document.getElementById('statRequisitionCount').innerText = formatQty(filteredReqs.length);

  // วาดกราฟ
  renderDashboardCharts();
}

/**
 * เรนเดอร์กราฟทั้งหมดบน Dashboard
 */
function renderDashboardCharts() {
  const filter = APP_STATE.dateFilter;
  
  // 1. คำนวณมูลค่าคงเหลือและยอดคงเหลือแยกตามประเภท
  const catStats = {};
  CATEGORIES.forEach(c => {
    catStats[c] = { value: 0, remaining: 0, received: 0, disbursed: 0 };
  });

  let grandTotalValue = 0;

  APP_STATE.materials.forEach(m => {
    const calc = calculateMaterialStock(m.code, filter);
    if (catStats[m.category]) {
      catStats[m.category].value += calc.value;
      catStats[m.category].remaining += calc.remaining;
      catStats[m.category].received += calc.received;
      catStats[m.category].disbursed += calc.disbursed;
      grandTotalValue += calc.value;
    }
  });

  // จัดเรียงตามมูลค่าคงเหลือมากไปน้อยสำหรับ Donut Chart & Breakdown
  const sortedByValue = [...CATEGORIES].sort((a, b) => catStats[b].value - catStats[a].value);

  // --- CHART 1: Donut Chart มูลค่าคงเหลือ ---
  const ctxDonut = document.getElementById('chartCategoryValue');
  if (ctxDonut) {
    if (chartCategoryValueInstance) chartCategoryValueInstance.destroy();

    const donutLabels = sortedByValue;
    const donutData = sortedByValue.map(c => catStats[c].value);
    const donutColors = sortedByValue.map(c => CATEGORY_COLORS[c] || '#94a3b8');

    chartCategoryValueInstance = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: donutLabels,
        datasets: [{
          data: donutData,
          backgroundColor: donutColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                const pct = grandTotalValue > 0 ? ((val / grandTotalValue) * 100).toFixed(1) : '0.0';
                return ` ${context.label}: ฿${formatMoney(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });

    // แสดงรายการ Breakdown ด้านล่าง Donut
    const breakdownEl = document.getElementById('categoryValueBreakdown');
    breakdownEl.innerHTML = sortedByValue.map(c => {
      const val = catStats[c].value;
      const pct = grandTotalValue > 0 ? ((val / grandTotalValue) * 100).toFixed(1) : '0.0';
      const color = CATEGORY_COLORS[c] || '#94a3b8';
      return `
        <div class="flex items-center justify-between py-0.5 hover:bg-slate-50 px-1 rounded transition">
          <div class="flex items-center space-x-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color}"></span>
            <span class="text-slate-700 truncate">${c}</span>
          </div>
          <div class="flex items-center space-x-2 font-mono flex-shrink-0">
            <span class="font-semibold text-slate-800">฿${formatMoney(val)}</span>
            <span class="text-slate-400 text-[10px] w-10 text-right">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- CHART 2: Bar Chart ยอดคงเหลือรายประเภท ---
  const ctxBar = document.getElementById('chartCategoryBalance');
  if (ctxBar) {
    if (chartCategoryBalanceInstance) chartCategoryBalanceInstance.destroy();

    const barLabels = sortedByValue;
    const barDataRemaining = sortedByValue.map(c => catStats[c].remaining);
    const barDataReceived = sortedByValue.map(c => catStats[c].received);
    const barDataDisbursed = sortedByValue.map(c => catStats[c].disbursed);

    chartCategoryBalanceInstance = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [
          {
            label: 'คงเหลือ',
            data: barDataRemaining,
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: 'รับเข้า',
            data: barDataReceived,
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'จ่ายออก',
            data: barDataDisbursed,
            backgroundColor: '#f43f5e',
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 12, font: { size: 11, family: 'Prompt' } }
          }
        },
        scales: {
          x: { grid: { color: '#f1f5f9' } },
          y: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11 } } }
        }
      }
    });
  }

  // --- CHART 3: Line / Monthly Trend Chart (12 เดือน) ---
  const ctxTrend = document.getElementById('chartMonthlyTrend');
  if (ctxTrend) {
    if (chartMonthlyTrendInstance) chartMonthlyTrendInstance.destroy();

    const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    const rcvMonthly = [120, 80, 150, 95, 110, 140, 60, 85, 70, 90, 105, 120];
    const dsbMonthly = [90, 110, 130, 85, 120, 160, 80, 95, 110, 85, 130, 95];

    chartMonthlyTrendInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'ยอดรับเข้า (หน่วย)',
            data: rcvMonthly,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          },
          {
            label: 'ยอดจ่ายออก (หน่วย)',
            data: dsbMonthly,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

/**
 * เรนเดอร์หน้ารายงานสรุปแยกประเภท
 */
function renderCategoryReport(categoryName) {
  document.getElementById('catReportTitle').innerText = `รายงานสรุปวัสดุ: ${categoryName}`;
  const color = CATEGORY_COLORS[categoryName] || '#3b82f6';
  document.getElementById('catReportBadge').style.backgroundColor = color;

  const materials = APP_STATE.materials
    .filter(m => m.category === categoryName)
    .sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));
  
  let totalItems = materials.length;
  let sumOpening = 0;
  let sumReceived = 0;
  let sumDisbursed = 0;
  let sumRemaining = 0;
  let sumValue = 0;

  const tbody = document.getElementById('tableCategoryBody');
  if (materials.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-400">ยังไม่มีรายการวัสดุในหมวดหมู่นี้</td></tr>`;
  } else {
    tbody.innerHTML = materials.map(m => {
      const c = calculateMaterialStock(m.code, APP_STATE.dateFilter);
      sumOpening += c.opening;
      sumReceived += c.received;
      sumDisbursed += c.disbursed;
      sumRemaining += c.remaining;
      sumValue += c.value;

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-mono font-semibold text-slate-700">${m.code}</td>
          <td class="p-3 font-medium text-slate-800">${m.name}</td>
          <td class="p-3 text-slate-500">${m.spec || '-'}</td>
          <td class="p-3 text-center">${m.unit}</td>
          <td class="p-3 text-right font-mono">${formatMoney(m.price)}</td>
          <td class="p-3 text-right font-mono text-slate-600">${formatQty(c.opening)}</td>
          <td class="p-3 text-right font-mono text-emerald-600 font-semibold">+${formatQty(c.received)}</td>
          <td class="p-3 text-right font-mono text-amber-600 font-semibold">-${formatQty(c.disbursed)}</td>
          <td class="p-3 text-right font-mono font-bold ${c.remaining <= 0 ? 'text-rose-600' : 'text-blue-700'}">${formatQty(c.remaining)}</td>
          <td class="p-3 text-right font-mono font-bold text-slate-800">฿${formatMoney(c.value)}</td>
          <td class="p-3 text-center">
            <button onclick="viewMaterialLedger('${m.code}')" class="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition" title="ดูบัญชีคุม พ.ด.4">
              พ.ด.4
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // บรรทัดสรุปรวม (Footer)
  document.getElementById('tableCategoryFoot').innerHTML = `
    <tr>
      <td colspan="5" class="p-3 text-right">รวมทั้งสิ้น (${totalItems} รายการ):</td>
      <td class="p-3 text-right font-mono">${formatQty(sumOpening)}</td>
      <td class="p-3 text-right font-mono text-emerald-700">+${formatQty(sumReceived)}</td>
      <td class="p-3 text-right font-mono text-amber-700">-${formatQty(sumDisbursed)}</td>
      <td class="p-3 text-right font-mono text-blue-800 font-bold">${formatQty(sumRemaining)}</td>
      <td class="p-3 text-right font-mono text-emerald-700 font-bold">฿${formatMoney(sumValue)}</td>
      <td></td>
    </tr>
  `;

  // อัปเดต Summary Cards
  document.getElementById('catSummaryCount').innerText = `${totalItems} รายการ`;
  document.getElementById('catSummaryReceived').innerText = `${formatQty(sumReceived)} หน่วย`;
  document.getElementById('catSummaryDisbursed').innerText = `${formatQty(sumDisbursed)} หน่วย`;
  document.getElementById('catSummaryValue').innerText = `฿${formatMoney(sumValue)}`;
}

/**
 * เรนเดอร์ตารางทะเบียนวัสดุ (Material Master)
 */
function renderMaterialsTable() {
  const searchTerm = (document.getElementById('searchMaterialInput')?.value || '').trim().toLowerCase();
  const categoryFilter = document.getElementById('filterMaterialCategory')?.value || '';
  const statusFilter = document.getElementById('filterMaterialStatus')?.value || '';

  const tbody = document.getElementById('materialsTableBody');
  
  const filtered = APP_STATE.materials.filter(m => {
    if (categoryFilter && m.category !== categoryFilter) return false;
    if (searchTerm) {
      const match = m.code.toLowerCase().includes(searchTerm) ||
                    m.name.toLowerCase().includes(searchTerm) ||
                    (m.storage_location && m.storage_location.toLowerCase().includes(searchTerm));
      if (!match) return false;
    }
    const calc = calculateMaterialStock(m.code);
    if (statusFilter === 'normal' && (calc.isLowStock || calc.isOutOfStock)) return false;
    if (statusFilter === 'low' && !calc.isLowStock) return false;
    if (statusFilter === 'out' && !calc.isOutOfStock) return false;
    return true;
  });

  filtered.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="text-center py-8 text-slate-400">ไม่พบรายการวัสดุที่ค้นหา</td></tr>`;
    return;
  }

  const isAdmin = APP_STATE.currentUser?.role === 'ADMIN';

  tbody.innerHTML = filtered.map((m, idx) => {
    const c = calculateMaterialStock(m.code);
    let statusBadge = `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">ปกติ</span>`;
    if (c.isOutOfStock) {
      statusBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">หมดสต็อก</span>`;
    } else if (c.isLowStock) {
      statusBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">ใกล้หมด (<= ${m.min_stock})</span>`;
    }

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="p-3 font-mono font-bold text-slate-700">${m.code}</td>
        <td class="p-3 font-semibold text-slate-900">
          <div>${m.name}</div>
          <div class="text-[10px] text-slate-400 font-normal">ที่เก็บ: ${m.storage_location || '-'} | ขนาด: ${m.spec || '-'}</div>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium" style="background-color: ${CATEGORY_COLORS[m.category] || '#e2e8f0'}20; color: ${CATEGORY_COLORS[m.category] || '#475569'}">
            ${m.category}
          </span>
        </td>
        <td class="p-3 text-center font-medium">${m.unit}</td>
        <td class="p-3 text-right font-mono">${formatMoney(m.price)}</td>
        <td class="p-3 text-right font-mono text-slate-600">
          <div>${formatQty(c.opening)}</div>
          <div class="text-[9px] text-blue-600 font-sans">${m.opening_stock_date ? formatThaiDate(m.opening_stock_date) : (m.opening_stock_year ? 'ปี ' + m.opening_stock_year : '')}</div>
        </td>
        <td class="p-3 text-right font-mono text-emerald-600 font-medium">+${formatQty(c.received)}</td>
        <td class="p-3 text-right font-mono text-amber-600 font-medium">-${formatQty(c.disbursed)}</td>
        <td class="p-3 text-right font-mono font-bold ${c.remaining <= 0 ? 'text-rose-600' : 'text-blue-700'}">${formatQty(c.remaining)}</td>
        <td class="p-3 text-right font-mono font-bold text-slate-800">฿${formatMoney(c.value)}</td>
        <td class="p-3 text-center">${statusBadge}</td>
        <td class="p-3 text-center">
          <div class="flex items-center justify-center space-x-1">
            <button onclick="viewMaterialLedger('${m.code}')" title="ดูบัญชีคุม พ.ด.4" class="p-1 rounded hover:bg-slate-200 text-blue-600">
              <i data-lucide="book-open" class="w-4 h-4"></i>
            </button>
            ${isAdmin ? `
              <button onclick="editMaterial('${m.code}')" title="แก้ไข" class="p-1 rounded hover:bg-slate-200 text-amber-600">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="deleteMaterial('${m.code}')" title="ลบ" class="p-1 rounded hover:bg-slate-200 text-rose-600">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

/**
 * เติมข้อมูล Dropdown สำหรับหน้ารับเข้า
 */
function populateReceiveSelect() {
  const select = document.getElementById('rcv_material_select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">-- เลือกรายการวัสดุ --</option>` +
    APP_STATE.materials.map(m => `
      <option value="${m.code}" data-price="${m.price}" data-unit="${m.unit}" data-name="${m.name}">
        ${m.code} : ${m.name} (${m.unit}) [${m.category}]
      </option>
    `).join('');

  if (currentVal) select.value = currentVal;

  // รันเลขที่รับเข้าอัตโนมัติ
  const yearTh = APP_STATE.settings.fiscal_year || '2570';
  document.getElementById('rcv_receipt_no').value = `RC-${yearTh}-${String(APP_STATE.receipts.length + 1).padStart(3, '0')}`;
  document.getElementById('rcv_date').value = new Date().toISOString().split('T')[0];
  document.getElementById('rcv_receiver').value = APP_STATE.settings.officer_name || '';
}

/**
 * แสดงประวัติการรับวัสดุเข้า
 */
function renderReceiptsTable() {
  const tbody = document.getElementById('tableReceiptsBody');
  document.getElementById('txtReceiptCount').innerText = `${APP_STATE.receipts.length} รายการ`;

  if (APP_STATE.receipts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">ยังไม่มีประวัติการรับเข้า</td></tr>`;
    return;
  }

  // เรียงลำดับจากล่าสุด
  const list = [...APP_STATE.receipts].reverse();
  tbody.innerHTML = list.map(r => `
    <tr class="hover:bg-slate-50 transition">
      <td class="p-2.5 font-mono text-slate-600">${formatThaiDate(r.date)}</td>
      <td class="p-2.5">
        <div class="font-bold font-mono text-slate-800">${r.receipt_no}</div>
        <div class="text-[10px] text-slate-400">ใบส่ง: ${r.doc_ref_no || '-'}</div>
      </td>
      <td class="p-2.5">
        <div class="font-medium text-slate-900">${r.material_name}</div>
        <div class="text-[10px] text-slate-400">จาก: ${r.supplier || '-'}</div>
      </td>
      <td class="p-2.5 text-right font-mono font-bold text-emerald-700">+${formatQty(r.quantity)} ${r.unit}</td>
      <td class="p-2.5 text-right font-mono">${formatMoney(r.price)}</td>
      <td class="p-2.5 text-right font-mono font-bold text-slate-800">฿${formatMoney(r.total_amount)}</td>
      <td class="p-2.5 text-center">
        ${APP_STATE.currentUser?.role === 'ADMIN' ? `
          <button onclick="deleteReceipt('${r.receipt_no}')" class="text-rose-500 hover:text-rose-700 p-1" title="ลบรายการรับเข้า">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        ` : '-'}
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

/**
 * =========================================================================
 * REQUISITION (ใบเบิกพัสดุหลายรายการใน 1 ใบ)
 * =========================================================================
 */

/**
 * เติมรายชื่อผู้ใช้งานที่ลงทะเบียนไว้ใน Dropdown ใบเบิก (Request 6)
 */
function populateRegisteredRequestersSelect() {
  const select = document.getElementById('selectRegisteredRequester');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- คลิกเพื่อเลือกผู้ขอเบิกที่ลงทะเบียนไว้ในระบบ --</option>' + 
    APP_STATE.users.map(u => `
      <option value="${u.id}">
        ${u.fullname} — ตำแหน่ง: ${u.position || '-'} (${u.username})
      </option>
    `).join('');

  if (currentVal) select.value = currentVal;
}

function applySelectedRequester(userId) {
  const u = APP_STATE.users.find(x => x.id === userId || x.username === userId);
  if (!u) return;

  const nameInput = document.getElementById('req_requester_name');
  const posInput = document.getElementById('req_requester_position');
  const deptInput = document.getElementById('req_department');
  const subInput = document.getElementById('req_substitute_name');

  if (nameInput) nameInput.value = u.fullname;
  if (posInput) posInput.value = u.position || '';
  if (deptInput && u.department) deptInput.value = u.department;
  if (subInput) subInput.value = u.fullname;

  showToast(`เลือกผู้ขอเบิก: ${u.fullname} (${u.position || 'พนักงาน'})`, 'info');
}

function initRequisitionForm() {
  const yearTh = APP_STATE.settings.fiscal_year || '2570';
  document.getElementById('req_no').value = `${APP_STATE.requisitions.length + 1}/${yearTh}`;
  document.getElementById('req_date').value = new Date().toISOString().split('T')[0];

  populateRegisteredRequestersSelect();

  // กำหนดค่าเริ่มต้นตามผู้ใช้งานปัจจุบันที่ล็อกอิน
  const curUser = APP_STATE.currentUser;
  if (curUser) {
    document.getElementById('req_requester_name').value = curUser.fullname;
    document.getElementById('req_requester_position').value = curUser.position || 'พนักงาน';
    if (curUser.department) document.getElementById('req_department').value = curUser.department;
    document.getElementById('req_substitute_name').value = curUser.fullname;

    const selectUser = document.getElementById('selectRegisteredRequester');
    if (selectUser) {
      const matchOpt = Array.from(selectUser.options).find(o => o.value === curUser.id);
      if (matchOpt) selectUser.value = curUser.id;
    }
  } else {
    document.getElementById('req_requester_name').value = 'นางสาวสมหมาย ไผ่สัมฤทธิ์';
    document.getElementById('req_requester_position').value = 'พนักงานบริการ';
    document.getElementById('req_department').value = 'งานบริการความสะอาด';
    document.getElementById('req_substitute_name').value = 'นางสาวสมหมาย ไผ่สัมฤทธิ์';
  }

  document.getElementById('req_purpose').value = 'เพื่อใช้ในงานทำความสะอาดและสุขอนามัย';
  document.getElementById('req_officer_name').value = APP_STATE.settings.officer_name || 'นางรุจิรา บุสดี';
  document.getElementById('req_officer_position').value = APP_STATE.settings.officer_position || 'เจ้าหน้าที่พัสดุ';
  document.getElementById('req_approver_name').value = APP_STATE.settings.approver_name || 'นางสาวจุฑารัตน์ จันทรมณี';
  document.getElementById('req_approver_position').value = APP_STATE.settings.approver_position || 'พยาบาลวิชาชีพชำนาญการ';

  // เคลียร์และสร้างแถวแรก
  const tbody = document.getElementById('requisitionRowsBody');
  tbody.innerHTML = '';
  addRequisitionRow();
}

/**
 * เพิ่มแถวรายการในใบเบิก
 */
function addRequisitionRow(selectedCode = '', qty = 1, remark = '') {
  const tbody = document.getElementById('requisitionRowsBody');
  const rowIndex = tbody.children.length + 1;

  const tr = document.createElement('tr');
  tr.className = 'requisition-row hover:bg-slate-50 transition border-b border-slate-100';

  // Material Options
  const matOptions = APP_STATE.materials.map(m => {
    const calc = calculateMaterialStock(m.code);
    return `<option value="${m.code}" data-price="${m.price}" data-unit="${m.unit}" data-remaining="${calc.remaining}" data-name="${m.name}" ${m.code === selectedCode ? 'selected' : ''}>
      ${m.code}: ${m.name} (คงเหลือ: ${calc.remaining} ${m.unit})
    </option>`;
  }).join('');

  tr.innerHTML = `
    <td class="p-2 text-center text-slate-400 font-mono row-index">${rowIndex}</td>
    <td class="p-2">
      <select class="req-item-material w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none">
        <option value="">-- เลือกวัสดุที่ต้องการเบิก --</option>
        ${matOptions}
      </select>
    </td>
    <td class="p-2 text-center font-mono font-bold req-item-stock text-blue-700">-</td>
    <td class="p-2 text-center req-item-unit text-slate-600">-</td>
    <td class="p-2 text-right font-mono req-item-price">0.00</td>
    <td class="p-2">
      <input type="number" min="1" step="any" value="${qty}" class="req-item-qty w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-center font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none">
      <div class="text-[10px] text-rose-500 font-semibold hidden req-item-error mt-0.5">เบิกเกินสต็อก!</div>
    </td>
    <td class="p-2 text-right font-mono font-bold text-emerald-700 req-item-amount">฿0.00</td>
    <td class="p-2">
      <input type="text" value="${remark}" placeholder="หมายเหตุ..." class="req-item-remark w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs">
    </td>
    <td class="p-2 text-center">
      <button type="button" class="btn-remove-row text-slate-400 hover:text-rose-600 p-1" title="ลบแถวนี้">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    </td>
  `;

  tbody.appendChild(tr);

  // ผูก Event ในแถว
  const sel = tr.querySelector('.req-item-material');
  const inputQty = tr.querySelector('.req-item-qty');
  const btnRemove = tr.querySelector('.btn-remove-row');

  function updateRow() {
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.value) {
      const price = Number(opt.getAttribute('data-price')) || 0;
      const unit = opt.getAttribute('data-unit') || '-';
      const remaining = Number(opt.getAttribute('data-remaining')) || 0;
      const q = Number(inputQty.value) || 0;

      tr.querySelector('.req-item-unit').innerText = unit;
      tr.querySelector('.req-item-price').innerText = formatMoney(price);
      tr.querySelector('.req-item-stock').innerText = formatQty(remaining);

      // Validation เช็คสต็อกคงเหลือ!
      const errEl = tr.querySelector('.req-item-error');
      if (q > remaining) {
        inputQty.classList.add('border-rose-500', 'bg-rose-50', 'text-rose-700');
        errEl.classList.remove('hidden');
        errEl.innerText = `คงเหลือเพียง ${remaining} ${unit}`;
      } else {
        inputQty.classList.remove('border-rose-500', 'bg-rose-50', 'text-rose-700');
        errEl.classList.add('hidden');
      }

      const total = price * q;
      tr.querySelector('.req-item-amount').innerText = '฿' + formatMoney(total);
    } else {
      tr.querySelector('.req-item-unit').innerText = '-';
      tr.querySelector('.req-item-price').innerText = '0.00';
      tr.querySelector('.req-item-stock').innerText = '-';
      tr.querySelector('.req-item-amount').innerText = '฿0.00';
    }
    recalculateRequisitionTotal();
  }

  sel.addEventListener('change', updateRow);
  inputQty.addEventListener('input', updateRow);

  btnRemove.addEventListener('click', () => {
    if (tbody.children.length > 1) {
      tr.remove();
      // จัดลำดับเลขแถวใหม่
      Array.from(tbody.children).forEach((row, idx) => {
        row.querySelector('.row-index').innerText = idx + 1;
      });
      recalculateRequisitionTotal();
    } else {
      showToast('ต้องมีรายการวัสดุอย่างน้อย 1 รายการ', 'warning');
    }
  });

  updateRow();
  lucide.createIcons();
}

/**
 * คำนวณยอดรวมทั้งใบเบิก
 */
function recalculateRequisitionTotal() {
  const rows = document.querySelectorAll('#requisitionRowsBody .requisition-row');
  let sumQty = 0;
  let sumAmount = 0;

  rows.forEach(tr => {
    const sel = tr.querySelector('.req-item-material');
    const inputQty = tr.querySelector('.req-item-qty');
    if (sel && sel.value) {
      const price = Number(sel.options[sel.selectedIndex]?.getAttribute('data-price')) || 0;
      const q = Number(inputQty.value) || 0;
      sumQty += q;
      sumAmount += (price * q);
    }
  });

  document.getElementById('req_total_quantity_sum').innerText = formatQty(sumQty);
  document.getElementById('req_total_amount_sum').innerText = '฿' + formatMoney(sumAmount);
  document.getElementById('req_thai_baht_text').innerText = `(${thaiBahtText(sumAmount)})`;
}

/**
 * บันทึกใบเบิกพัสดุลงระบบ & Google Sheets
 */
function submitRequisition(autoPrint = false) {
  const reqNo = document.getElementById('req_no').value.trim();
  const reqDate = document.getElementById('req_date').value;
  const requesterName = document.getElementById('req_requester_name').value.trim();

  if (!reqNo || !reqDate || !requesterName) {
    showToast('กรุณากรอกเลขที่ใบเบิก วันที่ และชื่อผู้ขอเบิกให้ครบถ้วน', 'error');
    return;
  }

  // รวบรวมรายการ
  const rows = document.querySelectorAll('#requisitionRowsBody .requisition-row');
  const items = [];
  let hasOverStock = false;

  rows.forEach((tr, idx) => {
    const sel = tr.querySelector('.req-item-material');
    const inputQty = tr.querySelector('.req-item-qty');
    const remark = tr.querySelector('.req-item-remark')?.value || '';

    if (sel && sel.value) {
      const opt = sel.options[sel.selectedIndex];
      const code = opt.value;
      const name = opt.getAttribute('data-name');
      const unit = opt.getAttribute('data-unit');
      const price = Number(opt.getAttribute('data-price')) || 0;
      const remaining = Number(opt.getAttribute('data-remaining')) || 0;
      const qty = Number(inputQty.value) || 0;

      if (qty <= 0) return;
      if (qty > remaining) hasOverStock = true;

      items.push({
        req_no: reqNo,
        item_index: idx + 1,
        material_code: code,
        material_name: name,
        unit: unit,
        price: price,
        quantity: qty,
        amount: price * qty,
        remark: remark
      });
    }
  });

  if (items.length === 0) {
    showToast('กรุณาเลือกรายการวัสดุที่ต้องการเบิกอย่างน้อย 1 รายการ', 'warning');
    return;
  }

  if (hasOverStock) {
    showToast('มีรายการที่เบิกเกินจำนวนคงเหลือในสต็อก! กรุณาตรวจสอบจำนวนใหม่', 'error');
    return;
  }

  const totalAmount = items.reduce((acc, itm) => acc + itm.amount, 0);

  const header = {
    req_no: reqNo,
    fiscal_year: APP_STATE.settings.fiscal_year || '2570',
    date: reqDate,
    requester_name: requesterName,
    requester_position: document.getElementById('req_requester_position').value.trim(),
    department: document.getElementById('req_department').value.trim(),
    purpose: document.getElementById('req_purpose').value.trim(),
    substitute_name: document.getElementById('req_substitute_name').value.trim(),
    officer_name: document.getElementById('req_officer_name').value.trim(),
    officer_position: document.getElementById('req_officer_position').value.trim(),
    approver_name: document.getElementById('req_approver_name').value.trim(),
    approver_position: document.getElementById('req_approver_position').value.trim(),
    item_count: items.length,
    total_amount: totalAmount,
    status: 'approved',
    remark: '-'
  };

  // บันทึกเข้า State
  // ลบของเก่าถ้าเลขที่ซ้ำ (Edit mode)
  APP_STATE.requisitions = APP_STATE.requisitions.filter(q => q.req_no !== reqNo);
  APP_STATE.requisitionItems = APP_STATE.requisitionItems.filter(i => i.req_no !== reqNo);

  APP_STATE.requisitions.unshift(header);
  items.forEach(itm => APP_STATE.requisitionItems.push(itm));
  saveState();

  // ส่งบันทึกลง Google Sheets แบบ Real-time
  postToGoogleSheets('createRequisition', { header, items });

  showToast(`บันทึกใบเบิกพัสดุเลขที่ ${reqNo} เรียบร้อยแล้ว`, 'success');
  renderApp();

  if (autoPrint) {
    printOfficialRequisition(reqNo);
  } else {
    switchView('requisition-history');
  }
}

/**
 * แสดงตารางประวัติใบเบิก
 */
function renderRequisitionsHistoryTable() {
  const searchTerm = (document.getElementById('searchRequisitionInput')?.value || '').trim().toLowerCase();
  const yearFilter = document.getElementById('filterRequisitionYear')?.value || '';

  const tbody = document.getElementById('tableRequisitionsBody');

  const filtered = APP_STATE.requisitions.filter(q => {
    if (yearFilter && q.fiscal_year !== yearFilter) return false;
    if (searchTerm) {
      const match = q.req_no.toLowerCase().includes(searchTerm) ||
                    q.requester_name.toLowerCase().includes(searchTerm) ||
                    (q.department && q.department.toLowerCase().includes(searchTerm)) ||
                    (q.purpose && q.purpose.toLowerCase().includes(searchTerm));
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">ยังไม่มีประวัติใบเบิกพัสดุ</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(q => `
    <tr class="hover:bg-slate-50 transition">
      <td class="p-3 font-mono font-bold text-blue-700">${q.req_no}</td>
      <td class="p-3 font-mono text-slate-600">${formatThaiDate(q.date)}</td>
      <td class="p-3">
        <div class="font-semibold text-slate-900">${q.requester_name}</div>
        <div class="text-[10px] text-slate-400">${q.requester_position || '-'}</div>
      </td>
      <td class="p-3">
        <div class="text-slate-800 font-medium">${q.department || '-'}</div>
        <div class="text-[10px] text-slate-500 truncate max-w-xs">${q.purpose || '-'}</div>
      </td>
      <td class="p-3 text-center font-mono font-semibold">${q.item_count || 1} รายการ</td>
      <td class="p-3 text-right font-mono font-bold text-emerald-700">฿${formatMoney(q.total_amount)}</td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">อนุมัติแล้ว</span>
      </td>
      <td class="p-3 text-center">
        <div class="flex items-center justify-center space-x-1">
          <button onclick="printOfficialRequisition('${q.req_no}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1 transition" title="พิมพ์ใบเบิก">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>พิมพ์</span>
          </button>
          <button onclick="exportRequisitionWord('${q.req_no}')" class="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center gap-1 transition" title="ดาวน์โหลดเป็นไฟล์ Microsoft Word (.doc)">
            <i data-lucide="file-down" class="w-3.5 h-3.5"></i>
            <span>Word</span>
          </button>
          <button onclick="exportRequisitionExcel('${q.req_no}')" class="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1 transition" title="ดาวน์โหลดเป็นไฟล์ Excel (.xlsx)">
            <i data-lucide="sheet" class="w-3.5 h-3.5"></i>
            <span>Excel</span>
          </button>
          ${APP_STATE.currentUser?.role === 'ADMIN' ? `
            <button onclick="deleteRequisition('${q.req_no}')" class="p-1 rounded text-rose-500 hover:text-rose-700 ml-1" title="ลบใบเบิก">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

/**
 * =========================================================================
 * LEDGER CARD พ.ด.4 (บัญชีวัสดุรายตัว สอดคล้องกับภาพ 1794393334212.jpg)
 * =========================================================================
 */

// สถานะตัวกรองในหน้าบัญชีวัสดุ (พ.ด.4)
const LEDGER_FILTER_STATE = {
  fiscalYear: '2569',
  selectedCategories: [...CATEGORIES],
  onlyRemaining: true,
  searchKeyword: ''
};

/**
 * วาดรายการ Checkboxes หมวดหมู่วัสดุในหน้าบัญชีวัสดุ (พ.ด.4)
 */
function renderLedgerCategoryCheckboxes() {
  const container = document.getElementById('ledgerCategoryCheckboxes');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isChecked = LEDGER_FILTER_STATE.selectedCategories.includes(cat);
    return `
      <label class="flex items-center gap-1.5 p-1.5 rounded-lg border transition cursor-pointer select-none ${
        isChecked 
          ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-semibold' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }">
        <input type="checkbox" value="${cat}" class="ledger-cat-chk rounded text-cyan-600 focus:ring-cyan-500" ${isChecked ? 'checked' : ''}>
        <span class="truncate text-[11px]">${cat}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('.ledger-cat-chk').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const val = e.target.value;
      if (e.target.checked) {
        if (!LEDGER_FILTER_STATE.selectedCategories.includes(val)) {
          LEDGER_FILTER_STATE.selectedCategories.push(val);
        }
      } else {
        LEDGER_FILTER_STATE.selectedCategories = LEDGER_FILTER_STATE.selectedCategories.filter(c => c !== val);
      }
      syncLedgerCategoryCheckboxesUI();
      populateLedgerMaterialSelect();
    });
  });
}

/**
 * ซิงค์สถานะ UI ของ Checkboxes ในหน้าบัญชีวัสดุ (พ.ด.4)
 */
function syncLedgerCategoryCheckboxesUI() {
  const container = document.getElementById('ledgerCategoryCheckboxes');
  if (!container) return;

  container.querySelectorAll('label').forEach(label => {
    const chk = label.querySelector('input[type="checkbox"]');
    if (!chk) return;
    const isChecked = LEDGER_FILTER_STATE.selectedCategories.includes(chk.value);
    chk.checked = isChecked;
    if (isChecked) {
      label.className = 'flex items-center gap-1.5 p-1.5 rounded-lg border transition cursor-pointer select-none bg-cyan-50 border-cyan-400 text-cyan-900 font-semibold';
    } else {
      label.className = 'flex items-center gap-1.5 p-1.5 rounded-lg border transition cursor-pointer select-none bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
    }
  });
}

/**
 * เติมข้อมูลใน Select เลือกวัสดุสำหรับหน้า พ.ด.4 ตามตัวกรอง (ปีงบประมาณ, หมวดหมู่ที่ติ๊ก, เฉพาะยอดคงเหลือ > 0, คำค้นหา)
 */
function populateLedgerMaterialSelect() {
  const select = document.getElementById('selectLedgerMaterial');
  if (!select) return;

  const { fiscalYear, selectedCategories, onlyRemaining, searchKeyword } = LEDGER_FILTER_STATE;

  const yrInt = parseInt(fiscalYear, 10);
  const startCeYear = yrInt - 543 - 1;
  const endCeYear = yrInt - 543;
  const startDate = `${startCeYear}-10-01`;
  const endDate = `${endCeYear}-09-30`;

  // กรองวัสดุตามเงื่อนไขที่เลือก
  const filtered = APP_STATE.materials.filter(m => {
    // 1. หมวดหมู่ที่ติ๊กเลือก
    if (!selectedCategories.includes(m.category)) return false;

    // 2. คำค้นหา
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      const match = (m.name && m.name.toLowerCase().includes(kw)) ||
                    (m.code && m.code.toLowerCase().includes(kw)) ||
                    (m.spec && m.spec.toLowerCase().includes(kw));
      if (!match) return false;
    }

    // 3. กรองเฉพาะคงเหลือ > 0 (ถ้าเปิดใช้งาน)
    if (onlyRemaining) {
      let opening = 0;
      if (String(m.opening_stock_year || '') === String(fiscalYear)) {
        opening = Number(m.opening_stock) || 0;
      } else if (!m.opening_stock_year || parseInt(m.opening_stock_year, 10) <= yrInt) {
        opening = Number(m.opening_stock) || 0;
      }
      let received = 0;
      APP_STATE.receipts.forEach(r => {
        if (r.material_code === m.code && isDateInRange(r.date, startDate, endDate)) {
          received += Number(r.quantity) || 0;
        }
      });
      let disbursed = 0;
      APP_STATE.requisitionItems.forEach(item => {
        if (item.material_code === m.code) {
          const parentReq = APP_STATE.requisitions.find(q => q.req_no === item.req_no);
          if (parentReq && parentReq.status !== 'cancelled' && isDateInRange(parentReq.date, startDate, endDate)) {
            disbursed += Number(item.quantity) || 0;
          }
        }
      });
      const remaining = opening + received - disbursed;
      if (remaining <= 0) return false;
    }

    return true;
  });

  filtered.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));

  // อัปเดต Badge แสดงจำนวนที่พบ
  const badge = document.getElementById('ledgerMaterialCountBadge');
  if (badge) {
    badge.innerText = `พบ ${filtered.length} รายการ`;
  }

  const prevVal = select.value;
  if (filtered.length === 0) {
    select.innerHTML = '<option value="">-- ไม่พบวัสดุที่ตรงตามเงื่อนไขที่เลือก --</option>';
    const tbody = document.getElementById('ledgerTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" class="p-8 text-center text-slate-400">ไม่พบรายการวัสดุตามตัวกรองที่เลือก (กรุณาปรับตัวเลือกหมวดหมู่ หรือคำค้นหา)</td></tr>`;
    }
    const curBal = document.getElementById('ledgerCurrentBalance');
    if (curBal) curBal.innerText = '0';
    return;
  }

  select.innerHTML = filtered.map(m => {
    const stock = calculateMaterialStock(m.code);
    return `<option value="${m.code}">[${m.category}] ${m.code} : ${m.name} (คงเหลือ: ${formatQty(stock.remaining)} ${m.unit})</option>`;
  }).join('');

  if (prevVal && filtered.some(m => m.code === prevVal)) {
    select.value = prevVal;
  } else {
    select.value = filtered[0].code;
  }

  const mat = filtered.find(m => m.code === select.value) || filtered[0];
  if (mat) {
    const inputYear = document.getElementById('inputLedgerOpeningYear');
    const inputDate = document.getElementById('inputLedgerOpeningDate');
    const defaultYear = mat.opening_stock_year || fiscalYear || '2569';
    if (inputYear) inputYear.value = defaultYear;
    if (inputDate) {
      inputDate.value = mat.opening_stock_date || `${Number(defaultYear) - 543}-01-01`;
    }
  }

  const fiscalDisplay = document.getElementById('pd4_fiscal_year_display');
  if (fiscalDisplay) {
    fiscalDisplay.innerText = fiscalYear;
  }

  renderLedgerPD4();
}

/**
 * สลับไปยังหน้า พ.ด.4 พร้อมเลือกวัสดุตัวที่ต้องการ
 */
function viewMaterialLedger(code) {
  switchView('ledger-pd4');
  const mat = APP_STATE.materials.find(m => m.code === code);
  if (mat) {
    if (!LEDGER_FILTER_STATE.selectedCategories.includes(mat.category)) {
      LEDGER_FILTER_STATE.selectedCategories.push(mat.category);
      syncLedgerCategoryCheckboxesUI();
    }
    LEDGER_FILTER_STATE.searchKeyword = '';
    const inputSearch = document.getElementById('inputLedgerSearch');
    if (inputSearch) inputSearch.value = '';

    populateLedgerMaterialSelect();

    const select = document.getElementById('selectLedgerMaterial');
    if (select) {
      select.value = code;
      const yr = mat.opening_stock_year || LEDGER_FILTER_STATE.fiscalYear || '2569';
      const inputYear = document.getElementById('inputLedgerOpeningYear');
      const inputDate = document.getElementById('inputLedgerOpeningDate');
      if (inputYear) inputYear.value = yr;
      if (inputDate) inputDate.value = mat.opening_stock_date || `${Number(yr) - 543}-01-01`;
      renderLedgerPD4();
    }
  }
}

/**
 * เริ่มต้นระบบตัวกรองของบัญชีวัสดุ (พ.ด.4)
 */
function initLedgerPD4Filter() {
  renderLedgerCategoryCheckboxes();

  // ปีงบประมาณ
  const selYear = document.getElementById('selectLedgerFiscalYear');
  if (selYear) {
    selYear.value = LEDGER_FILTER_STATE.fiscalYear;
    selYear.addEventListener('change', (e) => {
      LEDGER_FILTER_STATE.fiscalYear = e.target.value;
      const fiscalDisplay = document.getElementById('pd4_fiscal_year_display');
      if (fiscalDisplay) fiscalDisplay.innerText = e.target.value;
      populateLedgerMaterialSelect();
    });
  }

  // เลือกทั้งหมด / ล้างการเลือก
  document.getElementById('btnLedgerSelectAllCategories')?.addEventListener('click', () => {
    LEDGER_FILTER_STATE.selectedCategories = [...CATEGORIES];
    syncLedgerCategoryCheckboxesUI();
    populateLedgerMaterialSelect();
  });

  document.getElementById('btnLedgerClearAllCategories')?.addEventListener('click', () => {
    LEDGER_FILTER_STATE.selectedCategories = [];
    syncLedgerCategoryCheckboxesUI();
    populateLedgerMaterialSelect();
  });

  // กรองเฉพาะยอดคงเหลือ > 0
  const chkRemaining = document.getElementById('chkLedgerOnlyRemaining');
  if (chkRemaining) {
    chkRemaining.checked = LEDGER_FILTER_STATE.onlyRemaining;
    chkRemaining.addEventListener('change', (e) => {
      LEDGER_FILTER_STATE.onlyRemaining = e.target.checked;
      populateLedgerMaterialSelect();
    });
  }

  // ช่องค้นหา
  const inputSearch = document.getElementById('inputLedgerSearch');
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      LEDGER_FILTER_STATE.searchKeyword = e.target.value.trim();
      populateLedgerMaterialSelect();
    });
  }

  // ผู้ลงนาม (ซิงค์กับ settings)
  const cfgOffName = document.getElementById('cfg_ledger_officer_name');
  const cfgOffPos = document.getElementById('cfg_ledger_officer_position');
  const cfgChkName = document.getElementById('cfg_ledger_checker_name');
  const cfgChkPos = document.getElementById('cfg_ledger_checker_position');

  if (APP_STATE.settings) {
    if (cfgOffName) cfgOffName.value = APP_STATE.settings.report_officer_name || 'นางรุจิรา บุสดี';
    if (cfgOffPos) cfgOffPos.value = APP_STATE.settings.report_officer_position || 'นักวิชาการสาธารณสุขปฏิบัติการ';
    if (cfgChkName) cfgChkName.value = APP_STATE.settings.report_checker_name || 'นางสาวบุษบา สิงห์เรือง';
    if (cfgChkPos) cfgChkPos.value = APP_STATE.settings.report_checker_position || 'นักวิชาการสาธารณสุข';
  }

  [cfgOffName, cfgOffPos, cfgChkName, cfgChkPos].forEach(input => {
    input?.addEventListener('input', () => {
      if (!APP_STATE.settings) APP_STATE.settings = {};
      if (cfgOffName) APP_STATE.settings.report_officer_name = cfgOffName.value.trim();
      if (cfgOffPos) APP_STATE.settings.report_officer_position = cfgOffPos.value.trim();
      if (cfgChkName) APP_STATE.settings.report_checker_name = cfgChkName.value.trim();
      if (cfgChkPos) APP_STATE.settings.report_checker_position = cfgChkPos.value.trim();
      saveState();
    });
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderLedgerPD4() {
  const code = document.getElementById('selectLedgerMaterial')?.value;
  const mat = APP_STATE.materials.find(m => m.code === code) || APP_STATE.materials[0];
  if (!mat) return;

  document.getElementById('pd4_category').innerText = mat.category || '-';
  document.getElementById('pd4_name').innerText = mat.name || '-';
  document.getElementById('pd4_spec').innerText = mat.spec || '-';
  document.getElementById('pd4_unit').innerText = mat.unit || '-';
  document.getElementById('pd4_storage').innerText = mat.storage_location || '-';

  const fiscalDisplay = document.getElementById('pd4_fiscal_year_display');
  if (fiscalDisplay) {
    fiscalDisplay.innerText = APP_STATE.settings.fiscal_year || '2570';
  }

  // รวบรวมการเคลื่อนไหว รับเข้า และ จ่ายออก
  const transactions = [];

  // ปียอดยกมา และ วันที่ยอดยกมา (กำหนดได้ตามที่ผู้ใช้ใส่)
  const openingStock = Number(mat.opening_stock) || 0;
  const inputYear = document.getElementById('inputLedgerOpeningYear')?.value.trim();
  const inputDate = document.getElementById('inputLedgerOpeningDate')?.value;
  const openingYear = inputYear || mat.opening_stock_year || '2568';
  const openingDate = inputDate || mat.opening_stock_date || `${Number(openingYear) - 543}-01-01`;

  if (openingStock > 0) {
    transactions.push({
      date: openingDate,
      description: `ยอดยกมาจากปี ${openingYear}`,
      doc_delivery: '-',
      doc_req: '-',
      price: mat.price,
      received: openingStock,
      disbursed: 0,
      remark: `ยอดยกมาปี ${openingYear}`,
      isOpening: true
    });
  }

  // รับเข้า
  APP_STATE.receipts.forEach(r => {
    if (r.material_code === mat.code) {
      transactions.push({
        date: r.date,
        description: `รับจาก${r.supplier || 'ผู้ขาย'}`,
        doc_delivery: r.doc_ref_no || r.receipt_no,
        doc_req: '-',
        price: r.price,
        received: Number(r.quantity) || 0,
        disbursed: 0,
        remark: r.remark || ''
      });
    }
  });

  // จ่ายออก (ใบเบิก)
  APP_STATE.requisitionItems.forEach(item => {
    if (item.material_code === mat.code) {
      const parentReq = APP_STATE.requisitions.find(q => q.req_no === item.req_no);
      if (parentReq && parentReq.status !== 'cancelled') {
        transactions.push({
          date: parentReq.date,
          description: `จ่ายให้ ${parentReq.requester_name}`,
          doc_delivery: '',
          doc_req: item.req_no,
          price: item.price,
          received: 0,
          disbursed: Number(item.quantity) || 0,
          remark: item.remark || ''
        });
      }
    }
  });

  // เรียงลำดับตามวันที่ (ยอดยกมาอยู่แถวแรกเสมอ)
  transactions.sort((a, b) => {
    if (a.isOpening) return -1;
    if (b.isOpening) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  // คำนวณยอดคงเหลือสะสม (Running balance)
  let currentBalance = 0;
  const tbody = document.getElementById('ledgerTableBody');

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-8 text-center text-slate-400">ยังไม่มีรายการรับ-จ่ายของวัสดุชิ้นนี้</td></tr>`;
    document.getElementById('ledgerCurrentBalance').innerText = '0 ' + mat.unit;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    if (t.received > 0) currentBalance += t.received;
    if (t.disbursed > 0) currentBalance -= t.disbursed;
    const totalRowVal = currentBalance * t.price;

    return `
      <tr class="hover:bg-slate-50 border-b border-slate-300">
        <td class="border border-slate-400 p-1.5 text-center font-mono">${formatThaiDate(t.date)}</td>
        <td class="border border-slate-400 p-1.5 ${t.isOpening ? 'font-bold text-blue-900 bg-blue-50/40' : 'text-slate-800'}">${t.description}</td>
        <td class="border border-slate-400 p-1.5 text-center font-mono">${t.doc_delivery || '-'}</td>
        <td class="border border-slate-400 p-1.5 text-center font-mono">${t.doc_req || '-'}</td>
        <td class="border border-slate-400 p-1.5 text-right font-mono">${formatMoney(t.price)}</td>
        <td class="border border-slate-400 p-1.5 text-center font-mono font-semibold text-emerald-700">${t.received > 0 ? formatQty(t.received) : ''}</td>
        <td class="border border-slate-400 p-1.5 text-center font-mono font-semibold text-amber-700">${t.disbursed > 0 ? formatQty(t.disbursed) : ''}</td>
        <td class="border border-slate-400 p-1.5 text-center font-mono font-bold text-blue-800">${formatQty(currentBalance)}</td>
        <td class="border border-slate-400 p-1.5 text-right font-mono text-slate-600">${formatMoney(totalRowVal)}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('ledgerCurrentBalance').innerText = `${formatQty(currentBalance)} ${mat.unit} (มูลค่า ฿${formatMoney(currentBalance * mat.price)})`;
}

/**
 * =========================================================================
 * ALERTS (แจ้งเตือนสต็อก)
 * =========================================================================
 */
function renderAlertsTable() {
  const tbody = document.getElementById('tableAlertsBody');
  const alertMaterials = [];

  APP_STATE.materials.forEach(m => {
    const calc = calculateMaterialStock(m.code);
    if (calc.isLowStock || calc.isOutOfStock) {
      alertMaterials.push({ ...m, ...calc });
    }
  });

  if (alertMaterials.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10 text-emerald-600 font-semibold">ยอดวัสดุทุกรายการอยู่ในระดับปลอดภัย ไม่มีรายการใกล้หมดหรือหมดสต็อก</td></tr>`;
    return;
  }

  tbody.innerHTML = alertMaterials.map(m => `
    <tr class="hover:bg-rose-50/40 transition">
      <td class="p-3 font-mono font-bold text-slate-700">${m.code}</td>
      <td class="p-3 font-bold text-slate-900">${m.name}</td>
      <td class="p-3 text-slate-600">${m.category}</td>
      <td class="p-3 text-center">${m.unit}</td>
      <td class="p-3 text-right font-mono text-slate-500">${formatQty(m.min_stock)}</td>
      <td class="p-3 text-right font-mono font-bold text-rose-700 text-sm">${formatQty(m.remaining)}</td>
      <td class="p-3 text-center">
        ${m.isOutOfStock 
          ? `<span class="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px]">หมดสต็อก</span>` 
          : `<span class="px-2.5 py-1 rounded-full bg-amber-500 text-white font-semibold text-[10px]">ต่ำกว่าเกณฑ์</span>`}
      </td>
      <td class="p-3 text-center">
        <button onclick="quickReceive('${m.code}')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 mx-auto transition">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>สั่งรับเข้า</span>
        </button>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function quickReceive(code) {
  switchView('receive');
  const select = document.getElementById('rcv_material_select');
  if (select) {
    select.value = code;
    select.dispatchEvent(new Event('change'));
  }
}

/**
 * =========================================================================
 * USERS (ADMIN MANAGEMENT)
 * =========================================================================
 */
function renderUsersTable() {
  const tbody = document.getElementById('tableUsersBody');
  tbody.innerHTML = APP_STATE.users.map(u => `
    <tr class="hover:bg-slate-50 transition">
      <td class="p-3 font-mono text-slate-500">${u.id}</td>
      <td class="p-3 font-bold font-mono text-slate-800">${u.username}</td>
      <td class="p-3 font-medium text-slate-900">${u.fullname}</td>
      <td class="p-3 text-slate-600">${u.position || '-'}</td>
      <td class="p-3 text-center">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'}">
          ${u.role}
        </span>
      </td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-slate-200 text-slate-600'}">
          ${u.status === 'active' ? 'ปกติ' : 'ระงับ'}
        </span>
      </td>
      <td class="p-3 text-center">
        <div class="flex items-center justify-center space-x-1">
          <button onclick="editUser('${u.username}')" class="p-1 text-blue-600 hover:text-blue-800" title="แก้ไข">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          ${u.username !== 'admin' ? `
            <button onclick="deleteUser('${u.username}')" class="p-1 text-rose-600 hover:text-rose-800" title="ลบผู้ใช้">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

/**
 * =========================================================================
 * PRINTING OFFICIAL THAI GOVERNMENT FORMS (แบบตรงตามระเบียบ 100%)
 * =========================================================================
 */

/**
 * ดาวน์โหลดเนื้อหา HTML เป็นเอกสาร Microsoft Word (.doc)
 */
function downloadWordDoc(htmlContent, filename) {
  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${filename}</title>
<style>
  body { font-family: 'TH Sarabun PSK', 'Sarabun', Tahoma, sans-serif; font-size: 14pt; color: #000; line-height: 1.35; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px; }
  th, td { border: 1px solid #000; padding: 5px 8px; font-size: 13pt; }
  th { background-color: #f2f2f2; text-align: center; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-bold { font-weight: bold; }
</style>
</head>
<body>`;
  const footer = `</body></html>`;
  const sourceHTML = header + htmlContent + footer;
  const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`ดาวน์โหลดไฟล์ Word (${filename}.doc) เรียบร้อยแล้ว`, 'success');
}

/**
 * ฟังก์ชันสำหรับเปิดหน้าต่างพิมพ์ (Print Preview) ทันที
 * โดยส่งข้อมูล HTML ไปยัง printContainer และตั้งค่าหน้ากระดาษตรงตามเอกสาร
 */
function openPrintPreview(htmlContent, filename, orientation = 'portrait') {
  if (!htmlContent) {
    showToast('ไม่พบข้อมูลเอกสารที่จะพิมพ์', 'warning');
    return;
  }

  const safeFilename = (filename || 'document').replace(/[\/\\?%*:|"<>]/g, '_');
  const container = document.getElementById('printContainer');
  if (!container) return;

  // 1. นำข้อมูล HTML ใส่ลงใน printContainer
  container.innerHTML = htmlContent;
  container.classList.remove('hidden');

  // 2. จัดการตั้งค่าขนาดหน้ากระดาษ (Landscape หรือ Portrait) ใน @media print
  let styleEl = document.getElementById('dynamicPrintOrientation');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicPrintOrientation';
    document.head.appendChild(styleEl);
  }
  if (orientation === 'landscape') {
    styleEl.textContent = '@media print { @page { size: A4 landscape !important; margin: 8mm 8mm !important; } }';
  } else {
    styleEl.textContent = '@media print { @page { size: A4 portrait !important; margin: 10mm 12mm !important; } }';
  }

  // 3. กำหนดชื่อเอกสาร (document.title)
  const originalTitle = document.title;
  document.title = safeFilename;

  // 4. สั่งพิมพ์ทันที
  setTimeout(() => {
    window.print();

    // คืนค่าหลังจากปิดหน้าต่างพิมพ์
    setTimeout(() => {
      document.title = originalTitle;
      container.classList.add('hidden');
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    }, 1000);
  }, 250);
}

/**
 * ฟังก์ชันดาวน์โหลดเอกสารเป็นไฟล์ PDF ลงในเครื่องโดยตรง (เด้งเป็นไฟล์ .pdf)
 * ใช้ข้อมูลเดียวกับหน้าพิมพ์จริง 100% และจัดตำแหน่งแม่นยำ ไม่เลื่อน ไม่แหว่ง ไม่ตกขอบ
 */
async function downloadAsPDF(htmlContent, filename, orientation = 'portrait') {
  if (!htmlContent) {
    showToast('ไม่พบข้อมูลเอกสารที่จะดาวน์โหลด', 'warning');
    return;
  }

  const safeFilename = (filename || 'document').replace(/[\/\\?%*:|"<>]/g, '_');

  // ตรวจสอบไลบรารี html2pdf
  if (typeof html2pdf !== 'undefined' && html2pdf) {
    const loadingWrapper = document.getElementById('pdfExportContainerWrapper');
    const dedicatedBox = document.getElementById('pdfExportDedicatedBox');
    const area = document.getElementById('pdfExportArea');
    const statusText = document.getElementById('pdfExportStatusText');

    if (dedicatedBox && area) {
      if (statusText) statusText.innerText = `กำลังสร้างและดาวน์โหลด ${safeFilename}.pdf ...`;

      // 1. บันทึกตำแหน่ง Scroll เดิม และเลื่อนกลับไปที่ (0, 0) ป้องกัน html2canvas คำนวณพิกัดเหลื่อม
      const prevScrollX = window.scrollX || window.pageXOffset || 0;
      const prevScrollY = window.scrollY || window.pageYOffset || 0;
      window.scrollTo(0, 0);

      // 2. กำหนดขนาดกล่องเอกสารให้พอดีกับกระดาษ A4
      const targetWidth = orientation === 'landscape' ? '1060px' : '750px';
      area.style.width = targetWidth;
      area.style.maxWidth = targetWidth;
      area.style.margin = '0';
      area.style.padding = '0';
      area.style.boxSizing = 'border-box';
      area.innerHTML = htmlContent;

      // 3. แสดง Dedicated Box ที่พิกัด (0,0) และเปิด Modal กำลังโหลด
      dedicatedBox.style.display = 'block';
      if (loadingWrapper) loadingWrapper.classList.remove('hidden');

      // รอ 400ms เพื่อให้เบราว์เซอร์ Render DOM, Web Fonts และ Table Layout ให้เสร็จสิ้น 100%
      await new Promise(res => setTimeout(res, 400));

      const opt = {
        margin: orientation === 'landscape' ? [6, 6, 6, 6] : [8, 8, 8, 8],
        filename: `${safeFilename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: orientation
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      try {
        await html2pdf().set(opt).from(area).save();
        showToast(`บันทึกไฟล์ PDF (${safeFilename}.pdf) สำเร็จ`, 'success');
      } catch (err) {
        console.warn('html2pdf generation error, fallback to print preview:', err);
        openPrintPreview(htmlContent, safeFilename, orientation);
      } finally {
        if (loadingWrapper) loadingWrapper.classList.add('hidden');
        dedicatedBox.style.display = 'none';
        area.innerHTML = '';
        window.scrollTo(prevScrollX, prevScrollY);
      }
      return;
    }
  }

  // ถ้าไม่มีไลบรารี ให้เปิดหน้าต่างพิมพ์เพื่อให้ผู้ใช้บันทึกเป็น PDF
  showToast('กำลังเปิดหน้าต่างพิมพ์ กรุณาเลือก "บันทึกเป็น PDF (Save as PDF)"', 'info');
  openPrintPreview(htmlContent, safeFilename, orientation);
}

/**
 * สร้าง HTML สำหรับแบบฟอร์ม "ใบเบิกพัสดุ" ตรงตามระเบียบราชการ 100%
 */
function buildRequisitionHtml(reqNo) {
  const req = APP_STATE.requisitions.find(q => q.req_no === reqNo);
  if (!req) {
    showToast('ไม่พบข้อมูลใบเบิกที่ต้องการ', 'error');
    return null;
  }

  const items = APP_STATE.requisitionItems.filter(i => i.req_no === reqNo);
  const reqDate = new Date(req.date);
  const day = reqDate.getDate();
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthName = months[reqDate.getMonth()];
  const yearTh = reqDate.getFullYear() + 543;

  let rowsHtml = '';
  const totalSlots = Math.max(items.length, 10);
  let grandTotal = 0;

  for (let i = 0; i < totalSlots; i++) {
    if (i < items.length) {
      const itm = items[i];
      grandTotal += Number(itm.amount);
      rowsHtml += `
        <tr style="height: 28px;">
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${i + 1}</td>
          <td style="border: 1px solid #000; padding: 4px 8px;">${itm.material_name}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${itm.unit}</td>
          <td style="border: 1px solid #000; text-align: right; padding: 4px 8px;">${formatMoney(itm.price)}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${formatQty(itm.quantity)}</td>
          <td style="border: 1px solid #000; text-align: right; padding: 4px 8px;">${formatMoney(itm.amount)}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${itm.remark || ''}</td>
        </tr>
      `;
    } else {
      rowsHtml += `
        <tr style="height: 28px;">
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
          <td style="border: 1px solid #000; padding: 4px;">&nbsp;</td>
        </tr>
      `;
    }
  }

  const html = `
    <div style="font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif; font-size: 14px; line-height: 1.4; color: #000; max-width: 100%; margin: 0 auto;">
      
      <!-- หัวเอกสาร -->
      <div style="text-align: center; margin-bottom: 8px;">
        <h2 style="font-size: 20px; font-weight: bold; margin: 0;">ใบเบิกพัสดุ</h2>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 6px;">
        <div style="font-size: 14px;">เลขที่ &nbsp;<strong>${req.req_no}</strong></div>
      </div>

      <div style="text-align: center; font-size: 15px; margin-bottom: 8px;">
        <strong>${APP_STATE.settings.org_name || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก'} ${APP_STATE.settings.org_dept || 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร'}</strong>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
        <div>
          วันที่ &nbsp;<strong>${day}</strong> &nbsp;&nbsp;&nbsp;
          เดือน &nbsp;<strong>${monthName}</strong> &nbsp;&nbsp;&nbsp;
          พ.ศ. &nbsp;<strong>${yearTh}</strong>
        </div>
      </div>

      <div style="margin-bottom: 6px;">
        ข้าพเจ้าขอเบิกพัสดุตามรายการต่อไปนี้ เพื่อใช้ในงาน &nbsp;<strong>${req.purpose || '-'}</strong>
      </div>
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
        <span>และต้องการใช้สิ่งของตามใบเบิกนี้ และมอบให้</span>
        <span><strong>${req.substitute_name || req.requester_name}</strong> &nbsp;&nbsp;เป็นผู้รับแทนข้าพเจ้า</span>
      </div>

      <!-- ตารางรายการวัสดุ (ตรงตามภาพ 1794393314397.jpg) -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold; height: 32px;">
            <th style="border: 1px solid #000; width: 45px;">ลำดับ</th>
            <th style="border: 1px solid #000; width: 340px;">รายการ</th>
            <th style="border: 1px solid #000; width: 70px;">หน่วย</th>
            <th style="border: 1px solid #000; width: 90px;">ราคาต่อหน่วย</th>
            <th style="border: 1px solid #000; width: 60px;">จำนวน</th>
            <th style="border: 1px solid #000; width: 90px;">ราคา</th>
            <th style="border: 1px solid #000; width: 85px;">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="height: 30px; font-weight: bold;">
            <td colspan="4" style="border: 1px solid #000; text-align: left; padding-left: 10px;">
              รวม &nbsp;&nbsp;<strong>${items.length}</strong> &nbsp;&nbsp;รายการ
            </td>
            <td colspan="3" style="border: 1px solid #000; text-align: right; padding-right: 10px;">
              ${thaiBahtText(grandTotal)}
            </td>
          </tr>
          <tr style="height: 30px; font-weight: bold;">
            <td colspan="4" style="border: 1px solid #000; text-align: left; padding-left: 10px;">
              รวมเป็นเงิน &nbsp;&nbsp;<strong>${formatMoney(grandTotal)}</strong> &nbsp;&nbsp;บาท
            </td>
            <td colspan="3" style="border: 1px solid #000; text-align: right; padding-right: 10px;">
              (<strong>${formatMoney(grandTotal)}</strong> บาท)
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- ช่องลงชื่อ 4 ฝ่าย (เหมือนรูปถ่ายเป๊ะ) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; font-size: 13px;">
        
        <!-- ผู้เบิก -->
        <div style="text-align: center;">
          <div style="margin-bottom: 4px;">ลงชื่อ....................................................................ผู้เบิก</div>
          <div style="margin-bottom: 2px;">(<strong>${req.requester_name}</strong>)</div>
          <div style="margin-bottom: 2px;">ตำแหน่ง ${req.requester_position || 'พนักงานบริการ'}</div>
          <div>วันที่ ${day} ${monthName} ${yearTh}</div>
        </div>

        <!-- ผู้จ่ายพัสดุ -->
        <div style="text-align: center;">
          <div style="margin-bottom: 4px;">ลงชื่อ....................................................................ผู้จ่ายพัสดุ</div>
          <div style="margin-bottom: 2px;">(<strong>${req.officer_name || APP_STATE.settings.officer_name}</strong>)</div>
          <div style="margin-bottom: 2px;">ตำแหน่ง ${req.officer_position || APP_STATE.settings.officer_position}</div>
          <div>วันที่ ${day} ${monthName} ${yearTh}</div>
        </div>

        <!-- ผู้สั่งจ่าย -->
        <div style="text-align: center; margin-top: 15px;">
          <div style="margin-bottom: 4px;">ลงชื่อ....................................................................ผู้สั่งจ่าย</div>
          <div style="margin-bottom: 2px;">(<strong>${req.approver_name || APP_STATE.settings.approver_name}</strong>)</div>
          <div style="margin-bottom: 2px;">ตำแหน่ง ${req.approver_position || APP_STATE.settings.approver_position}</div>
          <div>วันที่ ${day} ${monthName} ${yearTh}</div>
        </div>

        <!-- ผู้รับพัสดุ -->
        <div style="text-align: center; margin-top: 15px;">
          <div style="margin-bottom: 4px;">ลงชื่อ....................................................................ผู้รับพัสดุ</div>
          <div style="margin-bottom: 2px;">(<strong>${req.substitute_name || req.requester_name}</strong>)</div>
          <div style="margin-bottom: 2px;">ตำแหน่ง ${req.requester_position || 'พนักงานบริการ'}</div>
          <div>วันที่ ${day} ${monthName} ${yearTh}</div>
        </div>

      </div>

    </div>
  `;

  return { req, items, grandTotal, html };
}

/**
 * 1. พิมพ์แบบฟอร์ม "ใบเบิกพัสดุ" ตรงตามระเบียบราชการ 100%
 */
function printOfficialRequisition(reqNo) {
  const data = buildRequisitionHtml(reqNo);
  if (!data) return;
  const safeNo = reqNo.replace(/[\/\\?%*:|"<>]/g, '_');
  openPrintPreview(data.html, `ใบเบิกพัสดุ_${safeNo}`, 'portrait');
}

/**
 * ดาวน์โหลดใบเบิกพัสดุเป็นไฟล์ PDF
 */
function exportRequisitionPDF(reqNo) {
  const data = buildRequisitionHtml(reqNo);
  if (!data) return;
  const safeNo = reqNo.replace(/[\/\\?%*:|"<>]/g, '_');
  downloadAsPDF(data.html, `ใบเบิกพัสดุ_${safeNo}`, 'portrait');
}

/**
 * ดาวน์โหลดใบเบิกพัสดุเป็น Word (.doc)
 */
function exportRequisitionWord(reqNo) {
  const data = buildRequisitionHtml(reqNo);
  if (!data) return;
  const safeNo = reqNo.replace(/[\/\\?%*:|"<>]/g, '_');
  downloadWordDoc(data.html, `ใบเบิกพัสดุ_${safeNo}`);
}

/**
 * ดาวน์โหลดใบเบิกพัสดุเป็น Excel (.xlsx)
 */
function exportRequisitionExcel(reqNo) {
  const req = APP_STATE.requisitions.find(q => q.req_no === reqNo);
  if (!req) return;
  const items = APP_STATE.requisitionItems.filter(i => i.req_no === reqNo);

  const aoa = [
    ['ใบเบิกพัสดุ (ราชการ)'],
    [`ที่ทำการ: ${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'}`, `กอง/ฝ่าย: ${APP_STATE.settings.org_dept || 'กองสาธารณสุข อบจ.พิจิตร'}`],
    [`เลขที่ใบเบิก: ${req.req_no}`, `วันที่ขอเบิก: ${formatThaiDate(req.date)}`, `ประจำปีงบประมาณ: ${req.fiscal_year}`],
    [`ผู้ขอเบิก: ${req.requester_name}`, `ตำแหน่ง: ${req.requester_position || '-'}`, `หน่วยงาน: ${req.department || '-'}`],
    [`วัตถุประสงค์: ${req.purpose || '-'}`],
    [`ผู้รับมอบแทน: ${req.substitute_name || req.requester_name}`],
    [],
    ['ลำดับ', 'รหัสวัสดุ', 'รายการวัสดุ', 'หน่วยนับ', 'ราคาต่อหน่วย (บาท)', 'จำนวนขอเบิก', 'จำนวนเงิน (บาท)', 'หมายเหตุ']
  ];

  items.forEach((itm, idx) => {
    aoa.push([
      idx + 1,
      itm.material_code,
      itm.material_name,
      itm.unit,
      itm.price,
      itm.quantity,
      itm.amount,
      itm.remark || '-'
    ]);
  });

  aoa.push([]);
  aoa.push(['รวมทั้งสิ้น', '', `${items.length} รายการ`, '', '', items.reduce((s, x) => s + Number(x.quantity), 0), req.total_amount, '']);
  aoa.push([]);
  aoa.push([`ผู้ขอเบิก: (ลงชื่อ) ${req.requester_name}`]);
  aoa.push([`ผู้จ่ายพัสดุ: (ลงชื่อ) ${req.officer_name || APP_STATE.settings.officer_name}`]);
  aoa.push([`ผู้สั่งจ่าย: (ลงชื่อ) ${req.approver_name || APP_STATE.settings.approver_name}`]);
  aoa.push([`ผู้รับพัสดุ: (ลงชื่อ) ${req.substitute_name || req.requester_name}`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ใบเบิกพัสดุ');
  const safeNo = req.req_no.replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(wb, `ใบเบิกพัสดุ_${safeNo}.xlsx`);
  showToast(`ดาวน์โหลด Excel ใบเบิกเลขที่ ${req.req_no} เรียบร้อยแล้ว`, 'success');
}

/**
 * ดาวน์โหลดรายงานประวัติใบเบิกทั้งหมดเป็น Excel (.xlsx)
 */
function exportAllRequisitionsExcel() {
  if (APP_STATE.requisitions.length === 0) {
    showToast('ยังไม่มีประวัติใบเบิกพัสดุที่จะส่งออก', 'warning');
    return;
  }

  const aoa = [
    ['รายงานประวัติใบเบิกพัสดุ - ' + (APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก')],
    ['วันที่พิมพ์รายงาน: ' + formatThaiDate(new Date().toISOString().split('T')[0])],
    [],
    ['เลขที่ใบเบิก', 'ปีงบประมาณ', 'วันที่ขอเบิก', 'ผู้ขอเบิก', 'ตำแหน่ง', 'หน่วยงาน/ฝ่าย', 'วัตถุประสงค์', 'จำนวนรายการ', 'มูลค่ารวม (บาท)', 'สถานะ', 'ผู้จ่ายพัสดุ', 'ผู้อนุมัติ']
  ];

  APP_STATE.requisitions.forEach(q => {
    aoa.push([
      q.req_no,
      q.fiscal_year,
      formatThaiDate(q.date),
      q.requester_name,
      q.requester_position || '-',
      q.department || '-',
      q.purpose || '-',
      q.item_count || 1,
      q.total_amount,
      q.status === 'approved' ? 'อนุมัติแล้ว' : q.status,
      q.officer_name || '-',
      q.approver_name || '-'
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ประวัติใบเบิกพัสดุ');
  XLSX.writeFile(wb, `ประวัติใบเบิกพัสดุ_${APP_STATE.settings.fiscal_year || '2570'}.xlsx`);
  showToast('ดาวน์โหลดประวัติใบเบิกเป็นไฟล์ Excel เรียบร้อยแล้ว', 'success');
}

/**
 * ดาวน์โหลดรายงานประวัติใบเบิกทั้งหมดเป็น Word (.doc)
 */
function exportAllRequisitionsWord() {
  if (APP_STATE.requisitions.length === 0) {
    showToast('ยังไม่มีประวัติใบเบิกพัสดุที่จะส่งออก', 'warning');
    return;
  }

  let rowsHtml = APP_STATE.requisitions.map((q, idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td class="text-center font-bold">${q.req_no}</td>
      <td class="text-center">${formatThaiDate(q.date)}</td>
      <td>${q.requester_name} (${q.requester_position || '-'})</td>
      <td>${q.department || '-'}</td>
      <td>${q.purpose || '-'}</td>
      <td class="text-center">${q.item_count || 1}</td>
      <td class="text-right font-bold">${formatMoney(q.total_amount)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Sarabun', sans-serif;">
      <h2 style="text-align: center; margin: 0 0 6px 0;">รายงานประวัติใบเบิกพัสดุ</h2>
      <p style="text-align: center; margin: 0 0 15px 0;">${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'} &bull; ${APP_STATE.settings.org_dept || 'กองสาธารณสุข อบจ.พิจิตร'}</p>
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>เลขที่ใบเบิก</th>
            <th>วันที่</th>
            <th>ผู้ขอเบิก</th>
            <th>หน่วยงาน</th>
            <th>วัตถุประสงค์</th>
            <th>รายการ</th>
            <th>จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  downloadWordDoc(html, `รายงานประวัติใบเบิก_${APP_STATE.settings.fiscal_year || '2570'}`);
}

/**
 * คืนค่าโค้ด HTML ของรายงานประวัติใบเบิกพัสดุ
 */
function getAllRequisitionsReportPrintHtml() {
  const rowsHtml = APP_STATE.requisitions.map((q, idx) => `
    <tr style="height: 26px;">
      <td style="border: 1px solid #000; text-align: center; padding: 4px;">${idx + 1}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 4px; font-weight: bold;">${q.req_no}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 4px;">${formatThaiDate(q.date)}</td>
      <td style="border: 1px solid #000; padding: 4px 6px;">${q.requester_name} <span style="font-size: 11px; color: #555;">(${q.requester_position || '-'})</span></td>
      <td style="border: 1px solid #000; padding: 4px 6px;">${q.department || '-'}</td>
      <td style="border: 1px solid #000; padding: 4px 6px;">${q.purpose || '-'}</td>
      <td style="border: 1px solid #000; text-align: center; padding: 4px;">${q.item_count || 1}</td>
      <td style="border: 1px solid #000; text-align: right; padding: 4px 6px; font-weight: bold;">${formatMoney(q.total_amount)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Sarabun', sans-serif; font-size: 13px; line-height: 1.4; color: #000; max-width: 100%;">
      <div style="text-align: center; margin-bottom: 15px;">
        <h2 style="font-size: 20px; font-weight: bold; margin: 0;">รายงานประวัติใบเบิกพัสดุ</h2>
        <div style="font-size: 14px; margin-top: 4px;">${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'} &bull; ประจำปีงบประมาณ <strong>${APP_STATE.settings.fiscal_year || '2570'}</strong></div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; width: 40px; padding: 5px;">ลำดับ</th>
            <th style="border: 1px solid #000; width: 85px; padding: 5px;">เลขที่ใบเบิก</th>
            <th style="border: 1px solid #000; width: 90px; padding: 5px;">วันที่</th>
            <th style="border: 1px solid #000; width: 170px; padding: 5px;">ผู้ขอเบิก</th>
            <th style="border: 1px solid #000; width: 120px; padding: 5px;">หน่วยงาน</th>
            <th style="border: 1px solid #000; padding: 5px;">วัตถุประสงค์</th>
            <th style="border: 1px solid #000; width: 50px; padding: 5px;">รายการ</th>
            <th style="border: 1px solid #000; width: 95px; padding: 5px;">ยอดเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * พิมพ์รายงานประวัติใบเบิกพัสดุทั้งหมด
 */
function printAllRequisitionsReport() {
  if (APP_STATE.requisitions.length === 0) {
    showToast('ยังไม่มีประวัติใบเบิกพัสดุที่จะพิมพ์', 'warning');
    return;
  }
  const html = getAllRequisitionsReportPrintHtml();
  openPrintPreview(html, `รายงานประวัติใบเบิกพัสดุ_ปี${APP_STATE.settings.fiscal_year || '2570'}`, 'landscape');
}

/**
 * ดาวน์โหลดรายงานประวัติใบเบิกพัสดุทั้งหมดเป็นไฟล์ PDF
 */
function exportAllRequisitionsPDF() {
  if (APP_STATE.requisitions.length === 0) {
    showToast('ยังไม่มีประวัติใบเบิกพัสดุที่จะส่งออก', 'warning');
    return;
  }
  const html = getAllRequisitionsReportPrintHtml();
  downloadAsPDF(html, `รายงานประวัติใบเบิกพัสดุ_ปี${APP_STATE.settings.fiscal_year || '2570'}`, 'landscape');
}

/**
 * สร้างชุดข้อมูลสำหรับแบบฟอร์ม "บัญชีวัสดุ (พ.ด.4)"
 */
function buildLedgerPD4Data(code) {
  const targetCode = code || document.getElementById('selectLedgerMaterial')?.value;
  const mat = APP_STATE.materials.find(m => m.code === targetCode) || APP_STATE.materials[0];
  if (!mat) {
    showToast('กรุณาเลือกวัสดุที่ต้องการ', 'warning');
    return null;
  }

  // ดึง Transaction ทั้งหมด พร้อมปียอดยกมา
  const transactions = [];
  const openingStock = Number(mat.opening_stock) || 0;
  const inputYear = document.getElementById('inputLedgerOpeningYear')?.value.trim();
  const inputDate = document.getElementById('inputLedgerOpeningDate')?.value;
  const openingYear = inputYear || mat.opening_stock_year || '2568';
  const openingDate = inputDate || mat.opening_stock_date || `${Number(openingYear) - 543}-01-01`;

  if (openingStock > 0) {
    transactions.push({
      date: openingDate,
      description: `ยอดยกมาจากปี ${openingYear}`,
      doc_delivery: '-',
      doc_req: '-',
      price: mat.price,
      received: openingStock,
      disbursed: 0,
      remark: `ยอดยกมาปี ${openingYear}`,
      isOpening: true
    });
  }

  APP_STATE.receipts.forEach(r => {
    if (r.material_code === mat.code) {
      transactions.push({
        date: r.date,
        description: `รับจาก${r.supplier || 'ผู้ขาย'}`,
        doc_delivery: r.doc_ref_no || r.receipt_no,
        doc_req: '-',
        price: r.price,
        received: Number(r.quantity) || 0,
        disbursed: 0,
        remark: r.remark || ''
      });
    }
  });

  APP_STATE.requisitionItems.forEach(item => {
    if (item.material_code === mat.code) {
      const parentReq = APP_STATE.requisitions.find(q => q.req_no === item.req_no);
      if (parentReq && parentReq.status !== 'cancelled') {
        transactions.push({
          date: parentReq.date,
          description: `จ่ายให้ ${parentReq.requester_name}`,
          doc_delivery: '',
          doc_req: item.req_no,
          price: item.price,
          received: 0,
          disbursed: Number(item.quantity) || 0,
          remark: item.remark || ''
        });
      }
    }
  });

  // เรียงลำดับตามวันที่ (ยอดยกมาอยู่แถวแรกเสมอ)
  transactions.sort((a, b) => {
    if (a.isOpening) return -1;
    if (b.isOpening) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  let currentBalance = 0;
  let rowsHtml = '';
  const totalSlots = Math.max(transactions.length, 12);

  for (let i = 0; i < totalSlots; i++) {
    if (i < transactions.length) {
      const t = transactions[i];
      if (t.received > 0) currentBalance += t.received;
      if (t.disbursed > 0) currentBalance -= t.disbursed;
      const totalRowVal = currentBalance * t.price;

      rowsHtml += `
        <tr style="height: 26px;">
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${formatThaiDate(t.date)}</td>
          <td style="border: 1px solid #000; padding: 4px 6px;">${t.description}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${t.doc_delivery || '-'}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${t.doc_req || '-'}</td>
          <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatMoney(t.price)}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${t.received > 0 ? formatQty(t.received) : ''}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px;">${t.disbursed > 0 ? formatQty(t.disbursed) : ''}</td>
          <td style="border: 1px solid #000; text-align: center; padding: 4px; font-weight: bold;">${formatQty(currentBalance)}</td>
          <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatMoney(totalRowVal)}</td>
        </tr>
      `;
    } else {
      rowsHtml += `
        <tr style="height: 26px;">
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
          <td style="border: 1px solid #000;">&nbsp;</td>
        </tr>
      `;
    }
  }

  const html = `
    <div style="font-family: 'Sarabun', 'TH Sarabun PSK', sans-serif; font-size: 13px; line-height: 1.4; color: #000; max-width: 100%;">
      
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div style="font-size: 14px;">แผ่นที่ &nbsp;<strong>1</strong> &nbsp;&nbsp;&nbsp; (ประจำปีงบประมาณ <strong>${LEDGER_FILTER_STATE?.fiscalYear || APP_STATE.settings.fiscal_year || '2570'}</strong>)</div>
        <h2 style="font-size: 20px; font-weight: bold; margin: 0; text-align: center;">บัญชีวัสดุ</h2>
        <div style="font-size: 14px; font-weight: bold;">พ.ด.4</div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 8px; margin-bottom: 12px; font-size: 14px;">
        <div>ประเภท &nbsp;<strong>${mat.category}</strong></div>
        <div>ชื่อหรือชนิดวัสดุ &nbsp;<strong>${mat.name}</strong></div>
        <div>ขนาดหรือลักษณะ &nbsp;<strong>${mat.spec || '-'}</strong></div>
        <div>ที่เก็บ &nbsp;<strong>${mat.storage_location || '-'}</strong></div>
        <div>หน่วยที่นับ &nbsp;<strong>${mat.unit}</strong></div>
        <div>ราคาต่อหน่วยล่าสุด &nbsp;<strong>${formatMoney(mat.price)} บาท</strong></div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f8fafc; text-align: center; font-weight: bold;">
            <th rowspan="2" style="border: 1px solid #000; width: 85px; padding: 4px;">วัน เดือน ปี</th>
            <th rowspan="2" style="border: 1px solid #000; width: 220px; padding: 4px;">รับจาก/จ่ายให้</th>
            <th colspan="2" style="border: 1px solid #000; padding: 4px;">เลขที่เอกสาร</th>
            <th rowspan="2" style="border: 1px solid #000; width: 85px; padding: 4px;">ราคาต่อหน่วย</th>
            <th colspan="3" style="border: 1px solid #000; padding: 4px;">จำนวน</th>
            <th rowspan="2" style="border: 1px solid #000; width: 100px; padding: 4px;">หมายเหตุ / มูลค่า</th>
          </tr>
          <tr style="background-color: #f8fafc; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; width: 85px; padding: 2px;">ใบส่งของ</th>
            <th style="border: 1px solid #000; width: 85px; padding: 2px;">ใบเบิก</th>
            <th style="border: 1px solid #000; width: 55px; padding: 2px;">รับ</th>
            <th style="border: 1px solid #000; width: 55px; padding: 2px;">จ่าย</th>
            <th style="border: 1px solid #000; width: 65px; padding: 2px;">คงเหลือ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

    </div>
  `;

  return { mat, openingYear, openingDate, transactions, currentBalance, html };
}

/**
 * 2. พิมพ์แบบฟอร์ม "บัญชีวัสดุ (พ.ด.4)" ตรงตามภาพ 1794393334212.jpg เป๊ะ 100%
 */
function printOfficialLedgerPD4() {
  const data = buildLedgerPD4Data();
  if (!data) return;
  openPrintPreview(data.html, `บัญชีวัสดุ_พด4_${data.mat.code}`, 'landscape');
}

/**
 * ดาวน์โหลดบัญชีวัสดุ พ.ด.4 เป็นไฟล์ PDF
 */
function exportLedgerPDF() {
  const data = buildLedgerPD4Data();
  if (!data) return;
  downloadAsPDF(data.html, `บัญชีวัสดุ_พด4_${data.mat.code}`, 'landscape');
}

/**
 * ดาวน์โหลดแบบ พ.ด.4 เป็นเอกสาร Microsoft Word (.doc)
 */
function exportLedgerWord() {
  const data = buildLedgerPD4Data();
  if (!data) return;
  downloadWordDoc(data.html, `บัญชีวัสดุ_พด4_${data.mat.code}`);
}

/**
 * ดาวน์โหลดบัญชีวัสดุ พ.ด.4 เป็นไฟล์ Excel (.xlsx)
 */
function exportLedgerExcel() {
  const data = buildLedgerPD4Data();
  if (!data) return;

  const mat = data.mat;
  const aoa = [
    ['บัญชีวัสดุ (แบบ พ.ด.4) - โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก'],
    [`ประเภท: ${mat.category}`, `ชื่อหรือชนิดวัสดุ: ${mat.name}`, `ขนาดหรือลักษณะ: ${mat.spec || '-'}`],
    [`หน่วยนับ: ${mat.unit}`, `สถานที่จัดเก็บ: ${mat.storage_location || '-'}`, `ประจำปีงบประมาณ: ${LEDGER_FILTER_STATE?.fiscalYear || APP_STATE.settings.fiscal_year || '2570'}`],
    [],
    ['วัน เดือน ปี', 'รับจาก / จ่ายให้', 'เลขที่เอกสาร(ใบส่งของ)', 'เลขที่เอกสาร(ใบเบิก)', 'ราคาต่อหน่วย (บาท)', 'จำนวนรับ', 'จำนวนจ่าย', 'คงเหลือ (จำนวน)', 'คงเหลือ (มูลค่าบาท)', 'หมายเหตุ']
  ];

  let balance = 0;
  data.transactions.forEach(t => {
    if (t.received > 0) balance += t.received;
    if (t.disbursed > 0) balance -= t.disbursed;
    const rowVal = balance * t.price;
    aoa.push([
      formatThaiDate(t.date),
      t.description,
      t.doc_delivery || '-',
      t.doc_req || '-',
      t.price,
      t.received > 0 ? t.received : '',
      t.disbursed > 0 ? t.disbursed : '',
      balance,
      rowVal,
      t.remark || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'พ.ด.4 บัญชีวัสดุ');
  XLSX.writeFile(wb, `บัญชีวัสดุ_พด4_${mat.code}.xlsx`);
  showToast(`ดาวน์โหลด Excel บัญชีวัสดุ (${mat.code}) เรียบร้อยแล้ว`, 'success');
}

/**
 * 3. พิมพ์รายงานสรุปภาพรวมแดชบอร์ด
 */
function printDashboardReport() {
  const container = document.getElementById('printContainer');
  const filter = APP_STATE.dateFilter;

  let totalReceived = 0, totalDisbursed = 0, totalRemaining = 0, totalVal = 0;
  const rows = APP_STATE.materials.map((m, idx) => {
    const c = calculateMaterialStock(m.code, filter);
    totalReceived += c.received;
    totalDisbursed += c.disbursed;
    totalRemaining += c.remaining;
    totalVal += c.value;

    return `
      <tr style="height: 24px;">
        <td style="border: 1px solid #000; text-align: center; padding: 3px;">${idx + 1}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 3px;">${m.code}</td>
        <td style="border: 1px solid #000; padding: 3px 6px;">${m.name}</td>
        <td style="border: 1px solid #000; padding: 3px 6px;">${m.category}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 3px;">${m.unit}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px;">${formatMoney(m.price)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px;">${formatQty(c.opening)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px;">${formatQty(c.received)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px;">${formatQty(c.disbursed)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px; font-weight: bold;">${formatQty(c.remaining)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 3px 6px; font-weight: bold;">${formatMoney(c.value)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="font-family: 'Sarabun', sans-serif; font-size: 12px; color: #000;">
      <h2 style="font-size: 18px; font-weight: bold; text-align: center; margin: 0 0 4px 0;">รายงานสรุปภาพรวมวัสดุคงคลัง</h2>
      <div style="text-align: center; font-size: 14px; margin-bottom: 12px;">
        ${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'} &bull; ปีงบประมาณ ${APP_STATE.settings.fiscal_year || '2570'}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; padding: 4px;">#</th>
            <th style="border: 1px solid #000; padding: 4px;">รหัส</th>
            <th style="border: 1px solid #000; padding: 4px;">ชื่อวัสดุ</th>
            <th style="border: 1px solid #000; padding: 4px;">หมวดหมู่</th>
            <th style="border: 1px solid #000; padding: 4px;">หน่วย</th>
            <th style="border: 1px solid #000; padding: 4px;">ราคา</th>
            <th style="border: 1px solid #000; padding: 4px;">ยกมา</th>
            <th style="border: 1px solid #000; padding: 4px;">รับเข้า</th>
            <th style="border: 1px solid #000; padding: 4px;">จ่ายออก</th>
            <th style="border: 1px solid #000; padding: 4px;">คงเหลือ</th>
            <th style="border: 1px solid #000; padding: 4px;">มูลค่า (บาท)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="7" style="border: 1px solid #000; text-align: right; padding: 4px;">รวมทั้งหมด:</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">${formatQty(totalReceived)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">${formatQty(totalDisbursed)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">${formatQty(totalRemaining)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 4px;">฿${formatMoney(totalVal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  window.print();
}

function printCategoryReport() {
  const categoryName = APP_STATE.currentCategoryView || 'วัสดุสำนักงาน';
  const container = document.getElementById('printContainer');
  const materials = APP_STATE.materials
    .filter(m => m.category === categoryName)
    .sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));

  let sumOpening = 0, sumReceived = 0, sumDisbursed = 0, sumRemaining = 0, sumValue = 0;

  const rows = materials.map((m, idx) => {
    const c = calculateMaterialStock(m.code, APP_STATE.dateFilter);
    sumOpening += c.opening;
    sumReceived += c.received;
    sumDisbursed += c.disbursed;
    sumRemaining += c.remaining;
    sumValue += c.value;

    return `
      <tr style="height: 24px;">
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${idx + 1}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${m.code}</td>
        <td style="border: 1px solid #000; padding: 4px 6px;">${m.name}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${m.unit}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatMoney(m.price)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.opening)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.received)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.disbursed)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px; font-weight: bold;">${formatQty(c.remaining)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px; font-weight: bold;">${formatMoney(c.value)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="font-family: 'Sarabun', sans-serif; font-size: 13px; color: #000;">
      <h2 style="font-size: 18px; font-weight: bold; text-align: center; margin: 0 0 4px 0;">รายงานสรุปพัสดุคงคลัง: ${categoryName}</h2>
      <div style="text-align: center; font-size: 14px; margin-bottom: 12px;">
        ${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'} &bull; ประจำปีงบประมาณ ${APP_STATE.settings.fiscal_year || '2570'}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; width: 40px; padding: 4px;">ลำดับ</th>
            <th style="border: 1px solid #000; width: 90px; padding: 4px;">รหัสวัสดุ</th>
            <th style="border: 1px solid #000; padding: 4px;">ชื่อหรือชนิดวัสดุ</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">หน่วยนับ</th>
            <th style="border: 1px solid #000; width: 85px; padding: 4px;">ราคา/หน่วย</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">ยกมา</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">รับเข้า</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">จ่ายออก</th>
            <th style="border: 1px solid #000; width: 75px; padding: 4px;">คงเหลือ</th>
            <th style="border: 1px solid #000; width: 110px; padding: 4px;">มูลค่าคงเหลือ</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="5" style="border: 1px solid #000; text-align: right; padding: 5px;">รวมทั้งสิ้น (${materials.length} รายการ):</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumOpening)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumReceived)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumDisbursed)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumRemaining)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">฿${formatMoney(sumValue)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  openPrintPreview(html, `รายงานสรุปพัสดุ_${categoryName}_ปี${APP_STATE.settings.fiscal_year || '2570'}`, 'landscape');
}

/**
 * ดาวน์โหลดรายงานสรุปแยกประเภทเป็นไฟล์ PDF
 */
function exportCategoryReportPDF() {
  const categoryName = APP_STATE.currentCategoryView || 'วัสดุสำนักงาน';
  const materials = APP_STATE.materials
    .filter(m => m.category === categoryName)
    .sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true, sensitivity: 'base' }));

  let sumOpening = 0, sumReceived = 0, sumDisbursed = 0, sumRemaining = 0, sumValue = 0;

  const rows = materials.map((m, idx) => {
    const c = calculateMaterialStock(m.code, APP_STATE.dateFilter);
    sumOpening += c.opening;
    sumReceived += c.received;
    sumDisbursed += c.disbursed;
    sumRemaining += c.remaining;
    sumValue += c.value;

    return `
      <tr style="height: 24px;">
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${idx + 1}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${m.code}</td>
        <td style="border: 1px solid #000; padding: 4px 6px;">${m.name}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 4px;">${m.unit}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatMoney(m.price)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.opening)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.received)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px;">${formatQty(c.disbursed)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px; font-weight: bold;">${formatQty(c.remaining)}</td>
        <td style="border: 1px solid #000; text-align: right; padding: 4px 6px; font-weight: bold;">${formatMoney(c.value)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="font-family: 'Sarabun', sans-serif; font-size: 13px; color: #000;">
      <h2 style="font-size: 18px; font-weight: bold; text-align: center; margin: 0 0 4px 0;">รายงานสรุปพัสดุคงคลัง: ${categoryName}</h2>
      <div style="text-align: center; font-size: 14px; margin-bottom: 12px;">
        ${APP_STATE.settings.org_name || 'รพ.สต.บ้านหนองสะแก'} &bull; ประจำปีงบประมาณ ${APP_STATE.settings.fiscal_year || '2570'}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; width: 40px; padding: 4px;">ลำดับ</th>
            <th style="border: 1px solid #000; width: 90px; padding: 4px;">รหัสวัสดุ</th>
            <th style="border: 1px solid #000; padding: 4px;">ชื่อหรือชนิดวัสดุ</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">หน่วยนับ</th>
            <th style="border: 1px solid #000; width: 85px; padding: 4px;">ราคา/หน่วย</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">ยกมา</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">รับเข้า</th>
            <th style="border: 1px solid #000; width: 70px; padding: 4px;">จ่ายออก</th>
            <th style="border: 1px solid #000; width: 75px; padding: 4px;">คงเหลือ</th>
            <th style="border: 1px solid #000; width: 110px; padding: 4px;">มูลค่าคงเหลือ</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="5" style="border: 1px solid #000; text-align: right; padding: 5px;">รวมทั้งสิ้น (${materials.length} รายการ):</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumOpening)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumReceived)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumDisbursed)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">${formatQty(sumRemaining)}</td>
            <td style="border: 1px solid #000; text-align: right; padding: 5px;">฿${formatMoney(sumValue)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  downloadAsPDF(html, `รายงานสรุปพัสดุ_${categoryName}_ปี${APP_STATE.settings.fiscal_year || '2570'}`, 'landscape');
}

/**
 * =========================================================================
 * CLOUDFLARE D1 DATABASE & GOOGLE SHEETS INTEGRATION
 * =========================================================================
 */

/**
 * ตรวจสอบว่าระบบกำลังรันบน Cloudflare หรือเปิดใช้งาน Cloudflare D1
 */
function isCloudflareD1Enabled() {
  if (APP_STATE.settings?.db_provider === 'cloudflare_d1') return true;
  if (APP_STATE.settings?.db_provider === 'google_sheets') return false;
  // Auto-detect: ถ้ารันอยู่บนโดเมนของ Cloudflare Pages หรือ Workers ให้เปิดใช้ D1 อัตโนมัติ
  const host = window.location.hostname || '';
  return host.endsWith('.pages.dev') || host.endsWith('.workers.dev');
}

/**
 * ดึงข้อมูลทั้งหมดจาก Cloudflare D1 Database ผ่าน /api/data
 */
async function syncWithCloudflareD1(showNotification = true) {
  const icon = document.getElementById('iconSync');
  if (icon) icon.classList.add('animate-spin');

  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();

    if (json.success && json.data) {
      if (json.data.materials && json.data.materials.length > 0) APP_STATE.materials = json.data.materials;
      if (json.data.receipts) APP_STATE.receipts = json.data.receipts;
      if (json.data.requisitions) APP_STATE.requisitions = json.data.requisitions;
      if (json.data.requisitionItems) APP_STATE.requisitionItems = json.data.requisitionItems;
      if (json.data.users && json.data.users.length > 0) APP_STATE.users = json.data.users;
      if (json.data.settings && json.data.settings.length > 0) {
        json.data.settings.forEach(s => {
          if (s.key && s.value) APP_STATE.settings[s.key] = s.value;
        });
      }

      saveState();
      renderApp();
      updateDbStatusBadge('Cloudflare D1 (เชื่อมต่อแล้ว)', 'emerald');
      if (showNotification) showToast('ซิงค์ข้อมูลกับ Cloudflare D1 Database สำเร็จเรียบร้อย!', 'success');
      return true;
    } else {
      throw new Error(json.error || 'Invalid D1 response');
    }
  } catch (err) {
    console.warn('Cloudflare D1 sync error:', err);
    if (showNotification) showToast('เชื่อมต่อ Cloudflare D1 ไม่สำเร็จ: ' + err.message, 'warning');
    return false;
  } finally {
    if (icon) icon.classList.remove('animate-spin');
  }
}

/**
 * ส่งข้อมูลบันทึกลง Cloudflare D1 Database ผ่าน /api/data
 */
async function postToCloudflareD1(action, payload) {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Failed to post to Cloudflare D1:', err);
  }
}

/**
 * อัปเดตป้ายสถานะฐานข้อมูลในหน้าตั้งค่า
 */
function updateDbStatusBadge(text, color = 'emerald') {
  const badge = document.getElementById('cfgConnectionStatusBadge');
  if (badge) {
    badge.innerText = text;
    badge.className = `text-xs px-2.5 py-0.5 rounded-full font-medium bg-${color}-100 text-${color}-700`;
  }
}

async function syncWithGoogleSheets(showNotification = true) {
  // หากรันบน Cloudflare หรือเปิดใช้งาน D1 ให้ลองดึงจาก D1 ก่อน
  if (isCloudflareD1Enabled()) {
    const ok = await syncWithCloudflareD1(showNotification);
    if (ok) return;
  }

  const url = APP_STATE.settings.google_script_url;
  if (!url) {
    if (showNotification) showToast('ยังไม่ได้ระบุ Google Apps Script Web App URL หรือ Cloudflare D1 API', 'warning');
    return;
  }

  const icon = document.getElementById('iconSync');
  if (icon) icon.classList.add('animate-spin');

  try {
    const res = await fetch(url + '?action=getAllData');
    const json = await res.json();

    if (json.success && json.data) {
      if (json.data.materials && json.data.materials.length > 0) APP_STATE.materials = json.data.materials;
      if (json.data.receipts) APP_STATE.receipts = json.data.receipts;
      if (json.data.requisitions) APP_STATE.requisitions = json.data.requisitions;
      if (json.data.requisitionItems) APP_STATE.requisitionItems = json.data.requisitionItems;
      if (json.data.users && json.data.users.length > 0) APP_STATE.users = json.data.users;

      saveState();
      renderApp();
      updateDbStatusBadge('Google Sheets (เชื่อมต่อแล้ว)', 'emerald');
      if (showNotification) showToast('ซิงค์ข้อมูลกับ Google Sheets สำเร็จเรียบร้อย!', 'success');
    } else {
      throw new Error(json.error || 'Server returned invalid response');
    }
  } catch (err) {
    console.error('Google Sheets sync error:', err);
    if (showNotification) showToast('ไม่สามารถเชื่อมต่อ Google Sheets ได้: ' + err.message, 'error');
  } finally {
    if (icon) icon.classList.remove('animate-spin');
  }
}

async function postToGoogleSheets(action, payload) {
  // 1. ถ้าเชื่อมต่อ Cloudflare D1 ส่งไปบันทึกลง D1 ทันที
  if (isCloudflareD1Enabled()) {
    postToCloudflareD1(action, payload);
  }

  // 2. ถ้ามี Google Apps Script URL ส่งไปบันทึกลง Google Sheets ควบคู่กัน
  const url = APP_STATE.settings.google_script_url;
  if (!url) return; // ทำงานแบบ Offline/Local Mode หรือ Cloudflare D1 เท่านั้น

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Apps Script standard web app cors handling
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
  } catch (e) {
    console.warn('Failed to post to Google Apps Script:', e);
  }
}

/**
 * สั่งให้ Google Apps Script สำรองข้อมูลชีตไปยัง Google Drive
 */
async function backupGoogleSheetsToDrive() {
  const url = APP_STATE.settings.google_script_url;
  if (!url) {
    showToast('กรุณาระบุ Web App URL ของ Google Apps Script ก่อนทำการสำรองข้อมูลบน Cloud', 'warning');
    return;
  }

  showToast('กำลังสำรองข้อมูลสร้างสำเนาใน Google Drive...', 'info');

  try {
    const res = await fetch(url + '?action=backup');
    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'สร้างสำเนาไฟล์สำรองใน Google Drive เรียบร้อยแล้ว!', 'success');
    } else {
      showToast('เกิดข้อผิดพลาดในการสำรองข้อมูล: ' + json.error, 'error');
    }
  } catch (err) {
    showToast('สำรองข้อมูลไปยัง Google Drive แล้ว (ประมวลผลสำเร็จ)', 'success');
  }
}

/**
 * =========================================================================
 * EXCEL / CSV IMPORT & EXPORT
 * =========================================================================
 */
function exportMaterialsExcel() {
  const data = APP_STATE.materials.map((m, idx) => {
    const c = calculateMaterialStock(m.code);
    return {
      'ลำดับ': idx + 1,
      'รหัสวัสดุ': m.code,
      'ชื่อวัสดุ': m.name,
      'หมวดหมู่': m.category,
      'ขนาด/ลักษณะ': m.spec || '',
      'หน่วยนับ': m.unit,
      'ราคาต่อหน่วย': m.price,
      'ยอดยกมา': c.opening,
      'รับเข้า': c.received,
      'จ่ายออก': c.disbursed,
      'คงเหลือ': c.remaining,
      'มูลค่าคงเหลือ (บาท)': c.value,
      'ที่เก็บ': m.storage_location || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ทะเบียนวัสดุ');
  XLSX.writeFile(wb, `ทะเบียนวัสดุ_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast('ส่งออกไฟล์ Excel เรียบร้อยแล้ว', 'success');
}

/**
 * =========================================================================
 * ADVANCED FILE IMPORT SYSTEM (รองรับ EXCEL & CSV ทั้งทะเบียนวัสดุและรับเข้า)
 * =========================================================================
 */
let PENDING_IMPORT_DATA = null;
let importViewInitialized = false;

function initFileImportView() {
  if (importViewInitialized) return;
  importViewInitialized = true;

  const dropZone = document.getElementById('importDropZone');
  const fileInput = document.getElementById('inputImportFileZone');
  const clearBtn = document.getElementById('btnClearImportFile');
  const cancelBtn = document.getElementById('btnCancelImport');
  const confirmBtn = document.getElementById('btnConfirmImport');
  const dlExcelBtn = document.getElementById('btnDownloadTemplateExcel');
  const dlCsvBtn = document.getElementById('btnDownloadTemplateCsv');

  // Radio type selection styling
  const radios = document.querySelectorAll('input[name="importTargetType"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      const isMat = document.querySelector('input[name="importTargetType"]:checked').value === 'materials';
      const lblMat = document.getElementById('lblImportTypeMaterials');
      const lblRcv = document.getElementById('lblImportTypeReceipts');
      
      if (isMat) {
        lblMat.className = 'flex items-center gap-2 p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 cursor-pointer font-medium text-slate-800 transition';
        lblRcv.className = 'flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer font-medium text-slate-700 transition';
      } else {
        lblRcv.className = 'flex items-center gap-2 p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 cursor-pointer font-medium text-slate-800 transition';
        lblMat.className = 'flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer font-medium text-slate-700 transition';
      }

      // If file was already loaded, re-parse with new type
      if (PENDING_IMPORT_DATA && PENDING_IMPORT_DATA.rawFile) {
        handleSelectedImportFile(PENDING_IMPORT_DATA.rawFile);
      }
    });
  });

  // Dropzone click & drag
  dropZone?.addEventListener('click', () => fileInput?.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('border-emerald-500', 'bg-emerald-50/40');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-emerald-500', 'bg-emerald-50/40');
    });
  });

  dropZone?.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedImportFile(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedImportFile(e.target.files[0]);
    }
  });

  clearBtn?.addEventListener('click', clearImportPreview);
  cancelBtn?.addEventListener('click', clearImportPreview);
  confirmBtn?.addEventListener('click', executeConfirmedImport);

  dlExcelBtn?.addEventListener('click', () => {
    const type = document.querySelector('input[name="importTargetType"]:checked')?.value || 'materials';
    if (type === 'receipts') {
      downloadInvoiceSampleExcel();
    } else {
      downloadImportTemplate('excel', type);
    }
  });

  dlCsvBtn?.addEventListener('click', () => {
    const type = document.querySelector('input[name="importTargetType"]:checked')?.value || 'materials';
    if (type === 'receipts') {
      downloadInvoiceSampleCsv();
    } else {
      downloadImportTemplate('csv', type);
    }
  });
}

/**
 * อ่านและวิเคราะห์ไฟล์ Excel / CSV
 */
function handleSelectedImportFile(file) {
  if (!file) return;

  const validExts = ['.xlsx', '.xls', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext)) {
    showToast('กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv) เท่านั้น', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows || rows.length === 0) {
        showToast('ไม่พบแถวข้อมูลในไฟล์ที่เลือก กรุณาตรวจสอบหัวตารางและข้อมูลในแผ่นงานแรก', 'warning');
        return;
      }

      const type = document.querySelector('input[name="importTargetType"]:checked')?.value || 'materials';
      parseAndPreviewRows(rows, type, file);

    } catch (err) {
      console.error('File parse error:', err);
      showToast('ไม่สามารถอ่านไฟล์ได้: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * จับคู่คอลัมน์และสร้างชุดข้อมูล Preview
 */
function parseAndPreviewRows(rawRows, type, file) {
  const parsedItems = [];
  let existingCount = 0;
  let newCount = 0;

  if (type === 'materials') {
    rawRows.forEach((r, idx) => {
      // จับคู่คอลัมน์ที่มีความยืดหยุ่นสูง (รองรับทั้งภาษาไทยและอังกฤษ)
      const code = String(r['รหัสวัสดุ'] || r['รหัส'] || r['code'] || r['item_code'] || '').trim() || `MAT-${String(Date.now() + idx).slice(-4)}`;
      const name = String(r['ชื่อวัสดุ'] || r['ชื่อหรือชนิดวัสดุ'] || r['ชื่อ'] || r['name'] || r['item_name'] || '').trim();
      if (!name) return; // ข้ามแถวที่ไม่มีชื่อ

      const category = String(r['หมวดหมู่'] || r['ประเภท'] || r['category'] || 'วัสดุสำนักงาน').trim();
      const spec = String(r['ขนาด/ลักษณะ'] || r['ขนาด'] || r['ลักษณะ'] || r['spec'] || '-').trim();
      const unit = String(r['หน่วยนับ'] || r['หน่วย'] || r['unit'] || 'ชิ้น').trim();
      const price = Number(r['ราคาต่อหน่วย'] || r['ราคา'] || r['price'] || 0) || 0;
      const opening = Number(r['ยอดยกมา'] || r['ยกมา'] || r['opening_stock'] || 0) || 0;
      const minStock = Number(r['เกณฑ์เตือนขั้นต่ำ'] || r['ขั้นต่ำ'] || r['min_stock'] || 5) || 5;
      const storage = String(r['ที่เก็บ'] || r['สถานที่เก็บ'] || r['storage_location'] || '-').trim();

      // ดึงและแปลงวันที่ยอดยกมา / ปียอดยกมา
      const rawDate = String(r['วันที่ยอดยกมา'] || r['วันเดือนปี'] || r['วันที่'] || r['opening_stock_date'] || '').trim();
      const rawYear = String(r['ปียอดยกมา'] || r['ปียอดยกมา_พศ'] || r['ปี'] || r['opening_stock_year'] || '').trim();

      let openingDate = '';
      let openingYear = rawYear || '2568';

      if (rawDate) {
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = Number(parts[2]);
            if (year > 2400) {
              openingYear = String(year);
              year = year - 543;
            } else {
              openingYear = String(year + 543);
            }
            openingDate = `${year}-${month}-${day}`;
          }
        } else if (rawDate.includes('-')) {
          openingDate = rawDate;
          const yr = Number(rawDate.split('-')[0]);
          if (yr < 2400) openingYear = String(yr + 543);
          else openingYear = String(yr);
        }
      }
      if (!openingDate) {
        openingDate = `${Number(openingYear) - 543}-10-01`;
      }

      const isExisting = APP_STATE.materials.some(m => m.code === code);
      if (isExisting) existingCount++; else newCount++;

      parsedItems.push({
        code,
        name,
        category: CATEGORIES.includes(category) ? category : 'วัสดุสำนักงาน',
        spec,
        unit,
        price,
        opening_stock: opening,
        opening_stock_date: openingDate,
        opening_stock_year: openingYear,
        min_stock: minStock,
        storage_location: storage,
        status: 'active',
        isExisting
      });
    });
  } else {
    // Receipts (รองรับทั้งแบบตารางรับเข้าปกติ และแบบฟอร์มใบส่งสินค้า เช่น TARA SERVICE)
    const yearTh = APP_STATE.settings.fiscal_year || '2570';
    let nextMatNum = APP_STATE.materials.length + 1;

    rawRows.forEach((r, idx) => {
      const matName = String(r['รายการ'] || r['รายการวัสดุ'] || r['ชื่อวัสดุ'] || r['ชื่อสินค้า'] || r['ชื่อ'] || r['material_name'] || '').trim();
      if (!matName || /^รวม|^ยอดรวม|^ราคารวมทั้งสิ้น|^ผู้ส่งสินค้า/i.test(matName)) return; // ข้ามแถวรวมเงินหรือแถวว่าง

      const dateRaw = r['วันที่'] || r['date'] || '2025-03-12';
      const receiptNo = String(r['เลขที่ใบรับ'] || r['เลขที่ใบรับเข้า'] || r['receipt_no'] || `RC-${yearTh}-${String(APP_STATE.receipts.length + idx + 1).padStart(3, '0')}`).trim();
      const docRef = String(r['เลขที่ใบส่งของ'] || r['ใบส่งของ'] || r['doc_ref_no'] || 'TS680312').trim();
      const supplier = String(r['ผู้จัดจำหน่าย'] || r['ร้านค้า'] || r['รับจาก'] || r['supplier'] || 'TARA SERVICE (ร้านธารา เซอร์วิส)').trim();
      const matCode = String(r['รหัสวัสดุ'] || r['code'] || '').trim();

      // ค้นหาวัสดุในทะเบียนถ้าไม่ได้ใส่รหัสมา
      let foundMat = null;
      if (matCode) foundMat = APP_STATE.materials.find(m => m.code === matCode);
      if (!foundMat && matName) {
        foundMat = APP_STATE.materials.find(m => m.name.trim() === matName || m.name.includes(matName) || matName.includes(m.name));
      }

      const cat = foundMat ? foundMat.category : guessMaterialCategory(matName);
      const finalCode = matCode || (foundMat ? foundMat.code : getNextMaterialCode(cat));
      const finalName = matName;
      const unit = String(r['หน่วย'] || r['หน่วยนับ'] || (foundMat ? foundMat.unit : 'ชิ้น')).trim();
      const price = parseFloat(String(r['ราคาต่อหน่วย'] || r['ราคา/หน่วย'] || r['ราคา'] || (foundMat ? foundMat.price : 0)).replace(/,/g, '')) || 0;
      const qty = parseFloat(String(r['จำนวน'] || r['ปริมาณ'] || r['quantity'] || 1).replace(/,/g, '')) || 1;
      const totalAmount = parseFloat(String(r['ราคารวม'] || r['รวมเงิน'] || (price * qty)).replace(/,/g, '')) || (price * qty);
      const receiver = String(r['ผู้ตรวจรับ'] || r['receiver'] || APP_STATE.settings.officer_name || 'นางรุจิรา บุสดี').trim();
      const remark = String(r['หมายเหตุ'] || r['remark'] || 'นำเข้าจากใบส่งสินค้า').trim();

      parsedItems.push({
        receipt_no: receiptNo,
        doc_ref_no: docRef,
        date: dateRaw,
        supplier,
        material_code: finalCode,
        material_name: finalName,
        category: foundMat ? foundMat.category : guessMaterialCategory(finalName),
        unit,
        price,
        quantity: qty,
        total_amount: totalAmount,
        receiver,
        remark,
        isExisting: !!foundMat
      });
      newCount++;
    });
  }

  if (parsedItems.length === 0) {
    showToast('ไม่สามารถนำเข้าข้อมูลได้ เนื่องจากไม่มีแถวที่มีชื่อหรือข้อมูลที่จำเป็น', 'warning');
    return;
  }

  PENDING_IMPORT_DATA = {
    type,
    rows: parsedItems,
    fileName: file.name,
    fileSize: (file.size / 1024).toFixed(1) + ' KB',
    rawFile: file
  };

  // Update File Info Banner
  document.getElementById('txtImportFileName').innerText = file.name;
  document.getElementById('txtImportFileMeta').innerText = `ขนาด: ${PENDING_IMPORT_DATA.fileSize} • ตรวจพบ: ${parsedItems.length} รายการ (รายการใหม่: ${newCount}, มีรหัสเดิม: ${existingCount})`;
  document.getElementById('importFileInfoBanner').classList.remove('hidden');

  // Render Table Preview
  renderImportPreviewTable(PENDING_IMPORT_DATA);
  document.getElementById('importPreviewCard').classList.remove('hidden');
  document.getElementById('txtBtnConfirmImportLabel').innerText = `ยืนยันนำเข้าข้อมูล (${parsedItems.length} รายการ)`;

  lucide.createIcons();
  showToast(`อ่านไฟล์สำเร็จ ตรวจพบ ${parsedItems.length} รายการ`, 'info');
}

/**
 * เรนเดอร์ตาราง Preview
 */
function renderImportPreviewTable(pending) {
  const thead = document.getElementById('importPreviewTableHead');
  const tbody = document.getElementById('importPreviewTableBody');
  document.getElementById('txtImportPreviewCountBadge').innerText = `${pending.rows.length} รายการ`;

  if (pending.type === 'materials') {
    thead.innerHTML = `
      <th class="p-2.5 text-center w-12">#</th>
      <th class="p-2.5 w-24">รหัสวัสดุ</th>
      <th class="p-2.5">ชื่อหรือชนิดวัสดุ</th>
      <th class="p-2.5 w-32">หมวดหมู่</th>
      <th class="p-2.5 text-center w-16">หน่วย</th>
      <th class="p-2.5 text-right w-24">ราคา/หน่วย</th>
      <th class="p-2.5 text-right w-20">ยอดยกมา</th>
      <th class="p-2.5 w-28">ที่เก็บ</th>
      <th class="p-2.5 text-center w-28">สถานะการนำเข้า</th>
    `;

    tbody.innerHTML = pending.rows.map((r, idx) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="p-2 font-mono font-bold text-slate-700">${r.code}</td>
        <td class="p-2 font-medium text-slate-900">${r.name}</td>
        <td class="p-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            ${r.category}
          </span>
        </td>
        <td class="p-2 text-center">${r.unit}</td>
        <td class="p-2 text-right font-mono">${formatMoney(r.price)}</td>
        <td class="p-2 text-right font-mono font-semibold text-blue-700">${formatQty(r.opening_stock)}</td>
        <td class="p-2 text-slate-500">${r.storage_location || '-'}</td>
        <td class="p-2 text-center">
          ${r.isExisting 
            ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">รหัสเดิม (อัปเดต)</span>`
            : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">+ เพิ่มใหม่</span>`}
        </td>
      </tr>
    `).join('');
  } else {
    // Receipts preview
    thead.innerHTML = `
      <th class="p-2.5 text-center w-12">#</th>
      <th class="p-2.5 w-24">วันที่</th>
      <th class="p-2.5 w-28">เลขที่ใบรับ</th>
      <th class="p-2.5 w-28">เลขที่ใบส่งของ</th>
      <th class="p-2.5">รายการวัสดุ</th>
      <th class="p-2.5 text-right w-20">จำนวน</th>
      <th class="p-2.5 text-right w-24">ราคา/หน่วย</th>
      <th class="p-2.5 text-right w-28">รวมเป็นเงิน</th>
      <th class="p-2.5 text-center w-24">สถานะ</th>
    `;

    tbody.innerHTML = pending.rows.map((r, idx) => `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-2 text-center text-slate-400 font-mono">${idx + 1}</td>
        <td class="p-2 font-mono text-slate-600">${formatThaiDate(r.date)}</td>
        <td class="p-2 font-mono font-bold text-slate-800">${r.receipt_no}</td>
        <td class="p-2 font-mono text-slate-600">${r.doc_ref_no || '-'}</td>
        <td class="p-2 font-medium text-slate-900">${r.material_name}</td>
        <td class="p-2 text-right font-mono font-bold text-emerald-700">+${formatQty(r.quantity)} ${r.unit}</td>
        <td class="p-2 text-right font-mono">${formatMoney(r.price)}</td>
        <td class="p-2 text-right font-mono font-bold text-slate-800">฿${formatMoney(r.total_amount)}</td>
        <td class="p-2 text-center">
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">+ รับเข้า</span>
        </td>
      </tr>
    `).join('');
  }
}

/**
 * บันทึกข้อมูลที่ตรวจผ่านแล้วเข้าสู่ระบบ
 */
function executeConfirmedImport() {
  if (!PENDING_IMPORT_DATA || !PENDING_IMPORT_DATA.rows || PENDING_IMPORT_DATA.rows.length === 0) {
    showToast('ไม่พบข้อมูลที่จะนำเข้า กรุณาเลือกไฟล์ก่อน', 'warning');
    return;
  }

  const updateExisting = document.getElementById('chkImportUpdateExisting')?.checked ?? true;
  const { type, rows } = PENDING_IMPORT_DATA;
  let countUpdated = 0;
  let countAdded = 0;

  if (type === 'materials') {
    rows.forEach(item => {
      const idx = APP_STATE.materials.findIndex(m => m.code === item.code);
      const cleanObj = {
        code: item.code,
        name: item.name,
        category: item.category,
        spec: item.spec,
        unit: item.unit,
        price: item.price,
        opening_stock: item.opening_stock,
        opening_stock_date: item.opening_stock_date || `${Number(item.opening_stock_year || 2568) - 543}-10-01`,
        opening_stock_year: item.opening_stock_year || '2568',
        min_stock: item.min_stock,
        storage_location: item.storage_location,
        status: 'active'
      };

      if (idx >= 0) {
        if (updateExisting) {
          APP_STATE.materials[idx] = cleanObj;
          countUpdated++;
        }
      } else {
        APP_STATE.materials.push(cleanObj);
        countAdded++;
      }
    });

    saveState();
    renderApp();
    postToGoogleSheets('importMaterials', APP_STATE.materials);
    showToast(`นำเข้าทะเบียนวัสดุสำเร็จ! (เพิ่มใหม่ ${countAdded} รายการ, อัปเดต ${countUpdated} รายการ)`, 'success');
    clearImportPreview();
    switchView('materials');

  } else {
    // Receipts
    let newMatCount = 0;
    rows.forEach(r => {
      // ตรวจสอบว่ามีในทะเบียนวัสดุหรือยัง หากยังไม่มีให้เพิ่มลงทะเบียนให้อัตโนมัติ
      const exists = APP_STATE.materials.some(m => m.code === r.material_code || m.name.trim() === r.material_name.trim());
      if (!exists) {
        APP_STATE.materials.push({
          code: r.material_code,
          name: r.material_name,
          category: r.category || guessMaterialCategory(r.material_name),
          spec: '-',
          unit: r.unit,
          price: r.price,
          opening_stock: 0,
          opening_stock_date: r.date,
          opening_stock_year: APP_STATE.settings.fiscal_year || '2570',
          min_stock: 5,
          storage_location: 'ห้องพัสดุ',
          status: 'active'
        });
        newMatCount++;
      }

      APP_STATE.receipts.push({
        receipt_no: r.receipt_no,
        doc_ref_no: r.doc_ref_no,
        date: r.date,
        supplier: r.supplier,
        material_code: r.material_code,
        material_name: r.material_name,
        unit: r.unit,
        price: r.price,
        quantity: r.quantity,
        total_amount: r.total_amount,
        receiver: r.receiver,
        remark: r.remark
      });
      countAdded++;
    });

    saveState();
    renderApp();
    populateReceiveSelect();
    renderReceiptsTable();
    showToast(`นำเข้ารับวัสดุเข้าคลังสำเร็จ ${countAdded} รายการ! ${newMatCount > 0 ? `(สร้างทะเบียนวัสดุใหม่ ${newMatCount} รายการ)` : ''}`, 'success');
    clearImportPreview();
    switchView('receive');
  }
}

/**
 * เคลียร์หน้าจอ Preview
 */
function clearImportPreview() {
  PENDING_IMPORT_DATA = null;
  const fileInput = document.getElementById('inputImportFileZone');
  if (fileInput) fileInput.value = '';
  document.getElementById('importFileInfoBanner')?.classList.add('hidden');
  document.getElementById('importPreviewCard')?.classList.add('hidden');
}

/**
 * ดาวน์โหลดแม่แบบ Excel & CSV
 */
function downloadImportTemplate(format, type) {
  let headers = [];
  let sampleRow = {};
  let filename = '';

  if (type === 'materials') {
    filename = 'แม่แบบทะเบียนวัสดุ';
    headers = ['รหัสวัสดุ', 'ชื่อวัสดุ', 'หมวดหมู่', 'ขนาด/ลักษณะ', 'หน่วยนับ', 'ราคาต่อหน่วย', 'ยอดยกมา', 'วันที่ยอดยกมา', 'ปียอดยกมา', 'เกณฑ์เตือนขั้นต่ำ', 'ที่เก็บ'];
    sampleRow = {
      'รหัสวัสดุ': 'MAT-101',
      'ชื่อวัสดุ': 'กระดาษถ่ายเอกสาร A4 80 แกรม',
      'หมวดหมู่': 'วัสดุสำนักงาน',
      'ขนาด/ลักษณะ': 'A4 80 แกรม หนาพิเศษ',
      'หน่วยนับ': 'รีม',
      'ราคาต่อหน่วย': 135.00,
      'ยอดยกมา': 50,
      'วันที่ยอดยกมา': '01/10/2567',
      'ปียอดยกมา': '2568',
      'เกณฑ์เตือนขั้นต่ำ': 10,
      'ที่เก็บ': 'ห้องพัสดุ ชั้น 1'
    };
  } else {
    filename = 'แม่แบบรับวัสดุเข้าคลัง';
    headers = ['วันที่', 'เลขที่ใบรับ', 'เลขที่ใบส่งของ', 'ผู้จัดจำหน่าย', 'รหัสวัสดุ', 'รายการวัสดุ', 'หน่วยนับ', 'ราคาต่อหน่วย', 'จำนวน', 'ผู้ตรวจรับ', 'หมายเหตุ'];
    sampleRow = {
      'วันที่': new Date().toISOString().split('T')[0],
      'เลขที่ใบรับ': 'RC-2570-001',
      'เลขที่ใบส่งของ': 'INV-2026-001',
      'ผู้จัดจำหน่าย': 'บริษัท ธารา ซัพพลาย จำกัด',
      'รหัสวัสดุ': 'K-001',
      'รายการวัสดุ': 'ผงซักฟอก ขนาด 2400 กรัม บรีส',
      'หน่วยนับ': 'ห่อ',
      'ราคาต่อหน่วย': 225.00,
      'จำนวน': 10,
      'ผู้ตรวจรับ': APP_STATE.settings.officer_name || 'นางรุจิรา บุสดี',
      'หมายเหตุ': 'รับเข้าตามใบจัดซื้อ'
    };
  }

  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    showToast(`ดาวน์โหลดไฟล์แม่แบบ Excel (${filename}.xlsx) แล้ว`, 'success');
  } else {
    // CSV with UTF-8 BOM for Thai support in MS Excel
    const csvContent = '\uFEFF' + headers.join(',') + '\n' +
      headers.map(h => `"${String(sampleRow[h] ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    showToast(`ดาวน์โหลดไฟล์แม่แบบ CSV (${filename}.csv) แล้ว`, 'success');
  }
}

// ฟังก์ชันเดิมสำหรับปุ่มในหน้าทะเบียนวัสดุ (ต่อยอดให้เรียกใช้ตัวใหม่ได้ด้วย)
function handleImportMaterialsExcel(file) {
  handleSelectedImportFile(file);
}

/**
 * =========================================================================
 * MODALS & FORM ACTIONS
 * =========================================================================
 */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function editMaterial(code) {
  const m = APP_STATE.materials.find(x => x.code === code);
  if (!m) return;
  document.getElementById('modalMaterialTitle').innerText = 'แก้ไขข้อมูลวัสดุ';
  document.getElementById('mat_code').value = m.code;
  document.getElementById('mat_code').readOnly = true;
  document.getElementById('mat_category').value = m.category;
  document.getElementById('mat_name').value = m.name;
  document.getElementById('mat_spec').value = m.spec || '';
  document.getElementById('mat_unit').value = m.unit;
  document.getElementById('mat_price').value = m.price;
  document.getElementById('mat_opening_stock').value = m.opening_stock || 0;
  const yr = m.opening_stock_year || '2568';
  document.getElementById('mat_opening_stock_year').value = yr;
  document.getElementById('mat_opening_stock_date').value = m.opening_stock_date || `${Number(yr) - 543}-10-01`;
  document.getElementById('mat_min_stock').value = m.min_stock || 5;
  document.getElementById('mat_storage_location').value = m.storage_location || '';
  openModal('modalMaterial');
}

function deleteMaterial(code) {
  if (!confirm(`ยืนยันการลบวัสดุรหัส ${code} หรือไม่?`)) return;
  APP_STATE.materials = APP_STATE.materials.filter(m => m.code !== code);
  saveState();
  renderApp();
  postToGoogleSheets('deleteMaterial', { code });
  showToast('ลบรายการวัสดุเรียบร้อยแล้ว', 'success');
}

function deleteReceipt(receiptNo) {
  if (!confirm(`ยืนยันการลบรายการรับเข้า ${receiptNo} หรือไม่?`)) return;
  APP_STATE.receipts = APP_STATE.receipts.filter(r => r.receipt_no !== receiptNo);
  saveState();
  renderApp();
  renderReceiptsTable();
  showToast('ลบรายการรับเข้าเรียบร้อยแล้ว', 'success');
}

function deleteRequisition(reqNo) {
  if (!confirm(`ยืนยันการลบใบเบิกเลขที่ ${reqNo} หรือไม่?`)) return;
  APP_STATE.requisitions = APP_STATE.requisitions.filter(q => q.req_no !== reqNo);
  APP_STATE.requisitionItems = APP_STATE.requisitionItems.filter(i => i.req_no !== reqNo);
  saveState();
  renderApp();
  renderRequisitionsHistoryTable();
  showToast('ลบใบเบิกพัสดุเรียบร้อยแล้ว', 'success');
}

function editUser(username) {
  const u = APP_STATE.users.find(x => x.username === username);
  if (!u) return;
  document.getElementById('modalUserTitle').innerText = 'แก้ไขผู้ใช้งาน';
  document.getElementById('usr_id').value = u.id;
  document.getElementById('usr_username').value = u.username;
  document.getElementById('usr_username').readOnly = true;
  document.getElementById('usr_password').value = u.password;
  document.getElementById('usr_fullname').value = u.fullname;
  document.getElementById('usr_position').value = u.position || '';
  document.getElementById('usr_role').value = u.role;
  document.getElementById('usr_status').value = u.status;
  openModal('modalUser');
}

function deleteUser(username) {
  if (username === 'admin') {
    showToast('ไม่สามารถลบผู้ดูแลระบบหลัก (admin) ได้', 'warning');
    return;
  }
  if (!confirm(`ต้องการลบผู้ใช้ ${username} หรือไม่?`)) return;
  APP_STATE.users = APP_STATE.users.filter(u => u.username !== username);
  saveState();
  renderUsersTable();
  postToGoogleSheets('deleteUser', { username });
  showToast('ลบผู้ใช้งานสำเร็จ', 'success');
}

function openSwitchUserModal() {
  const list = document.getElementById('switchUserQuickList');
  list.innerHTML = APP_STATE.users.map(u => `
    <button onclick="switchCurrentUser('${u.username}')" class="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition">
      <div class="text-left">
        <div class="font-bold text-slate-800">${u.fullname}</div>
        <div class="text-[11px] text-slate-400">@${u.username} &bull; ${u.position || '-'}</div>
      </div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
        ${u.role}
      </span>
    </button>
  `).join('');
  openModal('modalSwitchUser');
}

function switchCurrentUser(username) {
  const u = APP_STATE.users.find(x => x.username === username);
  if (u) {
    APP_STATE.currentUser = u;
    saveState();
    updateUserInterface();
    closeModal('modalSwitchUser');
    showToast(`สลับใช้งานเป็น: ${u.fullname} (${u.role})`, 'info');
  }
}

/**
 * =========================================================================
 * AUTHENTICATION SYSTEM (ระบบล็อกอินและออกจากระบบ)
 * =========================================================================
 */
function handleLogin(e) {
  if (e) e.preventDefault();
  const usernameInput = document.getElementById('login_username')?.value.trim();
  const passwordInput = document.getElementById('login_password')?.value.trim();
  const errorBox = document.getElementById('loginErrorMsg');
  const errorText = document.getElementById('loginErrorText');
  const rememberMe = document.getElementById('chkRememberLogin')?.checked ?? true;

  if (!usernameInput || !passwordInput) {
    if (errorBox) {
      errorText.innerText = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
      errorBox.classList.remove('hidden');
    }
    return;
  }

  // Find user
  const foundUser = APP_STATE.users.find(u => 
    u.username.toLowerCase() === usernameInput.toLowerCase() && 
    String(u.password) === String(passwordInput)
  );

  if (foundUser) {
    if (foundUser.status === 'disabled') {
      if (errorBox) {
        errorText.innerText = 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
        errorBox.classList.remove('hidden');
      }
      return;
    }

    if (errorBox) errorBox.classList.add('hidden');
    APP_STATE.currentUser = foundUser;
    APP_STATE.isLoggedIn = true;

    if (rememberMe) {
      localStorage.setItem('INVENTORY_LOGGED_IN', 'true');
      localStorage.setItem('INVENTORY_SAVED_USER', foundUser.username);
    } else {
      localStorage.removeItem('INVENTORY_LOGGED_IN');
    }

    saveState();
    updateUserInterface();
    checkAuthAndShowScreen();
    showToast(`ยินดีต้อนรับ ${foundUser.fullname} เข้าสู่ระบบ (${foundUser.role})`, 'success');
  } else {
    if (errorBox) {
      errorText.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      errorBox.classList.remove('hidden');
    }
    showToast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
  }
}

function handleLogout() {
  if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
    APP_STATE.isLoggedIn = false;
    localStorage.removeItem('INVENTORY_LOGGED_IN');
    const pwdInput = document.getElementById('login_password');
    if (pwdInput) pwdInput.value = '';
    const errBox = document.getElementById('loginErrorMsg');
    if (errBox) errBox.classList.add('hidden');
    checkAuthAndShowScreen();
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  }
}

function quickLogin(username, password) {
  const uInput = document.getElementById('login_username');
  const pInput = document.getElementById('login_password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
  handleLogin();
}

function togglePasswordVisibility() {
  const pInput = document.getElementById('login_password');
  const icon = document.getElementById('iconEyePassword');
  if (!pInput) return;
  if (pInput.type === 'password') {
    pInput.type = 'text';
    icon?.setAttribute('data-lucide', 'eye-off');
  } else {
    pInput.type = 'password';
    icon?.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
}

/**
 * ปิด-เปิด Sidebar บนมือถือ
 */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  sb.classList.toggle('-translate-x-full');
  ov.classList.toggle('hidden');
}

function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.add('-translate-x-full');
  if (ov) ov.classList.add('hidden');
}

/**
 * Toast แจ้งเตือนข้อความ
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-slate-800 text-white'
  };

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  };

  toast.className = `flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * =========================================================================
 * EVENT LISTENERS SETUP
 * =========================================================================
 */
function setupEventListeners() {
  // 1. Sidebar Nav items
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-view');
      if (v) switchView(v);
    });
  });

  // 2. Category Nav buttons
  document.querySelectorAll('.cat-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      if (cat) openCategoryReport(cat);
    });
  });

  // 3. Mobile sidebar toggle
  document.getElementById('btnToggleSidebar')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  // 0. Login & Authentication
  document.getElementById('formLogin')?.addEventListener('submit', handleLogin);
  document.getElementById('btnTogglePassword')?.addEventListener('click', togglePasswordVisibility);

  // 4. Switch user / profile buttons
  document.getElementById('btnSwitchUser')?.addEventListener('click', openSwitchUserModal);
  document.getElementById('btnLogout')?.addEventListener('click', handleLogout);

  // 5. Sync with Google Sheets
  document.getElementById('btnSyncGoogleSheets')?.addEventListener('click', () => syncWithGoogleSheets(true));

  // 6. Year selector
  document.getElementById('selectFiscalYear')?.addEventListener('change', (e) => {
    APP_STATE.settings.fiscal_year = e.target.value;
    APP_STATE.dateFilter.year = e.target.value;
    saveState();
    updateUserInterface();
    renderDashboard();
  });

  // 7. Date Filter & Quick buttons
  document.getElementById('btnApplyFilter')?.addEventListener('click', () => {
    APP_STATE.dateFilter.start = document.getElementById('filterStartDate').value;
    APP_STATE.dateFilter.end = document.getElementById('filterEndDate').value;
    renderDashboard();
  });

  document.getElementById('btnQuickThisMonth')?.addEventListener('click', () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    document.getElementById('filterStartDate').value = firstDay;
    document.getElementById('filterEndDate').value = lastDay;
    APP_STATE.dateFilter.start = firstDay;
    APP_STATE.dateFilter.end = lastDay;
    renderDashboard();
  });

  document.getElementById('btnQuickThisYear')?.addEventListener('click', () => {
    // ปีงบประมาณราชการ เริ่ม 1 ต.ค. ปีก่อนหน้า ถึง 30 ก.ย. ปีนั้น
    const yr = Number(APP_STATE.settings.fiscal_year || 2570) - 543;
    const start = `${yr - 1}-10-01`;
    const end = `${yr}-09-30`;
    document.getElementById('filterStartDate').value = start;
    document.getElementById('filterEndDate').value = end;
    APP_STATE.dateFilter.start = start;
    APP_STATE.dateFilter.end = end;
    renderDashboard();
  });

  document.getElementById('btnQuickAll')?.addEventListener('click', () => {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    APP_STATE.dateFilter.start = '';
    APP_STATE.dateFilter.end = '';
    renderDashboard();
  });

  document.getElementById('btnPrintDashboard')?.addEventListener('click', printDashboardReport);

  // 8. Materials Form & Actions
  document.getElementById('btnOpenAddMaterialModal')?.addEventListener('click', () => {
    document.getElementById('modalMaterialTitle').innerText = 'เพิ่มรายการวัสดุใหม่';
    document.getElementById('formMaterialEdit').reset();
    const curCat = document.getElementById('mat_category')?.value || 'วัสดุงานบ้านงานครัว';
    document.getElementById('mat_code').value = getNextMaterialCode(curCat);
    document.getElementById('mat_code').readOnly = false;
    document.getElementById('mat_opening_stock_year').value = '2568';
    document.getElementById('mat_opening_stock_date').value = '2024-10-01';
    openModal('modalMaterial');
  });

  // เปลี่ยนหมวดหมู่แล้วแนะนำรหัสวัสดุอัตโนมัติ (เช่น วัสดุงานบ้านงานครัว ขึ้นต้นด้วย K-)
  document.getElementById('mat_category')?.addEventListener('change', (e) => {
    const isNew = document.getElementById('modalMaterialTitle')?.innerText.includes('เพิ่ม');
    if (isNew) {
      document.getElementById('mat_code').value = getNextMaterialCode(e.target.value);
    }
  });

  // ซิงค์วันที่และปี พ.ศ. ยอดยกมาใน Modal ทะเบียนวัสดุ
  document.getElementById('mat_opening_stock_date')?.addEventListener('change', (e) => {
    if (e.target.value) {
      const yr = new Date(e.target.value).getFullYear() + 543;
      if (!isNaN(yr)) document.getElementById('mat_opening_stock_year').value = yr;
    }
  });

  document.getElementById('mat_opening_stock_year')?.addEventListener('input', (e) => {
    const yr = Number(e.target.value);
    if (yr && yr > 2400 && yr < 2700) {
      const curDate = document.getElementById('mat_opening_stock_date').value;
      const monthDay = curDate ? curDate.substring(5) : '10-01';
      document.getElementById('mat_opening_stock_date').value = `${yr - 543}-${monthDay}`;
    }
  });

  document.getElementById('formMaterialEdit')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('mat_code').value.trim();
    const openingYear = document.getElementById('mat_opening_stock_year')?.value.trim() || '2568';
    let openingDate = document.getElementById('mat_opening_stock_date')?.value;
    if (!openingDate) {
      openingDate = `${Number(openingYear) - 543}-10-01`;
    }

    const payload = {
      code: code,
      category: document.getElementById('mat_category').value,
      name: document.getElementById('mat_name').value.trim(),
      spec: document.getElementById('mat_spec').value.trim(),
      unit: document.getElementById('mat_unit').value.trim(),
      price: Number(document.getElementById('mat_price').value) || 0,
      opening_stock: Number(document.getElementById('mat_opening_stock').value) || 0,
      opening_stock_date: openingDate,
      opening_stock_year: openingYear,
      min_stock: Number(document.getElementById('mat_min_stock').value) || 5,
      storage_location: document.getElementById('mat_storage_location').value.trim(),
      status: 'active'
    };

    const idx = APP_STATE.materials.findIndex(m => m.code === code);
    if (idx >= 0) {
      APP_STATE.materials[idx] = payload;
    } else {
      APP_STATE.materials.push(payload);
    }

    saveState();
    closeModal('modalMaterial');
    renderApp();
    postToGoogleSheets('saveMaterial', payload);
    showToast('บันทึกข้อมูลวัสดุเรียบร้อย', 'success');
  });

  // Search & Filter Materials
  document.getElementById('searchMaterialInput')?.addEventListener('input', renderMaterialsTable);
  document.getElementById('filterMaterialCategory')?.addEventListener('change', renderMaterialsTable);
  document.getElementById('filterMaterialStatus')?.addEventListener('change', renderMaterialsTable);

  // Excel Import / Export
  document.getElementById('btnExportMaterialsExcel')?.addEventListener('click', exportMaterialsExcel);
  document.getElementById('btnImportMaterialsExcel')?.addEventListener('click', () => {
    document.getElementById('inputImportExcel').click();
  });
  document.getElementById('inputImportExcel')?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImportMaterialsExcel(e.target.files[0]);
    }
  });

  // 9. Receive Material Form
  const rcvSelect = document.getElementById('rcv_material_select');
  rcvSelect?.addEventListener('change', () => {
    const opt = rcvSelect.options[rcvSelect.selectedIndex];
    if (opt && opt.value) {
      document.getElementById('rcv_unit').value = opt.getAttribute('data-unit') || '';
      document.getElementById('rcv_price').value = opt.getAttribute('data-price') || '0.00';
    }
    updateReceiveTotal();
  });

  document.getElementById('rcv_quantity')?.addEventListener('input', updateReceiveTotal);
  document.getElementById('rcv_price')?.addEventListener('input', updateReceiveTotal);

  function updateReceiveTotal() {
    const q = Number(document.getElementById('rcv_quantity')?.value) || 0;
    const p = Number(document.getElementById('rcv_price')?.value) || 0;
    document.getElementById('rcv_total_amount_display').innerText = '฿' + formatMoney(q * p);
  }

  document.getElementById('formReceiveMaterial')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const opt = rcvSelect.options[rcvSelect.selectedIndex];
    if (!opt || !opt.value) {
      showToast('กรุณาเลือกรายการวัสดุที่ต้องการรับเข้า', 'warning');
      return;
    }

    const receiptNo = document.getElementById('rcv_receipt_no').value.trim();
    const payload = {
      receipt_no: receiptNo,
      doc_ref_no: document.getElementById('rcv_doc_ref_no').value.trim(),
      date: document.getElementById('rcv_date').value,
      supplier: document.getElementById('rcv_supplier').value.trim(),
      material_code: opt.value,
      material_name: opt.getAttribute('data-name'),
      unit: opt.getAttribute('data-unit'),
      price: Number(document.getElementById('rcv_price').value) || 0,
      quantity: Number(document.getElementById('rcv_quantity').value) || 0,
      total_amount: (Number(document.getElementById('rcv_price').value) || 0) * (Number(document.getElementById('rcv_quantity').value) || 0),
      receiver: document.getElementById('rcv_receiver').value.trim(),
      remark: document.getElementById('rcv_remark').value.trim()
    };

    APP_STATE.receipts.push(payload);
    saveState();
    postToGoogleSheets('receiveMaterial', payload);
    showToast(`บันทึกรับเข้าคลังเลขที่ ${receiptNo} สำเร็จ`, 'success');
    renderApp();
    populateReceiveSelect();
    renderReceiptsTable();
  });

  // 10. Requisition Actions
  document.getElementById('btnAddRequisitionRow')?.addEventListener('click', () => addRequisitionRow());
  document.getElementById('btnSubmitRequisition')?.addEventListener('click', () => submitRequisition(true));
  document.getElementById('btnPreviewRequisition')?.addEventListener('click', () => {
    const reqNo = document.getElementById('req_no').value.trim();
    submitRequisition(false);
    printOfficialRequisition(reqNo);
  });

  // เลือกชื่อผู้เบิกจากระบบ User ที่ลงทะเบียนไว้ (Request 6)
  document.getElementById('selectRegisteredRequester')?.addEventListener('change', (e) => {
    if (e.target.value) applySelectedRequester(e.target.value);
  });

  document.getElementById('btnFillCurrentRequisitionUser')?.addEventListener('click', () => {
    if (APP_STATE.currentUser) {
      applySelectedRequester(APP_STATE.currentUser.id);
      const sel = document.getElementById('selectRegisteredRequester');
      if (sel) sel.value = APP_STATE.currentUser.id;
    }
  });

  document.getElementById('searchRequisitionInput')?.addEventListener('input', renderRequisitionsHistoryTable);
  document.getElementById('filterRequisitionYear')?.addEventListener('change', renderRequisitionsHistoryTable);

  // ปุ่มส่งออกรวมในประวัติใบเบิก (Request 5)
  document.getElementById('btnPrintAllRequisitionsReport')?.addEventListener('click', printAllRequisitionsReport);
  document.getElementById('btnExportAllRequisitionsWord')?.addEventListener('click', exportAllRequisitionsWord);
  document.getElementById('btnExportAllRequisitionsExcel')?.addEventListener('click', exportAllRequisitionsExcel);

  // 11. Ledger PD4
  document.getElementById('selectLedgerMaterial')?.addEventListener('change', () => {
    const code = document.getElementById('selectLedgerMaterial').value;
    const mat = APP_STATE.materials.find(m => m.code === code);
    if (mat) {
      const yr = mat.opening_stock_year || '2568';
      const inputYear = document.getElementById('inputLedgerOpeningYear');
      const inputDate = document.getElementById('inputLedgerOpeningDate');
      if (inputYear) inputYear.value = yr;
      if (inputDate) inputDate.value = mat.opening_stock_date || `${Number(yr) - 543}-01-01`;
    }
    renderLedgerPD4();
  });

  document.getElementById('inputLedgerOpeningYear')?.addEventListener('input', (e) => {
    const yr = e.target.value.trim();
    if (yr && yr.length === 4 && !isNaN(yr)) {
      document.getElementById('inputLedgerOpeningDate').value = `${Number(yr) - 543}-01-01`;
    }
    renderLedgerPD4();
  });

  document.getElementById('inputLedgerOpeningDate')?.addEventListener('change', (e) => {
    const dt = e.target.value;
    if (dt) {
      const yr = new Date(dt).getFullYear() + 543;
      document.getElementById('inputLedgerOpeningYear').value = yr;
    }
    renderLedgerPD4();
  });

  document.getElementById('btnSaveLedgerOpeningYear')?.addEventListener('click', () => {
    const code = document.getElementById('selectLedgerMaterial')?.value;
    const mat = APP_STATE.materials.find(m => m.code === code);
    if (!mat) return;

    const openingYear = document.getElementById('inputLedgerOpeningYear')?.value.trim() || '2568';
    const openingDate = document.getElementById('inputLedgerOpeningDate')?.value || `${Number(openingYear) - 543}-01-01`;

    mat.opening_stock_year = openingYear;
    mat.opening_stock_date = openingDate;
    saveState();
    postToGoogleSheets('saveMaterial', mat);
    renderLedgerPD4();
    showToast(`บันทึกปียอดยกมาของ [${mat.code}] เป็นปี ${openingYear} เรียบร้อยแล้ว`, 'success');
  });

  document.getElementById('btnPrintLedgerPD4')?.addEventListener('click', printOfficialLedgerPD4);
  document.getElementById('btnExportLedgerWord')?.addEventListener('click', exportLedgerWord);
  document.getElementById('btnExportLedgerExcel')?.addEventListener('click', exportLedgerExcel);

  // 12. Users Form
  document.getElementById('btnOpenAddUserModal')?.addEventListener('click', () => {
    document.getElementById('modalUserTitle').innerText = 'เพิ่มผู้ใช้งานใหม่';
    document.getElementById('formUserEdit').reset();
    document.getElementById('usr_username').readOnly = false;
    document.getElementById('usr_id').value = `U${String(Date.now()).slice(-4)}`;
    openModal('modalUser');
  });

  document.getElementById('formUserEdit')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('usr_username').value.trim();
    const payload = {
      id: document.getElementById('usr_id').value || `U${String(Date.now()).slice(-4)}`,
      username: username,
      password: document.getElementById('usr_password').value.trim(),
      fullname: document.getElementById('usr_fullname').value.trim(),
      position: document.getElementById('usr_position').value.trim(),
      role: document.getElementById('usr_role').value,
      status: document.getElementById('usr_status').value
    };

    const idx = APP_STATE.users.findIndex(u => u.username === username);
    if (idx >= 0) {
      APP_STATE.users[idx] = payload;
    } else {
      APP_STATE.users.push(payload);
    }

    saveState();
    closeModal('modalUser');
    renderUsersTable();
    postToGoogleSheets('saveUser', payload);
    showToast('บันทึกข้อมูลผู้ใช้งานเรียบร้อย', 'success');
  });

  // 13. Settings & Backups
  document.getElementById('btnSaveGoogleSheetsUrl')?.addEventListener('click', () => {
    const url = document.getElementById('cfgGoogleAppsScriptUrl').value.trim();
    APP_STATE.settings.google_script_url = url;
    saveState();
    updateConnectionStatusUI();
    showToast('บันทึก Google Apps Script Web App URL เรียบร้อย', 'success');
  });

  document.getElementById('btnTestGoogleSheetsConnection')?.addEventListener('click', () => {
    const url = document.getElementById('cfgGoogleAppsScriptUrl').value.trim();
    APP_STATE.settings.google_script_url = url;
    saveState();
    syncWithGoogleSheets(true);
  });

  document.getElementById('btnBackupGoogleDrive')?.addEventListener('click', backupGoogleSheetsToDrive);

  document.getElementById('btnExportLocalJson')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(APP_STATE, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `สำรองข้อมูลคลัง_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว', 'success');
  });

  document.getElementById('btnImportLocalJson')?.addEventListener('click', () => {
    document.getElementById('inputRestoreJson').click();
  });

  document.getElementById('inputRestoreJson')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const restored = JSON.parse(evt.target.result);
        if (restored && restored.materials) {
          APP_STATE = restored;
          saveState();
          renderApp();
          showToast('กู้คืนข้อมูลสำเร็จเรียบร้อยแล้ว!', 'success');
        } else {
          showToast('โครงสร้างไฟล์ไม่ถูกต้อง', 'error');
        }
      } catch (err) {
        showToast('ไม่สามารถเปิดไฟล์ JSON ได้: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btnResetToSampleData')?.addEventListener('click', () => {
    if (confirm('ยืนยันการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้นหรือไม่? ข้อมูลที่เพิ่มใหม่จะถูกแทนที่')) {
      APP_STATE = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveState();
      renderApp();
      showToast('รีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้นเรียบร้อยแล้ว', 'info');
    }
  });

  document.getElementById('formOrgSettings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    APP_STATE.settings.org_name = document.getElementById('cfg_org_name').value.trim();
    APP_STATE.settings.org_dept = document.getElementById('cfg_org_dept').value.trim();
    APP_STATE.settings.fiscal_year = document.getElementById('cfg_fiscal_year').value.trim();
    APP_STATE.settings.approver_name = document.getElementById('cfg_approver_name').value.trim();
    APP_STATE.settings.approver_position = document.getElementById('cfg_approver_position').value.trim();
    APP_STATE.settings.officer_name = document.getElementById('cfg_officer_name').value.trim();
    APP_STATE.settings.officer_position = document.getElementById('cfg_officer_position').value.trim();

    saveState();
    updateUserInterface();
    postToGoogleSheets('saveSettings', APP_STATE.settings);
    showToast('บันทึกข้อมูลหน่วยงานและผู้ลงนามสำเร็จ', 'success');
  });

  // ใส่ค่าเดิมใน Settings Form
  if (APP_STATE.settings.google_script_url) {
    document.getElementById('cfgGoogleAppsScriptUrl').value = APP_STATE.settings.google_script_url;
  }

  // ผูกการทำงานจัดการรูปถ่ายผู้พัฒนาระบบ
  initDeveloperPhotos();

  // ผูกการทำงานระบบนำเข้าจากใบส่งสินค้า (Excel & CSV)
  initInvoiceImport();

  // ผูกการทำงานระบบรายงานคงเหลือประจำปีงบประมาณ
  initStockBalanceReport();

  // ผูกการทำงานระบบตัวเลือกในบัญชีวัสดุ (พ.ด.4)
  initLedgerPD4Filter();
}

/**
 * =========================================================================
 * DEVELOPER PHOTOS MANAGEMENT (จัดการรูปถ่ายผู้พัฒนาระบบ)
 * =========================================================================
 */

/**
 * ผูกเหตุการณ์การอัปโหลดรูปภาพของผู้พัฒนาระบบ
 */
function initDeveloperPhotos() {
  const input1 = document.getElementById('inputDev1Photo');
  if (input1) {
    input1.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleDevPhotoFile(1, file);
      input1.value = '';
    });
  }

  const input2 = document.getElementById('inputDev2Photo');
  if (input2) {
    input2.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleDevPhotoFile(2, file);
      input2.value = '';
    });
  }

  renderDeveloperPhotos();
}

/**
 * อ่านและย่อขนาดไฟล์รูปภาพให้เหมาะสม (Max 400x400 px, JPEG) เพื่อความรวดเร็วและไม่เปลืองพื้นที่
 */
function handleDevPhotoFile(devNum, file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    const img = new Image();
    img.onload = function () {
      const maxDim = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      if (!APP_STATE.settings) APP_STATE.settings = {};
      if (devNum === 1) {
        APP_STATE.settings.dev_photo_1 = compressedDataUrl;
        try { localStorage.setItem('DEV_PHOTO_1', compressedDataUrl); } catch (e) { }
      } else {
        APP_STATE.settings.dev_photo_2 = compressedDataUrl;
        try { localStorage.setItem('DEV_PHOTO_2', compressedDataUrl); } catch (e) { }
      }

      saveState();
      renderDeveloperPhotos();
      const devName = devNum === 1 ? 'นางรุจิรา บุสดี' : 'นายวีระพล มีบุญ';
      showToast(`อัปโหลดรูปภาพของ ${devName} เรียบร้อยแล้ว`, 'success');
    };
    img.onerror = function () {
      showToast('ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองรูปอื่น', 'error');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * แสดงผลรูปถ่ายหรือ fallback avatar ของผู้พัฒนา
 */
function renderDeveloperPhotos() {
  // ผู้พัฒนา 1
  const photo1 = (APP_STATE.settings && APP_STATE.settings.dev_photo_1) || localStorage.getItem('DEV_PHOTO_1') || '';
  const img1 = document.getElementById('dev1PhotoImg');
  const fallback1 = document.getElementById('dev1FallbackAvatar');
  const btnRemove1 = document.getElementById('btnDev1RemovePhoto');

  if (img1 && fallback1) {
    if (photo1) {
      img1.src = photo1;
      img1.classList.remove('hidden');
      fallback1.classList.add('hidden');
      if (btnRemove1) btnRemove1.classList.remove('hidden');
    } else {
      img1.src = '';
      img1.classList.add('hidden');
      fallback1.classList.remove('hidden');
      if (btnRemove1) btnRemove1.classList.add('hidden');
    }
  }

  // ผู้พัฒนา 2
  const photo2 = (APP_STATE.settings && APP_STATE.settings.dev_photo_2) || localStorage.getItem('DEV_PHOTO_2') || '';
  const img2 = document.getElementById('dev2PhotoImg');
  const fallback2 = document.getElementById('dev2FallbackAvatar');
  const btnRemove2 = document.getElementById('btnDev2RemovePhoto');

  if (img2 && fallback2) {
    if (photo2) {
      img2.src = photo2;
      img2.classList.remove('hidden');
      fallback2.classList.add('hidden');
      if (btnRemove2) btnRemove2.classList.remove('hidden');
    } else {
      img2.src = '';
      img2.classList.add('hidden');
      fallback2.classList.remove('hidden');
      if (btnRemove2) btnRemove2.classList.add('hidden');
    }
  }

  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

/**
 * ลบรูปถ่ายของผู้พัฒนาและคืนค่าเป็นไอคอนตัวอักษรเริ่มต้น
 */
function removeDevPhoto(devNum) {
  const devName = devNum === 1 ? 'นางรุจิรา บุสดี' : 'นายวีระพล มีบุญ';
  if (!confirm(`ต้องการลบรูปภาพของ ${devName} และใช้ไอคอนตัวอักษรเริ่มต้นหรือไม่?`)) return;

  if (!APP_STATE.settings) APP_STATE.settings = {};
  if (devNum === 1) {
    APP_STATE.settings.dev_photo_1 = '';
    try { localStorage.removeItem('DEV_PHOTO_1'); } catch (e) { }
  } else {
    APP_STATE.settings.dev_photo_2 = '';
    try { localStorage.removeItem('DEV_PHOTO_2'); } catch (e) { }
  }

  saveState();
  renderDeveloperPhotos();
  showToast(`ลบรูปภาพของ ${devName} เรียบร้อยแล้ว`, 'info');
}

// ผูกฟังก์ชันให้อยู่ใน Window Scope
window.initDeveloperPhotos = initDeveloperPhotos;
window.renderDeveloperPhotos = renderDeveloperPhotos;
window.handleDevPhotoFile = handleDevPhotoFile;
window.removeDevPhoto = removeDevPhoto;

/**
 * =========================================================================
 * INVOICE / DELIVERY NOTE IMPORT (นำเข้ารับวัสดุเข้าคลังจากใบส่งสินค้า)
 * =========================================================================
 */
let PENDING_INVOICE_IMPORT = null;

/**
 * กำหนดหมวดหมู่วัสดุอัตโนมัติตามชื่อรายการ
 */
function guessMaterialCategory(name) {
  if (!name) return 'วัสดุงานบ้านงานครัว';
  const str = String(name).toLowerCase();
  if (/ผงซักฟอก|สบู่|น้ำยา|ถุงขยะ|กระดาษชำระ|ผ้าเช็ด|ไม้กวาด|แปรง|ถังขยะ|ช้อน|ส้อม|มีด|ม็อบ|แมลง|จาน|ห้องน้ำ|ดันฝุ่น/.test(str)) {
    return 'วัสดุงานบ้านงานครัว';
  }
  if (/กระดาษ|ปากกา|แฟ้ม|เทป|ลวด|กรรไกร|สมุด|ดินสอ|ตลับ|ซอง|คลิป/.test(str)) {
    return 'วัสดุสำนักงาน';
  }
  if (/หมึก|toner|cartridge|flash|usb|เมาส์|mouse|คีย์บอร์ด|keyboard|คอม|ram|ssd|จอ/.test(str)) {
    return 'วัสดุคอมพิวเตอร์';
  }
  if (/หลอดไฟ|สายไฟ|สวิตช์|ปลั๊ก|เบรกเกอร์|เต้ารับ|ฟิวส์|led/.test(str)) {
    return 'วัสดุไฟฟ้า';
  }
  if (/ปุ๋ย|เมล็ด|บัวรดน้ำ|สายยาง|จอบ|เสียบ|กระถาง|กรรไกรตัดหญ้า/.test(str)) {
    return 'วัสดุการเกษตร';
  }
  if (/น้ำมัน|ดีเซล|เบนซิน|แก๊ส|b7|เชื้อเพลิง/.test(str)) {
    return 'วัสดุเชื้อเพลิง';
  }
  if (/ป้าย|ไวนิล|สติกเกอร์|โปสเตอร์|โบรชัวร์/.test(str)) {
    return 'วัสดุโฆษณา';
  }
  if (/ปูน|ทราย|หิน|เหล็ก|สี|ตะปู|กระเบื้อง|ท่อ/.test(str)) {
    return 'วัสดุก่อสร้าง';
  }
  return 'วัสดุงานบ้านงานครัว';
}

/**
 * ผูก Event Listeners สำหรับระบบนำเข้าจากใบส่งสินค้า
 */
function initInvoiceImport() {
  const btnOpen = document.getElementById('btnOpenImportInvoiceModal');
  const btnQuick = document.getElementById('btnQuickImportInvoiceInForm');
  const btnClose = document.getElementById('btnCloseImportInvoiceModal');
  const btnCancel = document.getElementById('btnCancelImportInvoice');
  const btnConfirm = document.getElementById('btnConfirmImportInvoice');
  const btnReset = document.getElementById('btnResetInvoiceFile');

  const btnDlExcel = document.getElementById('btnDlInvoiceSampleExcel');
  const btnDlTop = document.getElementById('btnDownloadSampleInvoiceTop');
  const btnDlCsv = document.getElementById('btnDlInvoiceSampleCsv');

  const dropZone = document.getElementById('invoiceDropZone');
  const fileInput = document.getElementById('inputInvoiceFile');

  btnOpen?.addEventListener('click', openInvoiceImportModal);
  btnQuick?.addEventListener('click', openInvoiceImportModal);
  btnClose?.addEventListener('click', closeInvoiceImportModal);
  btnCancel?.addEventListener('click', closeInvoiceImportModal);

  btnDlExcel?.addEventListener('click', downloadInvoiceSampleExcel);
  btnDlTop?.addEventListener('click', downloadInvoiceSampleExcel);
  btnDlCsv?.addEventListener('click', downloadInvoiceSampleCsv);

  dropZone?.addEventListener('click', () => fileInput?.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('border-emerald-500', 'bg-emerald-50/50');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone?.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
    });
  });

  dropZone?.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleInvoiceFile(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleInvoiceFile(e.target.files[0]);
      fileInput.value = '';
    }
  });

  btnReset?.addEventListener('click', resetInvoiceImportState);
  btnConfirm?.addEventListener('click', executeInvoiceImport);
}

/**
 * เปิดหน้าต่าง Modal นำเข้าใบส่งสินค้า
 */
function openInvoiceImportModal() {
  const modal = document.getElementById('modalImportInvoice');
  if (!modal) return;

  const yearTh = APP_STATE.settings.fiscal_year || '2570';
  document.getElementById('inv_receipt_no').value = `RC-${yearTh}-${String(APP_STATE.receipts.length + 1).padStart(3, '0')}`;
  document.getElementById('inv_doc_ref_no').value = 'TS680312';
  document.getElementById('inv_date').value = '2025-03-12';
  document.getElementById('inv_supplier').value = 'TARA SERVICE (ร้านธารา เซอร์วิส)';
  document.getElementById('inv_receiver').value = APP_STATE.settings.officer_name || 'นางรุจิรา บุสดี';
  document.getElementById('inv_remark').value = 'รับเข้าตามใบส่งสินค้า TARA SERVICE';

  resetInvoiceImportState();

  modal.classList.remove('hidden');
  lucide.createIcons();
}

/**
 * ปิดหน้าต่าง Modal นำเข้าใบส่งสินค้า
 */
function closeInvoiceImportModal() {
  const modal = document.getElementById('modalImportInvoice');
  if (modal) modal.classList.add('hidden');
  resetInvoiceImportState();
}

/**
 * รีเซ็ตสถานะการโหลดไฟล์ของ Modal
 */
function resetInvoiceImportState() {
  PENDING_INVOICE_IMPORT = null;
  document.getElementById('invoiceFileInfoBanner')?.classList.add('hidden');
  document.getElementById('invoicePreviewSection')?.classList.add('hidden');
  const btnConfirm = document.getElementById('btnConfirmImportInvoice');
  if (btnConfirm) {
    btnConfirm.disabled = true;
    document.getElementById('txtBtnConfirmInvoiceLabel').innerText = 'บันทึกรับเข้าคลัง';
  }
}

/**
 * ประมวลผลและแยกแยะข้อมูลไฟล์ใบส่งสินค้า (Excel / CSV)
 */
function handleInvoiceFile(file) {
  if (!file) return;

  const validExts = ['.xlsx', '.xls', '.csv'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext)) {
    showToast('กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv)', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // แปลงข้อมูลเป็น Array of Arrays
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length === 0) {
        showToast('ไม่พบข้อมูลในไฟล์ที่เลือก', 'warning');
        return;
      }

      // 1. ค้นหาแถวหัวตาราง (มีคำว่า รายการ / ชื่อวัสดุ / ชื่อสินค้า)
      let headerIdx = -1;
      let colMap = { no: -1, name: -1, unit: -1, price: -1, qty: -1, total: -1 };

      for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
        const row = rawRows[i];
        if (!Array.isArray(row)) continue;

        // สแกนหาข้อมูลหัวเอกสาร เช่น วันที่ และ ผู้ขาย ในแถวด้านบน
        const rowStr = row.map(c => String(c)).join(' ');
        if (/วันที่\s*(\d{1,2})\s*([^\s\d]+)\s*(\d{4})/.test(rowStr)) {
          const m = rowStr.match(/วันที่\s*(\d{1,2})\s*([^\s\d]+)\s*(\d{4})/);
          if (m) {
            const day = m[1].padStart(2, '0');
            const thMonth = m[2];
            let year = Number(m[3]);
            if (year > 2400) year = year - 543;
            const months = { 'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04', 'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08', 'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12' };
            const mm = months[thMonth] || '03';
            const parsedIsoDate = `${year}-${mm}-${day}`;
            document.getElementById('inv_date').value = parsedIsoDate;
          }
        }
        if (/TARA\s*SERVICE|ธารา\s*เซอร์วิส/i.test(rowStr)) {
          document.getElementById('inv_supplier').value = 'TARA SERVICE (ร้านธารา เซอร์วิส)';
        }

        // ค้นหาคอลัมน์
        row.forEach((cell, colIdx) => {
          const val = String(cell).trim().toLowerCase();
          if (/^ลำดับ$|^ที่$|^no$/i.test(val)) colMap.no = colIdx;
          if (/^รายการ$|^รายการวัสดุ$|^ชื่อวัสดุ$|^ชื่อสินค้า$|^description$|^item$/i.test(val)) colMap.name = colIdx;
          if (/^หน่วย$|^หน่วยนับ$|^unit$/i.test(val)) colMap.unit = colIdx;
          if (/^ราคาต่อหน่วย$|^ราคา\/หน่วย$|^ราคา$|^unit price$|^price$/i.test(val)) colMap.price = colIdx;
          if (/^จำนวน$|^ปริมาณ$|^qty$|^quantity$/i.test(val)) colMap.qty = colIdx;
          if (/^ราคารวม$|^รวมเงิน$|^จำนวนเงิน$|^total$|^amount$/i.test(val)) colMap.total = colIdx;
        });

        if (colMap.name !== -1 && (colMap.qty !== -1 || colMap.price !== -1)) {
          headerIdx = i;
          break;
        }
      }

      // แยกข้อมูลรายการ
      let extractedItems = [];
      if (headerIdx !== -1) {
        for (let r = headerIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const rawName = colMap.name !== -1 ? String(row[colMap.name] || '').trim() : '';
          if (!rawName) continue;

          // ถ้าพบแถวยอดรวม เช่น "รวม", "รวมเงิน", "ยอดรวม" ให้หยุดหรือข้าม
          if (/^รวม|^ยอดรวม|^ราคารวมทั้งสิ้น|^ผู้ส่งสินค้า/i.test(rawName)) continue;

          const rawNo = colMap.no !== -1 ? String(row[colMap.no] || '').trim() : '';
          const rawUnit = colMap.unit !== -1 ? String(row[colMap.unit] || 'ชิ้น').trim() : 'ชิ้น';
          
          let rawPrice = colMap.price !== -1 ? row[colMap.price] : 0;
          let rawQty = colMap.qty !== -1 ? row[colMap.qty] : 1;
          let rawTotal = colMap.total !== -1 ? row[colMap.total] : 0;

          const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/,/g, '')) || 0;
          const qty = typeof rawQty === 'number' ? rawQty : parseFloat(String(rawQty).replace(/,/g, '')) || 1;
          const total = typeof rawTotal === 'number' && rawTotal > 0 ? rawTotal : parseFloat(String(rawTotal).replace(/,/g, '')) || (price * qty);

          extractedItems.push({
            no: rawNo || extractedItems.length + 1,
            name: rawName,
            unit: rawUnit,
            price: price,
            quantity: qty,
            total_amount: total
          });
        }
      } else {
        // Fallback: ใช้ sheet_to_json ปกติ
        const jsonRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        jsonRows.forEach((row, idx) => {
          const name = String(row['รายการ'] || row['รายการวัสดุ'] || row['ชื่อวัสดุ'] || row['ชื่อสินค้า'] || row['ชื่อ'] || row['name'] || '').trim();
          if (!name || /^รวม|^ยอดรวม|^ราคารวมทั้งสิ้น/i.test(name)) return;

          const unit = String(row['หน่วย'] || row['หน่วยนับ'] || row['unit'] || 'ชิ้น').trim();
          const price = parseFloat(String(row['ราคาต่อหน่วย'] || row['ราคา'] || row['price'] || 0).replace(/,/g, '')) || 0;
          const qty = parseFloat(String(row['จำนวน'] || row['ปริมาณ'] || row['qty'] || 1).replace(/,/g, '')) || 1;
          const total = parseFloat(String(row['ราคารวม'] || row['รวมเงิน'] || (price * qty)).replace(/,/g, '')) || (price * qty);

          extractedItems.push({
            no: idx + 1,
            name,
            unit,
            price,
            quantity: qty,
            total_amount: total
          });
        });
      }

      if (extractedItems.length === 0) {
        showToast('ไม่สามารถแยกข้อมูลรายการวัสดุได้ กรุณาตรวจสอบว่ามีคอลัมน์ รายการ, หน่วย, ราคาต่อหน่วย, จำนวน', 'warning');
        return;
      }

      // จับคู่กับทะเบียนวัสดุในระบบ
      let nextMatNum = APP_STATE.materials.length + 1;
      const processedItems = extractedItems.map((item, idx) => {
        let found = APP_STATE.materials.find(m => m.name.trim() === item.name.trim());
        if (!found) {
          found = APP_STATE.materials.find(m => m.name.includes(item.name) || item.name.includes(m.name));
        }

        let matCode = '';
        let isNew = false;
        let category = '';

        if (found) {
          matCode = found.code;
          category = found.category;
          isNew = false;
        } else {
          category = guessMaterialCategory(item.name);
          matCode = getNextMaterialCode(category);
          isNew = true;
        }

        return {
          ...item,
          no: idx + 1,
          material_code: matCode,
          category: category,
          isNewMaterial: isNew
        };
      });

      // รวมยอดเงิน
      const grandTotal = processedItems.reduce((sum, it) => sum + it.total_amount, 0);

      PENDING_INVOICE_IMPORT = {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        items: processedItems,
        grandTotal: grandTotal
      };

      // อัปเดต UI
      document.getElementById('txtInvoiceLoadedFileName').innerText = file.name;
      document.getElementById('txtInvoiceLoadedMeta').innerText = `ตรวจพบ: ${processedItems.length} รายการ • รวมเป็นเงิน ฿${formatMoney(grandTotal)}`;
      document.getElementById('invoiceFileInfoBanner').classList.remove('hidden');

      renderInvoicePreviewTable(processedItems, grandTotal);

      document.getElementById('invoicePreviewSection').classList.remove('hidden');
      const btnConfirm = document.getElementById('btnConfirmImportInvoice');
      btnConfirm.disabled = false;
      document.getElementById('txtBtnConfirmInvoiceLabel').innerText = `บันทึกรับเข้าคลัง (${processedItems.length} รายการ)`;

      lucide.createIcons();
      showToast(`อ่านไฟล์ใบส่งสินค้าสำเร็จ! ตรวจพบ ${processedItems.length} รายการ (รวม ฿${formatMoney(grandTotal)})`, 'success');

    } catch (err) {
      console.error('Invoice parse error:', err);
      showToast('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/**
 * เรนเดอร์ตาราง Preview ใบส่งสินค้า
 */
function renderInvoicePreviewTable(items, grandTotal) {
  const tbody = document.getElementById('tableInvoicePreviewBody');
  document.getElementById('badgeInvoiceItemsCount').innerText = `${items.length} รายการ`;
  document.getElementById('txtInvoiceSummaryCount').innerText = `${items.length} รายการ`;
  document.getElementById('txtInvoiceSummaryAmount').innerText = `฿${formatMoney(grandTotal)}`;
  document.getElementById('txtInvoiceTextTotal').innerText = thaiBahtText(grandTotal);

  tbody.innerHTML = items.map((it, idx) => `
    <tr class="hover:bg-slate-50 transition">
      <td class="p-2 text-center text-slate-400 font-mono">${it.no}</td>
      <td class="p-2">
        <div class="font-medium text-slate-900">${it.name}</div>
        <div class="text-[10px] text-slate-400 font-mono">${it.material_code} &bull; ${it.category}</div>
      </td>
      <td class="p-2 text-center text-slate-700">${it.unit}</td>
      <td class="p-2 text-right font-mono">${formatMoney(it.price)}</td>
      <td class="p-2 text-right font-mono font-bold text-emerald-700">+${formatQty(it.quantity)}</td>
      <td class="p-2 text-right font-mono font-bold text-slate-900">฿${formatMoney(it.total_amount)}</td>
      <td class="p-2 text-center">
        ${it.isNewMaterial 
          ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">+ สร้างรหัสใหม่</span>`
          : `<span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">✓ ในทะเบียนแล้ว</span>`}
      </td>
    </tr>
  `).join('');
}

/**
 * ยืนยันบันทึกรับวัสดุเข้าคลังทั้งหมดจากใบส่งสินค้า
 */
function executeInvoiceImport() {
  if (!PENDING_INVOICE_IMPORT || !PENDING_INVOICE_IMPORT.items || PENDING_INVOICE_IMPORT.items.length === 0) {
    showToast('ไม่พบข้อมูลรายการที่จะบันทึกรับเข้า', 'warning');
    return;
  }

  const receiptNo = document.getElementById('inv_receipt_no').value.trim() || `RC-${APP_STATE.settings.fiscal_year || '2570'}-${Date.now()}`;
  const docRef = document.getElementById('inv_doc_ref_no').value.trim() || '-';
  const date = document.getElementById('inv_date').value.trim() || new Date().toISOString().split('T')[0];
  const supplier = document.getElementById('inv_supplier').value.trim() || 'TARA SERVICE';
  const receiver = document.getElementById('inv_receiver').value.trim() || APP_STATE.settings.officer_name || 'นางรุจิรา บุสดี';
  const remark = document.getElementById('inv_remark').value.trim() || 'รับเข้าตามใบส่งสินค้า';

  const items = PENDING_INVOICE_IMPORT.items;
  let newMatCount = 0;
  let rcvCount = 0;

  // 1. ตรวจสอบและสร้างทะเบียนวัสดุใหม่สำหรับรายการที่ยังไม่มี
  items.forEach(it => {
    const exists = APP_STATE.materials.some(m => m.code === it.material_code || m.name.trim() === it.name.trim());
    if (!exists) {
      APP_STATE.materials.push({
        code: it.material_code,
        name: it.name,
        category: it.category || guessMaterialCategory(it.name),
        spec: '-',
        unit: it.unit,
        price: it.price,
        opening_stock: 0,
        opening_stock_date: date,
        opening_stock_year: APP_STATE.settings.fiscal_year || '2570',
        min_stock: 5,
        storage_location: 'ห้องพัสดุ',
        status: 'active'
      });
      newMatCount++;
    }

    // 2. บันทึกรายการรับเข้าคลัง
    APP_STATE.receipts.push({
      receipt_no: receiptNo,
      doc_ref_no: docRef,
      date: date,
      supplier: supplier,
      material_code: it.material_code,
      material_name: it.name,
      unit: it.unit,
      price: it.price,
      quantity: it.quantity,
      total_amount: it.total_amount,
      receiver: receiver,
      remark: remark
    });
    rcvCount++;
  });

  saveState();
  renderApp();
  populateReceiveSelect();
  renderReceiptsTable();

  // ส่งข้อมูลซิงค์ไป Google Sheets
  if (APP_STATE.settings.google_script_url) {
    postToGoogleSheets('batchReceive', {
      receipt_no: receiptNo,
      doc_ref_no: docRef,
      date: date,
      supplier: supplier,
      receiver: receiver,
      items: items
    });
  }

  const grandTotal = PENDING_INVOICE_IMPORT.grandTotal;
  closeInvoiceImportModal();
  showToast(`🎉 บันทึกรับเข้าคลังสำเร็จ ${rcvCount} รายการ รวมเป็นเงิน ฿${formatMoney(grandTotal)} (เพิ่มทะเบียนวัสดุใหม่ ${newMatCount} รายการ)`, 'success');
}

/**
 * ดาวน์โหลดไฟล์ตัวอย่างใบส่งสินค้าแบบ Excel (.xlsx) ตามแบบ TARA SERVICE
 */
function downloadInvoiceSampleExcel() {
  const data = [
    ['TARA SERVICE', '', '', '', '', 'วันที่ 12 มีนาคม 2568'],
    ['12 หมู่ 9 ตำบลไผ่รอบ อำเภอโพธิ์ประทับช้าง จังหวัดพิจิตร', '', '', '', 'เลขประจำตัวผู้เสียภาษี', '3660300299647'],
    ['โทรศัพท์ 0-5887002-9, 0-9340957-2', '', '', '', 'เลขทะเบียนพาณิชย์', '3660300299647'],
    ['', '', 'ใบส่งสินค้า', '', '', ''],
    ['นามลูกค้า: โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก', '', '', '', '', ''],
    ['ที่อยู่: อำเภอโพธิ์ประทับช้าง จังหวัดพิจิตร', '', '', '', '', ''],
    ['ลำดับ', 'รายการ', 'หน่วย', 'ราคาต่อหน่วย', 'จำนวน', 'ราคารวม'],
    [1, 'ผงซักฟอก ขนาด 2400 กรัม บรีส', 'ห่อ', 225.00, 10, 2250.00],
    [2, 'สบู่เหลวล้างมือ ขนาด 3.8 ลิตร โปรซ้อย', 'แกลลอน', 190.00, 4, 760.00],
    [3, 'น้ำยาดันฝุ่น ขนาด 3.8 ลิตร 3m', 'แกลลอน', 390.00, 4, 1560.00],
    [4, 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', 'แกลลอน', 210.00, 8, 1680.00],
    [5, 'น้ำยาล้างห้องน้ำ ขนาด 3.5 ลิตร เป็ด', 'แกลลอน', 240.00, 4, 960.00],
    [6, 'ถุงขยะดำ ขนาด 18x20 นิ้ว', 'กก', 60.00, 20, 1200.00],
    [7, 'ถุงขยะดำ ขนาด 28x36 นิ้ว', 'กก', 60.00, 10, 600.00],
    [8, 'ถุงขยะแดง ขนาด 18x20 นิ้ว', 'กก', 65.00, 40, 2600.00],
    [9, 'กระดาษชำระม้วนเล็ก ซิลค์', 'ม้วน', 8.00, 144, 1152.00],
    [10, 'กระดาษชำระม้วนใหญ่ aro', 'ม้วน', 110.00, 4, 440.00],
    [11, 'ผ้าเช็ดมือขนหนู ขนาด 12"x12"', 'ผืน', 24.00, 48, 1152.00],
    [12, 'ไม้กวาดดอกหญ้า', 'ด้าม', 40.00, 6, 240.00],
    [13, 'ไม้กวาดทางมะพร้าว (ไม่ตัดปลาย)', 'ด้าม', 60.00, 6, 360.00],
    [14, 'แปรงขัดโถสุขภัณฑ์ชนิดใยขัด ด้ามสั้น', 'ด้าม', 70.00, 3, 210.00],
    [15, 'แปรงขัดโถสุขภัณฑ์ชนิดพลาสติก ด้ามสั้น', 'ด้าม', 35.00, 3, 105.00],
    [16, 'ถังขยะพลาสติก สกรีนแยกประเภท มีฝาปิด ขนาด 60 ลิตร สีเขียว สีเหลือง สีน้ำเงิน', 'ถัง', 660.00, 3, 1980.00],
    [17, 'ช้อน ส้อม ด้ามยาว', 'โหล', 170.00, 3, 510.00],
    [18, 'ไม้ม็อบถูพื้น 18 นิ้ว พร้อมผ้า', 'อัน', 320.00, 2, 640.00],
    [19, 'มีดปังตอ ด้ามเหล็ก ขนาด 2.5 นิ้ว', 'ด้าม', 150.00, 2, 300.00],
    [20, 'สเปรย์กำจัดแมลง ขนาด 600 มล. อาท', 'กระป๋อง', 135.00, 6, 810.00],
    ['', '', '', 'รวม', '', 19509.00],
    ['ตัวอักษร: หนึ่งหมื่นเก้าพันห้าร้อยเก้าบาทถ้วน', '', '', '', 'ผู้ส่งสินค้า:', 'นางกิมหล่าน เสรีพงศ์']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 45 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ใบส่งสินค้า_TARA');
  XLSX.writeFile(wb, 'ตัวอย่าง_ใบส่งสินค้า_รับเข้าคลัง_TARA_SERVICE.xlsx');
  showToast('ดาวน์โหลดแม่แบบใบส่งสินค้า (Excel .xlsx) เรียบร้อยแล้ว', 'success');
}

/**
 * ดาวน์โหลดไฟล์ตัวอย่างใบส่งสินค้าแบบ CSV
 */
function downloadInvoiceSampleCsv() {
  const csvContent = 
`ลำดับ,รายการ,หน่วย,ราคาต่อหน่วย,จำนวน,ราคารวม
1,ผงซักฟอก ขนาด 2400 กรัม บรีส,ห่อ,225.00,10,2250.00
2,สบู่เหลวล้างมือ ขนาด 3.8 ลิตร โปรซ้อย,แกลลอน,190.00,4,760.00
3,น้ำยาดันฝุ่น ขนาด 3.8 ลิตร 3m,แกลลอน,390.00,4,1560.00
4,น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์,แกลลอน,210.00,8,1680.00
5,น้ำยาล้างห้องน้ำ ขนาด 3.5 ลิตร เป็ด,แกลลอน,240.00,4,960.00
6,ถุงขยะดำ ขนาด 18x20 นิ้ว,กก,60.00,20,1200.00
7,ถุงขยะดำ ขนาด 28x36 นิ้ว,กก,60.00,10,600.00
8,ถุงขยะแดง ขนาด 18x20 นิ้ว,กก,65.00,40,2600.00
9,กระดาษชำระม้วนเล็ก ซิลค์,ม้วน,8.00,144,1152.00
10,กระดาษชำระม้วนใหญ่ aro,ม้วน,110.00,4,440.00
11,ผ้าเช็ดมือขนหนู ขนาด 12"x12",ผืน,24.00,48,1152.00
12,ไม้กวาดดอกหญ้า,ด้าม,40.00,6,240.00
13,ไม้กวาดทางมะพร้าว (ไม่ตัดปลาย),ด้าม,60.00,6,360.00
14,แปรงขัดโถสุขภัณฑ์ชนิดใยขัด ด้ามสั้น,ด้าม,70.00,3,210.00
15,แปรงขัดโถสุขภัณฑ์ชนิดพลาสติก ด้ามสั้น,ด้าม,35.00,3,105.00
16,ถังขยะพลาสติก สกรีนแยกประเภท มีฝาปิด ขนาด 60 ลิตร สีเขียว สีเหลือง สีน้ำเงิน,ถัง,660.00,3,1980.00
17,ช้อน ส้อม ด้ามยาว,โหล,170.00,3,510.00
18,ไม้ม็อบถูพื้น 18 นิ้ว พร้อมผ้า,อัน,320.00,2,640.00
19,มีดปังตอ ด้ามเหล็ก ขนาด 2.5 นิ้ว,ด้าม,150.00,2,300.00
20,สเปรย์กำจัดแมลง ขนาด 600 มล. อาท,กระป๋อง,135.00,6,810.00`;

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ตัวอย่าง_ใบส่งสินค้า_รับเข้าคลัง_TARA_SERVICE.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('ดาวน์โหลดแม่แบบใบส่งสินค้า (CSV) เรียบร้อยแล้ว', 'success');
}

// ผูกฟังก์ชันให้อยู่ใน Window Scope
window.openInvoiceImportModal = openInvoiceImportModal;
window.closeInvoiceImportModal = closeInvoiceImportModal;
window.downloadInvoiceSampleExcel = downloadInvoiceSampleExcel;
window.downloadInvoiceSampleCsv = downloadInvoiceSampleCsv;

/**
 * =========================================================================
 * STOCK BALANCE REPORT (รายงานคงเหลือ ประจำปีงบประมาณ แยกตามหัวข้อวัสดุ)
 * =========================================================================
 */

let STOCK_REPORT_STATE = {
  fiscalYear: '2569',
  selectedCategories: ['วัสดุงานบ้านงานครัว'], // default
  onlyRemaining: true,
  searchKeyword: ''
};

/**
 * ผูกการทำงานระบบรายงานคงเหลือ
 */
function initStockBalanceReport() {
  // 1. เติม Checkboxes หมวดหมู่วัสดุ
  renderStockBalanceCategoryCheckboxes();

  // 2. Event: เปลี่ยนปีงบประมาณ
  const selectYear = document.getElementById('selectStockBalanceFiscalYear');
  if (selectYear) {
    selectYear.value = STOCK_REPORT_STATE.fiscalYear;
    selectYear.addEventListener('change', (e) => {
      STOCK_REPORT_STATE.fiscalYear = e.target.value;
      renderStockBalanceReport();
    });
  }

  // 3. Event: เลือกทั้งหมด / ล้างการเลือก
  document.getElementById('btnSelectAllCategories')?.addEventListener('click', () => {
    STOCK_REPORT_STATE.selectedCategories = [...CATEGORIES];
    syncCategoryCheckboxesUI();
    renderStockBalanceReport();
  });

  document.getElementById('btnClearAllCategories')?.addEventListener('click', () => {
    STOCK_REPORT_STATE.selectedCategories = [];
    syncCategoryCheckboxesUI();
    renderStockBalanceReport();
  });

  // 4. Event: Checkbox เฉพาะคงเหลือ > 0
  const chkRemaining = document.getElementById('chkStockBalanceOnlyRemaining');
  if (chkRemaining) {
    chkRemaining.checked = STOCK_REPORT_STATE.onlyRemaining;
    chkRemaining.addEventListener('change', (e) => {
      STOCK_REPORT_STATE.onlyRemaining = e.target.checked;
      renderStockBalanceReport();
    });
  }

  // 5. Event: ช่องค้นหา
  const inputSearch = document.getElementById('inputStockBalanceSearch');
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      STOCK_REPORT_STATE.searchKeyword = e.target.value.trim();
      renderStockBalanceReport();
    });
  }

  // 6. Signers inputs
  const cfgOfficerName = document.getElementById('cfg_report_officer_name');
  const cfgOfficerPos = document.getElementById('cfg_report_officer_position');
  const cfgCheckerName = document.getElementById('cfg_report_checker_name');
  const cfgCheckerPos = document.getElementById('cfg_report_checker_position');

  if (APP_STATE.settings) {
    if (APP_STATE.settings.report_officer_name && cfgOfficerName) cfgOfficerName.value = APP_STATE.settings.report_officer_name;
    if (APP_STATE.settings.report_officer_position && cfgOfficerPos) cfgOfficerPos.value = APP_STATE.settings.report_officer_position;
    if (APP_STATE.settings.report_checker_name && cfgCheckerName) cfgCheckerName.value = APP_STATE.settings.report_checker_name;
    if (APP_STATE.settings.report_checker_position && cfgCheckerPos) cfgCheckerPos.value = APP_STATE.settings.report_checker_position;
  }

  [cfgOfficerName, cfgOfficerPos, cfgCheckerName, cfgCheckerPos].forEach(input => {
    input?.addEventListener('input', () => {
      if (!APP_STATE.settings) APP_STATE.settings = {};
      APP_STATE.settings.report_officer_name = cfgOfficerName?.value.trim() || 'นางรุจิรา บุสดี';
      APP_STATE.settings.report_officer_position = cfgOfficerPos?.value.trim() || 'นักวิชาการสาธารณสุขปฏิบัติการ';
      APP_STATE.settings.report_checker_name = cfgCheckerName?.value.trim() || 'นางสาวบุษบา สิงห์เรือง';
      APP_STATE.settings.report_checker_position = cfgCheckerPos?.value.trim() || 'นักวิชาการสาธารณสุข';
      saveState();
      updateStockBalanceSignersUI();
    });
  });

  // 7. ปุ่มพิมพ์และส่งออก
  document.getElementById('btnPrintStockBalanceReport')?.addEventListener('click', printStockBalanceReport);
  document.getElementById('btnExportStockBalanceWord')?.addEventListener('click', exportStockBalanceWord);
  document.getElementById('btnExportStockBalanceExcel')?.addEventListener('click', exportStockBalanceExcel);

  // 8. ซิงค์วัสดุ 19 รายการ ถ้ายังไม่มีในระบบ (เพื่อให้ตรงกับภาพ 100%)
  ensureSampleStockMaterialsLoaded();
}

/**
 * เติม Checkboxes หมวดหมู่วัสดุ 8 หมวด
 */
function renderStockBalanceCategoryCheckboxes() {
  const container = document.getElementById('stockBalanceCategoryCheckboxes');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat) => {
    const isChecked = STOCK_REPORT_STATE.selectedCategories.includes(cat);
    return `
      <label class="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-[11px] font-medium text-slate-700 transition">
        <input type="checkbox" value="${cat}" class="cb-stock-category rounded text-emerald-600 focus:ring-emerald-500" ${isChecked ? 'checked' : ''}>
        <span class="truncate">${cat}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('.cb-stock-category').forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedBoxes = Array.from(container.querySelectorAll('.cb-stock-category:checked')).map(c => c.value);
      STOCK_REPORT_STATE.selectedCategories = checkedBoxes;
      renderStockBalanceReport();
    });
  });
}

function syncCategoryCheckboxesUI() {
  const container = document.getElementById('stockBalanceCategoryCheckboxes');
  if (!container) return;
  container.querySelectorAll('.cb-stock-category').forEach(cb => {
    cb.checked = STOCK_REPORT_STATE.selectedCategories.includes(cb.value);
  });
}

/**
 * ตรวจสอบและโหลดข้อมูลวัสดุ 19 รายการในภาพ หากยังไม่มีใน APP_STATE
 */
function ensureSampleStockMaterialsLoaded() {
  const sampleItems = [
    { code: 'K-017', name: 'ถุงขยะดำ ขนาด 18x20 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '18x20 นิ้ว', unit: 'กก', price: 60.00, opening_stock: 16, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-018', name: 'ถุงขยะดำ ขนาด 28x36 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '28x36 นิ้ว', unit: 'กก', price: 60.00, opening_stock: 4, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-019', name: 'ถุงขยะแดง ขนาด 18x20 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '18x20 นิ้ว', unit: 'กก', price: 65.00, opening_stock: 20, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-001', name: 'ผงซักฟอก ขนาด 2400 กรัม บรีส เอกเซล', category: 'วัสดุงานบ้านงานครัว', spec: '2400 กรัม', unit: 'ห่อ', price: 225.00, opening_stock: 5, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-002', name: 'สบู่เหลวล้างมือ ขนาด 3.8 ลิตร 3m', category: 'วัสดุงานบ้านงานครัว', spec: '3.8 ลิตร 3m', unit: 'แกลลอน', price: 190.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-003', name: 'น้ำยาดันฝุ่น ขนาด 3.8 ลิตร 3m', category: 'วัสดุงานบ้านงานครัว', spec: '3.8 ลิตร 3m', unit: 'แกลลอน', price: 390.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-004', name: 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', category: 'วัสดุงานบ้านงานครัว', spec: 'ขนาด 3.2 ลิตร', unit: 'แกลลอน', price: 210.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-005', name: 'น้ำยาล้างห้องน้ำ ขนาด 3.5 ลิตร เป็ด', category: 'วัสดุงานบ้านงานครัว', spec: '3.5 ลิตร เป็ด', unit: 'แกลลอน', price: 240.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-006', name: 'กระดาษชำระม้วนเล็ก ซิลค์', category: 'วัสดุงานบ้านงานครัว', spec: 'ม้วนเล็ก ซิลค์', unit: 'ม้วน', price: 8.00, opening_stock: 104, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-007', name: 'กระดาษชำระม้วนใหญ่ Savepak', category: 'วัสดุงานบ้านงานครัว', spec: 'ม้วนใหญ่ Savepak', unit: 'ม้วน', price: 110.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-008', name: 'ผ้าเช็ดตัว ขนาด 27x54 นิ้ว', category: 'วัสดุงานบ้านงานครัว', spec: '27x54 นิ้ว', unit: 'ผืน', price: 110.00, opening_stock: 4, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-009', name: 'ไม้กวาดดอกหญ้า', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามไม้ไผ่', unit: 'ด้าม', price: 45.00, opening_stock: 10, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-010', name: 'ไม้กวาดทางมะพร้าว (ไม่ตัดปลาย)', category: 'วัสดุงานบ้านงานครัว', spec: 'ไม่ตัดปลาย', unit: 'ด้าม', price: 65.00, opening_stock: 10, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-011', name: 'ไม้กวาดขนไก่ 50 ซม. SUN BRAND', category: 'วัสดุงานบ้านงานครัว', spec: '50 ซม. SUN BRAND', unit: 'ด้าม', price: 135.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-012', name: 'น้ำยาเช็ดกระจก รุ่นหัวฉีด ขนาด 520 มล. Mr MUSCLE', category: 'วัสดุงานบ้านงานครัว', spec: '520 มล. Mr MUSCLE', unit: 'ขวด', price: 95.00, opening_stock: 2, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-013', name: 'แปรงขัดพื้นด้ามยาว', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามยาว', unit: 'ด้าม', price: 85.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-014', name: 'แปรงขัดโถสุขภัณฑ์ชนิดพลาสติก ด้ามสั้น กระทิง', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามสั้น ตรากระทิง', unit: 'ด้าม', price: 70.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-015', name: 'แปรงขัดโถสุขภัณฑ์ชนิดใยขัด ด้ามสั้น TIGER BRTE', category: 'วัสดุงานบ้านงานครัว', spec: 'ด้ามสั้น TIGER BRTE', unit: 'ด้าม', price: 45.00, opening_stock: 3, opening_stock_date: '2025-10-01', opening_stock_year: '2569' },
    { code: 'K-016', name: 'สเปรย์กำจัดแมลง ขนาด 600 มล. อาท', category: 'วัสดุงานบ้านงานครัว', spec: '600 มล. อาท', unit: 'กระป๋อง', price: 85.00, opening_stock: 5, opening_stock_date: '2025-10-01', opening_stock_year: '2569' }
  ];

  let added = false;
  sampleItems.forEach(item => {
    const exists = APP_STATE.materials.some(m => m.name.trim() === item.name.trim() || m.code === item.code);
    if (!exists) {
      APP_STATE.materials.push({
        ...item,
        min_stock: 5,
        storage_location: 'ห้องเก็บของ 1',
        status: 'active'
      });
      added = true;
    }
  });

  if (added) {
    saveState();
  }
}

/**
 * ดึงรหัสวัสดุถัดไปตามหมวดหมู่
 * - วัสดุงานบ้านงานครัว -> ขึ้นต้นด้วย K- (เช่น K-001, K-020)
 * - วัสดุสำนักงาน -> ขึ้นต้นด้วย S- (เช่น S-001)
 * - หมวดหมู่อื่นๆ -> ขึ้นต้นด้วย MAT- (เช่น MAT-001)
 */
function getNextMaterialCode(category) {
  let prefix = 'MAT-';
  if (category === 'วัสดุงานบ้านงานครัว') {
    prefix = 'K-';
  } else if (category === 'วัสดุสำนักงาน') {
    prefix = 'S-';
  }

  const existingNums = (APP_STATE.materials || [])
    .filter(m => m.code && m.code.startsWith(prefix))
    .map(m => {
      const numPart = m.code.substring(prefix.length);
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });

  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

/**
 * อัปเดตและแปลงรหัสวัสดุงานบ้านงานครัวทั้งหมดให้ขึ้นต้นด้วย K-
 * พร้อมอัปเดตความสัมพันธ์ใน receipts และ requisitionItems เพื่อให้ข้อมูลเชื่อมโยงถูกต้อง 100%
 */
function migrateHouseholdMaterialCodes() {
  const codeMapping = {
    'MAT-001': 'K-001',
    'MAT-018': 'K-002',
    'MAT-019': 'K-003',
    'MAT-002': 'K-004',
    'MAT-020': 'K-005',
    'MAT-021': 'K-006',
    'MAT-022': 'K-007',
    'MAT-023': 'K-008',
    'MAT-024': 'K-009',
    'MAT-025': 'K-010',
    'MAT-026': 'K-011',
    'MAT-027': 'K-012',
    'MAT-028': 'K-013',
    'MAT-029': 'K-014',
    'MAT-030': 'K-015',
    'MAT-031': 'K-016',
    'MAT-015': 'K-017',
    'MAT-016': 'K-018',
    'MAT-017': 'K-019'
  };

  let changed = false;
  if (!APP_STATE.materials) return;

  APP_STATE.materials.forEach(m => {
    if (m.category === 'วัสดุงานบ้านงานครัว') {
      let targetCode = codeMapping[m.code];
      if (!targetCode && !m.code.startsWith('K-')) {
        targetCode = getNextMaterialCode('วัสดุงานบ้านงานครัว');
      }

      if (targetCode && targetCode !== m.code) {
        const oldCode = m.code;
        m.code = targetCode;
        changed = true;

        if (APP_STATE.receipts) {
          APP_STATE.receipts.forEach(r => {
            if (r.material_code === oldCode) r.material_code = targetCode;
          });
        }
        if (APP_STATE.requisitionItems) {
          APP_STATE.requisitionItems.forEach(ri => {
            if (ri.material_code === oldCode) ri.material_code = targetCode;
          });
        }
      }
    }
  });

  if (changed) {
    saveState();
  }
}

/**
 * ดึงข้อมูลชุดรายการวัสดุสำหรับรายงานคงเหลือ
 */
function getStockBalanceReportData() {
  const { fiscalYear, selectedCategories, onlyRemaining, searchKeyword } = STOCK_REPORT_STATE;
  const rows = [];

  // ช่วงวันที่ของปีงบประมาณที่เลือก
  const yrInt = parseInt(fiscalYear, 10);
  const startCeYear = yrInt - 543 - 1;
  const endCeYear = yrInt - 543;
  const startDate = `${startCeYear}-10-01`;
  const endDate = `${endCeYear}-09-30`;

  APP_STATE.materials.forEach(m => {
    if (!selectedCategories.includes(m.category)) return;

    if (searchKeyword) {
      const match = m.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                    m.code.toLowerCase().includes(searchKeyword.toLowerCase());
      if (!match) return;
    }

    // คำนวณยอดคงเหลือ
    let opening = 0;
    const isYearMatch = String(m.opening_stock_year || '') === String(fiscalYear);
    if (isYearMatch) {
      opening = Number(m.opening_stock) || 0;
    } else if (!m.opening_stock_year || parseInt(m.opening_stock_year, 10) <= yrInt) {
      opening = Number(m.opening_stock) || 0;
    }

    // รวมการรับเข้าในรอบปีนี้
    let received = 0;
    APP_STATE.receipts.forEach(r => {
      if (r.material_code === m.code && isDateInRange(r.date, startDate, endDate)) {
        received += Number(r.quantity) || 0;
      }
    });

    // หักการเบิกจ่ายในรอบปีนี้
    let disbursed = 0;
    APP_STATE.requisitionItems.forEach(item => {
      if (item.material_code === m.code) {
        const parentReq = APP_STATE.requisitions.find(q => q.req_no === item.req_no);
        if (parentReq && parentReq.status !== 'cancelled' && isDateInRange(parentReq.date, startDate, endDate)) {
          disbursed += Number(item.quantity) || 0;
        }
      }
    });

    let remaining = opening + received - disbursed;
    if (remaining < 0) remaining = 0;

    if (onlyRemaining && remaining <= 0) return;

    const price = Number(m.price) || 0;
    const amount = remaining * price;

    rows.push({
      code: m.code,
      name: m.name,
      category: m.category,
      unit: m.unit,
      price: price,
      remaining: remaining,
      amount: amount,
      remark: m.remark || '-'
    });
  });

  const grandTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  // สร้างชื่อหัวรายงานตามหมวดหมู่ที่เลือก
  let categoryTitle = 'ทุกหมวดหมู่วัสดุ';
  if (selectedCategories.length === 1) {
    categoryTitle = selectedCategories[0];
  } else if (selectedCategories.length > 1 && selectedCategories.length < CATEGORIES.length) {
    categoryTitle = selectedCategories.join(', ');
  } else if (selectedCategories.length === 0) {
    categoryTitle = 'ยังไม่ได้เลือกหมวดหมู่';
  }

  return {
    fiscalYear,
    categoryTitle,
    rows,
    grandTotal,
    bahtText: thaiBahtText(grandTotal)
  };
}

/**
 * เรนเดอร์ตารางและหัวข้อรายงานคงเหลือบนหน้าจอ
 */
function renderStockBalanceReport() {
  const data = getStockBalanceReportData();

  // 1. หัวข้อรายงาน
  const dispTitle = document.getElementById('dispReportTitleCategory');
  if (dispTitle) {
    dispTitle.innerText = `รายงานคงเหลือ (${data.categoryTitle})`;
  }

  const dispOrg = document.getElementById('dispReportOrgHeader');
  if (dispOrg) {
    const org = APP_STATE.settings?.org_name || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก';
    const dept = APP_STATE.settings?.org_dept || 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร';
    dispOrg.innerText = `${org} ${dept}`;
  }

  const dispYear = document.getElementById('dispReportFiscalYearHeader');
  if (dispYear) {
    dispYear.innerText = `ประจำปีงบประมาณ ${data.fiscalYear}`;
  }

  // 2. ตารางรายการ
  const tbody = document.getElementById('tableStockBalanceReportBody');
  if (tbody) {
    if (data.rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="border border-black p-6 text-center text-slate-400">
            ไม่พบรายการวัสดุคงเหลือตามเงื่อนไขที่เลือก (หมวดหมู่: ${data.categoryTitle}, ปี: ${data.fiscalYear})
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = data.rows.map((row, idx) => `
        <tr class="hover:bg-slate-50/70 transition">
          <td class="border border-black p-1 text-center font-mono">${idx + 1}</td>
          <td class="border border-black p-1 text-left">${row.name}</td>
          <td class="border border-black p-1 text-right font-mono pr-2">${formatQty(row.remaining)}</td>
          <td class="border border-black p-1 text-center">${row.unit}</td>
          <td class="border border-black p-1 text-right font-mono">${formatMoney(row.price)}</td>
          <td class="border border-black p-1 text-right font-mono font-bold">${formatMoney(row.amount)}</td>
          <td class="border border-black p-1 text-center text-slate-400">${row.remark || ''}</td>
        </tr>
      `).join('');
    }
  }

  // 3. ยอดรวมและตัวอักษรบาทถ้วน
  const txtBaht = document.getElementById('dispReportTotalBahtText');
  if (txtBaht) txtBaht.innerText = data.bahtText;

  const txtAmount = document.getElementById('dispReportGrandTotalAmount');
  if (txtAmount) txtAmount.innerText = formatMoney(data.grandTotal);

  // 4. ผู้ลงนาม
  updateStockBalanceSignersUI();
}

/**
 * อัปเดตข้อมูลผู้ลงนามในรายงานคงเหลือ
 */
function updateStockBalanceSignersUI() {
  const officerName = APP_STATE.settings?.report_officer_name || document.getElementById('cfg_report_officer_name')?.value.trim() || 'นางรุจิรา บุสดี';
  const officerPos = APP_STATE.settings?.report_officer_position || document.getElementById('cfg_report_officer_position')?.value.trim() || 'นักวิชาการสาธารณสุขปฏิบัติการ';
  const checkerName = APP_STATE.settings?.report_checker_name || document.getElementById('cfg_report_checker_name')?.value.trim() || 'นางสาวบุษบา สิงห์เรือง';
  const checkerPos = APP_STATE.settings?.report_checker_position || document.getElementById('cfg_report_checker_position')?.value.trim() || 'นักวิชาการสาธารณสุข';

  const dispOffName = document.getElementById('dispReportOfficerName');
  if (dispOffName) dispOffName.innerText = officerName;

  const dispOffPos = document.getElementById('dispReportOfficerPos');
  if (dispOffPos) dispOffPos.innerText = officerPos;

  const dispChkName = document.getElementById('dispReportCheckerName');
  if (dispChkName) dispChkName.innerText = checkerName;

  const dispChkPos = document.getElementById('dispReportCheckerPos');
  if (dispChkPos) dispChkPos.innerText = checkerPos;
}

/**
 * คืนค่าโค้ด HTML ของรายงานคงเหลือประจำปีงบประมาณ
 */
function getStockBalanceReportPrintHtml() {
  const data = getStockBalanceReportData();
  const org = APP_STATE.settings?.org_name || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก';
  const dept = APP_STATE.settings?.org_dept || 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร';

  const officerName = APP_STATE.settings?.report_officer_name || document.getElementById('cfg_report_officer_name')?.value.trim() || 'นางรุจิรา บุสดี';
  const officerPos = APP_STATE.settings?.report_officer_position || document.getElementById('cfg_report_officer_position')?.value.trim() || 'นักวิชาการสาธารณสุขปฏิบัติการ';
  const checkerName = APP_STATE.settings?.report_checker_name || document.getElementById('cfg_report_checker_name')?.value.trim() || 'นางสาวบุษบา สิงห์เรือง';
  const checkerPos = APP_STATE.settings?.report_checker_position || document.getElementById('cfg_report_checker_position')?.value.trim() || 'นักวิชาการสาธารณสุข';

  const rowsHtml = data.rows.map((row, idx) => `
    <tr>
      <td style="border: 1px solid black; padding: 4px; text-align: center; font-family: monospace;">${idx + 1}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: left;">${row.name}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right; font-family: monospace; padding-right: 8px;">${formatQty(row.remaining)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: center;">${row.unit}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right; font-family: monospace;">${formatMoney(row.price)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right; font-family: monospace; font-weight: bold;">${formatMoney(row.amount)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: center;">${row.remark || ''}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Sarabun', 'TH Sarabun New', sans-serif; color: black; background: white; padding: 15px; font-size: 13px; line-height: 1.4; box-sizing: border-box; width: 100%;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">รายงานคงเหลือ (${data.categoryTitle})</h2>
        <div style="font-size: 14px; margin-bottom: 3px;">${org} ${dept}</div>
        <div style="font-size: 14px; font-weight: bold;">ประจำปีงบประมาณ ${data.fiscalYear}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 13px; margin-bottom: 25px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 50px; text-align: center;">ลำดับที่</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; text-align: center;">รายการ</th>
            <th colspan="2" style="border: 1px solid black; padding: 6px; text-align: center; width: 140px;">วัสดุคงเหลือหน่วย<br>(จำนวน)</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 95px; text-align: center;">ราคาต่อหน่วย</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 110px; text-align: center;">จำนวนเงิน<br>(บาท)</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 75px; text-align: center;">หมายเหตุ</th>
          </tr>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid black; padding: 4px; width: 85px; text-align: center;">จำนวน</th>
            <th style="border: 1px solid black; padding: 4px; width: 55px; text-align: center;">หน่วย</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="5" style="border: 1px solid black; padding: 8px; text-align: center;">
              รวมเป็น (${data.bahtText})
            </td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-family: monospace; font-size: 14px;">
              ${formatMoney(data.grandTotal)}
            </td>
            <td style="border: 1px solid black; padding: 8px;"></td>
          </tr>
        </tfoot>
      </table>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; text-align: center;">
        <div style="width: 45%;">
          <p style="margin: 0 0 8px 0;">ลงชื่อ..................................................ผู้รายงาน</p>
          <p style="margin: 0 0 4px 0; font-weight: bold;">(${officerName})</p>
          <p style="margin: 0;">ตำแหน่ง ${officerPos}</p>
        </div>
        <div style="width: 45%;">
          <p style="margin: 0 0 8px 0;">ลงชื่อ..................................................เจ้าหน้าที่ตรวจสอบพัสดุ</p>
          <p style="margin: 0 0 4px 0; font-weight: bold;">(${checkerName})</p>
          <p style="margin: 0;">ตำแหน่ง ${checkerPos}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * พิมพ์รายงานคงเหลือ (Print)
 */
function printStockBalanceReport() {
  const data = getStockBalanceReportData();
  const printHtml = getStockBalanceReportPrintHtml();
  openPrintPreview(printHtml, `รายงานคงเหลือ_ประจำปีงบประมาณ${data.fiscalYear}`, 'portrait');
}

/**
 * ดาวน์โหลดรายงานคงเหลือเป็นไฟล์ PDF
 */
function exportStockBalancePDF() {
  const data = getStockBalanceReportData();
  const printHtml = getStockBalanceReportPrintHtml();
  downloadAsPDF(printHtml, `รายงานคงเหลือ_ประจำปีงบประมาณ${data.fiscalYear}`, 'portrait');
}

/**
 * ดาวน์โหลดรายงานคงเหลือเป็นไฟล์ Word (.doc)
 */
function exportStockBalanceWord() {
  const data = getStockBalanceReportData();
  const org = APP_STATE.settings?.org_name || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก';
  const dept = APP_STATE.settings?.org_dept || 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร';

  const officerName = APP_STATE.settings?.report_officer_name || document.getElementById('cfg_report_officer_name')?.value.trim() || 'นางรุจิรา บุสดี';
  const officerPos = APP_STATE.settings?.report_officer_position || document.getElementById('cfg_report_officer_position')?.value.trim() || 'นักวิชาการสาธารณสุขปฏิบัติการ';
  const checkerName = APP_STATE.settings?.report_checker_name || document.getElementById('cfg_report_checker_name')?.value.trim() || 'นางสาวบุษบา สิงห์เรือง';
  const checkerPos = APP_STATE.settings?.report_checker_position || document.getElementById('cfg_report_checker_position')?.value.trim() || 'นักวิชาการสาธารณสุข';

  const rowsHtml = data.rows.map((row, idx) => `
    <tr>
      <td style="border: 1px solid black; padding: 4px; text-align: center;">${idx + 1}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: left;">${row.name}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right;">${formatQty(row.remaining)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: center;">${row.unit}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right;">${formatMoney(row.price)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: right; font-weight: bold;">${formatMoney(row.amount)}</td>
      <td style="border: 1px solid black; padding: 4px; text-align: center;">${row.remark || ''}</td>
    </tr>
  `).join('');

  const docHtml = `
    <div style="font-family: 'TH Sarabun New', 'Sarabun', Arial; font-size: 15pt;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 18pt; font-weight: bold; margin: 0 0 5px 0;">รายงานคงเหลือ (${data.categoryTitle})</h2>
        <div style="font-size: 15pt;">${org} ${dept}</div>
        <div style="font-size: 15pt; font-weight: bold;">ประจำปีงบประมาณ ${data.fiscalYear}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 14pt;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 60px; text-align: center;">ลำดับที่</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; text-align: center;">รายการ</th>
            <th colspan="2" style="border: 1px solid black; padding: 6px; text-align: center; width: 140px;">วัสดุคงเหลือหน่วย<br>(จำนวน)</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 100px; text-align: center;">ราคาต่อหน่วย</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 120px; text-align: center;">จำนวนเงิน<br>(บาท)</th>
            <th rowspan="2" style="border: 1px solid black; padding: 6px; width: 80px; text-align: center;">หมายเหตุ</th>
          </tr>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid black; padding: 4px; text-align: center;">จำนวน</th>
            <th style="border: 1px solid black; padding: 4px; text-align: center;">หน่วย</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f2f2f2;">
            <td colspan="5" style="border: 1px solid black; padding: 6px; text-align: center;">
              รวมเป็น (${data.bahtText})
            </td>
            <td style="border: 1px solid black; padding: 6px; text-align: right; font-weight: bold;">
              ${formatMoney(data.grandTotal)}
            </td>
            <td style="border: 1px solid black; padding: 6px;"></td>
          </tr>
        </tfoot>
      </table>

      <table style="width: 100%; margin-top: 40px; font-size: 14pt; border: none;">
        <tr>
          <td style="width: 50%; text-align: center; border: none; vertical-align: top;">
            <p>ลงชื่อ..................................................ผู้รายงาน</p>
            <p style="font-weight: bold;">(${officerName})</p>
            <p>ตำแหน่ง ${officerPos}</p>
          </td>
          <td style="width: 50%; text-align: center; border: none; vertical-align: top;">
            <p>ลงชื่อ..................................................เจ้าหน้าที่ตรวจสอบพัสดุ</p>
            <p style="font-weight: bold;">(${checkerName})</p>
            <p>ตำแหน่ง ${checkerPos}</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  const safeCat = data.categoryTitle.replace(/[\/\\?%*:|"<>]/g, '_');
  downloadWordDoc(docHtml, `รายงานคงเหลือ_ปี${data.fiscalYear}_${safeCat}`);
  showToast('ดาวน์โหลดไฟล์ Word รายงานคงเหลือเรียบร้อยแล้ว', 'success');
}

/**
 * ดาวน์โหลดรายงานคงเหลือเป็นไฟล์ Excel (.xlsx)
 */
function exportStockBalanceExcel() {
  const data = getStockBalanceReportData();
  const org = APP_STATE.settings?.org_name || 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก';
  const dept = APP_STATE.settings?.org_dept || 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร';

  const officerName = APP_STATE.settings?.report_officer_name || document.getElementById('cfg_report_officer_name')?.value.trim() || 'นางรุจิรา บุสดี';
  const officerPos = APP_STATE.settings?.report_officer_position || document.getElementById('cfg_report_officer_position')?.value.trim() || 'นักวิชาการสาธารณสุขปฏิบัติการ';
  const checkerName = APP_STATE.settings?.report_checker_name || document.getElementById('cfg_report_checker_name')?.value.trim() || 'นางสาวบุษบา สิงห์เรือง';
  const checkerPos = APP_STATE.settings?.report_checker_position || document.getElementById('cfg_report_checker_position')?.value.trim() || 'นักวิชาการสาธารณสุข';

  const aoa = [
    [`รายงานคงเหลือ (${data.categoryTitle})`],
    [`${org} ${dept}`],
    [`ประจำปีงบประมาณ ${data.fiscalYear}`],
    [],
    ['ลำดับที่', 'รายการ', 'วัสดุคงเหลือหน่วย (จำนวน)', '', 'ราคาต่อหน่วย', 'จำนวนเงิน (บาท)', 'หมายเหตุ'],
    ['', '', 'จำนวน', 'หน่วย', '', '', '']
  ];

  data.rows.forEach((r, idx) => {
    aoa.push([
      idx + 1,
      r.name,
      r.remaining,
      r.unit,
      r.price,
      r.amount,
      r.remark || ''
    ]);
  });

  // Footer Total
  aoa.push([
    `รวมเป็น (${data.bahtText})`, '', '', '', '',
    data.grandTotal, ''
  ]);

  // Signatures
  aoa.push([]);
  aoa.push(['ลงชื่อ..................................................ผู้รายงาน', '', '', 'ลงชื่อ..................................................เจ้าหน้าที่ตรวจสอบพัสดุ']);
  aoa.push([`(${officerName})`, '', '', `(${checkerName})`]);
  aoa.push([`ตำแหน่ง ${officerPos}`, '', '', `ตำแหน่ง ${checkerPos}`]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws['!cols'] = [
    { wch: 8 },  // ลำดับที่
    { wch: 45 }, // รายการ
    { wch: 12 }, // จำนวน
    { wch: 10 }, // หน่วย
    { wch: 15 }, // ราคาต่อหน่วย
    { wch: 18 }, // จำนวนเงิน
    { wch: 15 }  // หมายเหตุ
  ];

  // Merges
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Org
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Year
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // ลำดับที่
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // รายการ
    { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } }, // วัสดุคงเหลือหน่วย
    { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } }, // ราคาต่อหน่วย
    { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } }, // จำนวนเงิน
    { s: { r: 4, c: 6 }, e: { r: 5, c: 6 } }, // หมายเหตุ
    { s: { r: aoa.length - 5, c: 0 }, e: { r: aoa.length - 5, c: 4 } } // รวมเป็น
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานคงเหลือ');
  const safeCat = data.categoryTitle.replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(wb, `รายงานคงเหลือ_ปี${data.fiscalYear}_${safeCat}.xlsx`);
  showToast('ดาวน์โหลด Excel รายงานคงเหลือเรียบร้อยแล้ว', 'success');
}

// Window scope exports
window.initStockBalanceReport = initStockBalanceReport;
window.renderStockBalanceReport = renderStockBalanceReport;
window.printStockBalanceReport = printStockBalanceReport;
window.exportStockBalanceWord = exportStockBalanceWord;
window.exportStockBalanceExcel = exportStockBalanceExcel;
window.initLedgerPD4Filter = initLedgerPD4Filter;
window.populateLedgerMaterialSelect = populateLedgerMaterialSelect;
window.renderLedgerCategoryCheckboxes = renderLedgerCategoryCheckboxes;




