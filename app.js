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
      console.log('Le serveur écoute sur le port 3000');
    });
    app.use('/', express.static(__dirname + '/public'));

    const cors = require('cors');
    app.use(cors({
        origin: 'http://localhost:5500', 
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
    
    const secretKey = generateSecretKey(); // Générer la clé secrète

  const User = require('./models/user');
  const Activity = require('./models/activity');

  mongoose.connect('mongodb+srv://davrussell:5280Dr$$$@cluster0.ewfkbly.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.error('Échec de la connexion à MongoDB :', err));


    app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist/'));

    app.use(bodyParser.json());

  app.use(session({
      secret: secretKey,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: 'mongodb+srv://davrussell:5280Dr$$$@cluster0.ewfkbly.mongodb.net/?retryWrites=true&w=majority' }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // pour 1 jour
        secure: false, 
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
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Lutilisateur existe déjà' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Enregistrer le nouvel utilisateur
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: 'Inscription réussie' });
  });



  app.post('/login', async (req, res) => {
      const { username, email, password } = req.body;
    
      // Validation
      if ((!username && !email) || !password) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
      }
    
      // Vérifier si l'utilisateur existe par son email ou son nom d'utilisateur
      const user = await User.findOne({ $or: [{ email }, { username }] });
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
    
      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Courriel, nom dutilisateur ou mot de passe invalide' });
      }
    
      // Enregistrer l'utilisateur dans la session
      req.session.user = user;
    
      res.status(200).json({ message: 'Connexion réussie' });
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
        return res.status(401).json({ message: 'Non autorisé' });
      }
      
      // Détruire la session et supprimer les données de l'utilisateur
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Échec de déconnexion' });
        }
        res.status(200).json({ message: 'Déconnexion réussie' });
      });
    });
    
    
  app.post('/activities', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    console.log('User in session:', req.session.user);


    const { activity_type, start_time, end_time } = req.body;

    // Validation avec Validator.js 
    if (!activity_type || !start_time || !end_time) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    // Sauvegarder l'activité
    const activity = new Activity({
      user_id: req.session.user._id,
      activity_type,
      start_time,
      end_time,
    });

    await activity.save();

    res.status(201).json({ message: 'Activité enregistrée avec succès', activity });
  });


  app.get('/activities', async (req, res) => {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
      console.log('User in session:', req.session.user);
    
      // Récupérer l'historique des activités de l'utilisateur
      const activities = await Activity.find({ user_id: req.session.user._id });
    
      res.status(200).json({ activities });
    });
    
    


