// Récupération de la commande depuis le localStorage.
function getCart() {
    return JSON.parse(localStorage.getItem("product"));
}

// Vérification du contenu du panier.
function cartCheck() {
    const storageStatus = getCart();
    if (storageStatus === null || storageStatus.length === 0) {
        document.querySelector("#cart__items").innerHTML = `
            <article class="cart__item">
                <h2>Aucun produit</h2>   
                <p>Veuillez retourner sur la page d'accueil <br>
                    afin de sélectionner un produit.</p>
            </article>`;
        document.querySelector(".cart__order__form").hidden = true;
        document.querySelector("#totalQuantity").innerHTML = 0;
        document.querySelector("#totalPrice").innerHTML = 0;
        return false;
    } else {
        return true;
    }
}

// Modification du DOM pour afficher le contenu du panier.
async function cartDisplay() {
    const storageStatus = getCart();
    let totalPrice = 0;
    let totalQty = 0;
    let cartContent = "";
    for (product of storageStatus) {
        await fetch(`http://localhost:3000/api/products/${product.id}`)
            .then(res => res.json())
            .then(item => {
                totalPrice += parseInt(item.price) * parseInt(product.quantity);
                totalQty += parseInt(product.quantity);
                cartContent += `
                <article class="cart__item" data-id="${product.id}" data-color="${product.color}">
                <div class="cart__item__img">
                  <img src="${item.imageUrl}" alt="${item.altTxt}">
                </div>
                <div class="cart__item__content">
                  <div class="cart__item__content__description">
                    <h2>${item.name}</h2>
                            <p>${product.color}</p>
                            <p>${item.price * product.quantity} €</p>
                  </div>
                  <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                      <p>Qté : </p>
                      <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                      <p class="deleteItem">Supprimer</p>
                    </div>
                  </div>
                </div>
              </article>`;
            })
            .catch(error => {
                console.log("Erreur: " + error);
            });
    };
    document.querySelector("#cart__items").innerHTML = cartContent;
    document.querySelector("#totalQuantity").innerHTML = totalQty;
    document.querySelector("#totalPrice").innerHTML = totalPrice;
}

// Actualisation dynamique du panier, sans rechargement de la page.
async function loadPage() {
    if (cartCheck()) {
        await cartDisplay();
        productQuantity();
        productRemoval();
    }
}

loadPage();

// Gestion de la modification des quantités par l'utilisateur.
function productQuantity() {
    const storageStatus = getCart();
    const quantitySelectors = document.querySelectorAll(".itemQuantity");
    quantitySelectors.forEach(quantityInput => {
        quantityInput.addEventListener("change", (event) => {
            if (event.target.value < 1 || event.target.value > 100) {
                alert("Veuillez choisir entre 1 et 100 articles");
            } else {
                const newQty = event.target.value;
                const productId = event.target.closest("article").dataset.id;
                const productColor = event.target.closest("article").dataset.color;
                const productCartPosition = storageStatus.findIndex(item =>
                    item.id === productId && item.color === productColor);
                storageStatus[productCartPosition].quantity = newQty;
                localStorage.setItem("product", JSON.stringify(storageStatus));
                loadPage();
            }
        });
    });
}

// Gestion de la suppression des produits par l'utilisateur.
function productRemoval() {
    const storageStatus = getCart();
    const removeButtons = document.querySelectorAll(".deleteItem");
    removeButtons.forEach(removeButton => {
        removeButton.addEventListener("click", (event) => {
            const productId = event.target.closest("article").dataset.id;
            const productColor = event.target.closest("article").dataset.color;
            const newCart = storageStatus.filter(item =>
                !(item.id == productId && item.color === productColor));
            localStorage.setItem("product", JSON.stringify(newCart));
            loadPage();
        })
    });
}

// Vérification des inputs du formulaire, grâce à des Regex.
function formValidation() {
    const firstNameCheck = () => {
        const firstName = document.querySelector("#firstName");
        const errorMsg = document.querySelector("#firstNameErrorMsg");
        if (/^([A-Za-zÀ-ú]{2,20})?([-])?([A-Za-zÀ-ú]{2,20})$/.test(firstName.value)) {
            errorMsg.innerText = "";
            return true;
        } else {
            errorMsg.innerText = "Veuillez renseigner un prénom.";
        }
    };
    const lastNameCheck = () => {
        const lastName = document.querySelector("#lastName");
        const errorMsg = document.querySelector("#lastNameErrorMsg");
        if (/^([A-Za-zÀ-ú]{2,20})?([-])?([A-Za-zÀ-ú]{2,20})$/.test(lastName.value)) {
            errorMsg.innerText = "";
            return true;
        } else {
            errorMsg.innerText = "Veuillez renseigner un nom.";
        }
    };
    const addressCheck = () => {
        const address = document.querySelector("#address");
        const errorMsg = document.querySelector("#addressErrorMsg");
        if (address.value != "") {
            errorMsg.innerText = "";
            return true;
        } else {
            errorMsg.innerText = "Veuillez renseigner une adresse.";
        }
    };
    const cityCheck = () => {
        const city = document.querySelector("#city");
        const errorMsg = document.querySelector("#cityErrorMsg");
        if (/^([A-Za-zÀ-ú']{2,20})?([-])?([A-Za-zÀ-ú']{2,20})?([-])?([A-Za-zÀ-ú']{2,20})$/.test(city.value)) {
            errorMsg.innerText = "";
            return true;
        } else {
            errorMsg.innerText = "Veuillez renseigner une ville.";
        }
    };
    const emailCheck = () => {
        const email = document.querySelector("#email");
        const errorMsg = document.querySelector("#emailErrorMsg");
        if (/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(email.value)) {
            errorMsg.innerText = "";
            return true;
        } else {
            errorMsg.innerText = "Veuillez renseigner un email.";
        }
    };
    if (firstNameCheck() &&
        lastNameCheck() &&
        addressCheck() &&
        cityCheck() &&
        emailCheck()) {
        return true;
    } else {
        return false;
    }
}

// Envoi de la commande et redirection de l'utilisateur vers la page confirmation.
(async function orderSending() {
    const storageStatus = getCart();
    const orderButton = document.querySelector("#order");
    orderButton.addEventListener("click", async(event) => {
        event.preventDefault();
        if (formValidation()) {
            let contact = {
                firstName: document.querySelector("#firstName").value,
                lastName: document.querySelector("#lastName").value,
                address: document.querySelector("#address").value,
                city: document.querySelector("#city").value,
                email: document.querySelector("#email").value
            };
            let products = [];
            storageStatus.forEach(product => {
                products.push(product.id)
            });
            let userData = {
                contact,
                products
            };
            await fetch("http://localhost:3000/api/products/order", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                })
                .then(res => res.json())
                .then(data => {
                    localStorage.clear();
                    location.href = `file:///Users/macbook/Documents/P5-Dev-Web-Kanap/front/confirmation.html?id=${data.orderId}`;
                })
                .catch(error => {
                    console.log("Erreur: " + error);
                });
        } else {
            alert("Veuillez verifier vos informations.");
        }
    });
})();