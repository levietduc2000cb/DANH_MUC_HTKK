const fs = require("fs");
const { DOMParser } = require("xmldom");

const raw = fs.readFileSync('./DM_MaTM.json', 'utf-8');
const DM_MaTM = JSON.parse(raw);

// đọc file
const xmlString = fs.readFileSync("./DM_MAP_MAHH_MA_TM_TTDB.xml", "utf-8");

// parse XML
const xmlDoc = new DOMParser().parseFromString(xmlString, "text/xml");

const items = xmlDoc.getElementsByTagName("Item");

const DM_MAP_MAHH_MA_TM_TTDB = Array.from(items)
  .map(i => {
    const parts = i.getAttribute("Value").split("###");
    let maTM_TTDB = parts[0] || "";
    let tenTM_TTDB = parts[1] || "";
    let maTM = parts[2] || "";
    let TenTM = '';
    let MaMuc = '';
    let TenMuc = '';

    const found = DM_MaTM.find(item => item.MaTM === maTM);

    if (found) {
        TenTM = found.TenTM;
        MaMuc = found.MaMuc;
        TenMuc = found.TenMuc;
    }

    return {
      maTM_TTDB,
      tenTM_TTDB,
      maTM,
      TenTM,
      MaMuc,
      TenMuc
    };
  })
  .filter(i => i.maTM);

// ghi file JSON (dạng array)
fs.writeFileSync(
  "DM_MAP_MAHH_MA_TM_TTDB.json",
  JSON.stringify(DM_MAP_MAHH_MA_TM_TTDB, null, 2),
  "utf-8"
);

console.log("✅ Đã tạo file JSON");