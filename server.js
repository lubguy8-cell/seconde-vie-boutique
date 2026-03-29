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

// --- PRODUITS ---
app.get('/api/produits', (req, res) => {
    res.json(JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]'));
});

// Ajouter
app.post('/api/produits', upload.single('image'), (req, res) => {
    const produits = JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]');
    const nouveau = {
        id: Date.now().toString(),
        nom: req.body.nom,
        prix: parseFloat(req.body.prix),
        devise: req.body.devise,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.imageExistante,
        fournisseur: req.body.fournisseur,
        stock: req.body.stock === 'infini' ? 'infini' : parseInt(req.body.stock)
    };
    produits.push(nouveau);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(produits, null, 2));
    res.json(nouveau);
});

// Modifier
app.put('/api/produits/:id', upload.single('image'), (req, res) => {
    let produits = JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]');
    const index = produits.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        produits[index].nom = req.body.nom;
        produits[index].prix = parseFloat(req.body.prix);
        produits[index].devise = req.body.devise;
        produits[index].fournisseur = req.body.fournisseur;
        produits[index].stock = req.body.stock === 'infini' ? 'infini' : parseInt(req.body.stock);
        if (req.file) produits[index].image = `/uploads/${req.file.filename}`;
        fs.writeFileSync(DB_PRODUITS, JSON.stringify(produits, null, 2));
        res.json(produits[index]);
    } else {
        res.status(404).send("Produit non trouvé");
    }
});

// Supprimer
app.delete('/api/produits/:id', (req, res) => {
    let produits = JSON.parse(fs.readFileSync(DB_PRODUITS, 'utf8') || '[]');
    produits = produits.filter(p => p.id !== req.params.id);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(produits, null, 2));
    res.send("Supprimé");
});

// --- COMMANDES ---
app.get('/api/commandes', (req, res) => {
    res.json(JSON.parse(fs.readFileSync(DB_COMMANDES, 'utf8') || '[]'));
});

// Nouvelle Commande Client
app.post('/api/commandes', (req, res) => {
    const commandes = JSON.parse(fs.readFileSync(DB_COMMANDES, 'utf8') || '[]');
    const nouvelle = { ...req.body, id: "CMD-" + Date.now(), date: new Date().toLocaleString(), statut: "En attente" };
    commandes.push(nouvelle);
    fs.writeFileSync(DB_COMMANDES, JSON.stringify(commandes, null, 2));
    res.json(nouvelle);
});

// Valider Commande par le DG
app.patch('/api/commandes/:id', (req, res) => {
    let commandes = JSON.parse(fs.readFileSync(DB_COMMANDES, 'utf8') || '[]');
    const index = commandes.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        commandes[index].statut = "Validée";
        commandes[index].fraisLivraison = req.body.fraisLivraison;
        commandes[index].dureeLivraison = req.body.dureeLivraison;
        fs.writeFileSync(DB_COMMANDES, JSON.stringify(commandes, null, 2));
        res.json(commandes[index]);
    } else {
        res.status(404).send("Commande non trouvée");
    }
});

app.listen(port, () => console.log(`Serveur SECONDE VIE activé sur le port ${port}`));
