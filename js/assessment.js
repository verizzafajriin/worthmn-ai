/*==========================================
        WORTHMN ASSESSMENT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

/*==========================================
            VARIABLES
==========================================*/

const slides = document.querySelectorAll(".assessment-slide");

const progressDots = document.querySelectorAll(".progress-dot");


const nextButtons = document.querySelectorAll(".btn-primary:not(#startAssessment)");

const prevButtons = document.querySelectorAll(".btn-secondary");

let currentSlide = 0;

const assessmentData = {

    name: "",

    province: "",

    city: "",

    district: "",

    emotion: "",

    story: ""

};


/*==========================================
        BILINGUAL ERROR MESSAGES
==========================================*/

const errorMessages = {

    province: { id: "Provinsi wajib dipilih.", en: "Province is required." },

    city: { id: "Kota / Kabupaten wajib diisi.", en: "City / Regency is required." },

    district: { id: "Kecamatan wajib diisi.", en: "District is required." },

    emotion: { id: "Pilih salah satu emosi terlebih dahulu.", en: "Please pick an emotion first." }

};

function currentLang(){

    return document.documentElement.getAttribute("lang") || "id";

}

function setFieldError(group, errorKey){

    group.classList.add("invalid");

    group.dataset.errorKey = errorKey;

    const errorEl = group.querySelector(".field-error");

    if(errorEl) errorEl.textContent = errorMessages[errorKey][currentLang()];

}

function clearFieldError(group){

    group.classList.remove("invalid");

    delete group.dataset.errorKey;

    const errorEl = group.querySelector(".field-error");

    if(errorEl) errorEl.textContent = "";

}

const languageToggle = document.querySelector("#languageToggle");

if(languageToggle){

    languageToggle.addEventListener("change", () => {

        document.querySelectorAll(".invalid[data-error-key]").forEach(group => {

            const errorEl = group.querySelector(".field-error");

            if(errorEl) errorEl.textContent = errorMessages[group.dataset.errorKey][currentLang()];

        });

    });

}


/*==========================================
        LOCATION VALIDATION
==========================================*/

const provinceHiddenInput = document.querySelector("#province");

const provinceSelect = document.querySelector("#province-select");

const cityHiddenInput = document.querySelector("#city");

const districtHiddenInput = document.querySelector("#district");

const provinceGroup = provinceHiddenInput.closest(".form-group");

const cityGroup = cityHiddenInput.closest(".autocomplete-group");

const districtGroup = districtHiddenInput.closest(".autocomplete-group");

function validateLocationFields(){

    let isValid = true;

    if(!provinceHiddenInput.value){

        setFieldError(provinceGroup, "province");

        isValid = false;

    }else{

        clearFieldError(provinceGroup);

    }

    if(!cityHiddenInput.value){

        setFieldError(cityGroup, "city");

        isValid = false;

    }else{

        clearFieldError(cityGroup);

    }

    if(!districtHiddenInput.value){

        setFieldError(districtGroup, "district");

        isValid = false;

    }else{

        clearFieldError(districtGroup);

    }

    return isValid;

}

// clear the province error the moment a province is picked
if(provinceSelect){

    provinceSelect.addEventListener("change", () => clearFieldError(provinceGroup));

}

// clear the error the moment a valid suggestion is picked
document.addEventListener("click", (e)=>{

    if(e.target.closest("#city-suggestions")) clearFieldError(cityGroup);

    if(e.target.closest("#district-suggestions")) clearFieldError(districtGroup);

});


/*==========================================
            EMOTION SELECT
==========================================*/

const emotionCards = document.querySelectorAll(".emotion-card");

const emotionGroup = document.querySelector(".emotion-group");

function validateEmotion(){

    if(!assessmentData.emotion){

        setFieldError(emotionGroup, "emotion");

        return false;

    }

    clearFieldError(emotionGroup);

    return true;

}

emotionCards.forEach(card => {

    card.addEventListener("click", () => {

        emotionCards.forEach(item => {

            item.classList.remove("selected");

        });

        card.classList.add("selected");

        assessmentData.emotion = card.querySelector("span").textContent.trim();

        clearFieldError(emotionGroup);

        console.log("Emotion :", assessmentData.emotion);

    });

});


/*==========================================
            SHOW SLIDE
==========================================*/

function showSlide(index){

    slides.forEach(slide=>{

        slide.classList.remove("active");

    });

    progressDots.forEach(dot=>{

        dot.classList.remove("active");

    });

    slides[index].classList.add("active");

    progressDots[index].classList.add("active");

    currentSlide=index;

}


/*==========================================
            NEXT
==========================================*/

nextButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(currentSlide===0 && !validateLocationFields()){

            return;

        }

        if(currentSlide===1 && !validateEmotion()){

            return;

        }

        assessmentData.province = provinceHiddenInput.value;

        assessmentData.city = cityHiddenInput.value;

        assessmentData.district = districtHiddenInput.value;

        if(currentSlide<slides.length-1){

            showSlide(currentSlide+1);

        }

    });

});


/*==========================================
            PREVIOUS
==========================================*/

prevButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(currentSlide>0){

            showSlide(currentSlide-1);

        }

    });

});


/*==========================================
        CHARACTER COUNTER
==========================================*/

const nameInput = document.querySelector("#name");

const storyInput = document.querySelector("#story");

const counters = document.querySelectorAll(".form-group small span");


// Nama
nameInput.addEventListener("input", () => {

    counters[0].textContent = nameInput.value.length;

    assessmentData.name = nameInput.value;

});


// Cerita
storyInput.addEventListener("input", () => {

    counters[1].textContent = storyInput.value.length;

    assessmentData.story = storyInput.value;

});


/*==========================================
            SEND TO AI
==========================================*/

const startAssessmentButton = document.querySelector("#startAssessment");

async function sendToAI(){

    const originalLabel = startAssessmentButton.textContent;

    startAssessmentButton.disabled = true;

    startAssessmentButton.textContent = "Menganalisis...";

    showLoading();

    try{

        const response = await fetch("/analyze", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(assessmentData)

        });

        if(!response.ok){

            throw new Error(`Server error: ${response.status}`);

        }

        const result = await response.json();

        console.log(result);

        hideLoading();

        if(result.success){

            await renderAI(result);

        }else{

            renderAIError();

        }

    }catch(err){

        console.error("Gagal mengirim data ke AI:", err);

        hideLoading();

        renderAIError();

    }finally{

        startAssessmentButton.disabled = false;

        startAssessmentButton.textContent = originalLabel;

    }

}

startAssessmentButton.addEventListener("click", async () => {

    // make sure the very latest text-field values are captured before sending
    assessmentData.name = nameInput.value;

    assessmentData.story = storyInput.value;

    await sendToAI();

});

});