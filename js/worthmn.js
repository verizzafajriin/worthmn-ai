/*==========================================
            WORTHMN UI
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

/*==========================================
            NAVBAR SCROLL
==========================================*/

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 40){

        navbar.classList.add("scrolled");

    }else{

        navbar.classList.remove("scrolled");

    }

});


/*==========================================
            SMOOTH SCROLL
==========================================*/

const navLinks = document.querySelectorAll('a[href^="#"]');

navLinks.forEach(link=>{

    link.addEventListener("click",function(e){

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});


/*==========================================
            ACTIVE NAVBAR
==========================================*/

const sections = document.querySelectorAll("section");

window.addEventListener("scroll",()=>{

    let currentSection="";

    sections.forEach(section=>{

        const sectionTop=section.offsetTop-120;

        const sectionHeight=section.offsetHeight;

        if(window.scrollY>=sectionTop &&
           window.scrollY<sectionTop+sectionHeight){

            currentSection=section.getAttribute("id");

        }

    });

    document.querySelectorAll(".nav-menu a").forEach(link=>{

        link.classList.remove("language-active");

        if(link.getAttribute("href")==="#"+currentSection){

            link.classList.add("language-active");

        }

    });

});

});

/*==========================================
            HOME SLIDER
==========================================*/

const slides = document.querySelectorAll(".hs-slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;
let autoSlide;

function showSlide(index){

    slides.forEach(slide=>slide.classList.remove("active"));
    dots.forEach(dot=>dot.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");

    currentSlide=index;

}

function nextSlide(){

    currentSlide++;

    if(currentSlide>=slides.length){

        currentSlide=0;

    }

    showSlide(currentSlide);

}

function startSlider(){

    autoSlide=setInterval(nextSlide,5000);

}

function stopSlider(){

    clearInterval(autoSlide);

}

dots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        showSlide(index);

        stopSlider();

        startSlider();

    });

});

const slider=document.querySelector(".sliders");

slider.addEventListener("mouseenter",stopSlider);

slider.addEventListener("mouseleave",startSlider);

startSlider();

/*==========================================
            CARD ACTIVE
==========================================*/

const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        cards.forEach(c=>{

            c.classList.remove("active");

        });

        card.classList.add("active");

    });

});

/*==========================================
            FAQ
==========================================*/

const faqItems=document.querySelectorAll(".faq-item");

faqItems.forEach(item=>{

    const button=item.querySelector(".faq-question");

    button.addEventListener("click",()=>{

        const isActive=item.classList.contains("active");

        faqItems.forEach(faq=>{

            faq.classList.remove("active");

        });

        if(!isActive){

            item.classList.add("active");

        }

    });

});

/*==========================================
            SCROLL REVEAL
==========================================*/

const revealElements = document.querySelectorAll(
    ".cards, .footer-home, .guide-container, .assessment-container, .faq-container"
);

const revealOnScroll = () => {

    revealElements.forEach(element => {

        const windowHeight = window.innerHeight;

        const elementTop = element.getBoundingClientRect().top;

        if(elementTop < windowHeight - 120){

            element.style.opacity = "1";
            element.style.transform = "translateY(0)";

        }

    });

};

revealElements.forEach(element => {

    element.style.opacity = "0";
    element.style.transform = "translateY(50px)";
    element.style.transition = "all .8s ease";

});

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

