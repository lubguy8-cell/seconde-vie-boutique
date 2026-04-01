const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- CONFIGURATION TAILLE IMAGES (Indispensable pour la galerie) ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, ''))); 

// --- CONNEXION MONGODB ATLAS ---
const MONGODB_URI = "mongodb+srv://lubguy8_db_user:4bgwFcYISTj496Ro@cluster0.ftforz7.mongodb.net/seconde_vie?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ GL HUB AGENCY : Connexion MongoDB établie !'))
    .catch(err => console.error('❌ Erreur MongoDB :', err));

// --- MODÈLE MIS À JOUR ---
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String, // C'est ici que sera stockée la photo de ta galerie
    fournisseur: String,
    stock: String,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

// --- ROUTES ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Erreur lecture" });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        // On récupère les données envoyées par ton formulaire DG
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            fournisseur: req.body.fournisseur,
            stock: req.body.stock
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "Erreur ajout" });
    }
});

// Route pour supprimer un article (Bouton supprimer de ton tableau)
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Article supprimé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur suppression" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur le port ${PORT}`);
});