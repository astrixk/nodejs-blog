const express = require('express');
const router = express.Router();

const User = require('../models/User');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');

const adminLayout = '../views/layouts/admin';

// check
//  login page
const authMiddlerware = (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userid = decoded.userid;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};



// GET
// Admin login page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin Panel',
            description: 'Admin Panel'
        }
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

// GET
// Admin Check login


router.post('/admin', async (req, res) => {
    try {
        
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(!user){
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard')


        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
});

// GET
// Admin dashboard login


router.get('/dashboard',authMiddlerware, async (req, res) => {

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Admin Dashboard'
        }
        const data = await Post.find();
        res.render('admin/dashboard', { locals,data,layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});


// get admin create new
router.get('/add-post',authMiddlerware, async (req, res) => {

    try {
        const locals = {
            title: 'Add Post',
            description: 'Admin Dashboard'
        }
        const data = await Post.find();
        res.render('admin/add-post', { locals,data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});



// get admin create new
router.post('/add-post',authMiddlerware, async (req, res) => {

    try {

        
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        }catch(error){
            console.log(error);
        }
        
    } catch (error) {
        console.log(error);
    }
});


// Post
// Register
router.post('/register', async (req, res) => {
    try {
        
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({
                username,
                password: hashedPassword
            });
            res.status(201).json({ message: 'User Created',user });
        } catch (error) {
            if(error.code === 11000){
                return res.status(409).json({ message: 'Username already exists' });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }



        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
});

// get admin create new
router.get('/edit-post/:id',authMiddlerware, async (req, res) => {

    try {
        const locals = {
            title: 'Edit Post',
            description: 'Admin Dashboard'
        }
        const data = await Post.findOne({_id: req.params.id});
        res.render('admin/edit-post', {
            locals, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});




// put admin create new
router.put('/edit-post/:id',authMiddlerware, async (req, res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

//Delete admin Post
router.delete('/delete-post/:id',authMiddlerware, async (req, res) => {

    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

//get admin logout
router.get('/logout', async (req, res) => {

    try {
        res.clearCookie('token');
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;