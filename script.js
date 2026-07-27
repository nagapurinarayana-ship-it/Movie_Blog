const movies = [

{
title:"Inception",
rating:"8.8",
image:"https://picsum.photos/300/450?1"
},

{
title:"Interstellar",
rating:"8.7",
image:"https://picsum.photos/300/450?2"
},

{
title:"The Dark Knight",
rating:"9.0",
image:"https://picsum.photos/300/450?3"
},

{
title:"Avatar",
rating:"7.8",
image:"https://picsum.photos/300/450?4"
},

{
title:"Oppenheimer",
rating:"8.6",
image:"https://picsum.photos/300/450?5"
},

{
title:"RRR",
rating:"8.2",
image:"https://picsum.photos/300/450?6"
}

];

const grid=document.getElementById("movieGrid");

function showMovies(list){

grid.innerHTML="";

list.forEach(movie=>{

grid.innerHTML+=`

<div class="card">

<img src="${movie.image}">

<h3>${movie.title}</h3>

<p>⭐ ${movie.rating}</p>

</div>

`;

});

}

showMovies(movies);

document.getElementById("searchBox").addEventListener("input",function(){

const value=this.value.toLowerCase();

const filtered=movies.filter(movie=>movie.title.toLowerCase().includes(value));

showMovies(filtered);

});
