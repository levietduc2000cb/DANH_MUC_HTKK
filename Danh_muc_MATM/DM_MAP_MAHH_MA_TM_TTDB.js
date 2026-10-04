const fs = require("fs");
const { DOMParser } = require("xmldom");

// đọc file
const xmlString = fs.readFileSync("./DM_MAP_MAHH_MA_TM_TTDB.xml", "utf-8");

// parse XML
const xmlDoc = new DOMParser().parseFromString(xmlString, "text/xml");

const items = xmlDoc.getElementsByTagName("Item");

const DM_MAP_MAHH_MA_TM_TTDB = Array.from(items)
  .map(i => {
    const parts = i.getAttribute("Value").split("###");

    return {
      maTM_TTDB: parts[0] || "",
      tenTM_TTDB: parts[1] || "",
      maTM: parts[2] || ""
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