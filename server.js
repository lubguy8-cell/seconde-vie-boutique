// Ajoute ces deux fonctions dans ton server.js existant (section PRODUITS)

// MODIFIER UN PRODUIT
app.put('/api/produits/:id', upload.single('image'), (req, res) => {
    let data = lireDB(DB_PRODUITS);
    const index = data.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        data[index].nom = req.body.nom;
        data[index].prix = parseFloat(req.body.prix);
        data[index].devise = req.body.devise;
        data[index].fournisseurId = req.body.fournisseurId;
        data[index].stock = req.body.stock === 'infini' ? 'infini' : parseInt(req.body.stock);
        if (req.file) data[index].image = `/uploads/${req.file.filename}`;
        fs.writeFileSync(DB_PRODUITS, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } else { res.status(404).send("Non trouvé"); }
});

// SUPPRIMER UN PRODUIT
app.delete('/api/produits/:id', (req, res) => {
    let data = lireDB(DB_PRODUITS);
    data = data.filter(p => p.id !== req.params.id);
    fs.writeFileSync(DB_PRODUITS, JSON.stringify(data, null, 2));
    res.send("Supprimé");
});
