const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Fichiers pour stocker tes données à Kinshasa
const DATA_FILE = 'produits.json';

// Route pour voir la Boutique
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Route pour voir ton Espace DG
app.get('/dg', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API pour gérer les produits
app.get('/api/produits', (req, res) => {
    if (!fs.existsSync(DATA_FILE)) return res.json([]);
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
});

app.post('/api/produits', (req, res) => {
    let produits = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
    produits.push({ ...req.body, id: Date.now() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2));
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("------------------------------------------");
    console.log("BOUTIQUE SECONDE VIE : ACTIVÉE");
    console.log("Lien Boutique : http://localhost:3000");
    console.log("Lien Espace DG : http://localhost:3000/dg");
    console.log("------------------------------------------");
});