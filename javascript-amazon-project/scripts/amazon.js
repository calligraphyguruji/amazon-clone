import { cart, addToCart, loadFromStorage } from '../data/cart.js';

// Global state for catalog filtering
let currentCategory = 'all';
let currentSearchQuery = '';
let activeFilterPill = 'all';

// Track timer IDs for added checkmarks per product
const addedMessageTimeouts = {};

// =========================================================
// 1. RENDER PRODUCTS
// =========================================================
function renderProductsGrid() {
  const productsGridElement = document.querySelector('.js-products-grid');
  if (!productsGridElement) return;

  if (typeof products === 'undefined' || !Array.isArray(products)) {
    productsGridElement.innerHTML = '<div style="padding: 20px; font-size: 16px;">No products found.</div>';
    return;
  }

  // Filter products based on search query, category, and filter pills
  const filteredProducts = products.filter((product) => {
    // 1. Keyword search filter
    if (currentSearchQuery.trim() !== '') {
      const q = currentSearchQuery.toLowerCase().trim();
      const nameMatch = product.name.toLowerCase().includes(q);
      const keywordMatch = product.keywords && product.keywords.some(k => k.toLowerCase().includes(q));
      if (!nameMatch && !keywordMatch) {
        return false;
      }
    }

    // 2. Category / Filter Pill
    const activeCategory = currentCategory !== 'all' ? currentCategory : activeFilterPill;

    if (activeCategory === 'under500') {
      return (product.priceCents / 100) < 500;
    }

    if (activeCategory === 'prime') {
      return (product.rating.stars >= 4.5);
    }

    if (activeCategory === 'bestseller') {
      return product.rating.count >= 200;
    }

    if (activeCategory === 'deals') {
      return (product.priceCents / 100) < 1500 || product.rating.stars >= 4.5;
    }

    if (activeCategory === 'electronics') {
      const kws = ['toaster', 'blender', 'kettle', 'coffeemakers', 'appliances', 'speaker', 'headphones'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    if (activeCategory === 'apparel' || activeCategory === 'fashion') {
      const kws = ['socks', 'tshirts', 'hoodies', 'sweaters', 'pants', 'shorts', 'sunglasses', 'jewelry', 'sandals', 'shoes', 'apparel'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    if (activeCategory === 'kitchen') {
      const kws = ['kitchen', 'cookware', 'baking', 'towels', 'mixing bowls', 'food containers', 'dishes', 'plates', 'curtains', 'bed sheets', 'bedroom', 'bathroom'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    if (activeCategory === 'sports') {
      const kws = ['sports', 'basketballs', 'shoes', 'running shoes', 'athletic'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    if (activeCategory === 'appliances') {
      const kws = ['appliances', 'toaster', 'blender', 'kettle', 'coffeemakers'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    if (activeCategory === 'daily') {
      const kws = ['cleaning', 'bathroom', 'washroom', 'kleenex', 'tissues', 'garbage', 'laundry'];
      return product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
    }

    return true;
  });

  // Update catalog header labels
  const catalogCountElement = document.querySelector('.js-catalog-count');
  if (catalogCountElement) {
    catalogCountElement.innerText = `Showing ${filteredProducts.length} of ${products.length} products`;
  }

  if (filteredProducts.length === 0) {
    productsGridElement.innerHTML = `
      <div style="grid-column: 1 / -1; background: #fff; padding: 40px; text-align: center; border-radius: 8px;">
        <h3 style="margin-bottom: 10px; font-size: 20px;">No matching products found</h3>
        <p style="color: #555; font-size: 14px; margin-bottom: 20px;">Try checking your spelling or use more general terms.</p>
        <button class="filter-pill active js-reset-filters" style="padding: 8px 20px; cursor: pointer;">
          Reset All Filters
        </button>
      </div>
    `;

    const resetBtn = document.querySelector('.js-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentCategory = 'all';
        currentSearchQuery = '';
        activeFilterPill = 'all';
        const searchInput = document.querySelector('.js-search-input');
        if (searchInput) searchInput.value = '';
        const searchCat = document.querySelector('.js-search-category');
        if (searchCat) searchCat.value = 'all';
        updateFilterPillsUI('all');
        renderProductsGrid();
      });
    }
    return;
  }

  let productsHTML = '';

  filteredProducts.forEach((product) => {
    const priceRupees = (product.priceCents / 100).toFixed(0);
    const originalMrp = ((product.priceCents * 1.55) / 100).toFixed(0);
    const discountPercent = Math.round(((originalMrp - priceRupees) / originalMrp) * 100);

    const isDeal = product.rating.stars >= 4.5;
    const isBestseller = product.rating.count >= 200;

    let badgeHTML = '<div class="product-badge-wrap"></div>';
    if (isDeal) {
      badgeHTML = `<div class="product-badge-wrap"><span class="product-deal-badge">Limited time deal</span></div>`;
    } else if (isBestseller) {
      badgeHTML = `<div class="product-badge-wrap"><span class="product-bestseller-badge">#1 Best Seller</span></div>`;
    }

    productsHTML += `
      <div class="product-container">
        ${badgeHTML}

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="Added">
          Added
        </div>

        <div class="product-image-container">
          <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        </div>

        <div class="product-name" title="${product.name}">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
            src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars">
          <span class="product-rating-count">
            ${product.rating.count.toLocaleString()}
          </span>
        </div>

        <div class="product-price-row">
          <span class="product-price">&#8377;${Number(priceRupees).toLocaleString('en-IN')}</span>
          <span class="product-mrp">M.R.P.: &#8377;${Number(originalMrp).toLocaleString('en-IN')}</span>
          <span class="product-discount-tag">(${discountPercent}% off)</span>
        </div>

        <div class="product-prime-delivery">
          <span class="prime-logo-text">✓prime</span>
          <span>FREE Delivery by <strong>Tomorrow</strong></span>
        </div>

        <div class="product-actions-row">
          <div class="product-quantity-container">
            <select class="js-quantity-selector-${product.id}" aria-label="Select quantity">
              <option value="1" selected>1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          <button class="add-to-cart-button js-add-to-cart"
            data-product-id="${product.id}"
            data-product-name="${product.name}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });

  productsGridElement.innerHTML = productsHTML;
  attachAddToCartListeners();
}

// =========================================================
// 2. ADD TO CART HANDLER
// =========================================================
function attachAddToCartListeners() {
  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = quantitySelector ? Number(quantitySelector.value) : 1;

      addToCart(productId, quantity);
      updateCartQuantity();

      // Show "Added" checkmark badge with smooth fade
      const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
      if (addedMessage) {
        addedMessage.classList.add('visible');

        const previousTimeoutId = addedMessageTimeouts[productId];
        if (previousTimeoutId) {
          clearTimeout(previousTimeoutId);
        }

        const timeoutId = setTimeout(() => {
          addedMessage.classList.remove('visible');
        }, 2000);

        addedMessageTimeouts[productId] = timeoutId;
      }
    });
  });
}

// =========================================================
// 3. CART QUANTITY HEADER UPDATE
// =========================================================
export function updateCartQuantity() {
  loadFromStorage();
  let cartQuantity = 0;
  cart.forEach((item) => {
    cartQuantity += item.quantity;
  });

  const cartQuantityElement = document.querySelector('.js-cart-quantity');
  if (cartQuantityElement) {
    cartQuantityElement.innerHTML = cartQuantity;
  }
}

// =========================================================
// 4. SEARCH & FILTERING SYSTEM
// =========================================================
function setupSearchAndFilters() {
  const searchForm = document.querySelector('.js-search-form');
  const searchInput = document.querySelector('.js-search-input');
  const searchCategory = document.querySelector('.js-search-category');

  // Search form submission -> Navigates to search.html like real Amazon
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      const category = searchCategory ? searchCategory.value : 'all';
      if (query !== '' || category !== 'all') {
        window.location.href = `search.html?search=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
      } else {
        window.location.href = `search.html`;
      }
    });
  }

  // Category select change
  if (searchCategory) {
    searchCategory.addEventListener('change', () => {
      currentCategory = searchCategory.value;
      activeFilterPill = 'all';
      updateFilterPillsUI('all');
      renderProductsGrid();
    });
  }

  // Filter pills
  document.querySelectorAll('.js-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const category = pill.dataset.category;
      activeFilterPill = category;
      currentCategory = category;
      updateFilterPillsUI(category);
      renderProductsGrid();
    });
  });

  // Subnav category links
  document.querySelectorAll('.js-subnav-filter').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      if (category) {
        currentCategory = category;
        activeFilterPill = category;
        currentSearchQuery = '';
        if (searchInput) searchInput.value = '';
        updateFilterPillsUI(category);
        renderProductsGrid();

        const catalogEl = document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Deal Cards in Hero Carousel
  document.querySelectorAll('.js-deal-card-filter').forEach((card) => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      const keyword = card.dataset.keyword;
      if (category) {
        currentCategory = category;
        activeFilterPill = category;
        currentSearchQuery = keyword || '';
        if (searchInput) searchInput.value = keyword || '';
        updateFilterPillsUI(category);
        renderProductsGrid();

        const catalogEl = document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Multi-item feature boxes
  document.querySelectorAll('.js-feature-click').forEach((item) => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      const keyword = item.dataset.keyword;
      if (category) {
        currentCategory = category;
        activeFilterPill = category;
        currentSearchQuery = keyword || '';
        if (searchInput) searchInput.value = keyword || '';
        updateFilterPillsUI(category);
        renderProductsGrid();

        const catalogEl = document.getElementById('catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

function updateFilterPillsUI(selectedCategory) {
  document.querySelectorAll('.js-filter-pill').forEach((pill) => {
    if (pill.dataset.category === selectedCategory) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

// =========================================================
// 5. HERO CAROUSEL SLIDER CONTROLS
// =========================================================
function setupCarousel() {
  const carousel = document.querySelector('.js-deals-carousel');
  const prevBtn = document.querySelector('.js-carousel-prev');
  const nextBtn = document.querySelector('.js-carousel-next');

  if (!carousel || !prevBtn || !nextBtn) return;

  const scrollAmount = 320;

  prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

// =========================================================
// 6. SIDEBAR DRAWER (All Menu)
// =========================================================
function setupSidebarDrawer() {
  const toggleBtn = document.querySelector('.js-sidebar-toggle');
  const sidebar = document.querySelector('.js-amazon-sidebar');
  const overlay = document.querySelector('.js-sidebar-overlay');
  const closeBtn = document.querySelector('.js-sidebar-close-btn');

  if (!sidebar || !overlay) return;

  const openDrawer = () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    if (closeBtn) closeBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    if (closeBtn) closeBtn.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  document.querySelectorAll('.js-sidebar-link').forEach((link) => {
    link.addEventListener('click', () => {
      const category = link.dataset.category;
      if (category) {
        currentCategory = category;
        activeFilterPill = category;
        updateFilterPillsUI(category);
        renderProductsGrid();
      }
      closeDrawer();
    });
  });
}

// =========================================================
// 7. LOCATION MODAL (Pincode & City)
// =========================================================
function setupLocationModal() {
  const locationBtn = document.querySelector('.js-location-btn');
  const modalOverlay = document.querySelector('.js-location-modal-overlay');
  const modalClose = document.querySelector('.js-location-modal-close');
  const pincodeForm = document.querySelector('.js-pincode-form');
  const pincodeInput = document.querySelector('.js-pincode-input');
  const headerLocationLabel = document.querySelector('.js-header-location-name');

  // Load saved location from storage
  const savedLocation = localStorage.getItem('deliveryLocation') || 'Delivering to Greater N... 201310';
  if (headerLocationLabel) {
    headerLocationLabel.innerText = savedLocation;
  }

  if (!locationBtn || !modalOverlay) return;

  const openModal = () => modalOverlay.classList.add('open');
  const closeModal = () => modalOverlay.classList.remove('open');

  locationBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  const saveLocation = (locationText) => {
    localStorage.setItem('deliveryLocation', locationText);
    if (headerLocationLabel) {
      headerLocationLabel.innerText = locationText;
    }
    closeModal();
  };

  if (pincodeForm && pincodeInput) {
    pincodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = pincodeInput.value.trim();
      if (pin.length === 6 && /^\d+$/.test(pin)) {
        saveLocation(`Delivering to ${pin}`);
        pincodeInput.value = '';
      } else {
        alert('Please enter a valid 6-digit Indian pincode.');
      }
    });
  }

  document.querySelectorAll('.js-quick-city').forEach((cityBtn) => {
    cityBtn.addEventListener('click', () => {
      const loc = cityBtn.dataset.location;
      if (loc) {
        saveLocation(`Delivering to ${loc}`);
      }
    });
  });
}

// =========================================================
// 8. BACK TO TOP
// =========================================================
function setupBackToTop() {
  const backToTopBtn = document.querySelector('.js-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// =========================================================
// INITIALIZE PAGE
// =========================================================
renderProductsGrid();
updateCartQuantity();
setupSearchAndFilters();
setupCarousel();
setupSidebarDrawer();
setupLocationModal();
setupBackToTop();

// Sync across tabs & page visibility
window.addEventListener('storage', updateCartQuantity);
window.addEventListener('pageshow', updateCartQuantity);
window.addEventListener('focus', updateCartQuantity);