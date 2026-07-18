const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

router.get("/categories", async (req, res) => {

    try {

        const products = await Product.find();

        const categories = [...new Set(

            products.map(p => p.category || "OTROS")

        )];

        res.json(categories);

    }

    catch(err){

        res.status(500).json(err);

    }

});

module.exports = router;