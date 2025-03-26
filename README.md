# PicPic - Web App para Processamento de Imagens

PicPic é um aplicativo web desenvolvido com Node.js e Express que permite o upload, visualização e processamento de imagens. Ele oferece funcionalidades de binarização e aplicação de filtros como média, mediana e moda, além de conversões de imagens coloridas para preto e branco utilizando diferentes métodos. O app também oferece a opção de upload de imagens coloridas, processamento em tempo real e exibição de resultados.

## 🚀 Tecnologias Utilizadas
- **Backend:** Node.js, Express, Jimp
- **Frontend:** EJS, Bootstrap
- **Upload de Imagens:** Multer

## 📌 Funcionalidades
✅ Upload automático de imagens  
✅ Exibição da imagem carregada  
✅ Ajuste dinâmico do limiar de binarização  
✅ Aplicação de filtros (Média, Mediana, Moda)  
✅ Conversão de imagens coloridas para preto e branco (Métodos: Média, Luminância, Desaturação, Canal Vermelho, YUV)  
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

### **1. Página Inicial**:
1. Acesse a página principal onde você pode fazer o upload de uma imagem.

### **2. Upload de Imagem**:
1. Selecione uma imagem em preto e branco.
2. Carregue a imagem usando o botão de upload.
3. A imagem será exibida na tela após o upload.

### **3. Aplicação de Filtros**:
1. Escolha um filtro entre Média, Mediana ou Moda.
2. O filtro será aplicado à imagem carregada e a imagem processada será exibida.

### **4. Binarização**:
1. Ajuste o limiar de binarização para transformar a imagem em preto e branco com base no valor de limiar escolhido.

### **5. Conversão para Preto e Branco**:
1. Selecione um dos métodos de conversão (Média, Luminância, Desaturação, Canal Vermelho, YUV) para transformar a imagem colorida em preto e branco.

## 📂 Rotas
- **`/`**: Página inicial com upload de imagem.
- **`/upload`**: Rota para upload de imagens.
- **`/binarizar`**: Rota para binarização da imagem.
- **`/filtro-media`**: Rota para aplicar o filtro da média.
- **`/filtro-mediana`**: Rota para aplicar o filtro da mediana.
- **`/filtro-moda`**: Rota para aplicar o filtro da moda.
- **`/colorido`**: Rota para upload e conversão de imagens coloridas.
- **`/colorido/converter`**: Rota para conversão de imagens coloridas para preto e branco com diferentes métodos (Média, Luminância, Desaturação, Canal Vermelho, YUV).

## 📁 Estrutura do Projeto
```
├── public
│   └── uploads          # Pasta para armazenar imagens processadas
├── temp_uploads        # Pasta para armazenar imagens temporárias antes do processamento
├── views
│   └── index.ejs        # Página inicial
│   └── colorfull.ejs    # Página para imagens coloridas
├── app.js               # Arquivo principal da aplicação
├── package.json         # Dependências do projeto
```

## 🛠️ Contribuições
Sinta-se à vontade para contribuir com melhorias e correções! Basta fazer um fork do repositório, criar uma branch e abrir um pull request.
