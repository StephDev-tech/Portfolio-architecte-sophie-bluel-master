let allWorks = []

//Je fais une requête Globale pour récupérer les projets
const demandeDonneesApi = async (dataType,typeDeDemande,corpdDeLaDemande) => {
    const response = await fetch(`http://localhost:5678/api/${dataType}`,{
        method: typeDeDemande,
        body: corpdDeLaDemande
    });
    const rep = await response.json()
    return rep
}

/*************************************Templates********************/
const creerLesProjetsEnHtml = (projet, classParent) => {
    //Je crée les éléments de la structure 
    let figure = document.createElement("figure")
    figure.innerHTML = `<img src="${projet.imageUrl}" alt="${projet.title}"><figcaption>${projet.title}</figcaption>`
    const galleryImage = document.querySelector(classParent)
    galleryImage.append(figure)

 
}

const erreurSaisi = (texte) =>{
    let p = document.createElement("p")
    p.innerHTML = texte
    p.setAttribute("class","msg-erreur")
    return p
}

/*************************************Projets********************/
const genererTousLesProjets = (classParent) => {
    //J'intègre dynamiquement les projets
    demandeDonneesApi("works").then(projets => {
        allWorks = projets
        projets.forEach((projet) => {
            creerLesProjetsEnHtml(projet,classParent)
        })
    }).catch(error => {
        console.error('Erreur lors de la récupération des projets:', error);
    });
}
genererTousLesProjets(".gallery")

genererTousLesProjets(".gallery-modal")


/***********************************Filtres***********************/
const admin = localStorage.getItem("token")
if(admin != null){ 
    const elementAdmin = document.querySelectorAll(".admin")
    elementAdmin.forEach((element)=>{
        element.removeAttribute("style")
    })
}else{
    //J'intègre dynamiquement les filtres
    //J'initialise mon set et j'ajoute une nouvelle catégorie dans mon set 
    let setCategories = new Set()
    setCategories.add({ "id": 0, "name": "Tous"})

    //Je récupère les objets catégories dans l'API 
    demandeDonneesApi("categories").then(reponses => {
        //Une fois la reponse de l'API réceptionnée je boucle sur chaque éléments
        reponses.forEach((reponse) => {
            //J'ajoute dans mon set les catégories de l'API
            setCategories.add(reponse)
        })
        console.log(setCategories);
        //Je boucle sur l'ensemble des catégories de mon set pour créer des boutons 
        setCategories.forEach((categorie) => {
            //je crée les éléments de la structure
            let li = document.createElement("li")
            li.innerHTML = `<button id=${categorie.id}>${categorie.name}</button>`
            //je l'intègre au document HTML
            const listeFiltre = document.querySelector(".listeFiltre") 
            listeFiltre.append(li)
            //Pour chaque bouton je lui mets un écouteurs d'évenement
            li.addEventListener("click", () => {
                //Je selectionne ma class gallery
                const galleryImage = document.querySelector(".gallery")
                //Je supprime les enfants de ma section gallery
                galleryImage.innerHTML = ""
                //Si mon id de la catégorie est égale à 0
                if(categorie.id === 0){
                    //Je récupere les projets dans le tableau projets et pour chaque résultat 
                    allWorks.forEach((projet) => {
                        //Je reconstruit les éléments HTML avec ma fonction
                        creerLesProjetsEnHtml(projet,".gallery")
                    })
                //Sinon Je met dans une variable mon tableau de résultat filtré par son id categorie
                }else {
                    const projetsFiltres = allWorks.filter(projet=> projet.categoryId === categorie.id)
                    //Pour chaque projet filtré
                    projetsFiltres.forEach((projet) => {
                        //Je reconstruit les éléments HTML avec ma fonction
                        creerLesProjetsEnHtml(projet,".gallery")
                    })
                }
            })
        }) 
    })
}

/******************************Formulaire de connexion****************************/
//j'envoie les identifiants et reçois un token
const envoieIdentifiantConnexion = async (event) => {
    event.preventDefault();
    
    // Je récupère les valeurs des input
    let email = document.getElementById("email");
    let motDePasse = document.getElementById("motDePasse");
    
    //Si l'utilisateur rempli les champs 
    if(email.value !== '' || motDePasse.value !== ''){
        //je crée un objet JSON avec l'email et le mot de passe 
        const infoConnexion = JSON.stringify({ "email": email.value, "password": motDePasse.value });
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
                //Je récupère mon form 
                const form = document.getElementById("monForm")
                //Je vérifie si il y a un msg erreur
                let msgErreur = document.querySelector(".msg-erreur")
                //Si j'ai un msg erreur 
                if(msgErreur != null){
                    //Je le supprime 
                    msgErreur.remove()
                    //Et je remet le nouveaux message 
                    form.insertBefore(erreurSaisi("les informations utilisateur / mot de passe ne sont pas correctes"), form.children[2])
                }else{
                    //Sinon j'affiche le message d'erreur directement 
                    form.insertBefore(erreurSaisi("les informations utilisateur / mot de passe ne sont pas correctes"), form.children[2])
                }
            }
        //Je gère l'exception avec le catch pour ne pas planter le backend  
        } catch (error) {
            console.error("Erreur lors de l'envoi de la requête:", error);
            errorMessage.textContent = "Erreur lors de l'envoi de la requête.";
        }

    //Si l'utilisateur ne rempli pas les champs
    } else {
        //J'affiche dans la console l'erreur
        console.error("Les champs email et mot de passe sont requis.");
        //Je récupère mon form 
        const form = document.getElementById("monForm")
        //Je vérifie si il y a un msg erreur
        let msgErreur = document.querySelector(".msg-erreur")
        //Si j'ai un msg erreur 
        if(msgErreur != null){
            //Je le supprime 
            msgErreur.remove()
            //Et je remet le nouveaux message 
            form.insertBefore(erreurSaisi("Veuillez saisir les informations utilisateur / mot de passe"), form.children[2])
        }else{
            //Sinon j'affiche le message d'erreur directement 
            form.insertBefore(erreurSaisi("Veuillez saisir les informations utilisateur / mot de passe"), form.children[2])
        }    
    }
}
/***************************************MODAL*********************************/
// Je fais une fonction pour ouvrir la modal  
const openModal = () => {
    const modal = document.getElementById("modal")
    console.log(modal);
    modal.removeAttribute("style")
}

//Je fais une fonction pour fermer la modal
const closeModal = () => {
    const modal = document.getElementById("modal")
    console.log(modal);
    modal.setAttribute("style","display: none")
}

//Je récupere mon lien 
const boutonModifier = document.querySelector(".js-lien-div-admin")
// Je lui met un listener pour qu'au click il ouvre la modal
boutonModifier.addEventListener('click', openModal)

//Je recupère mon bouton fermer 
const boutonfermer = document.querySelector(".bouton-fermer-modal")
//Je met un listener pour qu'au click il ferme la modal
boutonfermer.addEventListener('click', closeModal)

//Je gère la propagation a la fermeture de la modal 
//Je recupère la modal 
const modalBackground = document.querySelector("#modal")
//Je lui met un listener pour qu'au click
modalBackground.addEventListener('click', (event) =>{ 
    // Si on click sur l'arrière plan la modal se ferme  
    if (event.target === modalBackground) {
        closeModal()   
    } else {
        //Sinon j'empêche la propagation
        event.stopPropagation();
    } 
})


















