/** 
 * @param {string} clientId
 * @returns joke string
*/
async function getJoke(clientId) {
    let response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
        }),
    });

    let data = await response.json();
    let joke = data.joke;

    return joke;
}

/**
 * @param {string} clientId 
 * @param {float} rating 
 * @returns success or error notification json object
 */
async function rateJoke(clientId, rating) {
    let response = await fetch('http://localhost:5000/rate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            rating: rating,
        }),
    });

    let data = await response.json();

    return data;
}


async function getCategories(clientId) {
    let response = await fetch('http://localhost:5000/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
        }),
    });

    let data = await response.json();
    let categories = data.categories;
    let scores = data.scores;

    return { categories, scores };
}


document.addEventListener("DOMContentLoaded", () => {
    const inputContainer = document.querySelector('.input-container');
    const nameInput = document.getElementById('name-input');
    const submitNameBtn = document.getElementById('submit-name');
    const jokeContainer = document.querySelector('.joke-container');
    const jokeText = document.getElementById('joke-text');
    const startButton = document.getElementById('start-btn');
    const ratingSection = document.querySelector('.rating-section');
    const ratingSlider = document.getElementById('rating-slider');
    const nextButton = document.getElementById('next-btn');
    const categList = document.getElementById('categories-list');

    submitNameBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name !== '') {
            inputContainer.classList.add('hidden');
            jokeContainer.classList.remove('hidden');
            setupJokeHandler(name);
        } else {
            alert('Please enter your name.');
        }
    });

    function setupJokeHandler(clientId) {
        startButton.addEventListener('click', async () => {
            let joke = await getJoke(clientId);
            jokeText.textContent = joke;
            startButton.style.display = 'none';
            ratingSection.classList.remove('hidden');
        });

        nextButton.addEventListener('click', async () => {
            const ratingValue = ratingSlider.value;
            await rateJoke(clientId, parseFloat(ratingValue));

            let joke = await getJoke(clientId);
            jokeText.textContent = joke;

            const { categories, scores } = await getCategories(clientId);

            const pairedList = categories.map((value, index) => {
                return { string: value, number: scores[index] };
            });

            pairedList.sort((a, b) => b.number - a.number);

            const sortedCategories = pairedList.map((pair) => pair.string);
            const sortedScores = pairedList.map((pair) => pair.number);
            
            categList.innerHTML = '';
            for (let i = 0; i < sortedCategories.length; i++) {
                const li = document.createElement('li');
                li.textContent = `${sortedScores[i]} <- ${sortedCategories[i]}`;
                categList.appendChild(li);
            }
        });
    }
});
