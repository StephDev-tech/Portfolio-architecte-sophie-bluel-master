let allWorks = [];
let allCategories = [];

//Je fais une requête Globale pour récupérer les projets
const demandeDonneesApi = async (dataType, typeDeDemande, corpdDeLaDemande) => {
	const response = await fetch(`http://localhost:5678/api/${dataType}`, {
		method: typeDeDemande,
		body: corpdDeLaDemande,
	});
	const rep = await response.json();
	return rep;
};

/*************************************Templates********************/

const creerLesProjetsEnHtml = (projet, classParent) => {
	//Je crée un élément figure
	const figure = document.createElement("figure");
	//je vérifie si le le parent à la class .gallery-modal avec un boolean
	const isModal = classParent === ".gallery-modal";
	// je crée une constante qui si:
	const theTemplate = isModal
		//isModal = true (donc est dans la modal) je n'affiche que l'image
		? `<img src="${projet.imageUrl}" alt="${projet.title}">`
		//isModal = false (donc est dans la gallerie principale) j'affiche l'image et le titre
		: `<img src="${projet.imageUrl}" alt="${projet.title}"><figcaption>${projet.title}</figcaption>`;
	//j'ajoute le template à figure
	figure.innerHTML = theTemplate;
	//j'intègre les classes désirées
	figure.setAttribute('class', `suppression${projet.id}`)
	//je récupère le conteneur parent
	const galleryImage = document.querySelector(classParent);
	// si c'est une modale
	if (isModal) {
		//J'ajouter une class à figure
		figure.classList.add("relative");
		//Je crée mon bouton
		const boutonSupprimer = document.createElement("button");
		//Je mets une icone corbeille a mon bouton
		boutonSupprimer.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
		//J'ajoute une class pour le css
		boutonSupprimer.classList.add("class", "bouton-supprimer");
		//Je récupère mes bouton pour lui ajouter un event listener
		boutonSupprimer.addEventListener("click", async (e) => {
			e.preventDefault();
			//Dans la liste de class je récupère la première class
			const classASupprimer = figure.classList[0];
			//Je recupère l'id du projet en supprimant la partie "suppression"
			const idImage = classASupprimer.replace("suppression", "");
			console.log("🚀 ~ boutonSupprimer.addEventListener ~ idImage:", idImage)
			//Je retire la figure de l'image concerné dans la galerie-modal
			figure.remove();
			//Je recupère la figure dans la galerie principale
			const imageGallery = document.querySelector(`.${classASupprimer}`);
			//Je la supprime
			console.log("🚀 ~ boutonSupprimer.addEventListener ~ classASupprimer:", classASupprimer)
			imageGallery.remove();
			try {
				//j'envoie ma requête à l'api pour supprimer en bdd
				const response = await fetch(
					`http://localhost:5678/api/works/${idImage}`,
					{
						method: "DELETE",
						headers: {
							"Content-Type": "*/*",
							"Authorization": `Bearer ${admin}`, // je recupère le token
						},
					}
				);
				if (response.ok) {
					console.log(response, "la suppression à réussi");
				} else {
					throw new Error("la suppression à rencontrer une erreur");
				}
			} catch (error) {
				console.log("error", error);
			}
		});
        //J'ajoute le bouton dans ma balise figure
		figure.appendChild(boutonSupprimer);
	}
	//sinon j'ajoute l'élément créer à la gallerie principale
	galleryImage.append(figure);
};

/*************************************Projets********************/

//Je crée une fonction pour générer les projets
const genererTousLesProjets = (classParent) => {
	//J'intègre dynamiquement les projets
	demandeDonneesApi("works")//Je fais une demande de donnée à l'api
		.then((projets) => {//je récupère les projets
			allWorks = projets;//Je mets les projets dans mon tableau allWorks
			projets.forEach((projet) => {//Pour chaque projet
				creerLesProjetsEnHtml(projet, classParent);//Je crée les projets en html
			});
		})
		.catch((error) => {
			console.error("Erreur lors de la récupération des projets:", error);
		});
};
genererTousLesProjets(".gallery");

/***********************************Filtres***********************/

//je stock mon token dans une variable
const admin = sessionStorage.getItem("token");

