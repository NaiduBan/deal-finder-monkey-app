# 🐒 OffersMonkey

[![Website](https://img.shields.io/website?url=https%3A%2F%2Foffersmonkey.com)](https://offersmonkey.com)
[![License](https://img.shields.io/github/license/offersmonkey/app)](LICENSE)

OffersMonkey is an AI-powered, real-time offer discovery platform that brings users the best deals across categories like electronics, fashion, travel, and more — all in one place. With smart filtering, chatbot assistance, affiliate integration, and gamified rewards, OffersMonkey helps users save money effortlessly while shopping online or in-store.

---

## 🚀 Live Site

👉 [Visit OffersMonkey](https://offersmonkey.com)

---

## 📱 Key Features

- 🔍 **Offer Discovery** – View latest offers from top affiliate networks (LinkMyDeals, Cuelinks).
- 🤖 **Smart Chatbot** – Get offer recommendations via AI chatbot interaction.
- 🧭 **Location-Based Deals** – Discover nearby in-store offers.
- 🏆 **Loyalty System** – Earn rewards and coins for using the app regularly.
- 💬 **User Reviews** – Read and add reviews/ratings for offers.
- 📊 **Analytics Dashboard (Admin)** – Monitor offer stats, clicks, engagement, and more.
- 🛠️ **Admin Control Panel** – Add, remove, or update offers and categories in real time.
- 🧾 **Offer Details** – Includes product name, image, description, terms, and redirection URL.
- 🎡 **Dynamic UI** – Clean, green-themed responsive interface with carousel and category filters.

---

## 🧰 Tech Stack

**Frontend:**
- React.js / Next.js
- Tailwind CSS
- Axios
- PWA Support

**Backend:**
- Node.js / Express.js
- Supabase (Database & Auth)
- REST APIs (LinkMyDeals, Cuelinks)

**Others:**
- Firebase (Push Notifications)
- Stripe / Razorpay (optional future monetization)
- Google Maps API (for location-based offers)
- Vercel / Netlify (Deployment)

---

## 🗂️ Folder Structure (Example)

OffersMonkey/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── assets/
│ ├── services/ # API calls
│ ├── utils/
│ └── styles/
├── supabase/
│ └── schema.sql
├── .env
├── README.md
└── package.json

yaml
Copy
Edit

---

## 🧪 Setup and Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/offersmonkey.git

# Navigate into the directory
cd offersmonkey

# Install dependencies
npm install

# Create a .env file and add required API keys
cp .env.example .env

# Start development server
npm run dev
🔐 Environment Variables (Sample)
makefile
Copy
Edit
SUPABASE_URL=
SUPABASE_ANON_KEY=
CUELINKS_API_KEY=
LINKMYDEALS_API_KEY=
FIREBASE_API_KEY=
NEXT_PUBLIC_MAPS_API_KEY=
👨‍💻 Admin Credentials (For Testing)
⚠️ Use only in dev or demo mode — don’t expose admin info in production.

📌 To-Do / Upcoming Features
 Native mobile app (Flutter)

 Affiliate earnings dashboard for users

 Custom push notifications

 Referral system

 Dark mode support

 More bank/UPI cashback filters

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change or improve.

📃 License
This project is licensed under the MIT License - see the LICENSE file for details.

📬 Contact
OffersMonkey Team
📧 support@offersmonkey.com
🌐 https://offersmonkey.com

“Shop smart. Save big. Every time. 🐵”

python
Copy
Edit

---

Let me know if you'd like this tailored for GitHub or a developer portfolio, or if you're using a different tech stac