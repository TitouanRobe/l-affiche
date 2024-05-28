function setCookie(name, value) {
    var encodedValue = encodeURIComponent(value);
    document.cookie = name + "=" + encodedValue + ";"
}

function getCookie(name) {
    var cookies = document.cookie.split('; ');

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=');
        if (cookie[0] === name) {
            return decodeURIComponent(cookie[1]);
        }
    }

    return null;
}

 
function deconnexion(){
    setCookie('id_utilisateur', '', -1); // La date d'expiration négative supprime le cookie
    alert('Déconnexion réussie!');
    console.log(getCookie('id_utilisateur'))
    window.location.reload(); // Recharger la page
}
 

function setCookie(name, value) {
    var encodedValue = encodeURIComponent(value);
    document.cookie = name + "=" + encodedValue + ";"
}

function hashPassword(password) {
    var hashedPassword = CryptoJS.SHA256(password);
    return hashedPassword.toString(CryptoJS.enc.Hex);
}

function connexion() {
  var mail = document.getElementById("connexion-inscription-utilisateur").value;
  var password =  hashPassword(document.getElementById("connexion-inscription-mdp").value);

  var xhr = new XMLHttpRequest();
  var url = 'http://127.0.0.1:8000/connexion';

  // Préparer les données à envoyer
  var data = JSON.stringify({
      mail: mail,
      password: password
  });

  console.log(data)
  // Configurer la requête
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  // Gérer la réponse de l'API
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
          if (xhr.status === 200) {
              var result = JSON.parse(xhr.responseText);
              console.log(result[0])
              if (result[0]['success']) {
                  alert("Connexion réussie !");
                  console.log('cookie:\n');
                  setCookie('id_utilisateur',result[0]['id_uti']);
                  console.log(document.cookie)
                  //window.location.href = "https://www.example.com";
                } else {
                  alert("Nom d'utilisateur ou mot de passe incorrect !");
                  console.log('erreur')
              }
          } else {
              console.error('Erreur lors de la communication avec l\'API. Statut:', xhr.status);
          }
      }
  };
  xhr.send(data);
}


function inscription(){
    var mail = document.getElementById("connexion-inscription-utilisateur").value;
    var password =  hashPassword(document.getElementById("connexion-inscription-mdp").value);  
    var pseudo = document.getElementById("connexion-inscription-pseudo").value;

    
    var xhr = new XMLHttpRequest();
    var url = 'http://127.0.0.1:8000/inscription';
  
    // Préparer les données à envoyer
    var data = JSON.stringify({
        mail:mail,
        pseudo: pseudo,
        password: password,

    });
  
    console.log(data)
    // Configurer la requête
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
  
    // Gérer la réponse de l'API
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var result = JSON.parse(xhr.responseText);
                console.log(result[0])
                if (result[0]['success']) {
                    alert("enregistrement réussie !");
                    console.log('cookie:\n');
                    setCookie('id_utilisateur',result[0]['id_uti']);
                    console.log(document.cookie)
                    //window.location.href = "https://www.example.com";

                } else {
                    alert(result[0]['message']);
                }
            } else {
                console.error('Erreur lors de la communication avec l\'API. Statut:', xhr.status);
            }
        }
    };
    xhr.send(data);    
}


