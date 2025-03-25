# PicPic - Web App para Processamento de Imagens

PicPic é um aplicativo web desenvolvido com Node.js e Express que permite o upload, visualização e processamento de imagens em preto e branco. Ele oferece a funcionalidade de binarização e alguns filtros, permitindo que os usuários ajustem um limiar para transformar pixels acima do valor em preto e abaixo em branco.

## 🚀 Tecnologias Utilizadas
- **Backend:** Node.js, Express, Jimp
- **Frontend:** EJS, Bootstrap
- **Upload de Imagens:** Multer

## 📌 Funcionalidades
✅ Upload automático de imagens
✅ Exibição da imagem carregada
✅ Ajuste dinâmico do limiar de binarização
✅ Processamento da imagem e exibição do resultado
✅ Interface responsiva com Bootstrap

## 🔧 Instalação e Uso

### 1️⃣ Clonar o repositório
```sh
git clone https://github.com/seu-usuario/picpic.git
cd picpic
```

### 2️⃣ Instalar as dependências
```sh
npm install
```

### 3️⃣ Executar o servidor
```sh
npm start
```
O aplicativo estará disponível em **http://localhost:3000**.

## 🖼️ Como Usar
1. Selecione uma imagem em preto e branco.
2. Defina o limiar para a binarização.
3. Clique no botão referente ao filtro desejado para processar a imagem.
4. Veja a imagem processada na tela.
