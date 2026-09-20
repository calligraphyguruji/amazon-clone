import { cart, addToCart, loadFromStorage } from '../data/cart.js';

// Parse query parameters
const urlParams = new URLSearchParams(window.location.search);
let currentQuery = urlParams.get('search') || urlParams.get('k') || '';
let currentCategory = urlParams.get('category') || 'all';
let onlyDeals = urlParams.get('deals') === 'true';

// Filter & sort state
const activeFilters = {
  brands: [],
  primeOnly: false,
  deliveryTomorrow: false,
  minRating: 0,
  minPrice: 0,
  maxPrice: Infinity,
  minDiscount: 0,
  sortBy: 'featured'
};

const addedMessageTimeouts = {};

// Brand inference based on product data
function getProductBrand(product) {
  if (product.brand) return product.brand;
  const name = product.name.toLowerCase();
  const kws = (product.keywords || []).map(k => k.toLowerCase());

  // Tech / Mobile / Electronics
  if (name.includes('iphone') || name.includes('apple') || kws.includes('apple')) return 'Apple';
  if (name.includes('samsung') || kws.includes('samsung')) return 'Samsung';
  if (name.includes('oneplus') || kws.includes('oneplus')) return 'OnePlus';
  if (name.includes('sony') || kws.includes('sony')) return 'Sony';
  if (name.includes('boat') || kws.includes('boat')) return 'boAt';
  if (name.includes('noise') || kws.includes('noise')) return 'Noise';
  if (name.includes('puma') || kws.includes('puma')) return 'Puma';
  if (name.includes('pigeon') || kws.includes('pigeon')) return 'Pigeon';
  if (name.includes('amazon basics') || name.includes('basics')) return 'Amazon Basics';

  // Clothing & Apparel
  if (kws.includes('tshirts') || kws.includes('shirts') || kws.includes('hoodies') || kws.includes('sweaters') || kws.includes('apparel') || kws.includes('clothing')) {
    if (name.includes('polo')) return 'US Polo Assn.';
    if (name.includes('fleece') || name.includes('hooded')) return 'Van Heusen';
    if (name.includes('cotton') || name.includes('adults')) return 'Allen Solly';
    if (name.includes('chiffon') || name.includes('beachwear')) return 'Biba';
    if (name.includes('jogger') || name.includes('sweatpant')) return 'Jockey';
    if (name.includes('chino') || name.includes('pants') || name.includes('shorts')) return 'Peter England';
    if (name.includes('socks')) return 'Jockey';
    return 'Amazon Brand - Symbol';
  }

  // Footwear
  if (kws.includes('shoes') || kws.includes('sneakers') || kws.includes('sandals') || kws.includes('footwear')) {
    if (name.includes('puma')) return 'Puma';
    if (name.includes('ballet')) return 'Bata';
    if (name.includes('sandals')) return 'Sparx';
    return 'Red Tape';
  }

  // Appliances
  if (kws.includes('toaster') || kws.includes('blender') || kws.includes('kettle') || kws.includes('coffeemakers') || kws.includes('appliances')) {
    if (name.includes('pigeon')) return 'Pigeon';
    if (name.includes('kettle')) return 'Prestige';
    if (name.includes('blender')) return 'Philips';
    if (name.includes('toaster')) return 'Morphy Richards';
    if (name.includes('coffeemaker')) return 'Wonderchef';
    return 'Bajaj';
  }

  // Kitchen & Dining
  if (kws.includes('cookware') || kws.includes('baking') || kws.includes('plate') || kws.includes('dishes') || kws.includes('containers')) {
    if (name.includes('cookware')) return 'Prestige';
    if (name.includes('plate') || name.includes('bowl')) return 'Cello';
    if (name.includes('storage') || name.includes('containers')) return 'Borosil';
    return 'Solimo';
  }

  // Home & Bedding
  if (kws.includes('towels') || kws.includes('curtains') || kws.includes('bed sheets') || kws.includes('sheets') || kws.includes('duvet') || kws.includes('bathmat')) {
    return 'Spaces';
  }

  // Daily Needs & Household
  if (kws.includes('cleaning') || kws.includes('laundry') || kws.includes('detergent') || kws.includes('tissues') || kws.includes('garbage')) {
    if (name.includes('laundry') || name.includes('detergent')) return 'Surf Excel';
    if (name.includes('tissue')) return 'Origami';
    return 'Amazon Basics';
  }

  if (kws.includes('basketball') || kws.includes('sports')) return 'Spalding';
  if (kws.includes('sunglasses')) return 'Fastrack';
  if (kws.includes('earrings') || kws.includes('jewelry')) return 'Giva';

  return 'Amazon Basics';
}

