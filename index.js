const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp-compact');

const app = express();
const upload = multer({ 
    dest: path.join(__dirname, 'temp_uploads')
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let uploadedImagePath = null;
let originalImagePath = null;

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

// Rota para a página colorido (ajustado para colorfull.ejs)
app.get('/colorido', (req, res) => {
    res.render('colorfull', { activePage: 'colorido' });
});

// Rota para upload de imagem colorida (com tratamento de erro melhorado)
app.post('/colorido/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada.' });
    }

    try {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const newFileName = `color_${Date.now()}${path.extname(req.file.originalname)}`;
        const newPath = path.join(uploadDir, newFileName);

        await fs.promises.rename(req.file.path, newPath);

        const imageUrl = `/uploads/${newFileName}`;
        uploadedImagePath = newPath;
        originalImagePath = newPath; // 🔧 sempre usar esta como base

        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Erro no upload:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            await fs.promises.unlink(req.file.path).catch(e => console.error('Erro ao apagar temp file:', e));
        }
        res.status(500).json({ success: false, error: 'Erro ao processar o upload da imagem.' });
    }
});


// Rota para conversão de imagens
app.get('/colorido/converter', async (req, res) => {
    try {
        if (!originalImagePath || !fs.existsSync(originalImagePath)) {
            return res.status(400).json({ success: false, error: 'Nenhuma imagem válida carregada.' });
        }

        const method = req.query.method;
        const { matrix, width, height } = await getPixelMatrix(originalImagePath);
        let resultMatrix = [];

        const outputFileName = `converted_${method}_${Date.now()}.png`;

        if (['media', 'luminancia', 'desaturacao', 'canal-vermelho', 'yuv'].includes(method)) {
            const image = await Jimp.read(originalImagePath);
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];

                let grayValue = r;
                switch (method) {
                    case 'media':
                        grayValue = Math.round((r + g + b) / 3);
                        break;
                    case 'luminancia':
                    case 'yuv':
                        grayValue = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                        break;
                    case 'desaturacao':
                        grayValue = Math.round((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
                        break;
                }

                this.bitmap.data[idx] = grayValue;
                this.bitmap.data[idx + 1] = grayValue;
                this.bitmap.data[idx + 2] = grayValue;
            });

            const outputPath = path.join(__dirname, 'public', 'uploads', outputFileName);
            await image.writeAsync(outputPath);
            return res.json({ success: true, processedUrl: `/uploads/${outputFileName}` });

        } else if (['sobel', 'laplaciano-positivo', 'laplaciano-negativo'].includes(method)) {
            function applyKernel(matrix, width, height, kernel) {
                return applyFilter(matrix, width, height, neighborhood => {
                    let sum = 0;
                    for (let i = 0; i < 9; i++) {
                        sum += neighborhood[i] * kernel[i];
                    }
                    return Math.round(Math.min(255, Math.max(0, sum)));
                });
            }

            if (method === 'laplaciano-positivo') {
                const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
                resultMatrix = applyKernel(matrix, width, height, kernel);
            }

            if (method === 'laplaciano-negativo') {
                const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
                resultMatrix = applyKernel(matrix, width, height, kernel);
            }

            if (method === 'sobel') {
                const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
                const Gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

                resultMatrix = applyFilter(matrix, width, height, neighborhood => {
                    let sumX = 0, sumY = 0;
                    for (let i = 0; i < 9; i++) {
                        sumX += neighborhood[i] * Gx[i];
                        sumY += neighborhood[i] * Gy[i];
                    }
                    const magnitude = Math.sqrt(sumX ** 2 + sumY ** 2);
                    return Math.round(Math.min(255, Math.max(0, magnitude)));
                });
            }

            const imageUrl = await saveProcessedImage(resultMatrix, width, height, outputFileName);
            return res.json({ success: true, processedUrl: imageUrl });
        }

        return res.status(400).json({ success: false, error: 'Método de conversão inválido.' });

    } catch (error) {
        console.error('Erro na conversão:', error);
        res.status(500).json({ success: false, error: 'Erro ao converter a imagem.', details: error.message });
    }
});




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
