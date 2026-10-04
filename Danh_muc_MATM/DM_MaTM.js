const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");

const xml = fs.readFileSync("./DM_MaTM.xml", "utf8");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

const data = parser.parse(xml);

const items = data.Sections.Section.Items.Item;

const result = items.map(item => ({
  MaTM: item.MaTM || "",
  TenTM: item.TenTM || "",
  MaMuc: item.MaMuc || "",
  TenMuc: item.TenMuc || "",
}));

fs.writeFileSync(
  "DM_MaTM.json",
  JSON.stringify(result, null, 2),
  "utf8"
);

console.log(result);