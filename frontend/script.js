let currentPage = 1;

function getFilters() {
  return {
    city: document.getElementById("city-filter")?.value || "",
    bhk: document.getElementById("bhk-filter")?.value || "",
    maxPrice: document.getElementById("price-filter")?.value || ""
  };
}

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

function formatIndianPrice(priceStr) {
  const price = parsePriceToNumber(priceStr);
  return "₹" + price.toLocaleString("en-IN");
}

function loadListings(page = 1) {
  const { city, bhk, maxPrice } = getFilters();

  const query = new URLSearchParams({
    page,
    limit: 10,
    city,
    bhk,
    maxPrice
  });

  fetch(`/api/listings?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("listing-container");
      const pagination = document.getElementById("pagination");
      container.innerHTML = "";
      pagination.innerHTML = "";

      if (data.listings.length === 0) {
        container.innerHTML = "<p style='text-align:center; font-weight:bold; color:gray;'>No matching properties found.</p>";
        return;
      }

      data.listings.forEach(listing => {
        const card = document.createElement("div");
        card.className = "card";
        card.onclick = () => window.location = `listing.html?id=${listing.id}`;
        card.innerHTML = `
          <img src="${listing.image}" alt="${listing.title}">
          <div class="info">
            <h3>${listing.title}</h3>
            <p>${listing.location}</p>
            <p><strong>${formatIndianPrice(listing.price)}</strong></p>
          </div>
        `;
        container.appendChild(card);
      });

      renderPagination(data.page, data.total);
    });
}

function renderPagination(current, total) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(total / 10);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.innerText = i;
    if (i === current) btn.style.backgroundColor = "#444";
    btn.onclick = () => {
      currentPage = i;
      loadListings(currentPage);
    };
    pagination.appendChild(btn);
  }
}

// ✅ Function to handle filter changes
function handleFilterChange() {
  currentPage = 1; // Reset to first page when filters change
  loadListings(currentPage);
}

function setupFilters() {
  document.getElementById("filters").innerHTML = `
    <select id="city-filter">
      <option value="">All Cities</option>
      <option value="Delhi">Delhi</option>
      <option value="Noida">Noida</option>
      <option value="Gurgaon">Gurgaon</option>
      <option value="Mumbai">Mumbai</option>
    </select>

    <select id="bhk-filter">
      <option value="">All BHK</option>
      <option value="1BHK">1BHK</option>
      <option value="2BHK">2BHK</option>
      <option value="3BHK">3BHK</option>
      <option value="4BHK">4BHK</option>
      <option value="5BHK">5BHK</option>
    </select>

    <select id="price-filter">
      <option value="">Any Price</option>
      <option value="1000000">Up to ₹10,00,000</option>
      <option value="1500000">Up to ₹15,00,000</option>
      <option value="2000000">Up to ₹20,00,000</option>
      <option value="2500000">Up to ₹25,00,000</option>
      <option value="3000000">Up to ₹30,00,000</option>
      <option value="3500000">Up to ₹35,00,000</option>
      <option value="4000000">Up to ₹40,00,000</option>
      <option value="4500000">Up to ₹45,00,000</option>
      <option value="5000000">Up to ₹50,00,000</option>
      <option value="5500000">Up to ₹55,00,000</option>
      <option value="6000000">Up to ₹60,00,000</option>
      <option value="6500000">Up to ₹65,00,000</option>
      <option value="7000000">Up to ₹70,00,000</option>
      <option value="7500000">Up to ₹75,00,000</option>
      <option value="8000000">Up to ₹80,00,000</option>
      <option value="8500000">Up to ₹85,00,000</option>
      <option value="9000000">Up to ₹90,00,000</option>
      <option value="9500000">Up to ₹95,00,000</option>
      <option value="10000000">Up to ₹1,00,00,000</option>
      <option value="999999999">₹1,00,00,000+</option>
    </select>

    <button class="page-btn" onclick="handleFilterChange()">Search</button>
  `;

  // ✅ No automatic filtering - filters only work when Search button is pressed
}

function loadLogin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loginArea = document.getElementById("login-area");

  if (user) {
    loginArea.innerText = `Hi, ${user.name}`;
  } else {
    loginArea.innerHTML = `<a href="login.html"><button class="page-btn">Sign in with Google</button></a>`;
  }
}

window.onload = () => {
  setupFilters();
  loadListings(currentPage);
  loadLogin();
};