let orderParams = new URLSearchParams(document.location.search);

const displayOrderNumber = () => {
    orderId.textContent = orderParams.get("id");
    localStorage.clear();
    setTimeout(() => {
        document.location.href = "file:///Users/macbook/Documents/P5-Dev-Web-Kanap/front/index.html";
    }, 5000);
};
displayOrderNumber();