// ======================================================
// GET HTML ELEMENTS
// ======================================================

const mentalIndexCard = document.getElementById("mentalIndexCard");

const reflectionCard = document.getElementById("reflectionCard");

const copingCard = document.getElementById("copingCard");

const nearbyCard = document.getElementById("nearbyCard");

const quoteCard = document.getElementById("quoteCard");


// ======================================================
// DELAY HELPER
// ======================================================

function delay(ms){

    return new Promise(resolve => setTimeout(resolve, ms));

}


// ======================================================
// SHOW / HIDE CARD
// ======================================================

function showCard(card){

    if(!card) return;

    card.style.display = "block";

    card.classList.add("fade-in");

}

function hideCard(card){

    if(!card) return;

    card.style.display = "none";

    card.innerHTML = "";

    card.classList.remove("fade-in");

}

function resetAI(){

    hideCard(mentalIndexCard);

    hideCard(reflectionCard);

    hideCard(copingCard);

    hideCard(nearbyCard);

    hideCard(quoteCard);

}


// ======================================================
// RISK -> DISPLAY MAPPING
// ======================================================

const riskStatus = {

    LOW: {
        color: "risk-low",
        title: "🌿 Kamu Terlihat Baik-baik Saja",
        description: "Perasaanmu hari ini tergolong ringan. Tetap luangkan waktu untuk dirimu sendiri, ya."
    },

    MEDIUM: {
        color: "risk-medium",
        title: "🌤️ Kamu Sedang Melalui Momen yang Berat",
        description: "Sepertinya kamu sedang menghadapi tekanan emosional yang cukup besar. Tidak apa-apa untuk mencari dukungan tambahan."
    },

    HIGH: {
        color: "risk-high",
        title: "💜 Kamu Tidak Sendirian",
        description: "Apa yang kamu rasakan terdengar berat sekali. Tolong pertimbangkan untuk berbicara dengan orang yang kamu percaya atau seorang profesional sesegera mungkin."
    }

};


// ======================================================
// BUILD THE SINGLE RESULT CARD (skeleton)
// ======================================================

function renderResultShell(result){

    const status = riskStatus[result.risk];

    if(!status) return;

    mentalIndexCard.innerHTML = `

        <div class="result-card status-card ${status.color}">

            <h3>🤍 Refleksi Emosional Hari Ini</h3>

            <h4>${status.title}</h4>

            <p>${status.description}</p>

            <div class="reflection-section">

                <h4>🌸 Refleksi Worthmn</h4>

                <p id="reflectionText"></p>

            </div>

            <div class="coping-section" id="copingSection"></div>

            <div class="nearby-section" id="nearbySection"></div>

        </div>

    `;

    showCard(mentalIndexCard);

}


// ======================================================
// TYPE WRITER EFFECT
// ======================================================

async function typeWriter(element, text, speed = 20){

    element.innerHTML = "";

    for(let i = 0; i < text.length; i++){

        element.innerHTML += text.charAt(i);

        await delay(speed);

    }

}


// ======================================================
// RENDER REFLECTION (inside the result card)
// ======================================================

async function renderReflection(result){

    const reflectionText = document.getElementById("reflectionText");

    if(!reflectionText) return;

    await typeWriter(reflectionText, result.reflection);

}


// ======================================================
// RENDER COPING (inside the result card)
// ======================================================

function renderCoping(result){

    const copingSection = document.getElementById("copingSection");

    if(!copingSection) return;

    if(!result.coping || result.coping.length === 0) return;

    const items = result.coping
        .map(item => `<li>${item}</li>`)
        .join("");

    copingSection.innerHTML = `

        <h4>🌿 Langkah yang Bisa Kamu Coba</h4>

        <ul class="coping-list">${items}</ul>

    `;

}


// ======================================================
// TRACK THE CURRENT RESULT
// ======================================================

let currentResult = null;


// ======================================================
// RENDER NEARBY SUPPORT (inside the result card)
// ======================================================


