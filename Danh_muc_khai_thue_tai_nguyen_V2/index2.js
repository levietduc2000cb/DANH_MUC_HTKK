const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");

const xml = fs.readFileSync("./Catalogue_032027_01.xml", "utf8");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

const data = parser.parse(xml);

const items = data.danhmuc.items.item;

const result = items.map(item => ({
  ma: item.ma || "",
  ten: item.ten || "",
  thuesuat: item.thuesuat || "",
  dvt: item.dvt || "",
}));

fs.writeFileSync(
  "catalogue-ttdb.json",
  JSON.stringify(result, null, 2),
  "utf8"
);

console.log(result);