# 🔗 URL Shortener API

A simple and efficient **URL Shortener API** built with **Node.js, Express, and MongoDB**.
It allows users to convert long URLs into short, shareable links and track how many times the link is used.

---

## 🚀 Features

- Generate **short URLs** from long URLs
- **Automatic URL validation**
- **Redirect to original URL**
- **Click count tracking**
- **Rate limiting** to prevent abuse
- **MongoDB TTL index** to automatically expire links after **5 days**
- Clean and modular **MVC architecture**

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **NanoID** (for generating short codes)
- **Express Rate Limit**

---

## 📂 Project Structure

```
## 📂 Project Structure

```

URL_Shortner
│
├── src
│ │
│ ├── config
│ │ └── db.js
│ │
│ ├── controllers
│ │ └── url.controller.js
│ │
│ ├── models
│ │ └── url.model.js
│ │
│ ├── routes
│ │ └── url.routes.js
│ │
│ ├── utils
│ │ ├── rateLimit.js
│ │ └── shortCode.generator.js
│ │
│ └── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

````

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/AniSam0000/URL_Shortner.git
````

Go to the project folder

```bash
cd URL_Shortner
```

Install dependencies

```bash
npm install
```

Run the server

```bash
node server.js
```

---

## 📡 API Endpoints

### 1️⃣ Create Short URL

**POST**

```
POST api/url/shorten
```

Example Request Body

```json
{
  "originalUrl": "https://example.com"
}
```

Example Response

```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

---

### 2️⃣ Redirect to Original URL

**GET**

```
GET api/url/:shortCode
```

Example

```
http://localhost:3000/abc123
```

This will redirect the user to the **original URL**.

---

## ⏳ URL Expiration

Each shortened URL automatically **expires after 5 days** using a **MongoDB TTL index**.

This prevents the database from growing indefinitely and removes expired links automatically.

---

## 🧠 Learning Outcomes

Through this project I learned:

- Designing **RESTful APIs**
- Using **MongoDB with Mongoose**
- Implementing **rate limiting**
- Creating **scalable backend architecture**
- Handling **data validation and error handling**

---

## 📌 Future Improvements

- Custom short URLs
- Link analytics (IP, location, device)
- User authentication
- Dashboard for managing links

---

## 👨‍💻 Author

**Aniket Samanta**

GitHub:
https://github.com/AniSam0000

---
