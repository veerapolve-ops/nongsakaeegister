/**
 * =========================================================================
 * Google Apps Script - ระบบทะเบียนคุมรับ-จ่ายวัสดุคงคลัง
 * บันทึกโค้ดนี้ลงใน Google Apps Script (Extensions > Apps Script)
 * แล้วกด Deploy > New Deployment > Web App (Anyone can access)
 * =========================================================================
 */

// ชื่อชีตหลักในสเปรดชีต
var SHEET_NAMES = {
  SETTINGS: 'Settings',
  USERS: 'Users',
  MATERIALS: 'Materials',
  RECEIPTS: 'Receipts',
  REQUISITIONS: 'Requisitions',
  REQ_ITEMS: 'RequisitionItems'
};

/**
 * ฟังก์ชันเริ่มต้นสร้างชีตและหัวตารางอัตโนมัติ (รันครั้งแรกเพียงครั้งเดียว หรือระบบจะรันให้อัตโนมัติ)
 */
function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ชีต Settings
  var sheetSettings = getOrCreateSheet(ss, SHEET_NAMES.SETTINGS);
  if (sheetSettings.getLastRow() === 0) {
    sheetSettings.appendRow(['Key', 'Value', 'Description']);
    sheetSettings.appendRow(['org_name', 'โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านหนองสะแก', 'ชื่อหน่วยงาน']);
    sheetSettings.appendRow(['org_dept', 'กองสาธารณสุข องค์การบริหารส่วนจังหวัดพิจิตร', 'ชื่อสังกัด/ส่วนงาน']);
    sheetSettings.appendRow(['fiscal_year', '2570', 'ปีงบประมาณปัจจุบัน']);
    sheetSettings.appendRow(['officer_name', 'นางรุจิรา บุสดี', 'เจ้าหน้าที่พัสดุ']);
    sheetSettings.appendRow(['officer_position', 'เจ้าหน้าที่พัสดุ', 'ตำแหน่งเจ้าหน้าที่พัสดุ']);
    sheetSettings.appendRow(['approver_name', 'นางสาวจุฑารัตน์ จันทรมณี', 'ผู้มีอำนาจสั่งจ่าย']);
    sheetSettings.appendRow(['approver_position', 'พยาบาลวิชาชีพชำนาญการ รักษาการในตำแหน่ง ผอ.รพ.สต.', 'ตำแหน่งผู้สั่งจ่าย']);
  }

  // 2. ชีต Users
  var sheetUsers = getOrCreateSheet(ss, SHEET_NAMES.USERS);
  if (sheetUsers.getLastRow() === 0) {
    sheetUsers.appendRow(['id', 'username', 'password', 'fullname', 'position', 'role', 'status', 'created_at']);
    sheetUsers.appendRow(['U001', 'admin', 'admin123', 'ผู้ดูแลระบบ (ADMIN)', 'หัวหน้างานพัสดุและคลัง', 'ADMIN', 'active', new Date()]);
    sheetUsers.appendRow(['U002', 'user', 'user123', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'พนักงานบริการ', 'USER', 'active', new Date()]);
    sheetUsers.appendRow(['U003', 'user2', 'user123', 'นายสมคิด จิตแจ่มใส', 'นักวิชาการสาธารณสุข', 'USER', 'active', new Date()]);
  }

  // 3. ชีต Materials (ทะเบียนวัสดุ)
  var sheetMaterials = getOrCreateSheet(ss, SHEET_NAMES.MATERIALS);
  if (sheetMaterials.getLastRow() === 0) {
    sheetMaterials.appendRow([
      'code', 'name', 'category', 'spec', 'unit', 'price', 
      'opening_stock', 'opening_stock_date', 'opening_stock_year', 'min_stock', 'storage_location', 'status', 'updated_at'
    ]);
    // ข้อมูลเริ่มต้นตัวอย่างตามระบบจริง
    var samples = [
      ['K-001', 'ผงซักฟอก ขนาด 2400 กรัม บรีส', 'วัสดุงานบ้านงานครัว', 'ขนาด 2400 กรัม', 'ห่อ', 225.00, 10, '2024-10-01', '2568', 5, 'ตู้เก็บวัสดุ ชั้น 2', 'active', new Date()],
      ['K-004', 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', 'วัสดุงานบ้านงานครัว', 'ขนาด 3.2 ลิตร', 'แกลลอน', 60.00, 25, '2024-10-01', '2568', 5, 'ห้องเก็บของ 1', 'active', new Date()],
      ['MAT-003', 'กระดาษถ่ายเอกสาร A4 80 แกรม Double A', 'วัสดุสำนักงาน', 'A4 80 แกรม', 'รีม', 135.00, 50, '2568', 10, 'ห้องพัสดุ ชั้น 1', 'active', new Date()],
      ['MAT-004', 'ปากกาลูกลื่น 0.5 มม. น้ำเงิน', 'วัสดุสำนักงาน', '0.5 มม. หมึกน้ำเงิน', 'ด้าม', 12.00, 120, '2568', 20, 'ตู้เครื่องเขียน A', 'active', new Date()],
      ['MAT-005', 'หมึกพิมพ์ HP Laser 85A', 'วัสดุคอมพิวเตอร์', 'CE285A สีดำ', 'กล่อง', 1850.00, 4, '2568', 2, 'ตู้ไอที ชั้น 2', 'active', new Date()],
      ['MAT-006', 'แฟลชไดรฟ์ Kingston 64GB USB 3.2', 'วัสดุคอมพิวเตอร์', '64GB Kingston', 'อัน', 189.00, 15, '2568', 3, 'ตู้ไอที ชั้น 2', 'active', new Date()],
      ['MAT-007', 'ปุ๋ยเคมีสูตร 16-16-16', 'วัสดุการเกษตร', 'กระสอบ 50 กก.', 'กระสอบ', 1250.00, 8, '2568', 2, 'โรงเรือนการเกษตร', 'active', new Date()],
      ['MAT-008', 'สายยางรดน้ำ 5/8 นิ้ว ยาว 20 เมตร', 'วัสดุการเกษตร', '5/8 นิ้ว หนาพิเศษ', 'ม้วน', 450.00, 5, '2568', 2, 'โรงเรือนการเกษตร', 'active', new Date()],
      ['MAT-009', 'หลอดไฟ LED T8 18W แสงขาว', 'วัสดุไฟฟ้า', '18W Daylight', 'หลอด', 85.00, 40, '2568', 10, 'ห้องช่าง/ไฟฟ้า', 'active', new Date()],
      ['MAT-010', 'สายไฟ VAF 2x1.5 Sq.mm. 100 เมตร', 'วัสดุไฟฟ้า', '2x1.5 ยาว 100 เมตร', 'ขด', 1350.00, 6, '2568', 2, 'ห้องช่าง/ไฟฟ้า', 'active', new Date()],
      ['MAT-011', 'น้ำมันดีเซล B7', 'วัสดุเชื้อเพลิง', 'มาตรฐาน ปตท.', 'ลิตร', 32.50, 220, '2568', 50, 'ถังบรรจุเชื้อเพลิง', 'active', new Date()],
      ['MAT-012', 'ป้ายไวนิลประชาสัมพันธ์โครงการ', 'วัสดุโฆษณา', 'ขนาด 1x3 เมตร', 'ผืน', 450.00, 15, '2568', 2, 'ห้องประชาสัมพันธ์', 'active', new Date()],
      ['MAT-013', 'ปูนซีเมนต์ปอร์ตแลนด์ ตราช้าง', 'วัสดุก่อสร้าง', 'ถุง 50 กก.', 'ถุง', 165.00, 80, '2568', 15, 'โกดังเก็บวัสดุ', 'active', new Date()],
      ['MAT-014', 'สีน้ำทาภายใน สีขาว ขนาด 5 แกลลอน', 'วัสดุก่อสร้าง', 'TOA 5 แกลลอน', 'ถัง', 1890.00, 25, '2568', 5, 'โกดังเก็บวัสดุ', 'active', new Date()]
    ];
    for (var i = 0; i < samples.length; i++) {
      sheetMaterials.appendRow(samples[i]);
    }
  }

  // 4. ชีต Receipts (ประวัติการรับเข้า)
  var sheetReceipts = getOrCreateSheet(ss, SHEET_NAMES.RECEIPTS);
  if (sheetReceipts.getLastRow() === 0) {
    sheetReceipts.appendRow([
      'receipt_no', 'doc_ref_no', 'date', 'supplier', 'material_code', 
      'material_name', 'unit', 'price', 'quantity', 'total_amount', 'receiver', 'remark', 'created_at'
    ]);
    sheetReceipts.appendRow([
      'RC-2568-001', 'TS680021', '2025-03-19', 'ร้านธารา เซอร์วิส', 'K-001',
      'ผงซักฟอก ขนาด 2400 กรัม บรีส', 'ห่อ', 225.00, 10, 2250.00, 'นางรุจิรา บุสดี', 'รับเข้าตามใบสั่งซื้อ', new Date('2025-03-19')
    ]);
  }

  // 5. ชีต Requisitions (ประวัติใบเบิก - หัวเอกสาร)
  var sheetRequisitions = getOrCreateSheet(ss, SHEET_NAMES.REQUISITIONS);
  if (sheetRequisitions.getLastRow() === 0) {
    sheetRequisitions.appendRow([
      'req_no', 'fiscal_year', 'date', 'requester_name', 'requester_position', 
      'department', 'purpose', 'substitute_name', 'officer_name', 'officer_position', 
      'approver_name', 'approver_position', 'item_count', 'total_amount', 'status', 'remark', 'created_at'
    ]);
    sheetRequisitions.appendRow([
      '02/2568', '2568', '2025-03-20', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'พนักงานบริการ',
      'งานบริการความสะอาด', 'เพื่อใช้ทำความสะอาดอาคารผู้ป่วยนอก', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'นางรุจิรา บุสดี', 'เจ้าหน้าที่พัสดุ',
      'นางสาวจุฑารัตน์ จันทรมณี', 'พยาบาลวิชาชีพชำนาญการ', 1, 225.00, 'approved', '-', new Date('2025-03-20')
    ]);
    sheetRequisitions.appendRow([
      '1/2570', '2570', '2026-10-19', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'พนักงานบริการ',
      'งานบริการความสะอาด', 'เพื่อใช้ในงานทำความสะอาดห้องสุขาและสุขอนามัย', 'นางสาวสมหมาย ไผ่สัมฤทธิ์', 'นางรุจิรา บุสดี', 'เจ้าหน้าที่พัสดุ',
      'นางสาวจุฑารัตน์ จันทรมณี', 'พยาบาลวิชาชีพชำนาญการ', 1, 60.00, 'approved', '-', new Date('2026-10-19')
    ]);
  }

  // 6. ชีต RequisitionItems (รายการวัสดุในใบเบิก)
  var sheetReqItems = getOrCreateSheet(ss, SHEET_NAMES.REQ_ITEMS);
  if (sheetReqItems.getLastRow() === 0) {
    sheetReqItems.appendRow([
      'req_no', 'item_index', 'material_code', 'material_name', 'unit', 
      'price', 'quantity', 'amount', 'remark'
    ]);
    sheetReqItems.appendRow([
      '02/2568', 1, 'K-001', 'ผงซักฟอก ขนาด 2400 กรัม บรีส', 'ห่อ', 225.00, 1, 225.00, '-'
    ]);
    sheetReqItems.appendRow([
      '1/2570', 1, 'K-004', 'น้ำยาล้างจาน ขนาด 3.2 ลิตร ซันไลต์', 'แกลลอน', 60.00, 1, 60.00, '-'
    ]);
  }

  return 'Setup completed successfully!';
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Handle GET Requests: ดึงข้อมูลทั้งหมดในคราวเดียว เพื่อประสิทธิภาพสูงสุด
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    initialSetup(); // เช็คว่ามีชีตครบถ้วนหรือไม่

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';

    if (action === 'backup') {
      var backupResult = backupToGoogleDrive();
      return jsonResponse({ success: true, message: backupResult });
    }

    // Default: ดึงข้อมูลทั้งหมด
    var data = {
      settings: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SETTINGS)),
      users: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.USERS)),
      materials: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.MATERIALS)),
      receipts: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.RECEIPTS)),
      requisitions: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.REQUISITIONS)),
      requisitionItems: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.REQ_ITEMS)),
      serverTime: new Date().toISOString()
    };

    return jsonResponse({ success: true, data: data });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle POST Requests: บันทึกรับเข้า / บันทึกใบเบิก / อัปเดตทะเบียนวัสดุ / อัปเดตผู้ใช้ / สำรองข้อมูล
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // รอ Lock ป้องกันข้อมูลชนกัน
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;

    var result = { success: false };

    switch (action) {
      case 'receiveMaterial':
        result = handleReceiveMaterial(ss, postData.payload);
        break;

      case 'createRequisition':
        result = handleCreateRequisition(ss, postData.payload);
        break;

      case 'saveMaterial':
        result = handleSaveMaterial(ss, postData.payload);
        break;

      case 'deleteMaterial':
        result = handleDeleteMaterial(ss, postData.payload);
        break;

      case 'saveUser':
        result = handleSaveUser(ss, postData.payload);
        break;

      case 'deleteUser':
        result = handleDeleteUser(ss, postData.payload);
        break;

      case 'saveSettings':
        result = handleSaveSettings(ss, postData.payload);
        break;

      case 'backup':
        var backupMsg = backupToGoogleDrive();
        result = { success: true, message: backupMsg };
        break;

      case 'importMaterials':
        result = handleImportMaterials(ss, postData.payload);
        break;

      case 'batchReceive':
        result = handleBatchReceive(ss, postData.payload);
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการรับวัสดุเข้าคลัง
 */
function handleReceiveMaterial(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_NAMES.RECEIPTS);
  var now = new Date();
  
  // payload: { receipt_no, doc_ref_no, date, supplier, material_code, material_name, unit, price, quantity, total_amount, receiver, remark }
  sheet.appendRow([
    payload.receipt_no,
    payload.doc_ref_no || '-',
    payload.date,
    payload.supplier || '-',
    payload.material_code,
    payload.material_name,
    payload.unit,
    Number(payload.price) || 0,
    Number(payload.quantity) || 0,
    Number(payload.total_amount) || (Number(payload.price) * Number(payload.quantity)),
    payload.receiver || '-',
    payload.remark || '-',
    now
  ]);

  return { success: true, message: 'บันทึกการรับเข้าเรียบร้อยแล้ว' };
}

