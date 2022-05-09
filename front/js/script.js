// Récupération de la liste des produits et de leurs détails, depuis l'API.
async function getItems() {
    try {
        const res = await fetch("http://localhost:3000/api/products");
        const items = await res.json();
        return items;
    } catch (error) {
        console.log("Erreur: " + error);
    };
}

// Modification du DOM pour faire apparaitre les produits.
function showItem(item) {
    document.querySelector("#items").innerHTML += `
        <a href="./product.html?id=${item._id}">
            <article>
                <img src="${item.imageUrl}" alt="${item.altTxt}">
                <h3 class="productName">${item.name}</h3>
                <p class="productDescription">${item.description}</p>
            </article>
        </a>`;
}

// Rendu dynamique de la liste des produits.
(async function renderProducts() {
    const items = await getItems();
    items.forEach(item => {
        showItem(item)
    });
})()