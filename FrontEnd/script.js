//Je fais une requête Globale pour récupérer les projets
async function demandeDonneesApi (dataType) {
    const response = await fetch(`http://localhost:5678/api/${dataType}`);
    const rep = await response.json()
    return rep
}

function creerLesProjetsEnHtml (projet) {
    //Je crée les éléments de la structure 
    let figure = document.createElement("figure")
    let imageElement = document.createElement("img")
    let figcaption = document.createElement("figcaption")
    //Je récupère les données de la requête 
    let srcImage = projet.imageUrl
    let titleImage = projet.title
    //J'intègre les données dans le html
    imageElement.src = srcImage;
    figcaption.textContent = titleImage
    const galleryImage = document.querySelector(".gallery")
    galleryImage.appendChild(figure)
    figure.appendChild(imageElement)
    figure.appendChild(figcaption)
}

/*************************************Projets********************/
function genererTousLesProjets () {
    //J'intègre dynamiquement les projets
    demandeDonneesApi("works").then(projets => {
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
    //Je boucle sur l'ensemble des catégories de mon set pour créer des boutons 
    setCategories.forEach((categorie) => {
        //je crée les éléments de la structure
        let li = document.createElement("li")
        let bouton = document.createElement("button")
        //Je récupère les données de mon set 
        let nomBtn = categorie.name
        let idBtn = categorie.id
        //j'intègre dans les données dans le html 
        const listeFiltre = document.querySelector(".listeFiltre") 
        listeFiltre.appendChild(li)
        li.appendChild(bouton)
        bouton.innerText=nomBtn
        bouton.id = idBtn
        //Pour chaque bouton je lui mets un écouteurs d'évenement
        bouton.addEventListener("click", () => {
            if(idBtn === 0){
                console.log("j'affiche tous", nomBtn );
                genererTousLesProjets()
            }else {
                console.log("j'affiche la catégorie ", nomBtn);
                demandeDonneesApi("works").then(projets => {
                 const projetsFiltrees = projets.filter(projet=> projet.categoryId === idBtn)
                 projetsFiltrees.forEach((projet) => {
                    creerLesProjetsEnHtml(projet)
                 })
                 console.log("hello dear"+projetsFiltrees);
                })
            }
        })
    }) 
})

/*figcaption.dataset.title = resultatProjet[i].title
figcaption.addEventListener("click", (e) => {
    console.log("coucou", e.target)
})*/