/**
 * จัดการรับวัสดุเข้าคลังแบบหลายรายการจากใบส่งสินค้า (Batch Receive)
 */
function handleBatchReceive(ss, payload) {
  var sheetReceipts = ss.getSheetByName(SHEET_NAMES.RECEIPTS);
  var sheetMaterials = ss.getSheetByName(SHEET_NAMES.MATERIALS);
  var now = new Date();
  var receiptNo = payload.receipt_no;
  var docRef = payload.doc_ref_no || '-';
  var date = payload.date;
  var supplier = payload.supplier || 'TARA SERVICE';
  var receiver = payload.receiver || '-';
  var items = payload.items || [];

  // ตรวจสอบและบันทึกวัสดุใหม่ลงชีต Materials หากยังไม่มี
  var existingCodes = {};
  if (sheetMaterials.getLastRow() > 1) {
    var matData = sheetMaterials.getRange(2, 1, sheetMaterials.getLastRow() - 1, 1).getValues();
    for (var m = 0; m < matData.length; m++) {
      existingCodes[matData[m][0]] = true;
    }
  }

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (it.material_code && !existingCodes[it.material_code]) {
      sheetMaterials.appendRow([
        it.material_code,
        it.name,
        it.category || 'วัสดุงานบ้านงานครัว',
        '-',
        it.unit,
        Number(it.price) || 0,
        0, // opening_stock
        date,
        '2570',
        5,
        'ห้องพัสดุ',
        'active',
        now
      ]);
      existingCodes[it.material_code] = true;
    }

    sheetReceipts.appendRow([
      receiptNo,
      docRef,
      date,
      supplier,
      it.material_code,
      it.name,
      it.unit,
      Number(it.price) || 0,
      Number(it.quantity) || 0,
      Number(it.total_amount) || (Number(it.price) * Number(it.quantity)),
      receiver,
      'รับเข้าตามใบส่งสินค้า',
      now
    ]);
  }

  return { success: true, count: items.length, message: 'บันทึกรับเข้าจากใบส่งสินค้าเรียบร้อยแล้ว' };
}

