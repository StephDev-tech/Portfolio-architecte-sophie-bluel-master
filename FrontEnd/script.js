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
    const figure = document.createElement("figure")
    figure.innerHTML = `<img src="${projet.imageUrl}" alt="${projet.title}"><figcaption>${projet.title}</figcaption>`
    figure.setAttribute("class", `suppression${projet.id}`)
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
const admin = sessionStorage.getItem("token")
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

//fonction pour créer et activer le bouton supprimer
const creerActiverBtnSupp = () => {
    //Je récupère ma modal
    const galleryModal = document.querySelector(".gallery-modal")
    //Je retarde la création des boutons supprimer 
    setTimeout(() => {
        //Je récupère les balises figure
    const figures = galleryModal.querySelectorAll(":scope > * ")
    //J'initialise une boucle qui va récupérer chaque figure 
    figures.forEach((figure) => {
        //J'ajouter une class 
        figure.classList.add("relative")
        //Je crée mon bouton 
        const boutonSupprimer = document.createElement('button')
        //Je mets une icone corbeille a mon bouton
        boutonSupprimer.innerHTML = `<i class="fa-solid fa-trash-can"></i>`
        //J'ajoute une class pour le css
        boutonSupprimer.setAttribute("class", "bouton-supprimer")
        //J'ajoute le bouton dans ma balise figure
        figure.appendChild(boutonSupprimer)
        //Je récupère mes bouton pour lui ajouter un event listener
        boutonSupprimer.addEventListener('click', async (e) => {
            e.preventDefault()
            //Dans la liste de class je récupère la première class
            const classASupprimer = figure.classList[0]
            //Je recupère l'id du projet en supprimant la partie "suppression"
            const idImage = classASupprimer.replace('suppression', "")
            //Je retire la figure de l'image concerné dans la galerie-modal
            figure.remove()
            //Je recupère la figure dans la galerie principale
            const imageGallery = document.querySelector(`.${classASupprimer}`)
            //Je la supprime
            imageGallery.remove()           
                try {
                //j'envoie ma requête à l'api pour supprimer en bdd
                const response = await fetch(`http://localhost:5678/api/works/${idImage}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': '*/*', 
                        'Authorization': `Bearer ${admin}` // je recupère le token
                     }
                })
                if ((response.status === 200)) {
                    console.log(response, "la suppression à réussi");
                } else {
                    console.error(response, "la suppression à rencontrer une erreur");
                }
            }catch{
                console.log("error")
            }
        })
    })
    }, 100)
}

//je recupère la modal à vider 
const viderModal = document.querySelector(".gallery-modal")

//Je récupere mon lien 
const boutonModifier = document.querySelector(".js-lien-div-admin")
// Je lui met un listener pour qu'au click il ouvre la modal
boutonModifier.addEventListener('click', () => {
    openModal()
    genererTousLesProjets(".gallery-modal")
    creerActiverBtnSupp()
})

//Je recupère mon bouton fermer 
const boutonfermer = document.querySelector(".bouton-fermer-modal")
//Je met un listener pour qu'au click il ferme la modal
boutonfermer.addEventListener('click', () => {
    closeModal()
    viderModal.innerHTML = ""
})

//Je gère la propagation a la fermeture de la modal 
//Je recupère la modal 
const modalBackground = document.querySelector("#modal")
//Je lui met un listener pour qu'au click
modalBackground.addEventListener('click', (e) => { 
    // Si on click sur l'arrière plan la modal se ferme  
    if (e.target === modalBackground) {
        closeModal() 
        viderModal.innerHTML = ""
    } else {
        //Sinon j'empêche la propagation
        e.stopPropagation();
    } 
})

//Je recupère la modal ajouter photo
const modalAjoutPhoto = document.querySelector('.modal-Ajouter-photo')
//je recupère la modal galerie image
const modalGalleryPhoto = document.querySelector('.div-modal')

//Je récupère le bouton ajouter photo
const boutonAjouterPhoto = document.getElementById("btnAjouterPhoto")
//je lui met un listener pour qu'au click
boutonAjouterPhoto.addEventListener('click', () => {
    //il cache la modal galerie image
    modalGalleryPhoto.classList.add('hide')
    // affiche la modal ajouter photo 
    modalAjoutPhoto.classList.remove('hide')
})

//Je recupère mon bouton fermer 
const boutonfermerAp = document.querySelector(".bouton-fermer-ap")
//Je met un listener pour qu'au click 
boutonfermerAp.addEventListener('click', () => {
    //il cache la modal ajouter photo 
    modalAjoutPhoto.classList.add('hide')
    //il ferme la modal 
    closeModal()
    //il retire la class hide dans la modal galerie image
    modalGalleryPhoto.classList.remove('hide')
    // il la vide
    viderModal.innerHTML = ""
})

//Je recupère mon bouton retour sur la modal ajouter photo
const boutonRetourAp = document.querySelector(".bouton-retour-ap")
// je lui met un listener pour qu'au click 
boutonRetourAp.addEventListener('click', () => {
    //il n'affiche plus la modal ajouter photo
    modalAjoutPhoto.classList.add('hide')
    //il affiche la modal galerie image 
    modalGalleryPhoto.classList.remove('hide')
})


const btnValider = document.querySelector(".bouton-valider")
btnValider.addEventListener('click', async () => {
    let image = document.getElementById("inputAjouterPhoto")
    const fichier = image.files[0]
    let titre = document.getElementById("inputText").value
    let categorie = document.getElementById("menuCategorie").value
    /*const envoie = await fetch("http://localhost:5678/api/works", {
        method: "POST",

    })*/
})



























