const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];

app.use(express.json());

app.get("/categories/:categoryname/products", async (req, res) => {
  const { categoryname } = req.params;
  const {
    top = 10,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    page = 1,
    sortBy,
    sortOrder = "asc",
  } = req.query;
  const pageSize = Math.min(top, 10);
  const startIndex = (page - 1) * pageSize;

  try {
    const allProducts = [];

    for (const company of companies) {
      const url = `http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
      const response = await axios.get(url);
      const products = response.data.map((product) => ({
        ...product,
        company,
        id: uuidv4(),
      }));
      allProducts.push(...products);
    }

    // Sorting
    if (sortBy) {
      allProducts.sort((a, b) => {
        if (sortOrder === "asc") {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
    }

    // Pagination
    const paginatedProducts = allProducts.slice(
      startIndex,
      startIndex + pageSize
    );

    res.json(paginatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET product details by ID
app.get("/categories/:categoryname/products/:productid", async (req, res) => {
  const { categoryname, productid } = req.params;

  try {
    const allProducts = [];

    for (const company of companies) {
      const url = `http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products?top=1000`; // Large number to fetch all products
      const response = await axios.get(url);
      const products = response.data.map((product) => ({
        ...product,
        company,
        id: uuidv4(),
      }));
      allProducts.push(...products);
    }

    const product = allProducts.find((prod) => prod.id === productid);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