// Get base products matching current search query and category (unconstrained by sidebar filters)
function getBaseMatchingProducts() {
  if (typeof products === 'undefined' || !Array.isArray(products)) return [];

  return products.filter((product) => {
    // 1. Query search
    if (currentQuery.trim() !== '') {
      const q = currentQuery.toLowerCase().trim();
      const nameMatch = product.name.toLowerCase().includes(q);
      const keywordMatch = product.keywords && product.keywords.some(k => k.toLowerCase().includes(q));
      if (!nameMatch && !keywordMatch) {
        return false;
      }
    }

    // 2. Category
    if (currentCategory !== 'all') {
      if (currentCategory === 'electronics') {
        const kws = ['iphone', 'samsung', 'oneplus', 'phone', 'mobile', 'laptop', 'macbook', 'headphones', 'earbuds', 'speaker', 'smartwatch', 'toaster', 'blender', 'kettle', 'appliances'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      } else if (currentCategory === 'apparel' || currentCategory === 'fashion') {
        const kws = ['socks', 'tshirts', 'hoodies', 'sweaters', 'pants', 'shorts', 'sunglasses', 'shoes', 'sneakers', 'sandals', 'apparel'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      } else if (currentCategory === 'kitchen') {
        const kws = ['kitchen', 'cookware', 'induction', 'baking', 'towels', 'plates', 'mixing bowls', 'food containers', 'curtains'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      } else if (currentCategory === 'sports') {
        const kws = ['sports', 'basketballs', 'shoes', 'running shoes', 'athletic'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      } else if (currentCategory === 'appliances') {
        const kws = ['appliances', 'induction', 'toaster', 'blender', 'kettle', 'coffeemakers'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      } else if (currentCategory === 'daily') {
        const kws = ['cleaning', 'bathroom', 'washroom', 'tissues', 'garbage', 'laundry'];
        const matches = product.keywords && product.keywords.some(k => kws.includes(k.toLowerCase()));
        if (!matches) return false;
      }
    }

    return true;
  });
}

// Dynamically render sidebar brands list based on currently matched products
function renderDynamicBrandFilters() {
  const brandsListEl = document.querySelector('.js-brands-filter-list');
  const brandsGroupEl = document.querySelector('.js-brands-filter-group');
  if (!brandsListEl) return;

  const baseProducts = getBaseMatchingProducts();
  const brandCounts = {};

  baseProducts.forEach((product) => {
    const brand = getProductBrand(product);
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  const availableBrands = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a]);

  // Clean activeFilters.brands if any selected brand is no longer in availableBrands
  activeFilters.brands = activeFilters.brands.filter(b => availableBrands.includes(b));

  if (availableBrands.length === 0) {
    if (brandsGroupEl) brandsGroupEl.style.display = 'none';
    brandsListEl.innerHTML = '';
    return;
  }

  if (brandsGroupEl) brandsGroupEl.style.display = 'block';

  let brandsHTML = '';
  availableBrands.forEach((brand) => {
    const isChecked = activeFilters.brands.includes(brand);
    const safeId = 'brand-' + brand.toLowerCase().replace(/[^a-z0-9]/g, '-');
    brandsHTML += `
      <li class="filter-item">
        <input type="checkbox" id="${safeId}" class="js-filter-checkbox js-dynamic-brand-cb" data-filter="brand" value="${brand}" ${isChecked ? 'checked' : ''}>
        <label for="${safeId}">${brand}</label>
      </li>
    `;
  });

  brandsListEl.innerHTML = brandsHTML;

  // Re-bind brand checkbox event listeners
  brandsListEl.querySelectorAll('.js-dynamic-brand-cb').forEach((cb) => {
    cb.addEventListener('change', () => {
      const val = cb.value;
      if (cb.checked) {
        if (!activeFilters.brands.includes(val)) activeFilters.brands.push(val);
      } else {
        activeFilters.brands = activeFilters.brands.filter(b => b !== val);
      }
      renderSearchResults();
    });
  });
}

// =========================================================
// 1. FILTER & SORT PRODUCTS
// =========================================================
function getFilteredAndSortedProducts() {
  const baseProducts = getBaseMatchingProducts();

  let result = baseProducts.filter((product) => {
    // 1. Deals Only
    if (onlyDeals) {
      if ((product.priceCents / 100) >= 2000 && product.rating.stars < 4.5) {
        return false;
      }
    }

    // 2. Dynamic Brands Filter
    if (activeFilters.brands.length > 0) {
      const productBrand = getProductBrand(product);
      if (!activeFilters.brands.includes(productBrand)) {
        return false;
      }
    }

    // 3. Prime Only
    if (activeFilters.primeOnly && product.rating.stars < 4.5) {
      return false;
    }

    // 4. Rating
    if (activeFilters.minRating > 0 && product.rating.stars < activeFilters.minRating) {
      return false;
    }

    // 5. Price
    const priceRupees = product.priceCents / 100;
    if (priceRupees < activeFilters.minPrice || priceRupees > activeFilters.maxPrice) {
      return false;
    }

    // 6. Discount
    if (activeFilters.minDiscount > 0) {
      const originalMrp = (product.priceCents * 1.55) / 100;
      const discount = Math.round(((originalMrp - priceRupees) / originalMrp) * 100);
      if (discount < activeFilters.minDiscount) return false;
    }

    return true;
  });

  // Sort
  if (activeFilters.sortBy === 'price-low') {
    result.sort((a, b) => a.priceCents - b.priceCents);
  } else if (activeFilters.sortBy === 'price-high') {
    result.sort((a, b) => b.priceCents - a.priceCents);
  } else if (activeFilters.sortBy === 'rating') {
    result.sort((a, b) => b.rating.stars - a.rating.stars);
  } else if (activeFilters.sortBy === 'reviews') {
    result.sort((a, b) => b.rating.count - a.rating.count);
  }

  return result;
}

// =========================================================
// 2. RENDER SEARCH RESULTS
// =========================================================
function renderSearchResults() {
  renderDynamicBrandFilters();
  const filteredProducts = getFilteredAndSortedProducts();
  const resultsGrid = document.querySelector('.js-search-results-grid');
  const resultsInfo = document.querySelector('.js-search-results-info');
  const queryDisplay = document.querySelector('.js-query-display');
  const activeFiltersRow = document.querySelector('.js-active-filters-row');

  // Display query title
  const displayLabel = currentQuery.trim() !== '' ? `"${currentQuery}"` : (currentCategory !== 'all' ? `Category: ${currentCategory}` : 'all products');
  if (queryDisplay) {
    queryDisplay.innerText = displayLabel;
  }

  if (resultsInfo) {
    resultsInfo.innerHTML = `1–${filteredProducts.length} of over ${products.length} results for <span class="search-results-query-term">${displayLabel}</span>`;
  }

  // Active filters tags
  if (activeFiltersRow) {
    let tagsHTML = '';
    if (activeFilters.brands.length > 0) {
      activeFilters.brands.forEach((b) => {
        tagsHTML += `<span class="active-filter-tag js-remove-brand" data-brand="${b}">Brand: ${b.toUpperCase()} ✕</span>`;
      });
    }
    if (activeFilters.primeOnly) {
      tagsHTML += `<span class="active-filter-tag js-remove-filter" data-type="prime">Prime Eligible ✕</span>`;
    }
    if (activeFilters.minRating > 0) {
      tagsHTML += `<span class="active-filter-tag js-remove-filter" data-type="rating">${activeFilters.minRating}★ &amp; Up ✕</span>`;
    }
    if (activeFilters.maxPrice !== Infinity || activeFilters.minPrice > 0) {
      tagsHTML += `<span class="active-filter-tag js-remove-filter" data-type="price">&#8377;${activeFilters.minPrice.toLocaleString('en-IN')} - ${activeFilters.maxPrice === Infinity ? 'Above' : '&#8377;' + activeFilters.maxPrice.toLocaleString('en-IN')} ✕</span>`;
    }
    if (activeFilters.minDiscount > 0) {
      tagsHTML += `<span class="active-filter-tag js-remove-filter" data-type="discount">${activeFilters.minDiscount}% Off or more ✕</span>`;
    }

    activeFiltersRow.innerHTML = tagsHTML;

    // Attach remove handlers
    document.querySelectorAll('.js-remove-brand').forEach((tag) => {
      tag.addEventListener('click', () => {
        const b = tag.dataset.brand;
        activeFilters.brands = activeFilters.brands.filter(item => item !== b);
        const checkbox = document.querySelector(`input[data-filter="brand"][value="${b}"]`);
        if (checkbox) checkbox.checked = false;
        renderSearchResults();
      });
    });

    document.querySelectorAll('.js-remove-filter').forEach((tag) => {
      tag.addEventListener('click', () => {
        const t = tag.dataset.type;
        if (t === 'prime') {
          activeFilters.primeOnly = false;
          const primeBox = document.querySelector('input[data-filter="prime"]');
          if (primeBox) primeBox.checked = false;
        } else if (t === 'rating') {
          activeFilters.minRating = 0;
        } else if (t === 'price') {
          activeFilters.minPrice = 0;
          activeFilters.maxPrice = Infinity;
        } else if (t === 'discount') {
          activeFilters.minDiscount = 0;
        }
        renderSearchResults();
      });
    });
  }

  if (!resultsGrid) return;

  if (filteredProducts.length === 0) {
    resultsGrid.innerHTML = `
      <div class="no-results-box">
        <h3>No results found for ${displayLabel}</h3>
        <p>Try checking your spelling, using more general search terms, or clearing some filters.</p>
        <button class="filter-clear-all-btn js-clear-all-inline" style="padding: 10px 24px; font-size: 14px;">
          Clear all filters &amp; View All Products
        </button>
      </div>
    `;

    const inlineClear = document.querySelector('.js-clear-all-inline');
    if (inlineClear) {
      inlineClear.addEventListener('click', () => {
        resetAllFilters();
      });
    }
    return;
  }

  let html = '';
  filteredProducts.forEach((product) => {
    const priceRupees = (product.priceCents / 100).toFixed(0);
    const originalMrp = ((product.priceCents * 1.55) / 100).toFixed(0);
    const discountPercent = Math.round(((originalMrp - priceRupees) / originalMrp) * 100);

    const isDeal = product.rating.stars >= 4.5;
    const isBestseller = product.rating.count >= 200;

    let badgeHTML = '<div style="height: 22px; margin-bottom: 6px;"></div>';
    if (isDeal) {
      badgeHTML = `<div style="height: 22px; margin-bottom: 6px;"><span class="product-deal-badge">Limited time deal</span></div>`;
    } else if (isBestseller) {
      badgeHTML = `<div style="height: 22px; margin-bottom: 6px;"><span class="product-bestseller-badge">#1 Best Seller</span></div>`;
    }

    html += `
      <div class="search-product-card">
        ${badgeHTML}

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="Added">
          Added
        </div>

        <div class="search-product-image-wrap">
          <img class="search-product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        </div>

        <div class="search-product-title" title="${product.name}">
          ${product.name}
        </div>

        <div class="search-product-rating">
          <img class="search-rating-stars" src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars">
          <span class="search-rating-count">${product.rating.count.toLocaleString()}</span>
        </div>

        <div class="search-price-row">
          <span class="search-current-price">&#8377;${Number(priceRupees).toLocaleString('en-IN')}</span>
          <span class="search-mrp">M.R.P.: &#8377;${Number(originalMrp).toLocaleString('en-IN')}</span>
          <span class="search-discount">(${discountPercent}% off)</span>
        </div>

        <div class="search-prime-delivery">
          <span style="color: #00a8e1; font-weight: 800; font-style: italic;">✓prime</span>
          <span>FREE Delivery by <strong>Tomorrow</strong></span>
        </div>

        <div class="search-card-actions">
          <select class="search-qty-select js-quantity-selector-${product.id}" aria-label="Select quantity">
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

          <button class="search-add-to-cart-btn js-add-to-cart"
            data-product-id="${product.id}"
            data-product-name="${product.name}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });

  resultsGrid.innerHTML = html;
  attachAddToCartHandlers();
}

// =========================================================
// 3. ADD TO CART LOGIC
// =========================================================
function attachAddToCartHandlers() {
  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = quantitySelector ? Number(quantitySelector.value) : 1;

      addToCart(productId, quantity);
      updateCartQuantity();

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

function updateCartQuantity() {
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
// 4. SIDEBAR FILTERS & SORT HANDLERS
// =========================================================
function setupFilterListeners() {
  // Sort dropdown
  const sortSelect = document.querySelector('.js-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      activeFilters.sortBy = sortSelect.value;
      renderSearchResults();
    });
  }

  // Checkbox filters (Prime, Delivery, POD)
  document.querySelectorAll('.js-filter-checkbox:not(.js-dynamic-brand-cb)').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const type = checkbox.dataset.filter;
      const val = checkbox.value;

      if (type === 'prime') {
        activeFilters.primeOnly = checkbox.checked;
      }

      renderSearchResults();
    });
  });

  // Rating filters
  document.querySelectorAll('.js-rating-filter').forEach((item) => {
    item.addEventListener('click', () => {
      const min = Number(item.dataset.minRating);
      activeFilters.minRating = activeFilters.minRating === min ? 0 : min;
      renderSearchResults();
    });
  });

  // Price filters
  document.querySelectorAll('.js-price-filter').forEach((item) => {
    item.addEventListener('click', () => {
      const min = Number(item.dataset.minPrice) || 0;
      const max = Number(item.dataset.maxPrice) || Infinity;

      if (activeFilters.minPrice === min && activeFilters.maxPrice === max) {
        activeFilters.minPrice = 0;
        activeFilters.maxPrice = Infinity;
      } else {
        activeFilters.minPrice = min;
        activeFilters.maxPrice = max;
      }

      renderSearchResults();
    });
  });

  // Discount filters
  document.querySelectorAll('.js-discount-filter').forEach((item) => {
    item.addEventListener('click', () => {
      const min = Number(item.dataset.minDiscount);
      activeFilters.minDiscount = activeFilters.minDiscount === min ? 0 : min;
      renderSearchResults();
    });
  });

  // Clear all filters
  document.querySelectorAll('.js-clear-filters-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      resetAllFilters();
    });
  });
}

function resetAllFilters() {
  activeFilters.brands = [];
  activeFilters.primeOnly = false;
  activeFilters.deliveryTomorrow = false;
  activeFilters.minRating = 0;
  activeFilters.minPrice = 0;
  activeFilters.maxPrice = Infinity;
  activeFilters.minDiscount = 0;
  activeFilters.sortBy = 'featured';
  currentQuery = '';
  currentCategory = 'all';
  onlyDeals = false;

  document.querySelectorAll('.js-filter-checkbox').forEach(cb => cb.checked = false);

  const searchInput = document.querySelector('.js-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.querySelector('.js-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  renderSearchResults();
}

// =========================================================
// 5. SEARCH FORM IN HEADER
// =========================================================
function setupHeaderSearch() {
  const searchForm = document.querySelector('.js-search-form');
  const searchInput = document.querySelector('.js-search-input');
  const searchCategory = document.querySelector('.js-search-category');

  // Pre-fill input
  if (searchInput && currentQuery) {
    searchInput.value = currentQuery;
  }
  if (searchCategory && currentCategory) {
    searchCategory.value = currentCategory;
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput ? searchInput.value.trim() : '';
      const cat = searchCategory ? searchCategory.value : 'all';
      window.location.href = `search.html?search=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
    });
  }
}

// =========================================================
// 6. MODALS, SIDEBAR & BACK TO TOP
// =========================================================
function setupModalsAndSidebar() {
  // Location
  const locationBtn = document.querySelector('.js-location-btn');
  const modalOverlay = document.querySelector('.js-location-modal-overlay');
  const modalClose = document.querySelector('.js-location-modal-close');
  const headerLocationLabel = document.querySelector('.js-header-location-name');
  const pincodeForm = document.querySelector('.js-pincode-form');
  const pincodeInput = document.querySelector('.js-pincode-input');

  const savedLocation = localStorage.getItem('deliveryLocation') || 'Delivering to Greater N... 201310';
  if (headerLocationLabel) headerLocationLabel.innerText = savedLocation;

  if (locationBtn && modalOverlay) {
    locationBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
    if (modalClose) modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });

    const saveLoc = (text) => {
      localStorage.setItem('deliveryLocation', text);
      if (headerLocationLabel) headerLocationLabel.innerText = text;
      modalOverlay.classList.remove('open');
    };

    if (pincodeForm && pincodeInput) {
      pincodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = pincodeInput.value.trim();
        if (pin.length === 6 && /^\d+$/.test(pin)) {
          saveLoc(`Delivering to ${pin}`);
          pincodeInput.value = '';
        }
      });
    }

    document.querySelectorAll('.js-quick-city').forEach((cityBtn) => {
      cityBtn.addEventListener('click', () => {
        saveLoc(`Delivering to ${cityBtn.dataset.location}`);
      });
    });
  }

  // Sidebar
  const toggleBtn = document.querySelector('.js-sidebar-toggle');
  const sidebar = document.querySelector('.js-amazon-sidebar');
  const sidebarOverlay = document.querySelector('.js-sidebar-overlay');
  const sidebarClose = document.querySelector('.js-sidebar-close-btn');

  if (sidebar && sidebarOverlay) {
    const openSidebar = () => {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
      if (sidebarClose) sidebarClose.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeSidebar = () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
      if (sidebarClose) sidebarClose.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  }

  // Back to Top
  const backToTop = document.querySelector('.js-back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// =========================================================
// INITIALIZE SEARCH PAGE
// =========================================================
renderSearchResults();
updateCartQuantity();
setupFilterListeners();
setupHeaderSearch();
setupModalsAndSidebar();

window.addEventListener('storage', updateCartQuantity);
window.addEventListener('pageshow', updateCartQuantity);
window.addEventListener('focus', updateCartQuantity);
