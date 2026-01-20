const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address-input");
const addressWarning = document.getElementById("address-warn");
const spanItem = document.getElementById("date-span");
const pickupCheckbox = document.getElementById("pickup-checkbox");

let cart = [];

/* -----------------------------
      PREÇOS POR BAIRRO
-------------------------------- */
const precosPorBairro = {
  "vila lalau": 12,
  "jaraguá 99": 10,
  "chico de paulo": 8,
  "ilha da figueira": 14,
};

/* -----------------------------
      FUNÇÃO PARA IDENTIFICAR BAIRRO
-------------------------------- */
function identificarBairro(address) {
  address = address.toLowerCase();
  if (address.includes("vila lalau")) return "vila lalau";
  if (address.includes("jaraguá 99")) return "jaraguá 99";
  if (address.includes("chico de paulo")) return "chico de paulo";
  if (address.includes("ilha da figueira")) return "ilha da figueira";
  return null;
}

/* -----------------------------
      ABRIR E FECHAR CARRINHO
-------------------------------- */
cartBtn.addEventListener("click", () => {
  cartModal.style.display = "flex";
  updateCart();
});

cartModal.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

/* -----------------------------
        ADICIONAR ITEM
-------------------------------- */
menu.addEventListener("click", (event) => {
  const parentButton = event.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const itemName = parentButton.getAttribute("data-name");
    const itemPrice = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(itemName, itemPrice);
    updateCart();
  }
});

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
}

/* -----------------------------
        ATUALIZAR CARRINHO
-------------------------------- */
function updateCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "items-start",
      "border-b",
      "pb-3",
      "mb-3"
    );

    cartItemElement.innerHTML = `
      <div>
        <p class="font-semibold">${item.name}</p>
        <p class="text-sm">Qtd: ${item.quantity}</p>
        <p class="text-xs text-gray-600">${item.obs || ""}</p>
        <p class="font-medium mt-1">R$ ${item.price.toFixed(2)}</p>
      </div>
      <button class="remove-from-cart-btn" data-name="${item.name}">
        remover
      </button>
    `;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Contador mostra quantidade total de produtos
  cartCounter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

/* -----------------------------
      REMOVER ITEM
-------------------------------- */
cartItemsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const itemName = event.target.getAttribute("data-name");
    const itemObs = event.target.getAttribute("data-obs");
    removeFromCart(itemName, itemObs);
    updateCart();
  }
});

function removeFromCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
  }
}

/* -----------------------------
        FINALIZAR PEDIDO
-------------------------------- */
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  const retirada = pickupCheckbox.checked;
  const address = addressInput.value.trim();

  if (!retirada && address === "") {
    addressWarning.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  addressWarning.classList.add("hidden");
  addressInput.classList.remove("border-red-500");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let frete = 0;
  let bairroEncontrado = null;
  if (!retirada) {
    bairroEncontrado = identificarBairro(address);
    frete = bairroEncontrado ? precosPorBairro[bairroEncontrado] : 0;
  }

  const total = subtotal + frete;

  // Lista de itens
  const cartItemsText = cart
    .map((item) => {
      const obsText = item.obs ? ` (Obs: ${item.obs})` : "";
      return `${item.quantity}x ${item.name}${obsText} - R$ ${(
        item.price * item.quantity
      ).toFixed(2)}`;
    })
    .join("\n");

  // Montar mensagem com estilo antigo do Maps (%0A)
  let entregaTexto = "";
  let mapsTexto = "";
  let freteTexto = `*Frete:* R$ ${frete.toFixed(2)}%0A`;

  if (retirada) {
    entregaTexto = "*Entrega:* RETIRADA NO BALCÃO%0A";
    freteTexto = "";
    mapsTexto = "";
  } else {
    entregaTexto = `*Endereço:* ${encodeURIComponent(address)}%0A`;
    mapsTexto = `*Google Maps:* https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}%0A`;
  }

  const message =
    `*Novo Pedido!*%0A%0A` +
    `${encodeURIComponent(cartItemsText)}%0A%0A` +
    `*Subtotal:* R$ ${subtotal.toFixed(2)}%0A` +
    freteTexto +
    `*Total:* R$ ${total.toFixed(2)}%0A%0A` +
    entregaTexto +
    mapsTexto;

  const phoneNumber = "47997716634";
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");

  cart = [];
  updateCart();
});

/* -----------------------------
      HORÁRIO DO RESTAURANTE
-------------------------------- */
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 23;
}

if (checkRestaurantOpen()) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-500");
} else {
  spanItem.classList.remove("bg-green-500");
  spanItem.classList.add("bg-red-500");
}
