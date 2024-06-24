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

/***********************************Filtres***********************/
const admin = localStorage.getItem("token")
if(admin != null){ 
    const elementAdmin = document.querySelectorAll(".admin")
    elementAdmin.forEach((element)=>{
        element.classList.remove("hide")
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

/***************************************MODAL*********************************/
// Je fais une fonction pour ouvrir la modal  
const openModal = () => {
    const modal = document.getElementById("modal")
    modal.classList.remove("hide")
}

//Je fais une fonction pour fermer la modal
const closeModal = () => {
    const modal = document.getElementById("modal")
    modal.classList.add("hide")
}

//Je récupere mon lien 
const boutonModifier = document.querySelector(".js-lien-div-admin")
// Je lui met un listener pour qu'au click il ouvre la modal
boutonModifier.addEventListener('click', () => {
    openModal()
    genererTousLesProjets(".gallery-modal")
    let galleryModal = document.querySelector(".gallery-modal")
    setTimeout(() => {
    let figures = galleryModal.querySelectorAll(":scope > * ")
    figures.forEach((figure) => {
        figure.setAttribute("class", "relative")
        let boutonSupprimer = document.createElement('button')
        boutonSupprimer.innerHTML = `<i class="fa-solid fa-trash-can"></i>`
        boutonSupprimer.setAttribute("class", "bouton-supprimer")
        figure.appendChild(boutonSupprimer)
    })
    }, 1000)
})

//Je recupère mon bouton fermer 
const boutonfermer = document.querySelector(".bouton-fermer-modal")
//Je met un listener pour qu'au click il ferme la modal
boutonfermer.addEventListener('click', closeModal)

//Je gère la propagation a la fermeture de la modal 
//Je recupère la modal 
const modalBackground = document.querySelector("#modal")
//Je lui met un listener pour qu'au click
modalBackground.addEventListener('click', (e) =>{ 
    // Si on click sur l'arrière plan la modal se ferme  
    if (e.target === modalBackground) {
        closeModal()   
    } else {
        //Sinon j'empêche la propagation
        e.stopPropagation();
    } 
})

























