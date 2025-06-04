# PicPic - Web App para Processamento de Imagens

PicPic é um aplicativo web desenvolvido com Node.js e Express para processamento de imagens em tons de cinza e coloridas.

## 🚀 Tecnologias Utilizadas
- **Backend:** Node.js, Express, Jimp
- **Frontend:** EJS, Bootstrap
- **Upload de Imagens:** Multer

## 📌 Funcionalidades

### Para Imagens em Tons de Cinza
✅ Upload e visualização de imagens  
✅ Binarização com ajuste de limiar  
✅ Filtros de suavização (Média, Mediana, Moda)  
✅ Visualização de histograma  

### Para Imagens Coloridas
✅ Conversão para tons de cinza (Média, Luminância, Desaturação, Canal Vermelho, YUV)  
✅ Filtros de realce de bordas (Sobel, Prewitt, Laplaciano)  
✅ Equalização de histograma  
✅ Quantização de cores  

## 🔧 Instalação e Uso

1. Clone o repositório:
```sh
git clone https://github.com/self1027/PicPic.git
cd PicPic
```

2. Instale as dependências:
```sh
npm install
```

3. Execute o servidor:
```sh
npm start
```

Acesse no navegador: `http://localhost:3000`

## 🖼️ Como Usar

1. Na página inicial, faça upload de uma imagem
2. Para imagens P&B:
   - Ajuste o limiar e aplique binarização
   - Escolha entre os filtros de suavização
3. Para imagens coloridas:
   - Selecione o método de conversão desejado
   - Aplique filtros avançados quando disponível
4. Visualize o histograma e baixe a imagem processada

## 📂 Rotas Principais
- `/` - Página inicial (imagens P&B)
- `/colorido` - Página para imagens coloridas
- `/upload` - Upload de imagens P&B
- `/colorido/upload` - Upload de imagens coloridas

## 📄 Licença
MIT