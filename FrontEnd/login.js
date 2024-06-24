/******************************Template****************************/
const erreurSaisi = (texte) =>{
    let p = document.querySelector(".msg-erreur")
    p.innerHTML = texte
}

/******************************Formulaire de connexion****************************/
//j'envoie les identifiants et reçois un token
const envoieIdentifiantConnexion = async (event) => {
    event.preventDefault();
    
    // Je récupère les valeurs des input
    let email = document.getElementById("email").value;
    let password = document.getElementById("motDePasse").value;
    
    //Si l'utilisateur rempli les champs 
    if(email !== '' || password !== ''){
        //je crée un objet JSON avec l'email et le mot de passe 
        const infoConnexion = JSON.stringify({  email, password });
        //je propose une requête a l'API
        try{
            // Je paramètre la requête pour l'API
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                body: infoConnexion,
                headers: {'Content-Type': 'application/json' }
            })

            // si la rep est ok 
            if (response.ok) {
                //Je récupère la réponse sous format JSON
                const rep = await response.json();
                //Je range dans le localstorage le token (j'entre le nom de ma valeur puis sa valeur)
                localStorage.setItem("token", rep.token)  
                //Je redirige le client sur la page d'accueil
                window.location.href = "./index.html"
            } else {
                //J'envoie à la console le type d'erreur 
                console.error("identifiant et mot de passe incorrect")
                erreurSaisi("identifiant et mot de passe incorrect")
            }
        //Je gère l'exception avec le catch pour ne pas planter le backend  
        } catch (error) {
            console.error("test Erreur lors de l'envoi de la requête:", error);
        }

    //Si l'utilisateur ne rempli pas les champs
    } else {
        //J'affiche dans la console l'erreur
        console.error("Les champs email et mot de passe sont requis.");
        //Je récupère mon form 
        erreurSaisi("Les champs email et mot de passe sont requis.");

    }    
}
