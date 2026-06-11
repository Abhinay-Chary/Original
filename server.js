const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const app = express();
const bp = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userSchema = require('./users/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('./users/users');
const Fruit = require('./fruits/addFruits');
const cart = require('./cartApi/cart');
require('dotenv').config();
console.log("ss", process.env.MONGO_URL);
// mongodb+srv://abhinaychary1:<db_password>@cluster.vyskc.mongodb.net/?appName=Cluster
mongoose.connect("mongodb+srv://abhinaychary1:Abhi%40sep27@cluster.vyskc.mongodb.net/?appName=Cluster").then(x => {
    console.log('connected')
}).catch(e => {
    console.log(e)
})
// const tempUsers = [{ name: 'Abhi', password: '$2b$10$JK1TRnQMYo/IYjBelrCEX..JMe.bEmf9DjhMc4MM6SUH0xsgw.DO2' }];
app.use(bp.json());
app.use(express.json());
app.use(cors());

//  mongoose.connect()
app.get('/getCart/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const a = await cart.findOne({ userName: id });
        res.json({ data: a })
    }
    catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }

})

app.post('/saveForLater', async (req, res) => {
    try {
        const { userName, obj } = req.body;

        const result = await cart.findOneAndUpdate(
            { userName },
            { $set: { cart: obj } },
            {
                new: true,
                upsert: true, // creates document if not found
            }
        );

        res.status(201).json({
            message: "Saved successfully",
            data: result
        });

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
});
app.post('/signUp', async (req, res) => {
    try {
        console.log('signUp');

        const { name, password } = req.body;

        const existUser = await users.findOne({ name });

        if (existUser) {
            return res.status(409).json({
                message: 'Username already exists, please login'
            });
        }

        const hashp = await bcrypt.hash(password, 10);

        const newUser = new userSchema({
            name,
            password: hashp
        });

        await newUser.save();

        return res.status(201).json({
            message: 'User signed up successfully'
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});
app.get('/allUsers', async (req, res) => {
    try {
        const user = await users.find();
        res.status(200).json({ userData: user });
    }
    catch (err) {
        res.status(500).json({ message: "server error", error: err.message })
    }
})
app.post('/deleteUser', async (req, res) => {
    try {
        const foundUser = await users.findOne({ name: req.body.name });
        if (foundUser) {
            const deleteObj = await users.deleteMany({});
            console.log(re);
            res.json({ m: deleteObj })

        }
        else {
            res.json({ message: "nothing to delete" })
        }
    }
    catch (err) {
        res.status(500).json({ message: "server error", error: err.message })

    }
})
app.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await users.findOne({ name });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Incorrect password'
            });
        }

        const token = await generateJwt(user);

        return res.status(200).json({
            message: 'Login successful',
            user: user.name,
            token,
            expiresIn: 10
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

app.post('/addFruit', async (req, res) => {
    try {
        const { name, source, type } = req.body;
        const fruit = new Fruit({ name: name, source: source, type: type });
        const resp = await fruit.save()
        console.log(resp);
        res.json(resp)
    }
    catch (err) {
        res.status(500).json({ message: err.message })

    }
})
app.get('/getFruits', async (req, res) => {
    console.log('called')
    try {
        const fruit = await Fruit.find();
        res.json(fruit);
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
});
app.post('/updateFruits', async (req, res) => {
    console.log(req.body)
    const fruit = await Fruit.findOneAndUpdate({ name: req.body.name }, { price: req.body.price, quantity: req.body.quantity, type: req.body.type }, { new: true });
    res.json(fruit);
})
app.get('/getProducts', () => { })
app.post('/addToCart', verifyJwt, (req, res) => {

})
function verifyJwt(req, res, next) {

    let verify;
    if (req.headers.token)
        verify = jwt.verify(req.headers.token, 'abcd');
    try {
        if (verify)
            next()
        else
            res.json('loggedOut')
    } catch (e) {
        res.json(e)
    }


}


function generateJwt(user) {
    const token = jwt.sign({ name: user }, 'abcd', { expiresIn: 2000 })
    return token
}
app.listen(3000, () => {
    console.log('started')
})