const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp-compact');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let uploadedImagePath = null;

// Função auxiliar para obter matriz de pixels
async function getPixelMatrix(imagePath) {
    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    let matrix = [];

    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
            const grayscale = (pixelColor.r + pixelColor.g + pixelColor.b) / 3;
            row.push(grayscale);
        }
        matrix.push(row);
    }
    return { matrix, width, height };
}

// Função para criar uma nova imagem a partir da matriz processada
async function saveProcessedImage(matrix, width, height, outputFileName) {
    const image = new Jimp(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = Math.round(matrix[y][x]);
            image.setPixelColor(Jimp.rgbaToInt(value, value, value, 255), x, y);
        }
    }
    const outputPath = path.join(__dirname, 'uploads', outputFileName);
    await image.writeAsync(outputPath);
    return `/uploads/${outputFileName}`;
}

// Aplicação de filtros
function applyFilter(matrix, width, height, filterFunc) {
    let newMatrix = JSON.parse(JSON.stringify(matrix));
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let neighborhood = [
                matrix[y - 1][x - 1], matrix[y - 1][x], matrix[y - 1][x + 1],
                matrix[y][x - 1], matrix[y][x], matrix[y][x + 1],
                matrix[y + 1][x - 1], matrix[y + 1][x], matrix[y + 1][x + 1]
            ];
            newMatrix[y][x] = filterFunc(neighborhood);
        }
    }
    return newMatrix;
}

app.get('/', (req, res) => {
    res.render('index')
})

// Rota para upload de imagem
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem enviada.');
    }
    uploadedImagePath = req.file.path;
    res.redirect('/');
});

// Rota para binarização
app.get('/binarizar', async (req, res) => {
    if (!uploadedImagePath) {
        return res.status(400).send('Nenhuma imagem carregada.');
    }
    try {
        let { matrix, width, height } = await getPixelMatrix(uploadedImagePath);
        let threshold = parseInt(req.query.threshold)// || 128 Essa porta Lógica estava setando threshold como 128 quando o valor enviado do front era 0
        
        matrix = matrix.map(row => row.map(pixel => {return (pixel >= threshold) ? 255 : 0;}));
        const imageUrl = await saveProcessedImage(matrix, width, height, `binarized_${Date.now()}.png`);
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a imagem.');
    }
});

// Rota para filtro da média
app.get('/filtro-media', async (req, res) => {
    if (!uploadedImagePath) {
        return res.status(400).send('Nenhuma imagem carregada.');
    }
    try {
        let { matrix, width, height } = await getPixelMatrix(uploadedImagePath);
        matrix = applyFilter(matrix, width, height, neighborhood =>
            neighborhood.reduce((sum, val) => sum + val, 0) / neighborhood.length
        );
        const imageUrl = await saveProcessedImage(matrix, width, height, `media_${Date.now()}.png`);
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a imagem.');
    }
});

// Rota para filtro da mediana
app.get('/filtro-mediana', async (req, res) => {
    if (!uploadedImagePath) {
        return res.status(400).send('Nenhuma imagem carregada.');
    }
    try {
        let { matrix, width, height } = await getPixelMatrix(uploadedImagePath);
        matrix = applyFilter(matrix, width, height, neighborhood =>
            neighborhood.sort((a, b) => a - b)[Math.floor(neighborhood.length / 2)]
        );
        const imageUrl = await saveProcessedImage(matrix, width, height, `mediana_${Date.now()}.png`);
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a imagem.');
    }
});

// Rota para filtro da moda
app.get('/filtro-moda', async (req, res) => {
    if (!uploadedImagePath) {
        return res.status(400).send('Nenhuma imagem carregada.');
    }
    try {
        let { matrix, width, height } = await getPixelMatrix(uploadedImagePath);
        matrix = applyFilter(matrix, width, height, neighborhood => {
            const freqMap = neighborhood.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            return parseInt(Object.keys(freqMap).reduce((a, b) => (freqMap[a] > freqMap[b] ? a : b)));
        });
        const imageUrl = await saveProcessedImage(matrix, width, height, `moda_${Date.now()}.png`);
        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a imagem.');
    }
});

app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));

module.exports = app;
