const apiKey = '506fd9cf';

const moviesListElement = document.getElementById('movies-list');
// const movieDetailsElement = document.getElementById('movie-details');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const movie_specification = document.getElementById('movie-specify');


let currentPage = 1;
let totalResults = 0;
let currentSearchQuery = '';

searchInput.addEventListener('input',()=>{
    if(searchInput.value.trim().length>=3 || searchInput.value.trim().length==0)
    {
        searchButton.click();
    }


});

// Event listener for the search button
searchButton.addEventListener('click', () => {
    currentSearchQuery = searchInput.value.trim();
    currentPage = 1;
    fetchMovies(currentPage, currentSearchQuery);
});

// Event listener for pagination buttons
prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies(currentPage, currentSearchQuery);
    }
});

nextButton.addEventListener('click', () => {
    if (currentPage < Math.ceil(totalResults / 10)) {
        currentPage++;
        fetchMovies(currentPage, currentSearchQuery);
    }
});

// Function to fetch movies from the API
function fetchMovies(page, searchQuery) {
    
    let apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&page=${page}`;
    if (searchQuery) {
        apiUrl += `&s=${encodeURIComponent(searchQuery)}`;
    }
    else {
        apiUrl += `&s=${encodeURIComponent('har')}`;
    }
    //   console.log(apiUrl);

    // Fetch data from the API
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.Response === 'True') {

                 const error_handler = document.getElementById("error-message");
                error_handler.innerHTML = "";
                // Update the total number of results
                totalResults = parseInt(data.totalResults);

                // Clear the movies list and movie details sections
                moviesListElement.innerHTML = '';
                // movieDetailsElement.innerHTML = '';

                // Render the movies list
                data.Search.forEach((movie) => {
                    renderMovieItem(movie);
                });
            } else {
                
                const error_handler = document.getElementById("error-message");
                error_handler.innerHTML = "Unknown Error Occured";
                error_handler.style.color = "white";
                throw new Error(data.Error || 'Unknown error occurred');

            }
        })
        .catch((error) => {
            
            const error_handler = document.getElementById("error-message");
            error_handler.innerHTML = "Error fetching movie list";
            error_handler.style.color = "white";
            console.error('Error fetching movie list:', error.message);
            return null;
        });
}

// Function to render a movie item in the list
function renderMovieItem(movie) {
    var temp = document.createElement("div");
    temp.id = `${movie.imdbID}`;
    temp.style.marginBottom = "20px";
    temp.style.marginTop = "20px";
    temp.style.display = "flex";
    temp.style.flexDirection = "column";
    temp.style.flexWrap = "wrap";
    temp.style.justifyContent = "space-between";
    temp.style.padding = "15px";
    temp.style.backgroundColor = "#faf60c";
    temp.style.borderRadius = "10px";
    const containment = document.createElement("div");
    containment.classList.add("containment");

    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');

    movieItem.innerHTML = `
    <img src="${movie.Poster}" alt="${movie.Title}">
    <h3>${movie.Title}</h3>
    <p>Rating: ${getRatingStars(getMovieRating(movie.imdbID)) || 'Not rated yet'}</p>
    
    <div class="comments">
    Comments: ${getMovieComments(movie.imdbID) || 'No comments yet'}
    </div>
  `;
    const ratingInput = document.createElement('input');
    ratingInput.type = 'number';
    ratingInput.min = '1';
    ratingInput.max = '5';
    ratingInput.style.marginBottom = "8px";
    ratingInput.placeholder = 'Rate (1-5)';
    ratingInput.classList.add("styling");

    ratingInput.addEventListener('change', () => {
        const rating = ratingInput.value;
        if (rating <= 5 && rating > 0) {
            saveMovieRating(movie.imdbID, rating);
        }
        else if (rating > 5) {
            saveMovieRating(movie.imdbID, "5");
        }
        else {
            saveMovieRating(movie.imdbID, "1");
        }
    });
    function getRatingStars(rating) {
        const roundedRating = Math.round(parseFloat(rating));
        const fullStars = '★'.repeat(roundedRating);
        const emptyStars = '☆'.repeat(5 - roundedRating);
        return fullStars + emptyStars;
    }

    const commentTextarea = document.createElement('textarea');
    commentTextarea.style.marginBottom = "8px";
    commentTextarea.placeholder = 'Leave a comment';
    commentTextarea.classList.add("styling");

    commentTextarea.addEventListener('input', () => {
        const comment = commentTextarea.value;
        saveMovieComment(movie.imdbID, comment);
    });
    const commentButton = document.createElement('button');
    commentButton.textContent = 'Leave a comment';
    commentButton.classList.add("prev_next");


    temp.appendChild(movieItem);

    ratingInput.addEventListener('input', () => {
        fetchMovies(currentPage, currentSearchQuery);
    });

    commentButton.addEventListener('click', () => {
        fetchMovies(currentPage, currentSearchQuery);
    });


    containment.appendChild(ratingInput);
    containment.appendChild(commentTextarea);
    containment.appendChild(commentButton);

    temp.appendChild(containment);

    moviesListElement.appendChild(temp);

    // Add event listener to show movie details on click
    movieItem.addEventListener('click', () => {
        const activeMovie = document.querySelector('.movie-item.active');
        if (activeMovie) {
            activeMovie.classList.remove('active');
            movie_specification.innerHTML = "";
            movie_specification.style.padding = "0px";
            temp.classList.remove('positive');
            fetchMovies(currentPage, currentSearchQuery);
        }

        
        else {
            temp.classList.add('positive');
            movieItem.classList.add('active');
            fetchMovieDetails(movie.imdbID, activeMovie, temp);
            // movie_specification.appendChild(movieDetails);
            movie_specification.style.padding = "20px";
            movie_specification.scrollIntoView({ behavior: 'smooth' });
        }
    });


}

// Function to fetch and render movie details
function fetchMovieDetails(movieId, activeMovie, temp) {
    // console.log(movieId);
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`;

    // Fetch movie details from the API
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.Response === 'True') {
                
                renderMovieDetails(data, activeMovie, temp);
            } else {
                
                const error_handler = document.getElementById("error-message");
                error_handler.innerHTML = "Movie Not Found";
                error_handler.style.color = "white";
                throw new Error(data.Error || 'Unknown error occurred');
            }
        })
        .catch((error) => {
            
            const error_handler = document.getElementById("error-message");
            error_handler.innerHTML = "Error fetching movie list";
            error_handler.style.color = "white";
            console.error('Error fetching movie list:', error.message);
            return null;
        });
}

