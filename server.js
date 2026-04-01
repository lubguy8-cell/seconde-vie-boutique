const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
// Sert les fichiers statiques (HTML, CSS, JS) depuis le dossier racine
app.use(express.static(path.join(__dirname, ''))); 

// --- CONNEXION MONGODB ATLAS ---
const MONGODB_URI = "mongodb+srv://lubguy8_db_user:4bgwFcYISTj496Ro@cluster0.ftforz7.mongodb.net/seconde_vie?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ GL HUB AGENCY : Connexion MongoDB établie avec succès !'))
    .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// --- MODÈLE DE DONNÉES (SCHÉMA) ---
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// --- ROUTES API ---

// Récupérer les produits (du plus récent au plus ancien)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
});

// Ajouter un nouveau produit
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de l'ajout (vérifiez les champs)" });
    }
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Boutique Seconde Vie lancée sur le port ${PORT}`);
});