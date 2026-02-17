/* ======================================
   PAGE ENTER ANIMATION
   ====================================== */
document.body.classList.add('page-enter');

/* ======================================
   CINEMATIC SCROLL & REVEAL SYSTEM
   ====================================== */

// Intersection Observer for scroll reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
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
    revealElements.forEach((el) => {
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
   STICKY NAV SCROLL BEHAVIOR (rAF throttled)
   ====================================== */
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const stickyNav = document.querySelector('.sticky-nav');
            const heroBg = document.querySelector('.hero-bg-image');
            const backToTop = document.querySelector('.back-to-top');
            const nowPlaying = document.querySelector('.now-playing-container');

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

            // Back to top button visibility
            if (backToTop) {
                if (scrollY > 600) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }

            // Hide now playing near footer
            if (nowPlaying) {
                const scrollBottom = scrollY + window.innerHeight;
                const docHeight = document.body.scrollHeight;
                if (scrollBottom > docHeight - 200) {
                    nowPlaying.style.opacity = '0';
                    nowPlaying.style.transform = 'translateY(20px)';
                } else if (nowPlaying.classList.contains('visible')) {
                    nowPlaying.style.opacity = '1';
                    nowPlaying.style.transform = 'translateY(0)';
                }
            }

            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

/* ======================================
   BACK TO TOP
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

/* ======================================
   SKILLS PROGRESS BAR ANIMATION
   ====================================== */
const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.progress-fill');
            bars.forEach((bar, i) => {
                bar.style.width = '0';
                void bar.offsetWidth; // Force reflow
                setTimeout(() => {
                    bar.style.width = bar.getAttribute('data-percent') + '%';
                }, i * 100);
            });
            // Only animate once
            observer.unobserve(entry.target);
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
            btn.setAttribute('aria-expanded', String(!isOpen));
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
   MOBILE MENU (wire up HTML-based menu)
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-nav-overlay');

    if (toggle && overlay) {
        // Toggle menu
        toggle.addEventListener('click', () => {
            const isActive = document.body.classList.toggle('mobile-nav-active');
            toggle.setAttribute('aria-expanded', String(isActive));
        });

        // Close on overlay background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.classList.remove('mobile-nav-active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on nav link click
        overlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('mobile-nav-active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('mobile-nav-active')) {
                document.body.classList.remove('mobile-nav-active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
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
   CONTACT FORM VALIDATION
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const messageInput = form.querySelector('#contact-message');
    const submitBtn = form.querySelector('.contact-submit');
    const statusEl = form.querySelector('.form-status');

    function showError(input, message) {
        input.classList.add('error');
        let errorEl = input.parentElement.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.setAttribute('role', 'alert');
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
        requestAnimationFrame(() => errorEl.classList.add('visible'));
    }

    function clearError(input) {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.classList.remove('visible');
        }
    }

    // Clear errors on input
    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => clearError(input));
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        // Validate name
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            valid = false;
        } else {
            clearError(nameInput);
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email');
            valid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            showError(emailInput, 'Please enter a valid email');
            valid = false;
        } else {
            clearError(emailInput);
        }

        // Validate message
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Please enter a message');
            valid = false;
        } else {
            clearError(messageInput);
        }

        if (!valid) return;

        // Submit form
        const btnSpan = submitBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Sending...';
        submitBtn.classList.add('loading');

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                btnSpan.textContent = 'Sent!';
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');
                form.reset();

                if (statusEl) {
                    statusEl.textContent = 'Message sent successfully! I will get back to you soon.';
                    statusEl.className = 'form-status success visible';
                }

                setTimeout(() => {
                    btnSpan.textContent = originalText;
                    submitBtn.classList.remove('success');
                    if (statusEl) {
                        statusEl.classList.remove('visible');
                    }
                }, 4000);
            } else {
                throw new Error('Failed to send');
            }
        } catch (err) {
            btnSpan.textContent = originalText;
            submitBtn.classList.remove('loading');

            if (statusEl) {
                statusEl.textContent = 'Something went wrong. Please try again or email me directly.';
                statusEl.className = 'form-status error visible';
            }

            setTimeout(() => {
                if (statusEl) statusEl.classList.remove('visible');
            }, 5000);
        }
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
