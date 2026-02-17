/* ======================================
   CINEMATIC SCROLL & REVEAL SYSTEM
   ====================================== */

// Intersection Observer for scroll reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger the reveal by index for grouped elements
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
});

// Observe all reveal elements with stagger
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach((el, i) => {
        // Add stagger delay based on sibling position
        const parent = el.parentElement;
        const siblings = parent ? parent.querySelectorAll('.reveal-up') : [];
        const siblingIndex = Array.from(siblings).indexOf(el);
        if (siblingIndex > 0) {
            el.dataset.delay = siblingIndex * 120;
        }
        revealObserver.observe(el);
    });
});

/* ======================================
   STICKY NAV SCROLL BEHAVIOR
   ====================================== */
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const stickyNav = document.querySelector('.sticky-nav');
    const heroBg = document.querySelector('.hero-bg-image');

    // Show sticky nav after scrolling past hero
    if (stickyNav) {
        if (scrollY > 300) {
            stickyNav.classList.add('visible');
        } else {
            stickyNav.classList.remove('visible');
        }
    }

    // Parallax fade on hero background
    if (heroBg) {
        const heroHeight = window.innerHeight;
        const progress = Math.min(scrollY / heroHeight, 1);
        heroBg.style.opacity = 1 - progress;
        heroBg.style.transform = `scale(${1 + progress * 0.08}) translateY(${scrollY * 0.3}px)`;
    }

    lastScrollY = scrollY;
});

/* ======================================
   SKILLS PROGRESS BAR ANIMATION
   ====================================== */
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.progress-fill');
            bars.forEach((bar, i) => {
                // Reset then animate
                bar.style.width = '0';
                void bar.offsetWidth; // Force reflow
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-percent') + '%';
                }, i * 100); // Stagger each bar
            });
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.skill-card').forEach(card => {
        skillObserver.observe(card);
    });
});

/* ======================================
   FAQ ACCORDION
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');
            
            // Close all other items
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            item.classList.toggle('open');
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });
});

/* ======================================
   LAST.FM NOW PLAYING
   ====================================== */
const apiKey = '6de8b093d016798162681279bdefa922';
const username = 'Luyanda_jnr';
const lastFmUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json`;

async function fetchNowPlaying() {
    try {
        const response = await fetch(lastFmUrl);
        const data = await response.json();

        if (data.error) {
            console.error('Last.fm API Error:', data.message);
            return;
        }

        const track = data.recenttracks?.track?.[0];
        const player = document.querySelector('.now-playing-container');
        const albumCover = document.getElementById('album-cover');
        const trackLink = document.getElementById('track-link');

        if (track) {
            const trackName = track.name || 'Unknown Track';
            const artistName = track.artist['#text'] || 'Unknown Artist';
            const albumName = track.album?.['#text'] || 'Unknown Album';

            document.getElementById('track-name').textContent = trackName;
            document.getElementById('artist-name').textContent = artistName;
            document.getElementById('album-name').textContent = albumName;

            let albumArt = track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'];

            if (!albumArt || albumArt.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
                albumArt = await fetchArtistImage(artistName);
            }

            albumCover.src = albumArt;

            const trackUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;
            trackLink.href = trackUrl;

            if (track['@attr']?.nowplaying === 'true') {
                player.classList.add('playing', 'visible');
            } else {
                document.getElementById('track-name').textContent = 'Last Played: ' + trackName;
                player.classList.remove('playing');
                player.classList.add('visible');
            }
        } else {
            player.classList.remove('playing', 'visible');
        }
    } catch (error) {
        console.error('Error fetching Last.fm data:', error);
    }
}

async function fetchArtistImage(artist) {
    const artistUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
    try {
        const response = await fetch(artistUrl);
        const data = await response.json();
        if (data.artist && data.artist.image) {
            const artistImage = data.artist.image[3]?.['#text'] || data.artist.image[2]?.['#text'];
            return artistImage || 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
        }
    } catch (error) {
        console.error('Error fetching artist image:', error);
    }
    return 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 30000);

// Delayed reveal of now playing
setTimeout(() => {
    const player = document.querySelector('.now-playing-container');
    if (player && !player.classList.contains('visible')) {
        player.classList.add('visible');
    }
}, 3000);

/* ======================================
   MOBILE MENU
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileToggle.setAttribute('role', 'button');
        mobileToggle.setAttribute('tabindex', '0');
        mobileToggle.innerHTML = '<span></span><span></span><span></span>';

        const mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-nav-overlay';

        const mobileContent = document.createElement('div');
        mobileContent.className = 'mobile-nav-content';

        const heroNav = document.querySelector('.hero-nav ul');
        if (heroNav) {
            const navClone = heroNav.cloneNode(true);
            mobileContent.appendChild(navClone);
        }

        mobileOverlay.appendChild(mobileContent);
        document.body.appendChild(mobileToggle);
        document.body.appendChild(mobileOverlay);

        mobileToggle.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-active');
        });

        mobileOverlay.addEventListener('click', (e) => {
            if (e.target === mobileOverlay) {
                document.body.classList.remove('mobile-nav-active');
            }
        });

        mobileContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('mobile-nav-active');
            });
        });

        // Hide now playing near bottom on mobile
        const nowPlaying = document.querySelector('.now-playing-container');
        if (nowPlaying) {
            window.addEventListener('scroll', () => {
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
    }
});

/* ======================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

/* ======================================
   NAVIGATION HELPERS
   ====================================== */
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

const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', goBackToLastPage);
}

savePosition();
