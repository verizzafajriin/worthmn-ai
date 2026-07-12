// =======================================
// WORTHMN LOADING ENGINE
// =======================================


const loadingMessages = [

    "🤍 Membaca ceritamu...",

    "🌸 Memahami emosi yang kamu bagikan...",

    "🌿 Menyusun refleksi yang hangat...",

    "✨ Menyiapkan hasil untukmu..."

];

const LOADING_MESSAGE_INTERVAL_MS = 1200;

let loadingIntervalId = null;


function showLoading(){

    const aiContainer = document.getElementById("aiLoading");

    if(!aiContainer) return;

    aiContainer.innerHTML = `

        <div class="loading-card">

            <div class="loading-icon">

                🤍

            </div>

            <h2>

                Worthmn AI

            </h2>

            <p class="loading-message">

                ${loadingMessages[0]}

            </p>

        </div>

    `;

    // Cycle through the messages on a timer until hideLoading() stops it.
    let messageIndex = 0;

    clearInterval(loadingIntervalId);

    loadingIntervalId = setInterval(() => {

        messageIndex = (messageIndex + 1) % loadingMessages.length;

        const textEl = aiContainer.querySelector(".loading-message");

        if(textEl) textEl.textContent = loadingMessages[messageIndex];

    }, LOADING_MESSAGE_INTERVAL_MS);

}


function hideLoading(){

    const aiContainer = document.getElementById("aiLoading");

    clearInterval(loadingIntervalId);

    loadingIntervalId = null;

    if(!aiContainer) return;

    aiContainer.innerHTML = "";

}