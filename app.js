  //app.js
  const MongoStore = require('connect-mongo');
  const express = require('express');
  const app = express();
  const server = require('http').Server(app);
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
  });

  server.listen(3000, () => {
      console.log('Server is listening on port 3000');
    });
    app.use('/', express.static(__dirname + '/public'));

    const cors = require('cors');
    app.use(cors({
        origin: 'http://localhost:5500', // Update this to match your client-side application's address
        credentials: true,
    }));
    

  const mongoose = require('mongoose');
  const validator = require('validator');
  const session = require('express-session');
  const bcrypt = require('bcrypt');
  const bodyParser = require('body-parser');
  const crypto = require('crypto'); 



  function generateSecretKey() {
      return crypto.randomBytes(32).toString('hex');
    }
    
    const secretKey = generateSecretKey(); // Generate the secret key

  const User = require('./models/user');
  const Activity = require('./models/activity');

  mongoose.connect('mongodb+srv://davrussell:5280Dr$$$@cluster0.ewfkbly.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));







    app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist/'));

    app.use(bodyParser.json());

  app.use(session({
      secret: secretKey,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: 'mongodb+srv://davrussell:5280Dr$$$@cluster0.ewfkbly.mongodb.net/?retryWrites=true&w=majority' }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: false, // set true if your site uses HTTPS
        sameSite: 'strict',
        httpOnly: true
      },
    }));
  
    

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validation
    // Add more validation checks using Validator.js as needed
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: 'Registration successful' });
  });



  app.post('/login', async (req, res) => {
      const { username, email, password } = req.body;
    
      // Validation
      if ((!username && !email) || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
    
      // Check if the user exists by email or username
      const user = await User.findOne({ $or: [{ email }, { username }] });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    
      // Verify the password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid email, username, or password' });
      }
    
      // Save the user in the session
      req.session.user = user;
    
      res.status(200).json({ message: 'Logged in successfully' });
    });

    app.get('/isloggedin', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      if (req.session.user) {
        res.status(200).json({ isLoggedIn: true });
      } else {
        res.status(200).json({ isLoggedIn: false });
      }
    });
    
    
    

    app.post('/logout', (req, res) => {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Destroy the session and remove the user data
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
    
    
  app.post('/activities', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('User in session:', req.session.user);


    const { activity_type, start_time, end_time } = req.body;

    // Validation using Validator.js
    // Add more validation checks as needed
    if (!activity_type || !start_time || !end_time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save the activity
    const activity = new Activity({
      user_id: req.session.user._id,
      activity_type,
      start_time,
      end_time,
    });

    await activity.save();

    res.status(201).json({ message: 'Activity logged successfully', activity });
  });


  app.get('/activities', async (req, res) => {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log('User in session:', req.session.user);
    
      // Retrieve the user's activity history
      const activities = await Activity.find({ user_id: req.session.user._id });
    
      res.status(200).json({ activities });
    });
    
    


