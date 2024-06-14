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

const creerLesProjetsEnHtml = (projet) => {
    //Je crée les éléments de la structure 
    let figure = document.createElement("figure")
    figure.innerHTML = `<img src="${projet.imageUrl}" alt="${projet.title}"><figcaption>${projet.title}</figcaption>`
    const galleryImage = document.querySelector(".gallery")
    galleryImage.append(figure)
}

/*************************************Projets********************/
const genererTousLesProjets = () => {
    //J'intègre dynamiquement les projets
    demandeDonneesApi("works").then(projets => {
        allWorks = projets
        projets.forEach((projet) => {
            creerLesProjetsEnHtml(projet)
        })
    }).catch(error => {
        console.error('Erreur lors de la récupération des projets:', error);
    });
}
genererTousLesProjets()

/***********************************Filtres***********************/

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
            const galleryImage = document.querySelector(".gallery")
            galleryImage.innerHTML = ""
            if(categorie.id === 0){
                allWorks.forEach((projet) => {
                    creerLesProjetsEnHtml(projet)
                 })
            }else {
                 const projetsFiltres = allWorks.filter(projet=> projet.categoryId === categorie.id)
                 projetsFiltres.forEach((projet) => {
                    creerLesProjetsEnHtml(projet)
                 })
            }
        })
    }) 
})










