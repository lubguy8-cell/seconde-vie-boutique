const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Fichiers de données (Nos mini bases de données)
const DATA_FILE = 'produits.json';
const ORDERS_FILE = 'commandes.json';

// Initialisation des fichiers s'ils n'existent pas
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));

// --- GESTION DES PRODUITS ---

// Lire les produits
app.get('/api/produits', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// Ajouter ou Modifier un produit (incluant Stock et Fournisseur)
app.post('/api/produits', (req, res) => {
    const produits = JSON.parse(fs.readFileSync(DATA_FILE));
    const nouveauProduit = {
        id: Date.now(),
        nom: req.body.nom,
        prix: req.body.prix,
        image: req.body.image,
        fournisseur: req.body.fournisseur || "Interne",
        stock: req.body.stock, // Nombre ou "infini"
        description: req.body.description || ""
    };
    produits.push(nouveauProduit);
    fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2));
    res.json({ message: "Article enregistré avec succès !" });
});

// Supprimer un produit
app.delete('/api/produits/:id', (req, res) => {
    let produits = JSON.parse(fs.readFileSync(DATA_FILE));
    produits = produits.filter(p => p.id != req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2));
    res.json({ message: "Article supprimé." });
});

// --- GESTION DES COMMANDES (PANIER) ---

// Envoyer une commande depuis la boutique vers l'espace DG
app.post('/api/commandes', (req, res) => {
    const commandes = JSON.parse(fs.readFileSync(ORDERS_FILE));
    const nouvelleCommande = {
        id: "CMD-" + Date.now(),
        date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' }),
        client: req.body.client, // {nom, telephone, commune}
        articles: req.body.articles, // Liste du panier
        total: req.body.total,
        paiement: req.body.paiement, // M-Pesa, Orange, Espèces
        statut: "En attente", // En attente, Confirmée, Livrée
        fraisLivraison: req.body.fraisLivraison || 0
    };
    commandes.push(nouvelleCommande);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(commandes, null, 2));
    res.json({ message: "Demande de commande reçue par le DG !", id: nouvelleCommande.id });
});

// Lire les commandes pour l'espace DG
app.get('/api/commandes', (req, res) => {
    const commandes = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(commandes);
});

// Mettre à jour le statut (Confirmer la commande)
app.patch('/api/commandes/:id', (req, res) => {
    const commandes = JSON.parse(fs.readFileSync(ORDERS_FILE));
    const index = commandes.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        commandes[index].statut = req.body.statut;
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(commandes, null, 2));
        res.json({ message: "Statut mis à jour." });
    }
});

app.listen(PORT, () => {
    console.log(`
    =============================================
    BOUTIQUE SECONDE VIE : MODE PRO ACTIVÉE
    Serveur : http://localhost:${PORT}
    =============================================
    `);
});