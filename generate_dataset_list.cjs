const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'pmk_labelled');
const listPath = path.join(__dirname, 'public', 'dataset_list.json');

const datasetList = [];

function addFiles(sourcePath, organKey, level) {
    if (fs.existsSync(sourcePath)) {
        const files = fs.readdirSync(sourcePath);
        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png)$/i)) {
                // Determine actual path relative to project root
                const relativePath = path.relative(__dirname, path.join(sourcePath, file));
                // Encode each path segment to handle spaces, parentheses etc.
                const urlPath = '/' + relativePath
                    .replace(/\\/g, '/')
                    .split('/')
                    .map(segment => encodeURIComponent(segment))
                    .join('/');
                datasetList.push({
                    url: urlPath,
                    label: `${organKey}_${level}`
                });
            }
        }
    } else {
        console.warn(`WARNING: Path does not exist: ${sourcePath}`);
    }
}

const organs = {
    'air_liur': { type: 'subfolders', path: 'Air_Liur', maxLevel: 4 },
    'gusi': { type: 'prefix', path: 'gusi', maxLevel: 3 },
    'kaki': { type: 'prefix', path: 'kaki', maxLevel: 3 },
    'lidah': { type: 'prefix', path: 'lidah', maxLevel: 3 }
};

for (const organKey of Object.keys(organs)) {
    const organInfo = organs[organKey];
    
    if (organInfo.type === 'subfolders') {
        // Air Liur uses numbered subfolders: Air_Liur/1/, Air_Liur/2/, etc.
        for (let level = 1; level <= organInfo.maxLevel; level++) {
            const levelPath = path.join(srcDir, organInfo.path, level.toString());
            addFiles(levelPath, organKey, level);
        }
    } else if (organInfo.type === 'prefix') {
        // Gusi, Kaki, Lidah use prefix-based naming: (1) filename, (2) filename, etc.
        const fullPath = path.join(srcDir, organInfo.path, 'pmk_labelled');
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            for (let level = 1; level <= organInfo.maxLevel; level++) {
                const levelFiles = files.filter(f => f.startsWith(`(${level})`) && f.match(/\.(jpg|jpeg|png)$/i));
                for (const file of levelFiles) {
                    const relativePath = path.relative(__dirname, path.join(fullPath, file));
                    const urlPath = '/' + relativePath
                        .replace(/\\/g, '/')
                        .split('/')
                        .map(segment => encodeURIComponent(segment))
                        .join('/');
                    datasetList.push({
                        url: urlPath,
                        label: `${organKey}_${level}`
                    });
                }
            }
        } else {
            console.warn(`WARNING: Path does not exist: ${fullPath}`);
        }
    }
}

// Print summary
const summary = {};
datasetList.forEach(item => {
    summary[item.label] = (summary[item.label] || 0) + 1;
});
console.log('\n=== Dataset Summary ===');
for (const [label, count] of Object.entries(summary)) {
    console.log(`  ${label}: ${count} gambar`);
}
console.log(`\n  TOTAL: ${datasetList.length} gambar`);
console.log(`  Jumlah kelas: ${Object.keys(summary).length}`);

fs.writeFileSync(listPath, JSON.stringify(datasetList, null, 2));
console.log(`\nDataset list disimpan ke: ${listPath}`);
