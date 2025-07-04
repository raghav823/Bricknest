const id = new URLSearchParams(window.location.search).get("id");
const detailDiv = document.getElementById("listing-detail");
let user = null;

// Load user from localStorage
const userData = localStorage.getItem("user");
if (userData) {
  user = JSON.parse(userData);
}

// Fetch and show listing
fetch(`/api/listings/${id}`)
  .then(res => res.json())
  .then(listing => {
    detailDiv.innerHTML = `
      <h2>${listing.title}</h2>
      <img src="${listing.image}" alt="${listing.title}" />
      <p><strong>City:</strong> ${listing.location}</p>
      <p><strong>Price:</strong> ${listing.price}</p>
      <p>${listing.description}</p>
      <button class="view-owner-btn" id="view-owner">📞 View Owner's Number</button>
      <button class="share-btn" onclick="copyLink()">📤 Share this property</button>
      <p id="owner-info" style="margin-top:10px; font-weight:bold;"></p>
    `;

    if (user) {
      const infoBox = document.createElement("p");
      infoBox.innerText = `👋 Welcome, ${user.name}`;
      detailDiv.appendChild(infoBox);
    }

    document.getElementById("view-owner").onclick = () => {
      const infoArea = document.getElementById("owner-info");
      infoArea.innerHTML = "";

      if (user) {
        infoArea.innerText = "📱 Contact: +91-9876543210";
      } else {
        const promptBox = document.createElement("div");
        promptBox.style = `
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          background: #f4f4f4;
          text-align: center;
        `;
        promptBox.innerHTML = `
          <p><strong>Sign in to view the owner's number</strong></p>
          <div id="g_id_signin_btn"></div>
        `;
        infoArea.appendChild(promptBox);

        google.accounts.id.initialize({
            client_id: "843087196803-7s7l9jf1cdrvctakochbv0tce359l1q7.apps.googleusercontent.com",
            callback: (res) => {
              const userInfo = jwt_decode(res.credential);
              localStorage.setItem("user", JSON.stringify(userInfo));
              location.reload();
            }
          });
          
        google.accounts.id.renderButton(
          document.getElementById("g_id_signin_btn"),
          { theme: "outline", size: "large" }
        );
      }
    };
  })
  .catch(err => {
    detailDiv.innerHTML = `<p style="color:red;">❌ Listing not found.</p>`;
    console.error(err);
  });

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("🔗 Link copied to clipboard!");
}
