const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Pour gérer l'envoi de fichiers
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));
app.use('/uploads', express.static('uploads')); // Rend les photos accessibles

// Configuration du stockage des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const DB_PRODUITS = './produits.json';
const DB_COMMANDES = './commandes.json';

// --- ROUTES PRODUITS ---
app.get('/api/produits', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]');
    res.json(data);
});

// Route modifiée pour accepter un FICHIER au lieu d'un LIEN
app.post('/api/produits', upload.single('image'), (req, res) => {
    const produits = JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]');
    const nouveau = {
        id: Date.now(),
        nom: req.body.nom,
        prix: parseFloat(req.body.prix),
        image: `/uploads/${req.file.filename}`, // Chemin local vers l'image
        fournisseur: req.body.fournisseur,
        stock: req.body.stock
    };
    produits.push(nouveau);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(produits, null, 2));
    res.json(nouveau);
});

// --- ROUTES COMMANDES ---
app.get('/api/commandes', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_COMMANDES, 'utf8') || '[]');
    res.json(data);
});

app.post('/api/commandes', (req, res) => {
    const commandes = JSON.parse(fs.readFileSync(DB_COMMANDES, 'utf8') || '[]');
    const nouvelle = { ...req.body, id: "CMD-" + Date.now(), date: new Date().toLocaleString(), statut: "En attente" };
    commandes.push(nouvelle);
    fs.writeFileSync(DB_COMMANDES, JSON.stringify(commandes, null, 2));
    res.json(nouvelle);
});

app.listen(port, () => {
    console.log(`------------------------------------------`);
    console.log(`BOUTIQUE SECONDE VIE : MODE STOCKAGE LOCAL`);
    console.log(`------------------------------------------`);
});
