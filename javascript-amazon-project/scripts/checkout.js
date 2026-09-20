import { cart, removeFromCart, updateQuantity, saveToStorage } from '../data/cart.js';

function renderOrderSummary() {
  let cartSummaryHTML = '';
  let totalItemsCount = 0;
  let itemsCostCents = 0;

  if (cart.length === 0) {
    cartSummaryHTML = `
      <div class="cart-item-container" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 20px; font-weight: 500; margin-bottom: 15px;">
          Your Amazon Cart is empty.
        </div>
        <a href="amazon.html">
          <button class="button-primary" style="padding: 10px 25px; cursor: pointer;">
            Explore Products
          </button>
        </a>
      </div>
    `;
  } else {
    cart.forEach((cartItem) => {
      const productId = cartItem.productId;

      let matchingProduct;
      products.forEach((product) => {
        if (product.id === productId) {
          matchingProduct = product;
        }
      });

      if (!matchingProduct) return;

      totalItemsCount += cartItem.quantity;
      itemsCostCents += matchingProduct.priceCents * cartItem.quantity;

      cartSummaryHTML += `
        <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
          <div class="delivery-date">
            Delivery date: Tuesday, June 21
          </div>

          <div class="cart-item-details-grid">
            <img class="product-image"
              src="${matchingProduct.image}">

            <div class="cart-item-details">
              <div class="product-name">
                ${matchingProduct.name}
              </div>
              <div class="product-price">
                &#8377;${(matchingProduct.priceCents / 100).toFixed(2)}
              </div>
              <div class="product-quantity">
                <span>
                  Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                </span>
                <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                  Update
                </span>
                <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                  Delete
                </span>
              </div>
            </div>

            <div class="delivery-options">
              <div class="delivery-options-title">
                Choose a delivery option:
              </div>
              <div class="delivery-option">
                <input type="radio" checked
                  class="delivery-option-input"
                  name="delivery-option-${matchingProduct.id}">
                <div>
                  <div class="delivery-option-date">
                    Tuesday, June 21
                  </div>
                  <div class="delivery-option-price">
                    FREE Shipping
                  </div>
                </div>
              </div>
              <div class="delivery-option">
                <input type="radio"
                  class="delivery-option-input"
                  name="delivery-option-${matchingProduct.id}">
                <div>
                  <div class="delivery-option-date">
                    Wednesday, June 15
                  </div>
                  <div class="delivery-option-price">
                    &#8377;49.00 - Shipping
                  </div>
                </div>
              </div>
              <div class="delivery-option">
                <input type="radio"
                  class="delivery-option-input"
                  name="delivery-option-${matchingProduct.id}">
                <div>
                  <div class="delivery-option-date">
                    Monday, June 13
                  </div>
                  <div class="delivery-option-price">
                    &#8377;99.00 - Shipping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  const orderSummaryElement = document.querySelector('.js-order-summary');
  if (orderSummaryElement) {
    orderSummaryElement.innerHTML = cartSummaryHTML;
  }

  // Update Checkout Header count
  const headerItemsElement = document.querySelector('.js-checkout-header-items');
  if (headerItemsElement) {
    headerItemsElement.innerText = `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'}`;
  }

  // Update Payment Summary
  const paymentItemsElement = document.querySelector('.js-payment-summary-items');
  if (paymentItemsElement) {
    paymentItemsElement.innerText = totalItemsCount;
  }

  const paymentItemsCostElement = document.querySelector('.js-payment-summary-items-cost');
  if (paymentItemsCostElement) {
    paymentItemsCostElement.innerHTML = `&#8377;${(itemsCostCents / 100).toFixed(2)}`;
  }

  const shippingCostCents = cart.length > 0 ? 0 : 0;
  const subtotalCents = itemsCostCents + shippingCostCents;
  const taxCents = Math.round(subtotalCents * 0.1);
  const totalCents = subtotalCents + taxCents;

  const subtotalElement = document.querySelector('.js-payment-summary-subtotal');
  if (subtotalElement) {
    subtotalElement.innerHTML = `&#8377;${(subtotalCents / 100).toFixed(2)}`;
  }

  const taxElement = document.querySelector('.js-payment-summary-tax');
  if (taxElement) {
    taxElement.innerHTML = `&#8377;${(taxCents / 100).toFixed(2)}`;
  }

  const totalElement = document.querySelector('.js-payment-summary-total');
  if (totalElement) {
    totalElement.innerHTML = `&#8377;${(totalCents / 100).toFixed(2)}`;
  }

  // Attach delete handlers
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      renderOrderSummary();
    });
  });

  // Attach update handlers
  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const currentItem = cart.find(item => item.productId === productId);
      const newQuantityStr = prompt('Enter new quantity (1-100):', currentItem ? currentItem.quantity : 1);
      if (newQuantityStr !== null) {
        const newQuantity = Number(newQuantityStr);
        if (newQuantity > 0 && newQuantity <= 100) {
          updateQuantity(productId, newQuantity);
          renderOrderSummary();
        } else if (newQuantity === 0) {
          removeFromCart(productId);
          renderOrderSummary();
        }
      }
    });
  });
}

renderOrderSummary();
