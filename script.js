window.addEventListener("scroll", function () {
    const body = document.body;
    const scrollPosition = window.scrollY;
    const fadeStart = 100; // Start fading after 100px scroll
    const fadeEnd = 800; // Fully faded at 800px scroll (slower transition)
    const opacity = Math.max(0, 1 - scrollPosition / fadeEnd);
    const stickyNav = document.querySelector(".sticky-nav");
    const aboutContainer = document.querySelector(".about-container");
    const position = aboutContainer.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;


    body.style.setProperty("--bg-opacity", opacity);
    
    if (scrollPosition > fadeStart) {
        body.classList.add("scrolled");
    } else {
        body.classList.remove("scrolled");
    }
    
    if (scrollPosition > 200) {
        stickyNav.classList.add("visible");
    } else {
        stickyNav.classList.remove("visible");
    } 
    lastScrollY = scrollPosition;

    if (position < screenHeight * 0.8) {
        aboutContainer.classList.add("visible");
    }
});


