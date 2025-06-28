const express = require('express');
const PORT = 4000;
const cors = require('cors');
const multer = require('multer');
require('./db/config');

const Admin = require('./db/Admin/Admin');
const users = require('./db/Users/userschema');
const seller = require('./db/Seller/Sellers');
const items = require('./db/Seller/Additem');
const myorders = require('./db/Users/myorders');
const WishlistItem = require('./db/Users/Wishlist');

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
}));

// ================= Image Upload Setup =================
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));


// ================== Admin Routes ==================
app.post('/alogin', async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (admin && admin.password === password) {
        res.json({ Status: "Success", user: { id: admin._id, name: admin.name, email: admin.email } });
    } else {
        res.json("Invalid credentials");
    }
});

app.post('/asignup', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
        res.json("Already have an account");
    } else {
        await Admin.create({ name, email, password });
        res.json("Account Created");
    }
});


// ================== User Routes ==================
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await users.findOne({ email });
    if (existing) {
        res.json("Already have an account");
    } else {
        await users.create({ name, email, password });
        res.json("Account Created");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (user && user.password === password) {
        res.json({ Status: "Success", user: { id: user._id, name: user.name, email: user.email } });
    } else {
        res.json("Invalid credentials");
    }
});

app.get('/users', async (req, res) => {
    const data = await users.find();
    res.json(data);
});

app.delete('/userdelete/:id', async (req, res) => {
    await users.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});


// ================== Seller Routes ==================
app.post('/ssignup', async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await seller.findOne({ email });
    if (existing) {
        res.json("Already have an account");
    } else {
        await seller.create({ name, email, password });
        res.json("Account Created");
    }
});

app.post('/slogin', async (req, res) => {
    const { email, password } = req.body;
    const s = await seller.findOne({ email });
    if (s && s.password === password) {
        res.json({ Status: "Success", user: { id: s._id, name: s.name, email: s.email } });
    } else {
        res.json("Invalid credentials");
    }
});

app.get('/sellers', async (req, res) => {
    const data = await seller.find();
    res.json(data);
});

app.delete('/sellerdelete/:id', async (req, res) => {
    await seller.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});


// ================== Item Routes ==================
app.post('/items', upload.single('itemImage'), async (req, res) => {
    const { title, author, genre, description, price, userId, userName } = req.body;
    const itemImage = req.file.path;

    try {
        const item = new items({ itemImage, title, author, genre, description, price, userId, userName });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create item' });
    }
});

app.get('/getitem/:userId', async (req, res) => {
    const data = await items.find({ userId: req.params.userId });
    res.json(data);
});

app.get('/item', async (req, res) => {
    const data = await items.find();
    res.json(data);
});

app.get('/item/:id', async (req, res) => {
    const item = await items.findById(req.params.id);
    res.json(item);
});

app.delete('/itemdelete/:id', async (req, res) => {
    await items.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

app.delete('/useritemdelete/:id', async (req, res) => {
    await items.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});


// ================== Orders Routes ==================
app.post('/userorder', async (req, res) => {
    const orderData = req.body;
    const order = new myorders(orderData);
    await order.save();
    res.status(201).json(order);
});

app.get('/getorders/:userId', async (req, res) => {
    const data = await myorders.find({ userId: req.params.userId });
    res.json(data);
});

app.get('/getsellerorders/:userId', async (req, res) => {
    const data = await myorders.find({ sellerId: req.params.userId });
    res.json(data);
});

app.get('/orders', async (req, res) => {
    const data = await myorders.find();
    res.json(data);
});

app.delete('/userorderdelete/:id', async (req, res) => {
    await myorders.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});


// ================== Wishlist Routes ==================
app.post('/wishlist/add', async (req, res) => {
    const { itemId, userId, userName, title, author, genre, price, itemImage } = req.body;

    const existingItem = await WishlistItem.findOne({ itemId, userId });
    if (existingItem) {
        return res.status(400).json({ msg: 'Item already in wishlist' });
    }

    const newItem = new WishlistItem({ itemId, userId, userName, title, author, genre, price, itemImage });
    await newItem.save();
    res.status(201).json(newItem);
});

app.get('/wishlist/:userId', async (req, res) => {
    const data = await WishlistItem.find({ userId: req.params.userId });
    res.json(data);
});

app.post('/wishlist/remove', async (req, res) => {
    const { itemId, userId } = req.body;
    const removed = await WishlistItem.findOneAndDelete({ itemId, userId });
    if (!removed) {
        return res.status(404).json({ msg: 'Item not found in wishlist' });
    }
    res.json({ msg: 'Item removed from wishlist' });
});


// ================== Start Server ==================
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