/**
 * จัดการบันทึกใบเบิกวัสดุ (หลายรายการใน 1 ใบ)
 */
function handleCreateRequisition(ss, payload) {
  var sheetReq = ss.getSheetByName(SHEET_NAMES.REQUISITIONS);
  var sheetItems = ss.getSheetByName(SHEET_NAMES.REQ_ITEMS);
  var now = new Date();

  // 1. บันทึกหัวใบเบิก
  var head = payload.header;
  sheetReq.appendRow([
    head.req_no,
    head.fiscal_year || '2570',
    head.date,
    head.requester_name,
    head.requester_position || '-',
    head.department || '-',
    head.purpose || '-',
    head.substitute_name || '-',
    head.officer_name || '-',
    head.officer_position || '-',
    head.approver_name || '-',
    head.approver_position || '-',
    payload.items.length,
    Number(head.total_amount) || 0,
    head.status || 'approved',
    head.remark || '-',
    now
  ]);

  // 2. บันทึกรายการย่อย
  for (var i = 0; i < payload.items.length; i++) {
    var itm = payload.items[i];
    sheetItems.appendRow([
      head.req_no,
      i + 1,
      itm.material_code,
      itm.material_name,
      itm.unit,
      Number(itm.price) || 0,
      Number(itm.quantity) || 0,
      Number(itm.amount) || (Number(itm.price) * Number(itm.quantity)),
      itm.remark || '-'
    ]);
  }

  return { success: true, message: 'บันทึกใบเบิกวัสดุเลขที่ ' + head.req_no + ' เรียบร้อยแล้ว' };
}