// Function to render movie details in the movie details section
function renderMovieDetails(movie, activeMovie, temp) {
    // console.log(movie);
    const movieDetails = document.createElement('div');
    movieDetails.classList.add('movie-details');
    movieDetails.innerHTML = `
    <h2>${movie.Title}</h2>
    <p>Year: ${movie.Year}</p>
    <p>Genre: ${movie.Genre}</p>
    <p>Released: ${movie.Released}</p>
    <p>Director: ${movie.Director}</p>
    <p>Writer: ${movie.Writer}</p>
    <p>Actors: ${movie.Actors}</p>
    <p>Language: ${movie.Language}</p>
    <p>Plot: ${movie.Plot}</p>
    <!-- Add more movie details here -->
  `;

    
    const but = document.createElement('button');
    but.classList.add("prev_next");
    but.textContent = "Remove Details";

    movie_specification.innerHTML = "<h1>SELECTED MOVIE DETAILS</h1>";
    movie_specification.appendChild(movieDetails);
    movie_specification.appendChild(but);

    but.addEventListener('click', () => {
        // activeMovie.classList.remove('active');
        movie_specification.innerHTML = "";
        movie_specification.style.padding = "0px";
        temp.classList.remove('positive');
        fetchMovies(currentPage, currentSearchQuery);
    });
    //   const c=document.getElementById(`${movie.imdbID}`);
    //   c.appendChild(movieDetails);
}

// Initial fetch on page load
fetchMovies(currentPage, currentSearchQuery);

// Function to save the movie rating to local storage
function saveMovieRating(movieId, rating) {
    localStorage.setItem(`rating-${movieId}`, rating);
}

// Function to retrieve the movie rating from local storage
function getMovieRating(movieId) {
    return localStorage.getItem(`rating-${movieId}`);
}

// Function to save the movie comment to local storage
function saveMovieComment(movieId, comment) {
    localStorage.setItem(`comment-${movieId}`, comment);
}

// Function to retrieve the movie comment from local storage
function getMovieComments(movieId) {
    return localStorage.getItem(`comment-${movieId}`);
}
