const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

// Đọc file XML
const xmlData = fs.readFileSync('./Catalogue_Dia_Ban_Tinh_Moi.xml', 'utf8');

// Parse XML
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
});

const jsonData = parser.parse(xmlData);

// Lấy danh sách Item
const items = jsonData.Sections.Section.Items.Item;

// Convert sang object
const result = {};

items.forEach(item => {
    const [, code, name] = item.Value.split('###');

    result[code] = name;
});

// In ra console
console.log(result);

// Hoặc lưu ra file JSON
fs.writeFileSync(
    './Catalogue_Dia_Ban_Tinh_Moi.json',
    JSON.stringify(result, null, 2),
    'utf8'
);

console.log('Đã tạo Catalogue_Dia_Ban_Tinh_Moi.json');