//Si admin est different de null 
if (admin != null) {
	const elementAdmin = document.querySelectorAll(".admin");//je récupère tous mes éléments avec la class 'admin'
	elementAdmin.forEach((element) => {// et pour chaque element 
		element.classList.remove("hide");//je lui retire la class 'hide'
	});
} else {
	//J'intègre dynamiquement les filtres
	//J'initialise mon set et j'ajoute une nouvelle catégorie dans mon set
	let setCategories = new Set();
	setCategories.add({ id: 0, name: "Tous" });

	//Je récupère les objets catégories dans l'API
	demandeDonneesApi("categories").then((reponses) => {
		categories = reponses
		//Une fois la reponse de l'API réceptionnée je boucle sur chaque éléments
		reponses.forEach((reponse) => {
			//J'ajoute dans mon set les catégories de l'API
			setCategories.add(reponse);
		});
		console.log(setCategories);
		//Je boucle sur l'ensemble des catégories de mon set pour créer des boutons
		setCategories.forEach((categorie) => {
			//je crée les éléments de la structure
			let li = document.createElement("li");
			li.innerHTML = `<button id=${categorie.id} class="bouton-filtre">${categorie.name}</button>`;
			//je l'intègre au document HTML
			const listeFiltre = document.querySelector(".listeFiltre");
			listeFiltre.append(li);
			//Pour chaque bouton je lui mets un écouteurs d'évenement
			li.addEventListener("click", () => {
				let boutonFiltre = document.querySelectorAll('.bouton-filtre')
				boutonFiltre.forEach(bouton => {
					bouton.classList.remove('active')
				})
				const bouton = li.querySelector(':scope > *')
				bouton.classList.add("active")
				//Je selectionne ma class gallery
				const galleryImage = document.querySelector(".gallery");
				//Je supprime les enfants de ma section gallery
				galleryImage.innerHTML = "";
				//Si mon id de la catégorie est égale à 0
				if (categorie.id === 0) {
					//Je récupere les projets dans le tableau projets et pour chaque résultat
					allWorks.forEach((projet) => {
						//Je reconstruit les éléments HTML avec ma fonction
						creerLesProjetsEnHtml(projet, ".gallery");
					});
					//Sinon Je met dans une variable mon tableau de résultat filtré par son id categorie
				} else {
					const projetsFiltres = allWorks.filter(
						(projet) => projet.categoryId === categorie.id
					);
					//Pour chaque projet filtré
					projetsFiltres.forEach((projet) => {
						//Je reconstruit les éléments HTML avec ma fonction
						creerLesProjetsEnHtml(projet, ".gallery");
					});
				}
			});
		});
	});
}

/***************************************MODAL*********************************/

// Je fais une fonction pour ouvrir la modal
const openModal = () => {
	const modal = document.getElementById("modal");//je récupère la modal 
	allWorks.forEach((work) => {//je récupère les projets dans le tableau allWorks et pour chaque projets
		creerLesProjetsEnHtml(work, ".gallery-modal");//j'utilise la fonction creerLesProjetsEnHtml
	});
	modal.classList.remove("hide");//j'affiche la modal
};

//Je fais une fonction pour fermer la modal
const closeModal = () => {
	const modal = document.getElementById("modal");//je recupere la modal
	modal.classList.add("hide");//j'ajoute une class "hide"
	const formAReboot = document.querySelector(".form-ajouter-photo")//Je récupère mon formulaire 
	formAReboot.reset()//je réinitialise le formulaire
	const icon = document.querySelector(".fa-image")//je récupère l'icon
	icon.classList.remove("hide")//Je retire la class 'hide'
	const label = document.querySelector(".titre-ajouter-photo")//je récupère mon label
	label.classList.remove("hide")//je retire la class 'hide'
	const divAjouter = document.querySelector(".ajouter-photo")//je récupère la div ajouter photo
	divAjouter.classList.remove("bkg-image-input")//je retire la class 'bkg-image-input'
	const text = document.querySelector(".texte-ajouter-photo")//je récupère le texte de la div ajouter photo
	text.classList.remove("hide")//je retire la class 'hide' 
	const image = document.getElementById('preview')//je récupère la balise image 
	image.classList.add("hide")//j'ajoute une class 'hide' à la balise image 
};

//je recupère la modal à vider
const viderModal = document.querySelector(".gallery-modal");