/**
 * บันทึก/แก้ไขข้อมูลวัสดุในทะเบียน
 */
function handleSaveMaterial(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_NAMES.MATERIALS);
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(payload.code).trim()) {
      rowIndex = i + 1; // 1-based index
      break;
    }
  }

  var rowData = [
    payload.code,
    payload.name,
    payload.category,
    payload.spec || '-',
    payload.unit,
    Number(payload.price) || 0,
    Number(payload.opening_stock) || 0,
    payload.opening_stock_date || '',
    payload.opening_stock_year || '2568',
    Number(payload.min_stock) || 5,
    payload.storage_location || '-',
    payload.status || 'active',
    new Date()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { success: true, message: 'บันทึกข้อมูลวัสดุเรียบร้อยแล้ว' };
}

/**
 * ลบวัสดุ
 */
function handleDeleteMaterial(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_NAMES.MATERIALS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(payload.code).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบรายการวัสดุเรียบร้อย' };
    }
  }
  return { success: false, error: 'ไม่พบรายการวัสดุที่ต้องการลบ' };
}

/**
 * นำเข้าทะเบียนวัสดุแบบชุด (Batch Import)
 */
function handleImportMaterials(ss, payloadList) {
  var sheet = ss.getSheetByName(SHEET_NAMES.MATERIALS);
  var count = 0;
  for (var i = 0; i < payloadList.length; i++) {
    var p = payloadList[i];
    sheet.appendRow([
      p.code || ('MAT-' + (Date.now() + i)),
      p.name,
      p.category || 'วัสดุสำนักงาน',
      p.spec || '-',
      p.unit || 'ชิ้น',
      Number(p.price) || 0,
      Number(p.opening_stock) || 0,
      p.opening_stock_date || '',
      p.opening_stock_year || '2568',
      Number(p.min_stock) || 5,
      p.storage_location || '-',
      'active',
      new Date()
    ]);
    count++;
  }
  return { success: true, message: 'นำเข้าวัสดุสำเร็จ ' + count + ' รายการ' };
}

