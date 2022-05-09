// Récupération de l'ID du produit depuis l'URL de la page.
function productCheck() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    return id;
}

// Récupération des informations du produit grâce à son ID, depuis l'API.
async function productInfos() {
    const productId = productCheck();
    try {
        const res = await fetch(`http://localhost:3000/api/products/${productId}`);
        const item = await res.json();
        return item;
    } catch (error) {
        console.log("Erreur: " + error);    
    };
}

// Modification du DOM pour faire apparaitre les détails du produit.
(async function fillProduct() {
    const item = await productInfos();
    document.querySelector(".item__img").innerHTML =
        `<img src="${item.imageUrl}" alt="${item.altTxt}">`;
    document.querySelector("#title").innerHTML = item.name;
    document.querySelector("#price").innerHTML = item.price;
    document.querySelector("#description").innerHTML = item.description;
    item.colors.forEach(color => {
        document.querySelector("#colors").innerHTML +=
            `<option value="${color}">${color}</option>`
    });
})();

// Envoi de la sélection de l'utilisateur, dans le localStorage.
(function productStorage() {
    const sendButton = document.querySelector("#addToCart");
    sendButton.addEventListener("click", () => {
        const productId = productCheck();
        const productColor = document.querySelector("#colors").value;
        const productQuantity = document.querySelector("#quantity").value;
        let productDetails = {
            id: productId,
            color: productColor,
            quantity: productQuantity
        };
        let storageStatus = JSON.parse(localStorage.getItem("product"));
        let storagePush = () => {
            if (productColor === "") {
                alert("Veuillez sélectionner une couleur");
            } else if (productQuantity < 1 || productQuantity > 100) {
                alert("Veuillez choisir entre 1 et 100 articles");
            } else {
                storageStatus.push(productDetails);
                localStorage.setItem("product", JSON.stringify(storageStatus));
                alert("Votre sélection à été ajoutée au panier");
            }
        };
        if (storageStatus) {
            storageStatus.forEach((product, index) => {
                if (productDetails.id === product.id &&
                    productDetails.color === product.color) {
                    productDetails.quantity = parseInt(productDetails.quantity) +
                        parseInt(product.quantity);
                    storageStatus.splice(index, 1);
                }
            });
            storagePush();
        } else {
            storageStatus = [];
            storagePush();
        };
    });
})();