//Je récupere mon lien
const boutonModifier = document.querySelector(".js-lien-div-admin");
// Je lui met un listener pour qu'au click il ouvre la modal
boutonModifier.addEventListener("click", () => {
	openModal();
	
});

//Je recupère mon bouton fermer
const boutonfermer = document.querySelector(".bouton-fermer-modal");
//Je met un listener pour qu'au click il ferme la modal
boutonfermer.addEventListener("click", () => {
	closeModal();
	viderModal.innerHTML = "";
});

//Je gère la propagation a la fermeture de la modal
//Je recupère la modal
const modalBackground = document.querySelector("#modal");
//Je lui met un listener pour qu'au click
modalBackground.addEventListener("click", (e) => {
	// Si on click sur l'arrière plan la modal se ferme
	if (e.target === modalBackground) {
		closeModal();
		viderModal.innerHTML = "";
	} else {
		//Sinon j'empêche la propagation
		e.stopPropagation();
	}
});

//Je recupère la modal ajouter photo
const modalAjoutPhoto = document.querySelector(".modal-Ajouter-photo");
//je recupère la modal galerie image
const modalGalleryPhoto = document.querySelector(".div-modal");

//Je récupère le bouton ajouter photo
const boutonAjouterPhoto = document.getElementById("btnAjouterPhoto");
//je lui met un listener pour qu'au click
boutonAjouterPhoto.addEventListener("click", () => {
	//il cache la modal galerie image
	modalGalleryPhoto.classList.add("hide");
	// affiche la modal ajouter photo
	modalAjoutPhoto.classList.remove("hide");
});

//Je recupère mon bouton fermer
const boutonfermerAp = document.querySelector(".bouton-fermer-ap");
//Je met un listener pour qu'au click
boutonfermerAp.addEventListener("click", () => {
	const form = document.querySelector('#form')
	//il cache la modal ajouter photo
	modalAjoutPhoto.classList.add("hide");
	form.reset()
	//il ferme la modal
	closeModal();
	//il retire la class hide dans la modal galerie image
	modalGalleryPhoto.classList.remove("hide");
	// il la vide
	viderModal.innerHTML = "";
});

//Je recupère mon bouton retour sur la modal ajouter photo
const boutonRetourAp = document.querySelector(".bouton-retour-ap");
// je lui met un listener pour qu'au click
boutonRetourAp.addEventListener("click", () => {
	//il n'affiche plus la modal ajouter photo
	modalAjoutPhoto.classList.add("hide");
	//il affiche la modal galerie image
	modalGalleryPhoto.classList.remove("hide");
});

/*********************************Aperçu image***************************/

//je fais une fonction pour l'apercu de l'image avant envoie
const apercuImage = () => {
	//Je récupère mon input (file)
	const input = document.getElementById("inputAjouterPhoto")
	//Je récupère ma balise image
	const image = document.getElementById('preview')
	//Si il y'a une image dans le input 
	if (input.files[0]) {
		//Je crée un nouveau file reader 
		const reader = new FileReader()
		//Au chargement de l'image j'exécute une fonction qui affiche l'image dans la balise 
		reader.onload = (input) => { //Je lis l'image télécharger
			image.src = input.target.result//je récupère l'url et je le met dans l'attribut src de la balise image
		}
		reader.readAsDataURL(input.files[0])//
		image.classList.remove("hide")//je retire la class 'hide'
	} else {
		image.classList.add("hide")//sinon je remet la class 'hide' à l'image
	}
}

//je récupère mon input image 
const inputImage = document.getElementById('inputAjouterPhoto')
inputImage.addEventListener('change', ()=>{//je lui met un listener pour que quand il y'a un changement 
	apercuImage()//j'utilise la fonction apercuImage pour afficher l'image télécharger 
	
	//je recupère les élément dans la div 'zone-ajouter-photo' et j'ajoute à chaque élément la class 'hide'
	const icon = document.querySelector(".fa-image")
	icon.classList.add("hide")
	const label = document.querySelector(".titre-ajouter-photo")
	label.classList.add("hide")
	const divAjouter = document.querySelector(".ajouter-photo")
	divAjouter.classList.add("bkg-image-input")
	const text = document.querySelector(".texte-ajouter-photo")
	text.classList.add("hide")
}) 

/*********************************Générer dynamiquement mes catégorie*****/

