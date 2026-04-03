const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

// --- 1. CONNEXION MONGODB (TON LIEN MISE À JOUR) ---
const mongoURI = 'mongodb+srv://lubguy8_db_user:4bgwFcYISTj496Ro@cluster0.ftforz7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
    .then(() => console.log("Léopard connecté à MongoDB ! 🇨🇩 ✅"))
    .catch(err => console.error("Erreur de connexion MongoDB :", err));

// --- 2. CONFIGURATION CLOUDINARY (Pense à mettre TES clés ici) ---
cloudinary.config({ 
  cloud_name: 'TON_CLOUD_NAME', 
  api_key: 'TA_CLE_API', 
  api_secret: 'TON_SECRET_API' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { 
    folder: 'seconde-vie-articles', 
    allowed_formats: ['jpg', 'png', 'jpeg'] 
  },
});
const upload = multer({ storage: storage });

// --- 3. MODÈLES DE DONNÉES ---
const Produit = mongoose.model('Produit', {
    nom: String, 
    description: String, 
    prix: Number, 
    devise: String,
    image: String, 
    fournisseurId: String, 
    stock: String
});

const Commande = mongoose.model('Commande', {
    client: Object, 
    articles: Array, 
    date: { type: Date, default: Date.now }, 
    statut: { type: String, default: "En attente" },
    fraisLivraison: String, 
    dureeLivraison: String
});

// --- 4. ROUTES API ---

// Récupérer tous les produits
app.get('/api/produits', async (req, res) => {
    try {
        const produits = await Produit.find();
        res.json(produits);
    } catch (err) { res.status(500).send(err); }
});

// Ajouter un produit avec image sur Cloudinary
app.post('/api/produits', upload.single('image'), async (req, res) => {
    try {
        const nouveauProduit = new Produit({
            ...req.body,
            image: req.file ? req.file.path : 'https://via.placeholder.com/150'
        });
        await nouveauProduit.save();
        res.json(nouveauProduit);
    } catch (err) { res.status(500).send(err); }
});

// Supprimer un produit
app.delete('/api/produits/:id', async (req, res) => {
    try {
        await Produit.findByIdAndDelete(req.params.id);
        res.send("Article supprimé avec succès");
    } catch (err) { res.status(500).send(err); }
});

// Créer une commande
app.post('/api/commandes', async (req, res) => {
    try {
        const nouvelleCommande = new Commande(req.body);
        await nouvelleCommande.save();
        res.json(nouvelleCommande);
    } catch (err) { res.status(500).send(err); }
});

app.listen(port, () => console.log(`Boutique SECONDE VIE active sur le port ${port}`));