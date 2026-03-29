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
app.delete('/api/fournisseurs/:id', (req, res) => {
    let data = lireDB(DB_FOURNISSEURS);
    data = data.filter(f => f.id !== req.params.id);
    fs.writeFileSync(DB_FOURNISSEURS, JSON.stringify(data, null, 2));
    res.send("Supprimé");
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
app.put('/api/produits/:id', upload.single('image'), (req, res) => {
    let data = lireDB(DB_PRODUITS);
    const index = data.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        data[index].nom = req.body.nom;
        data[index].prix = parseFloat(req.body.prix);
        data[index].devise = req.body.devise;
        data[index].stock = req.body.stock === 'infini' ? 'infini' : parseInt(req.body.stock);
        data[index].fournisseurId = req.body.fournisseurId;
        if (req.file) data[index].image = `/uploads/${req.file.filename}`;
        fs.writeFileSync(DB_PRODUITS, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } else { res.status(404).send("Non trouvé"); }
});
app.delete('/api/produits/:id', (req, res) => {
    let data = lireDB(DB_PRODUITS);
    data = data.filter(p => p.id !== req.params.id);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(data, null, 2));
    res.send("Supprimé");
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
// LA ROUTE PATCH MANQUANTE QUI CAUSAIT L'ERREUR :
app.patch('/api/commandes/:id', (req, res) => {
    let data = lireDB(DB_COMMANDES);
    const index = data.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data[index].statut = "Validée";
        data[index].fraisLivraison = req.body.fraisLivraison;
        data[index].dureeLivraison = req.body.dureeLivraison;
        fs.writeFileSync(DB_COMMANDES, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } else { res.status(404).send("Commande non trouvée"); }
});

app.listen(port, () => console.log(`Serveur prêt sur le port ${port}`));