//Je récupère les données dans l'api pour les catégories 
demandeDonneesApi("categories").then((categorie) => {
	//je range les catégories dans un tableau
	allCategories = categorie
	//je récupère le tableau et pour chaque résultat du tableau : 
	allCategories.forEach(categorie => {
		//je crée une balise option
		const option = document.createElement("option")
		//j'intègre le nom de la catégorie
		option.innerHTML = `${categorie.name}`
		//je rajoute l'id de la catégorie dans la valeur
		option.setAttribute('value', `${categorie.id}`)
		//je récupère ma balise select
		const menuCategorie = document.getElementById("menuCategorie")
		//j'ajoute mes options au select
		menuCategorie.appendChild(option)
	})
})

/*********************************Formulaire envoie image à l'api*********************/

//Je récupère mon formulaire
const form = document.querySelector('#form')
//J'ajoute un listener a mon formulaire
form.addEventListener('change', () => {
	//Je récupère le bouton envoyé
	const btnEnvoyer = document.querySelector(".bouton-valider")
	//Je récupère mon input 
	let input = document.getElementById('inputAjouterPhoto')
	//je récupère le premier élément de mon tableau files
	let image = input.files[0]
	//je récupère la valeur de mon input (text)
	let titre = document.getElementById("inputText").value.trim()
	//je récupère la valeur de mon select convertie en number
	let categorie = Number(document.querySelector("#menuCategorie").value)
	//je crée un formData
	let formData = new FormData()

	//Je récupère les span pour la gestion des message erreur
	let errorImage = document.getElementById("errorImage")//pour l'image
	let errorTitre = document.getElementById("errorTitre")//pour le titre
	let errorCategorie = document.getElementById("errorCategorie")//pour la catégorie
	let msgUtilisateur = document.getElementById("msgUtilisateur")//pour l'envoie des éléments

	//Je vide les message erreur
	errorImage.innerHTML= ""
	errorTitre.innerHTML= ""
	errorCategorie.innerHTML= ""

	//Je crée une fonction qui désactive le bouton valider
	const desactiveBtn = ()=>{
		btnEnvoyer.classList.remove('valide')
		btnEnvoyer.setAttribute("disabled","true")
	}

	//Je crée une fonction qui active le bouton valider
	const activeBtn = () =>{
		btnEnvoyer.classList.add('valide')
		btnEnvoyer.removeAttribute("disabled")
	}

	//Si l'image n'est pas défini 
	if ( image === undefined) {
		errorImage.innerHTML="Une image est requise."//j'affiche un message d'erreur
		errorImage.style.color = 'red'
		desactiveBtn()//je désactive mon bouton

	
	//Si le titre n'est pas défini 		
	} else if (titre === "") {
		errorTitre.innerHTML="Un titre est requis. svp"//j'affiche un message d'erreur
		errorTitre.style.color = 'red'
		desactiveBtn()//je désactive mon bouton

	//Si le titre n'est pas défini 
	} else if (categorie === 0 ) {
		errorCategorie.innerHTML="Une catégorie est requise."//j'affiche un message d'erreur
		errorCategorie.style.color = 'red'
		desactiveBtn()//je désactive mon bouton

	//Sinon Si tout les input sont remplis alors :
	} else {
		//J'active mon bouton 
		activeBtn()

		//je lui un listener pour qu'au click 
		btnEnvoyer.addEventListener('click', async () => {
			
			//j'envoie la valeur des inputs dans mon formData
			formData.append('image',image)//image
			formData.append('title',titre)//titre
			formData.append('category',categorie)//catégorie

			//je fais un appel à l'api pour l'envoie des éléments
			const response = await fetch("http://localhost:5678/api/works", {
			method: "POST",
			headers: {
				"Authorization": `Bearer${admin}` // je recupère le token
			},
			body: formData
			})

			//Si la reponse est ok 
			if (response.ok) {
				let gallery = document.querySelector(".gallery")
				gallery.innerHTML = ""
				genererTousLesProjets(".gallery")
				msgUtilisateur.innerHTML = "L'envoie des éléments à reussi."
				msgUtilisateur.style.color = "green"
				form.reset()

			//Sinon l'envoie à échouer	
			} else {
				msgUtilisateur.innerHTML = "L'envoie à échouer"//J'affiche un message d'erreur
				msgUtilisateur.style.color = "red"
			}			
		})
	}
})
		














