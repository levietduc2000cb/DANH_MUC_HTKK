const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "Catalogue_Dia_Ban.xml");
const outputPath = path.join(__dirname, "Catalogue_Dia_Ban_map.js");

function parseValue(raw) {
  const parts = raw.trim().split("###");
  const level = parts[0];
  if (level !== "0" && level !== "1") return null;

  if (parts.length === 5) {
    return { key: parts[2], name: parts[4] };
  }
  if (parts.length === 6) {
    return { key: parts[3], name: parts[5] };
  }
  return null;
}

function main() {
  const xml = fs.readFileSync(inputPath, "utf8");
  const re = /<Item\s+Value\s*=\s*"([^"]*)"/gi;
  const map = Object.create(null);
  let m;
  while ((m = re.exec(xml)) !== null) {
    const parsed = parseValue(m[1]);
    if (!parsed) continue;
    map[parsed.key] = parsed.name;
  }

  const json = JSON.stringify(map, null, 2);
  const body = [
    "/**",
    " * Ma địa bàn (đoạn thứ 3 trong Value 5 phần, hoặc đoạn 4 nếu 6 phần) → Tên.",
    " * Nguồn: Catalogue_Dia_Ban.xml (chỉ level 0 và 1).",
    " * Chạy lại: node generate_Catalogue_Dia_Ban_map.js",
    " */",
    `module.exports = ${json};`,
    "",
  ].join("\n");
  fs.writeFileSync(outputPath, body, "utf8");
  console.log(`Đã ghi ${Object.keys(map).length} key → ${outputPath}`);
  console.log(`Ví dụ 10313: ${JSON.stringify(map["10313"])}`);
}

main();
