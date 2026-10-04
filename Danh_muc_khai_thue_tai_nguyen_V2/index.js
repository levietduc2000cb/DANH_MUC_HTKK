const fs = require("fs");
const XLSX = require("xlsx");

const filePath = "./Catalogue_032027_01.xml";
const outPath = "./Catalogue_032027_01.xlsx";

const xml = fs.readFileSync(filePath, "utf8");

const rows = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((m) => {
  const block = m[1];
  const get = (tag) =>
    (block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "").trim();

  return {
    ten: get("ten"),          // Tên
    ma: get("ma"),            // Mã chỉ tiêu
    dvt: get("dvt"),          // Đơn vị tính
    thuesuat: get("thuesuat"),
    giatoithieu: get("giatoithieu"),// Giá tối thiểu
    giatoida: get("giatoida") // Giá tối đa
  };
});

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "DuLieu");
XLSX.writeFile(wb, outPath);

console.log("Da tao file:", outPath);