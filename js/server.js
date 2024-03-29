const express = require("express");
const path = require('path');
const {DemoGeneric} = require('./demo-generic.js');
let Google = new DemoGeneric();
const fs = require('fs');
const { spawn } = require("child_process");
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;

app.listen(port, () => {
    console.log("Server has started! Open http://localhost:3000")
});
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const issuer_id = "3388000000022301521";
const class_suffix = "testeclube";

// Configuração do multer para lidar com o upload de imagens
let newFileName, uniqueSuffix;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    newFileName = uniqueSuffix + fileExtension;
    cb(null, newFileName);
  }
});
const upload = multer({ storage: storage });

// Rota para lidar com o upload da imagem e os dados do formulário
app.post('/submit', upload.single('image'), (req, res) => {
    const valuesFromHTML = req.body;
    // Logging
    console.log('Values from HTML: ' + JSON.stringify(valuesFromHTML) + '\n');
    // Once the image is saved, you can proceed with further processing
    const pythonProcess = spawn('/usr/bin/python3', ["/home/rodrigocaiokell/codigos-pessoais/js/ajeitaImagem.py",newFileName,uniqueSuffix]);
    pythonProcess.on('exit', (code) => {
        console.log(`Python process exited with code ${code}`);

        // Create object and generate LINK here
        let object_suffix = valuesFromHTML.NOME + valuesFromHTML.N_TITULO;
        Google.createObject(
            issuer_id,
            class_suffix,
            object_suffix,
            valuesFromHTML.NOME.replace(/\s/g, ''),
            valuesFromHTML.CATEGORIA,
            valuesFromHTML.VALIDADE,
            valuesFromHTML.N_TITULO,
            valuesFromHTML.EMISSAO,
            uniqueSuffix + '.png'
        );

        let LINK = Google.createJwtExistingObjects(issuer_id, object_suffix, class_suffix);
        res.json({ message: LINK });
    });
});