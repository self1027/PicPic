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

// Rota principal
app.get('/', (req, res) => {
    res.render('index');
});

// Rota para upload da imagem
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem enviada.');
    }
    uploadedImagePath = req.file.path;
    res.redirect('/');
});

app.get('/binarizar', async (req, res) => {
    if (!uploadedImagePath) {
        return res.status(400).send('Nenhuma imagem carregada.');
    }

    try {
        const image = await Jimp.read(uploadedImagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        // Obtém o limiar da requisição (ou usa 128 como padrão)
        let threshold = parseInt(req.query.threshold);
        if (isNaN(threshold) || threshold < 0 || threshold > 255) {
            threshold = 128;
        }

        // Criando matriz da imagem e aplicando binarização com o limiar personalizado
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelColor = Jimp.intToRGBA(image.getPixelColor(x, y));
                const grayscale = (pixelColor.r + pixelColor.g + pixelColor.b) / 3;
                const binColor = grayscale >= threshold ? 255 : 0;
                image.setPixelColor(Jimp.rgbaToInt(binColor, binColor, binColor, 255), x, y);
            }
        }

        const binarizedFileName = `binarized_${Date.now()}.png`;
        const binarizedImagePath = path.join(__dirname, 'uploads', binarizedFileName);
        await image.writeAsync(binarizedImagePath);

        // Retorna o caminho da imagem para o frontend
        res.json({ imageUrl: `/uploads/${binarizedFileName}` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a imagem.');
    }
});


// Inicia o servidor
app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));