function renderNearbyList(places){

    const nearbySection = document.getElementById("nearbySection");

    if(!nearbySection) return;

    if(!places || places.length === 0){

        nearbySection.innerHTML = `

            <h4>📍 Dukungan Profesional di Sekitarmu</h4>

            <p>Maaf, kami belum menemukan layanan terdekat untuk lokasimu saat ini.</p>

        `;

        return;

    }

    const items = places
        .map(place => `

            <div class="nearby-item">

                <h4>🧠 ${place.name}</h4>

                <p>📌 ${place.address}</p>

                ${place.phone ? `<p>📞 ${place.phone}</p>` : ""}

                ${place.website ? `<p>🌐 ${place.website}</p>` : ""}

                <a href="${place.google_maps_url}" target="_blank">
                    Buka Google Maps →
                </a>

            </div>

        `)
        .join("");

    nearbySection.innerHTML = `

        <h4>📍 Dukungan Profesional di Sekitarmu</h4>

        <p>
            Kamu tidak harus menghadapi semuanya sendirian.
            Berikut beberapa layanan yang mungkin dapat membantu.
        </p>

        ${items}

    `;

}

async function requestNearbySupport(){

    const nearbySection = document.getElementById("nearbySection");

    if(!nearbySection || !currentResult) return;

    nearbySection.innerHTML = `<p>🔎 Mencari dukungan terdekat...</p>`;

    try{

        const response = await fetch("http://127.0.0.1:5000/nearby-support", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
                province: currentResult.province || currentResult.city,
                city: currentResult.city,
                district: currentResult.district
            })

        });

        const data = await response.json();

        if(data.success){

            renderNearbyList(data.nearby);

        }else{

            nearbySection.innerHTML = `<p>Maaf, terjadi kesalahan saat mencari dukungan terdekat.</p>`;

        }

    }catch(err){

        console.error("Gagal memuat dukungan terdekat:", err);

        nearbySection.innerHTML = `<p>Maaf, terjadi kesalahan saat mencari dukungan terdekat.</p>`;

    }

}

function declineNearbySupport(){

    const nearbySection = document.getElementById("nearbySection");

    if(nearbySection) nearbySection.innerHTML = "";

}

function renderNearby(result){

    const nearbySection = document.getElementById("nearbySection");

    if(!nearbySection) return;

    if(result.nearby_mode === "direct"){

        renderNearbyList(result.nearby);

        return;

    }

    if(result.nearby_mode === "offer"){

        nearbySection.innerHTML = `

            <div class="nearby-item">

                <p>💜 Ingin kami carikan psikolog atau layanan dukungan terdekat di sekitarmu?</p>

                <button type="button" class="btn-primary" onclick="requestNearbySupport()">Ya, tampilkan</button>

                <button type="button" class="btn-secondary" onclick="declineNearbySupport()">Tidak, terima kasih</button>

            </div>

        `;

        return;

    }

    // "none" (LOW risk) - leave the section empty, nothing to show.

}


// ======================================================
// RENDER VIRTUAL HUG / QUOTE (its own card)
// ======================================================

function renderQuote(result){

    if(!result.quote) return;

    quoteCard.innerHTML = `

        <div class="quote-wrapper fade-in">

            <h3>🤍 Sebuah Pelukan Virtual</h3>

            <p>${result.quote}</p>

        </div>

    `;

    showCard(quoteCard);

}


// ======================================================
// RENDER ERROR
// ======================================================


function renderAIError(){

    resetAI();

    mentalIndexCard.innerHTML = `

        <div class="result-card status-card">

            <h3>🤍 Refleksi Emosional Hari Ini</h3>

            <p>
                Maaf, terjadi kesalahan saat menghubungi server.
                Silakan coba lagi dalam beberapa saat.
            </p>

        </div>

    `;

    showCard(mentalIndexCard);

}


// ======================================================
// MAIN RENDER FUNCTION
// ======================================================


async function renderAI(result){

    currentResult = result;

    resetAI();

    renderResultShell(result);

    await delay(400);

    await renderReflection(result);

    await delay(400);

    renderCoping(result);

    if(result.ask_nearby){

        await delay(400);

        renderNearby(result);

    }

    await delay(600);

    renderQuote(result);

}
