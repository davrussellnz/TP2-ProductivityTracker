  //client.js

  const registerForm = document.getElementById('register-form');
  const registerUsername = document.getElementById('username');
  const registerEmail = document.getElementById('email');
  const registerPassword = document.getElementById('password');

  registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();


      // Vérifier si tous les champs sont remplis
      if (!registerUsername.value || !registerEmail.value || !registerPassword.value) {
          alert('Veuillez remplir tous les champs');
          return;
        }
    
      const registerData = {
        username: registerUsername.value,
        email: registerEmail.value,
        password: registerPassword.value,
      };
    
      // Envoi des données d'inscription au serveur
      try {
          const response = await fetch('/register', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(registerData),
            });
            
          
     // Vérifier si l'inscription a réussi
        if (response.ok) {
          alert('Utilisateur enregistré avec succès');
        } else {
          const errorData = await response.json();
          throw new Error(`Échec de l'enregistrement : ${errorData.message}`);
          
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    });
    


  const loginForm = document.getElementById('login-form');
  const loginUsername = document.getElementById('login-username');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Vérifier si tous les champs sont remplis

    if (!loginUsername.value || !loginEmail.value || !loginPassword.value) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const loginData = {
      username: loginUsername.value,
      email: loginEmail.value,
      password: loginPassword.value,
    };

    // Envoi des données de connexion au serveur
    try {
      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
          alert('Vous avez été connecté avec succès.');
      
          // Obtenir l'élément h2 par son ID
          const userVisualizationHeader = document.getElementById('user-visualization');
      
          // Mettre à jour l'élément h2 avec le nom d'utilisateur
          userVisualizationHeader.textContent = `Visualisation des activités de ${loginUsername.value}`;
      
          fetchAndVisualizeData(); 

        } else {
          
          throw new Error('Échec de la connexion');
        }
    } catch (error) {
      console.error('Erreur:', error);
    }
  });

  const logoutButton = document.getElementById('logout-button');

  logoutButton.addEventListener('click', async (e) => {
    e.preventDefault();

    // Vérifier si la déconnexion a réussi
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
          alert('Vous avez été déconnecté avec succès.');
        location.reload();
      } else {
        throw new Error('Échec de la déconnexion');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });



//éléments du formulaire d'activité
  const activityForm = document.getElementById('activity-form');
  const activityType = document.getElementById('activity-type');
  const startTime = document.getElementById('start-time');
  const endTime = document.getElementById('end-time');

  activityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const activityData = {
        activity_type: activityType.value,
        start_time: startTime.value,
        end_time: endTime.value,
      };
    
      
      const email = loginEmail.value || registerEmail.value;
    
      // Vérification et envoi des données d'activité
      if (validateInput(activityData, email)) {
        sendActivityData(activityData);
      } else {
        console.error('Données dentrée non valides');
      }
    });
    

  function validateInput(data, email) {
      const activityTypes = ['work', 'eating', 'leisure', 'sleep'];
      const isValidActivityType = activityTypes.includes(data.activity_type);
      const isValidStartTime = Date.parse(data.start_time);
      const isValidEndTime = Date.parse(data.end_time);
      const isValidEmail = validator.isEmail(email);
      const isEndTimeGreaterThanStartTime = isValidStartTime < isValidEndTime;

       // Afficher une alerte si l'heure de fin est antérieure à l'heure de début
      if (!isEndTimeGreaterThanStartTime) {
          alert('Lheure de fin doit être postérieure à lheure de début.');
      }
    
      return (
        isValidActivityType &&
        isValidStartTime &&
        isValidEndTime &&
        isValidStartTime < isValidEndTime &&
        isValidEmail
      );
    }
    
    
// Envoyer les données d'activité au serveur
  function sendActivityData(data) {
      fetch('/activities', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Échec de lenregistrement de lactivité');
          }
        })
        .then((data) => {
          console.log('Activity logged:', data);
          fetchAndVisualizeData();
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    
// Connexion pour recevoir les données en temps réel
  const socket = io();

  socket.on('data', (data) => {
    visualizeData(data);
  });

  const visualizationContainer = document.getElementById('visualization-container');

  // Calculer la durée d'une activité
  function getActivityDuration(activity) {
    const startTime = new Date(activity.start_time);
    const endTime = new Date(activity.end_time);
    return (endTime - startTime) / 60000;
  }

  // Traduire le type d'activité en français
  function translateActivityType(activityType) {
    const translations = {
      sleep: 'Sommeil',
      work: 'Travail',
      leisure: 'Récréation',
      eating: 'Alimentation',
    };
  
    return translations[activityType] || activityType;
  }
  
// Récupérer les données d'activité et mettre à jour la visualisation
  function fetchAndVisualizeData() {

      d3.select("#visualization-container").selectAll("svg").remove();

    fetch('/activities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',

    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Échec de lextraction des données dactivité');
      }
    })
    .then((data) => {
      visualizeData(data.activities);
    })
    
  }

  function visualizeData(data) {
  
    // Effacer les données de visualisation existantes
    d3.select("#visualization-container").selectAll("text").remove();
  
    const activityDurationData = data.reduce((acc, activity) => {
      const activityType = activity.activity_type;
      const duration = getActivityDuration(activity);
  
      if (acc[activityType]) {
        acc[activityType] += duration;
      } else {
        acc[activityType] = duration;
      }
  
      return acc;
    }, {});
  
    const pieData = Object.entries(activityDurationData).map(([key, value]) => ({
      type: key,
      duration: value,
    }));
  
      // Calculer la durée totale de toutes les activités
    const totalDuration = pieData.reduce((acc, activity) => acc + activity.duration, 0);
  
    //Dimensions du diagramme circulaire
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;
  
    // Créer l'élément SVG pour le diagramme circulaire
    const svg = d3
      .select(visualizationContainer)
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width)
      .attr("height", height)
      .selectAll("g")
      .data([null])
      .join("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
  
      // Pour les couleurs du diagramme 
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    const pie = d3.pie().value((d) => d.duration);
  
    const path = d3.arc().outerRadius(radius - 10).innerRadius(0);
  
    // Mettre à jour les éléments "arc"
    const arc = svg
      .selectAll(".arc")
      .data(pie(pieData))
      .join(
        (enter) => enter.append("g").attr("class", "arc"),
        (update) => update,
        (exit) => exit.remove()
      );
  
    arc
      .selectAll("path")
      .data((d) => [d])
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => color(d.data.type));
  
      // Ajouter les étiquettes de type d'activité 
    arc
      .selectAll(".label")
      .data((d) => [d])
      .join("text")
      .attr("class", "label")
      .attr("transform", (d) => `translate(${path.centroid(d)})`)
      .attr("dy", "-0.2em")
      .text((d) => `${translateActivityType(d.data.type)}`);
  
      // Ajouter les pourcentages 
    arc
      .selectAll(".percentage")
      .data((d) => [d])
      .join("text")
      .attr("class", "percentage")
      .attr("transform", (d) => `translate(${path.centroid(d)})`)
      .attr("dy", "1em")
      .text((d) => `${((d.data.duration / totalDuration) * 100).toFixed(2)}%`);
  }
  