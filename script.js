window.addEventListener("scroll", function () {
    const body = document.body;
    const scrollPosition = window.scrollY;
    const fadeStart = 100;
    const fadeEnd = 800;
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
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0xffffff,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 3;

    function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});

window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const faqFadeStart = 2000;
    const faqFadeEnd = 3000;
    const aboutSectionStart = 2700;
    const faqBackground = document.querySelector(".faq-background");

    if (faqBackground) {
        if (scrollPosition >= faqFadeStart && scrollPosition <= faqFadeEnd) {
            let faqOpacity = 1 - (scrollPosition - faqFadeStart) / (faqFadeEnd - faqFadeStart);
            faqBackground.style.opacity = faqOpacity;
        } else if (scrollPosition < faqFadeStart) {
            faqBackground.style.opacity = 1;
        } else {
            faqBackground.style.opacity = 0;
        }

        if (scrollPosition >= aboutSectionStart) {
            faqBackground.style.opacity = 0;
        }
    }
});

const apiKey = "6de8b093d016798162681279bdefa922";
const username = "Luyanda_jnr";
const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json`;

async function fetchNowPlaying() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Last.fm API Error:", data.message);
            if (data.error === 10) {
                alert("⚠️ Your Last.fm API key is invalid or expired! Please update it.");
            }
            return;
        }

        const track = data.recenttracks?.track?.[0];
        const player = document.querySelector('.now-playing-container');
        const albumCover = document.getElementById("album-cover");
        const trackLink = document.getElementById("track-link");

        if (track) {
            const trackName = track.name || "Unknown Track";
            const artistName = track.artist["#text"] || "Unknown Artist";
            const albumName = track.album?.["#text"] || "Unknown Album";

            document.getElementById("track-name").textContent = trackName;
            document.getElementById("artist-name").textContent = artistName;
            document.getElementById("album-name").textContent = albumName;

            let albumArt = track.image?.[3]?.["#text"] || track.image?.[2]?.["#text"];

            if (!albumArt || albumArt.includes("2a96cbd8b46e442fc41c2b86b821562f")) {
                console.warn("No album art found, trying to fetch artist image...");
                albumArt = await fetchArtistImage(artistName);
            }

            console.log("Final Image URL:", albumArt);

            albumCover.src = albumArt;

            const trackUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;
            trackLink.href = trackUrl;

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

    return "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
}

fetchNowPlaying();

setInterval(fetchNowPlaying, 30000);

setTimeout(() => {
    document.querySelector('.now-playing-container').classList.add('visible');
}, 2000);

document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll(".progress-bar");
                progressBars.forEach(bar => {
                    bar.style.width = "0";
                    void bar.offsetWidth;
                    bar.style.width = bar.getAttribute("data-percent") + "%";
                });
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll(".skill-category").forEach(category => {
        observer.observe(category);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth <= 768) {
        const nowPlaying = document.querySelector('.now-playing-container');
        const contactLink = document.querySelector('.sticky-nav ul li a[href*="#contact"]');

        if (contactLink) {
            contactLink.style.backgroundColor = 'rgba(233, 214, 179, 0.2)';
            contactLink.style.padding = '8px 15px';
        }

        window.addEventListener('scroll', function () {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.body.scrollHeight;

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

document.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth <= 768) {
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

        const navClone = document.querySelector('nav ul').cloneNode(true);
        mobileContent.appendChild(navClone);
        mobileOverlay.appendChild(mobileContent);

        document.body.appendChild(mobileToggle);
        document.body.appendChild(mobileOverlay);

        mobileToggle.addEventListener('click', function () {
            document.body.classList.toggle('mobile-nav-active');
        });

        mobileOverlay.addEventListener('click', function (e) {
            if (e.target === mobileOverlay) {
                document.body.classList.remove('mobile-nav-active');
            }
        });

        mobileContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                document.body.classList.remove('mobile-nav-active');
            });
        });
    }
});

function savePosition() {
    sessionStorage.setItem('lastPage', window.location.href);
}

function goBackToLastPage() {
    const lastPage = sessionStorage.getItem('lastPage');
    if (lastPage) {
        window.location.href = lastPage;
    } else {
        window.history.back();
    }
}

document.getElementById("backButton").addEventListener("click", goBackToLastPage);

savePosition();