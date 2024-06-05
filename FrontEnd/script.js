//Je fais une requête pour récupérer les projets
async function recuperationProjets () {
    const response = await fetch("http://localhost:5678/api/works");
    const projet = await response.json()
    return projet

}

//je supprime les éléments html
const galleryImage = document.querySelector(".gallery")
while (galleryImage.firstChild) {
        galleryImage.removeChild(galleryImage.firstChild)
    }

//J'intègre dynamiquement les données
recuperationProjets().then(resultatProjet => {
    for(let i = 0; i < resultatProjet.length; i++){
        //Je crée les éléments de la structure 
        let figure = document.createElement("figure")
        let imageElement = document.createElement("img")
        let figcaption = document.createElement("figcaption")
        //Je récupère les données de la requête 
        let srcImage = resultatProjet[i].imageUrl
        let titleImage = resultatProjet[i].title
        //J'intègre les données dans le html
        imageElement.src = srcImage;
        figcaption.textContent = titleImage
        galleryImage.appendChild(figure)
        figure.appendChild(imageElement)
        figure.appendChild(figcaption)
    }
}).catch(error => {
    console.error('Erreur lors de la récupération des projets:', error);
});