/**
 * บันทึกผู้ใช้งาน
 */
function handleSaveUser(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(payload.username).trim().toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    payload.id || ('U' + String(Date.now()).slice(-4)),
    payload.username,
    payload.password,
    payload.fullname,
    payload.position || '-',
    payload.role || 'USER',
    payload.status || 'active',
    new Date()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { success: true, message: 'บันทึกข้อมูลผู้ใช้งานสำเร็จ' };
}

/**
 * ลบผู้ใช้งาน
 */
function handleDeleteUser(ss, payload) {
  var sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(payload.username).trim().toLowerCase()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบผู้ใช้เรียบร้อย' };
    }
  }
  return { success: false, error: 'ไม่พบผู้ใช้ที่ต้องการลบ' };
}

/**
 * บันทึกตั้งค่าระบบ
 */
function handleSaveSettings(ss, settingsMap) {
  var sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  sheet.clear();
  sheet.appendRow(['Key', 'Value', 'Description']);
  for (var key in settingsMap) {
    sheet.appendRow([key, settingsMap[key], '']);
  }
  return { success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อย' };
}

/**
 * สำรองข้อมูล Google Sheets สร้างสำเนาไฟล์ไว้ใน Google Drive
 */
function backupToGoogleDrive() {
  var currentSs = SpreadsheetApp.getActiveSpreadsheet();
  var currentFile = DriveApp.getFileById(currentSs.getId());
  var parentFolder = currentFile.getParents().hasNext() ? currentFile.getParents().next() : DriveApp.getRootFolder();
  
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd_HH-mm-ss');
  var backupFileName = 'สำเนาสำรอง_' + currentSs.getName() + '_' + nowStr;
  
  var copiedFile = currentFile.makeCopy(backupFileName, parentFolder);
  
  return 'สำรองไฟล์ไปยัง Google Drive สำเร็จ: ' + backupFileName + ' (ID: ' + copiedFile.getId() + ')';
}

/**
 * Helper: แปลงข้อมูลใน Sheet ให้เป็น Array of Objects
 */
function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    var hasValue = false;
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
      }
      obj[key] = val;
      if (val !== '' && val !== null && val !== undefined) {
        hasValue = true;
      }
    }
    if (hasValue) {
      results.push(obj);
    }
  }
  return results;
}

/**
 * ส่งค่า JSON กลับไปยัง Web App
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

