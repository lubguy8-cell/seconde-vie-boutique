const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const DB_PRODUITS = './produits.json';
const DB_COMMANDES = './commandes.json';
const DB_FOURNISSEURS = './fournisseurs.json';

// Fonction pour lire les fichiers en toute sécurité
const lireDB = (fichier) => {
    try {
        if (!fs.existsSync(fichier)) fs.writeFileSync(fichier, '[]');
        return JSON.parse(fs.readFileSync(fichier, 'utf8'));
    } catch (e) { return []; }
};

// --- FOURNISSEURS ---
app.get('/api/fournisseurs', (req, res) => res.json(lireDB(DB_FOURNISSEURS)));

app.post('/api/fournisseurs', (req, res) => {
    const data = lireDB(DB_FOURNISSEURS);
    const nouveau = { id: Date.now().toString(), nom: req.body.nom, telephone: req.body.telephone };
    data.push(nouveau);
    fs.writeFileSync(DB_FOURNISSEURS, JSON.stringify(data, null, 2));
    res.json(nouveau);
});

// --- PRODUITS ---
app.get('/api/produits', (req, res) => res.json(lireDB(DB_PRODUITS)));

app.post('/api/produits', upload.single('image'), (req, res) => {
    const data = lireDB(DB_PRODUITS);
    const nouveau = {
        id: Date.now().toString(),
        nom: req.body.nom,
        prix: parseFloat(req.body.prix),
        devise: req.body.devise,
        image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg',
        fournisseurId: req.body.fournisseurId,
        stock: req.body.stock === 'infini' ? 'infini' : parseInt(req.body.stock)
    };
    data.push(nouveau);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(data, null, 2));
    res.json(nouveau);
});

// --- COMMANDES ---
app.get('/api/commandes', (req, res) => res.json(lireDB(DB_COMMANDES)));

app.post('/api/commandes', (req, res) => {
    const data = lireDB(DB_COMMANDES);
    const nouvelle = { ...req.body, id: "CMD-" + Date.now(), date: new Date().toLocaleString(), statut: "En attente" };
    data.push(nouvelle);
    fs.writeFileSync(DB_COMMANDES, JSON.stringify(data, null, 2));
    res.json(nouvelle);
});

app.listen(port, () => console.log(`Serveur prêt sur le port ${port}`));
