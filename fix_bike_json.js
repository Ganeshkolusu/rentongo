
const fs = require('fs');
const path = require('path');

const bikeDataPath = path.join(__dirname, 'src/pages/data/bikeData.json');
const carDataPath = path.join(__dirname, 'src/pages/data/carData.json');

// Read carData to get states and cities
let carData = {};
try {
    const carDataContent = fs.readFileSync(carDataPath, 'utf8');
    carData = JSON.parse(carDataContent);
} catch (e) {
    console.error('Failed to read carData.json:', e.message);
    // Fallback if carData fails, though it shouldn't as we just fixed it
    carData = { states: [], cities: {} };
}

// Read bikeData
let bikeFileContent = '';
try {
    bikeFileContent = fs.readFileSync(bikeDataPath, 'utf8');
} catch (e) {
    console.error('Failed to read bikeData.json:', e.message);
    process.exit(1);
}

// Fix the multiple arrays issue in bikeData
// It looks like: [...] \n [...] \n ...
// We can try to regex match all [...] blocks
// Or just wrap it in [ ... ] and replace ][ with ],[

let validJsonString = bikeFileContent.trim();
// Replace "][" or "] [" or "]\n[" with "],["
validJsonString = validJsonString.replace(/\]\s*\[/g, '],[');
// Wrap in outer array
validJsonString = '[' + validJsonString + ']';

let bikeArrays = [];
try {
    bikeArrays = JSON.parse(validJsonString);
} catch (e) {
    console.error('Failed to parse bikeData content:', e.message);
    // Fallback: try to extract objects
    const matches = bikeFileContent.match(/\{[\s\S]*?\}/g);
    if (matches) {
        bikeArrays = [matches.map(m => {
            try { return JSON.parse(m); } catch (e) { return null; }
        }).filter(x => x)];
    }
}

// Flatten the arrays
const allBikes = bikeArrays.flat().filter(b => b && b.bikename);

// Build bikeBrands and bikeModels
const bikeBrands = new Set();
const bikeModels = {};

allBikes.forEach(bike => {
    const brand = bike.bikename.trim();
    const model = bike.bikemodel.trim();

    bikeBrands.add(brand);

    if (!bikeModels[brand]) {
        bikeModels[brand] = [];
    }

    if (!bikeModels[brand].includes(model)) {
        bikeModels[brand].push(model);
    }
});

const sortedBrands = Array.from(bikeBrands).sort();
Object.keys(bikeModels).forEach(k => bikeModels[k].sort());

// Construct final object
const finalData = {
    bikeBrands: sortedBrands,
    bikeModels: bikeModels,
    years: Array.from({ length: 35 }, (_, i) => (2024 - i).toString()),
    colors: ["Black", "White", "Red", "Blue", "Silver", "Grey", "Yellow", "Orange", "Green", "Purple", "Brown"], // Keep colors in data even if UI doesn't use them
    fuelTypes: ["Petrol", "Electric"],
    transmissionTypes: ["Manual", "Automatic"],
    states: carData.states || [],
    cities: carData.cities || {}
};

fs.writeFileSync(bikeDataPath, JSON.stringify(finalData, null, 2));
console.log('Successfully repaired bikeData.json');
