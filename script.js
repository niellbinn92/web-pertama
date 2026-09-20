* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
}

body {
    background-color: #0b0f19;
    color: #f3f4f6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Navbar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 8%;
    background: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #1f2937;
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #ffffff;
}

.logo span {
    color: #6366f1;
}

.nav-badge {
    background: rgba(99, 102, 241, 0.1);
    color: #818cf8;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid rgba(99, 102, 241, 0.2);
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 60px 20px 40px;
}

.hero h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(to right, #ffffff, #9ca3af);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero p {
    color: #9ca3af;
    font-size: 15px;
}

/* Container & Grid Produk */
.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px 60px;
    flex: 1;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
}

/* Product Card */
.product-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

.product-card:hover {
    transform: translateY(-4px);
    border-color: #6366f1;
}

.badge-stock {
    align-self: flex-start;
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.product-card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ffffff;
}

.product-card .desc {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 20px;
    line-height: 1.5;
}

.price {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
}

/* Tombol Beli */
.buy-btn {
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%;
}

.buy-btn:hover {
    background-color: #4f46e5;
}

/* Footer */
footer {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #1f2937;
    color: #6b7280;
    font-size: 13px;
    background: #0b0f19;
}
