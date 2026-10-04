const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const Catalogue_Dia_Ban_Tinh_Moi = require("./Catalogue_Dia_Ban_Tinh_Moi.json");

// Đọc file XML
const xmlContent = fs.readFileSync('./Catalogue_Dia_Ban_Xa_Moi.xml', 'utf8');

// Parse XML
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
});

const parsed = parser.parse(xmlContent);

// Lấy danh sách Item
const items = parsed.Sections.Section.Items.Item;

// Convert sang array object
const result = items.map(item => {
    const [provinceCode, data, name] = item.Value.split('###');

    return {
        data,
        value: `${name}, ${Catalogue_Dia_Ban_Tinh_Moi[provinceCode]}`,
        name,
        p1: '',
        p2: Catalogue_Dia_Ban_Tinh_Moi[provinceCode]
    };
});

// Ghi file JSON
fs.writeFileSync(
    './Catalogue_Dia_Ban_Xa_Moi.json',
    JSON.stringify(result, null, 2),
    'utf8'
);

console.log('Đã tạo Catalogue_Dia_Ban_Xa_Moi.json');