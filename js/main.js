const storageKey = 'myUniqueMovieStorageKey';
let movieList = [];

(() => {
  //init function
  //form submit listener
  document.querySelector('form').addEventListener('submit', handleSubmit); //mouse click OR enter key
  //storage listener
  window.addEventListener('storage', handleStorage); //localStorage only,not sessionStorage

  //read from storage and build the content
  readFromStorage();
  //add double click listener for deleting movies from movieList
  document.getElementById('movies').addEventListener('dblclick', deleteMovie);
  document.getElementById('movies').addEventListener('click', selectMovie);
})();

function selectMovie(ev) {
  let target = ev.target;
  if (target.tagName === 'DT' || target.localName === 'dd') {
    let title = target.localName === 'dt' ? target.textContent : target.previousElementSibling.textContent;
    let director = target.localName === 'dd' ? target.textContent : target.nextElementSibling.textContent;
    document.getElementById('title').value = title;
    document.getElementById('director').value = director;
  }
}

function deleteMovie(ev) {
  let target = ev.target;
  if (target.tagName === 'DT' || target.localName === 'dd') {
    let title = target.localName === 'dt' ? target.textContent : target.previousElementSibling.textContent;
    let director = target.localName === 'dd' ? target.textContent : target.nextElementSibling.textContent;
    if (confirm(`Are you sure you want to delete ${title} by ${director}?`)) {
      //they said ok
      // movieList = movieList.filter(movie=>{
      //   if(movie.title !== title || movie.director !== director){
      //     return true;
      //   }
      // });

      movieList = movieList.filter((movie) => movie.title !== title || movie.director !== director);
      buildList();
      saveToStorage();
    }
  }
}

function handleSubmit(ev) {
  ev.preventDefault(); //stop the form submitting and reloading the page
  let title = document.getElementById('title').value;
  let director = document.getElementById('director').value;
  if (!title || !director) return;
  //tell the user to fill in the form

  //We SHOULD add a unique id to each movie and use that later in the buildList
  const id = crypto.randomUUID();
  const movie = { id, title, director };
  // let movie = {title:title, director: director};
  movieList.unshift(movie); //or push()
  buildList();
  saveToStorage();
}

function handleStorage(ev) {
  //if storage has been updated on another tab then
  //update the display
  // console.log(ev);
  if (ev.key === storageKey) {
    //movie data was changed
    movieList = JSON.parse(ev.newValue);
    buildList();
  }
}

function saveToStorage() {
  //update the movieList in storage
  let jsonStr = JSON.stringify(movieList); //convert movieList to a JSON string
  localStorage.setItem(storageKey, jsonStr);
  //overwrite the older value of localStorage... we cannot EDIT what is in the string, just overwrite
  //setItem, getItem, removeItem, clear
}

function readFromStorage() {
  //retrieve the contents from storage
  let jsonStr = localStorage.getItem(storageKey);
  if (jsonStr) {
    movieList = JSON.parse(jsonStr);
  } else {
    movieList = [];
    localStorage.setItem(storageKey, JSON.stringify([]));
    //set a default value for movieList AND the localStorage key
    //JSON.stringify === turn an object into a JSON string
    //JSON.parse === turn a JSON string into an object
  }
  buildList();
}

function buildList(list) {
  //build contents of <dl> from array of objects
  let dl = document.getElementById('movies');

  // dl.innerHTML = movieList
  //   .map((movie) => {
  //     return `<dt>${movie.title}<dt>
  //   <dd>${movie.director}</dd>`;
  //   })
  //   .join('');

  dl.innerHTML = '';
  let df = document.createDocumentFragment();
  // {title:'Alien', director: 'ridley scott'}
  // [Object object]
  movieList
    .sort((a, b) => {
      if (a.title > b.title) return 1;
      if (a.title < b.title) return -1;
      return 0;
    })
    .forEach((movie) => {
      let dt = document.createElement('dt');
      let dd = document.createElement('dd');
      dt.textContent = movie.title;
      dt.setAttribute('data-ref', movie.id ?? 1);
      dd.textContent = movie.director;
      df.append(dt);
      df.append(dd);
    });
  dl.append(df);
  updateMovieCount();
}

function updateMovieCount() {
  let span = document.querySelector('header>h1>span');
  span.textContent = movieList.length;
}
