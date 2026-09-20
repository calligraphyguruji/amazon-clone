export let cart = JSON.parse(localStorage.getItem('cart')) || [];

function normalizeCart() {
  if (typeof products === 'undefined') return;

  const validCart = [];
  cart.forEach((cartItem) => {
    if (!cartItem) return;
    if (cartItem.productId) {
      const exists = products.some(p => p.id === cartItem.productId);
      if (exists) {
        validCart.push(cartItem);
      }
    } else if (cartItem.productName) {
      const match = products.find(p => p.name === cartItem.productName);
      if (match) {
        const existingInValid = validCart.find(item => item.productId === match.id);
        if (existingInValid) {
          existingInValid.quantity += (cartItem.quantity || 1);
        } else {
          validCart.push({
            productId: match.id,
            quantity: cartItem.quantity || 1
          });
        }
      }
    }
  });

  cart = validCart;
  saveToStorage();
}

if (typeof products !== 'undefined') {
  normalizeCart();
}

export function loadFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (typeof products !== 'undefined') {
    normalizeCart();
  }
}

export function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(productId, quantity = 1) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {
    cart.push({
      productId: productId,
      quantity: quantity
    });
  }

  saveToStorage();
}

export function removeFromCart(productId) {
  const newCart = [];

  cart.forEach((cartItem) => {
    if (cartItem.productId !== productId) {
      newCart.push(cartItem);
    }
  });

  cart = newCart;
  saveToStorage();
}

export function updateQuantity(productId, newQuantity) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity = newQuantity;
    saveToStorage();
  }
}