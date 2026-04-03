const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// --- 1. CONNEXION MONGODB ---
const mongoURI = 'mongodb+srv://lubguy8_db_user:4bgwFcYISTj496Ro@cluster0.ftforz7.mongodb.net/seconde_vie?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log("Léopard connecté à MongoDB ! 🇨🇩 ✅"))
  .catch(err => console.error("Erreur MongoDB :", err));

// --- 2. CONFIGURATION CLOUDINARY ---
cloudinary.config({ 
  cloud_name: 'TON_CLOUD_NAME', 
  api_key: 'TA_CLE_API', 
  api_secret: 'TON_SECRET_API' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { 
    folder: 'seconde-vie-articles', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // Cloudinary accepte presque toutes les tailles, pas de limite de poids ici
  },
});
const upload = multer({ storage: storage });

// --- 3. MODÈLE ---
const Produit = mongoose.model('Produit', {
  nom: String, 
  prix: Number, 
  image: String, 
  fournisseurId: String, 
  stock: String,
  createdAt: { type: Date, default: Date.now }
});

// --- 4. ROUTES ---

// Récupérer les produits
app.get('/api/produits', async (req, res) => {
  const produits = await Produit.find().sort({ createdAt: -1 });
  res.json(produits);
});

// Ajouter un produit (IMAGE SUR CLOUDINARY)
app.post('/api/produits', upload.single('image'), async (req, res) => {
  try {
    // Si aucune image n’est envoyée, erreur
    if (!req.file) {
      return res.status(400).json({ message: "Erreur. Veuillez choisir une photo." });
    }

    // Sauvegarde du produit avec l’URL de Cloudinary
    const nouveau = new Produit({
      nom: req.body.nom,
      prix: req.body.prix,
      fournisseurId: req.body.fournisseurId,
      stock: req.body.stock,
      image: req.file.path  // url générée par Cloudinary
    });

    await nouveau.save();
    res.status(201).json(nouveau);

  } catch (err) {
    // Si Cloudinary ou MongoDB plante
    res.status(500).json({ message: "Erreur. Essayez une autre photo.", error: err.message });
  }
});

// Supprimer
app.delete('/api/produits/:id', async (req, res) => {
  await Produit.findByIdAndDelete(req.params.id);
  res.send("Supprimé");
});

app.listen(port, () => console.log(`🚀 Boutique active sur le port ${port}`));