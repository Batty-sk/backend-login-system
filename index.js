const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors')


const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use(cors());

const PORT = process.env.PORT ||8000;

// sir exposing my cloud mongodb credentials because my monogodb compass were not working..

mongoose.connect('mongodb+srv://user123:user123@cluster0.wa3ihmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

 
// makeingschema for document.
const userSchema = new mongoose.Schema({
  username: String,
  dob: Date,
  email: String,
  password:String,
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
      console.log(req.body)
      const {username, dob, email, password} = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const newUser = new User({
        username,
        dob,
        email,
        password,
      });
      await newUser.save();
  
      const token = jwt.sign({ email: newUser.email }, jwtSecret);
      res.status(201).json({ token:token, email: newUser.email });
    } catch (error) {
      console.error('Error registrring user:', error);
      res.status(500).json({ message: 'Internal srver error' });
    }
  });
  
  app.post('/login', async (req, res) => {
    try {
      console.log('login, ',req.body)
      const { username, password } = req.body;
  
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'User not found ' });
      }
      if (password !== user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ email: user.email }, jwtSecret);
      res.status(200).json({ token:token, email: user.email });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// Validating the  token endpoint
app.post('/validateToken', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    jwt.verify(token, jwtSecret);
    res.status(200).json({ message: 'Token is valid' });
    console.log('token verified')
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    console.log('tokem not verified')
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
