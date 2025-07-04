const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

// ✅ Parse price strings like "31 Lakhs", "2 Cr", "₹4200000"
function parsePriceToNumber(priceStr) {
  const clean = priceStr.toLowerCase().replace(/[^a-z0-9. ]/g, '').trim();

  if (clean.includes("lakh")) {
    const value = parseFloat(clean);
    return isNaN(value) ? 0 : value * 100000;
  }

  if (clean.includes("cr")) {
    const value = parseFloat(clean);
    return isNaN(value) ? 0 : value * 10000000;
  }

  const direct = parseInt(clean.replace(/\D/g, ""));
  return isNaN(direct) ? 0 : direct;
}

app.get('/api/listings', (req, res) => {
  const { page = 1, limit = 10, city, bhk, maxPrice } = req.query;
  const filePath = path.join(__dirname, 'data', 'listings.json');
  let listings = JSON.parse(fs.readFileSync(filePath));

  // ✅ Apply filters first
  if (city) listings = listings.filter(l => l.location.toLowerCase() === city.toLowerCase());
  if (bhk) listings = listings.filter(l => l.title.includes(bhk));
  if (maxPrice) {
    const cap = parseInt(maxPrice);
    listings = listings.filter(l => {
      const price = parsePriceToNumber(l.price);
      return price <= cap;
    });
  }

  // ✅ Then paginate
  const start = (page - 1) * limit;
  const paginated = listings.slice(start, start + parseInt(limit));

  res.json({
    page: parseInt(page),
    total: listings.length,
    listings: paginated
  });
});

app.get('/api/listings/:id', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'listings.json');
  const listings = JSON.parse(fs.readFileSync(filePath));
  const listing = listings.find(l => l.id == req.params.id);
  if (listing) res.json(listing);
  else res.status(404).json({ error: 'Listing not found' });
});

app.post('/api/listings', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'listings.json');
  const listings = JSON.parse(fs.readFileSync(filePath));
  const newId = listings.length > 0 ? listings[listings.length - 1].id + 1 : 1;

  const newListing = {
    id: newId,
    title: req.body.title,
    location: req.body.location,
    price: req.body.price,
    description: req.body.description,
    image: req.body.image
  };

  listings.push(newListing);
  fs.writeFileSync(filePath, JSON.stringify(listings, null, 2));
  res.json({ message: '✅ Listing added successfully!' });
});

app.listen(PORT, () => {
  console.log(`🚀 BrickNest server running at http://localhost:${PORT}`);
});
