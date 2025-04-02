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
document.addEventListener("DOMContentLoaded", function () {
    // Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Allows transparency

    // Set Renderer Size
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create Moving Particles (Stars Effect)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10; // Random position
    }
    
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Camera Position
    camera.position.z = 3;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate effect
        particlesMesh.rotation.y += 0.001;

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handling
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});
window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const faqFadeStart = 2000; // When the background starts appearing
    const faqFadeEnd = 3000;   // When it fully disappears
    const aboutSectionStart = 2700; // "About" section starts here
    const faqBackground = document.querySelector(".faq-background");

    if (faqBackground) {
        if (scrollPosition >= faqFadeStart && scrollPosition <= faqFadeEnd) {
            let faqOpacity = 1 - (scrollPosition - faqFadeStart) / (faqFadeEnd - faqFadeStart);
            faqBackground.style.opacity = faqOpacity;
        } else if (scrollPosition < faqFadeStart) {
            faqBackground.style.opacity = 1; // Fully visible before 1900px
        } else {
            faqBackground.style.opacity = 0; // Fully hidden after 2600px
        }

        // Ensure it disappears before the "About" section starts
        if (scrollPosition >= aboutSectionStart) {
            faqBackground.style.opacity = 0;
        }
    }
});
// player
const apiKey = "6de8b093d016798162681279bdefa922";
const username = "Luyanda_jnr";
const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json`;

async function fetchNowPlaying() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Handle API errors
        if (data.error) {
            console.error("Last.fm API Error:", data.message);
            if (data.error === 10) { // Invalid API Key
                alert("⚠️ Your Last.fm API key is invalid or expired! Please update it.");
            }
            return;
        }

        const track = data.recenttracks?.track?.[0]; // Get the latest track
        const player = document.querySelector('.now-playing-container');
        const albumCover = document.getElementById("album-cover");
        const trackLink = document.getElementById("track-link");

        if (track) {
            const trackName = track.name || "Unknown Track";
            const artistName = track.artist["#text"] || "Unknown Artist";
            const albumName = track.album?.["#text"] || "Unknown Album"; // Fetch Album Name


            document.getElementById("track-name").textContent = trackName;
            document.getElementById("artist-name").textContent = artistName;
            document.getElementById("album-name").textContent = albumName; // Display Album Name


            let albumArt = track.image?.[3]?.["#text"] || track.image?.[2]?.["#text"]; // Try high-quality first

            // If no album art OR it's Last.fm's default placeholder, get artist image
            if (!albumArt || albumArt.includes("2a96cbd8b46e442fc41c2b86b821562f")) {
                console.warn("No album art found, trying to fetch artist image...");
                albumArt = await fetchArtistImage(artistName);
            }

            console.log("Final Image URL:", albumArt); // Debugging

            albumCover.src = albumArt;

            // Generate Last.fm track URL
            const trackUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;
            trackLink.href = trackUrl; // Update link

            if (track['@attr']?.nowplaying === "true") {
                player.classList.add('playing', 'visible');
            } else {
                document.getElementById("track-name").textContent = "Last Played: " + trackName;
                player.classList.remove('playing');
                player.classList.add('visible');
            }
        } else {
            console.warn("No tracks found in API response.");
            player.classList.remove('playing', 'visible');
        }
    } catch (error) {
        console.error("Error fetching Last.fm data:", error);
    }
}

// Function to get artist image if album cover is missing
async function fetchArtistImage(artist) {
    const artistUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
    
    try {
        const response = await fetch(artistUrl);
        const data = await response.json();
        
        if (data.artist && data.artist.image) {
            const artistImage = data.artist.image[3]?.["#text"] || data.artist.image[2]?.["#text"];
            return artistImage || "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
        }
    } catch (error) {
        console.error("Error fetching artist image:", error);
    }
    
    return "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"; // Final fallback
}

// Initial fetch
fetchNowPlaying();

// Update every 30 seconds
setInterval(fetchNowPlaying, 30000);

// Make it appear after page load
setTimeout(() => {
    document.querySelector('.now-playing-container').classList.add('visible');
}, 2000);




// progress 

document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll(".progress-bar");
                progressBars.forEach(bar => {
                    // Reset to 0 to ensure animation plays every time
                    bar.style.width = "0";
                    // Force reflow to reset animation
                    void bar.offsetWidth;
                    // Animate to target width
                    bar.style.width = bar.getAttribute("data-percent") + "%";
                });
            }
        });
    }, { 
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    });

    // Observe each skill category individually for better performance
    document.querySelectorAll(".skill-category").forEach(category => {
        observer.observe(category);
    });
});
// Mobile menu toggle functionality

// Mobile menu toggle functionality

// Ensure contact link stays visible when scrolling
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        const nowPlaying = document.querySelector('.now-playing-container');
        const contactLink = document.querySelector('.sticky-nav ul li a[href*="#contact"]');
        
        // Make contact link more prominent
        if (contactLink) {
            contactLink.style.backgroundColor = 'rgba(233, 214, 179, 0.2)';
            contactLink.style.padding = '8px 15px';
        }
        
        // Adjust when scrolling to prevent overlap
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.body.scrollHeight;
            
            // If near bottom of page, hide now playing temporarily
            if (scrollPosition > documentHeight - 150) {
                nowPlaying.style.opacity = '0';
                nowPlaying.style.transform = 'translateY(20px)';
            } else {
                nowPlaying.style.opacity = '1';
                nowPlaying.style.transform = 'translateY(0)';
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        // Create mobile menu elements
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-nav-overlay';
        
        const mobileContent = document.createElement('div');
        mobileContent.className = 'mobile-nav-content';
        
        // Clone existing navigation links
        const navClone = document.querySelector('nav ul').cloneNode(true);
        mobileContent.appendChild(navClone);
        mobileOverlay.appendChild(mobileContent);
        
        document.body.appendChild(mobileToggle);
        document.body.appendChild(mobileOverlay);
        
        // Toggle mobile menu
        mobileToggle.addEventListener('click', function() {
            document.body.classList.toggle('mobile-nav-active');
        });
        
        // Close menu when clicking on overlay
        mobileOverlay.addEventListener('click', function(e) {
            if (e.target === mobileOverlay) {
                document.body.classList.remove('mobile-nav-active');
            }
        });
        
        // Close menu when clicking a link
        mobileContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                document.body.classList.remove('mobile-nav-active');
            });
        });
    }
});

