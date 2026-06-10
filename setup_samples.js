const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'pmk_labelled');
const destDir = path.join(__dirname, 'public', 'samples');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy the first file from a directory
function copySample(sourcePath, destFilename) {
    if (fs.existsSync(sourcePath)) {
        const files = fs.readdirSync(sourcePath);
        const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i));
        if (imageFiles.length > 0) {
            const firstImage = imageFiles[0];
            const srcFile = path.join(sourcePath, firstImage);
            const destFile = path.join(destDir, destFilename);
            fs.copyFileSync(srcFile, destFile);
            console.log(`Copied ${firstImage} to ${destFilename}`);
            return true;
        }
    }
    return false;
}

// Categories and their specific paths
const organs = {
    'air_liur': { type: 'subfolders', path: 'Air_Liur' },
    'gusi': { type: 'prefix', path: 'gusi/pmk_labelled' },
    'kaki': { type: 'prefix', path: 'kaki/pmk_labelled' },
    'lidah': { type: 'prefix', path: 'lidah/pmk_labelled' }
};

for (const organKey of Object.keys(organs)) {
    const organInfo = organs[organKey];
    
    if (organInfo.type === 'subfolders') {
        for (let level = 1; level <= 4; level++) {
            const levelPath = path.join(srcDir, organInfo.path, level.toString());
            copySample(levelPath, `${organKey}_${level}.jpg`);
        }
    } else if (organInfo.type === 'prefix') {
        const fullPath = path.join(srcDir, organInfo.path);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            for (let level = 1; level <= 4; level++) {
                // Find file starting with `(${level})`
                const levelFile = files.find(f => f.startsWith(`(${level})`) && f.match(/\.(jpg|jpeg|png)$/i));
                if (levelFile) {
                    const srcFile = path.join(fullPath, levelFile);
                    const destFile = path.join(destDir, `${organKey}_${level}.jpg`);
                    fs.copyFileSync(srcFile, destFile);
                    console.log(`Copied ${levelFile} to ${organKey}_${level}.jpg`);
                }
            }
        }
    }
}

console.log('Sample images setup completed!');
