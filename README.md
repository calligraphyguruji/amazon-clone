# Amazon Clone

A responsive e-commerce web application inspired by Amazon, built using vanilla **HTML5**, **CSS3**, and modern **JavaScript (ES6+)**.

---

## 📌 Overview

This project replicates core user interface and shopping flows of Amazon, including dynamic product rendering, cart interactions, checkout review, orders history, and package tracking. It is built cleanly without heavy frameworks to demonstrate core web development fundamentals such as DOM manipulation, responsive layouts with CSS Grid and Flexbox, and modular code organization.

---

## ✨ Features

- **Dynamic Product Rendering**: Generates product listings dynamically via JavaScript (`products.js`), including images, ratings, review counts, and formatted pricing.
- **Product Quantity & Add to Cart**: Allows users to select product quantities and add items to their shopping cart.
- **Responsive Layout**: Designed for seamless viewing across mobile, tablet, and desktop screens.
- **Multi-Page Architecture**:
  - **Storefront (`amazon.html`)**: Product grid browsing, search bar, and navigation header with live cart count.
  - **Checkout (`checkout.html`)**: Review items, delivery options, and payment order summary.
  - **Orders (`orders.html`)**: View placed orders, order dates, totals, and "Buy Again" options.
  - **Order Tracking (`tracking.html`)**: Delivery status progress tracker and estimated arrival details.
- **Modular Stylesheets**: Clean separation between shared styles (header, global typography) and page-specific styles.

---

## 🛠️ Tech Stack

- **Markup**: [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML)
- **Styling**: [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) (CSS Grid, Flexbox, Media Queries)
- **Scripting**: [JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Typography**: [Google Fonts (Roboto)](https://fonts.google.com/specimen/Roboto)

---

## 📁 Project Structure

```text
Amazon-Clone/
│
├── javascript-amazon-project/
│   ├── amazon.html               # Main store page with product catalog
│   ├── checkout.html             # Checkout & order review page
│   ├── orders.html               # Order history page
│   ├── tracking.html             # Package delivery tracking page
│   │
│   ├── backend/
│   │   └── products.json         # Raw JSON data of products
│   │
│   ├── data/
│   │   └── products.js           # JavaScript product dataset
│   │
│   ├── scripts/
│   │   └── amazon.js             # DOM manipulation & product rendering logic
│   │
│   ├── styles/
│   │   ├── shared/
│   │   │   ├── general.css       # Global resets and shared variables
│   │   │   └── amazon-header.css # Header styles across pages
│   │   └── pages/
│   │       ├── amazon.css        # Homepage & product grid styles
│   │       ├── orders.css        # Orders page layout
│   │       ├── tracking.css      # Tracking progress bar styles
│   │       └── checkout/
│   │           ├── checkout.css  # Checkout page layout
│   │           └── checkout-header.css
│   │
│   └── images/                   # Icons, rating stars, and product media
│
└── README.md
```

---

## 🚀 Getting Started

No build tools or package managers required. You can run the project locally using any static web server or directly in your browser.

### Option 1: Live Server (VS Code Extension)
1. Open the project folder in **Visual Studio Code**.
2. Right-click on `javascript-amazon-project/amazon.html`.
3. Select **"Open with Live Server"**.

### Option 2: Using Python HTTP Server
Run the following in your terminal from the project root:

```bash
cd javascript-amazon-project
python3 -m http.server 3000
```
Then open `http://localhost:3000/amazon.html` in your browser.

### Option 3: Using Node.js (`npx serve`)
```bash
npx serve javascript-amazon-project
```

---

## 🔮 Roadmap & Future Enhancements

- [ ] Persist shopping cart items using `localStorage`
- [ ] Implement search bar filtering and product categorization
- [ ] Dynamic order placement and live checkout calculations
- [ ] Interactive package delivery status updates
- [ ] Unit and integration tests with Jasmine or Jest
- [ ] Backend REST API integration

---

## 📄 License

This project is created for educational and portfolio purposes.
