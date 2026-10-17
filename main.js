const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((el) => io.observe(el));
} else {
    reveals.forEach((el) => el.classList.add('visible'));
}

// Pause decorative animations while they are off-screen so they
// never compete with scrolling.
if ('IntersectionObserver' in window) {
    const pauser = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
    });
    document.querySelectorAll('.scroll-cue').forEach((el) => pauser.observe(el));
}

// Background motion graphics. Three things decide whether one plays: the
// visitor's motion preference, whether they are paying for the bytes, and
// whether the clip is actually on screen.
document.querySelectorAll('.plate-video').forEach((video) => {
    const button = video.parentElement.querySelector('.motion-toggle');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;

    // Paused by the visitor, as opposed to paused because it scrolled away.
    let stopped = reduced || saveData;

    const label = () => {
        button.textContent = stopped ? 'Play' : 'Pause';
        button.setAttribute('aria-pressed', String(stopped));
        button.setAttribute('aria-label', (stopped ? 'Play' : 'Pause') + ' background video');
    };

    if (stopped) {
        // autoplay is in the markup so it starts on the first frame rather than
        // waiting for this script; opting out means undoing it here.
        video.autoplay = false;
        video.removeAttribute('autoplay');
        video.pause();
        // Nothing has been fetched yet under save-data, so leave it that way.
        if (saveData) video.preload = 'none';
    }
    label();

    // play() rejects when the browser blocks autoplay (low power mode, a
    // permission setting). The poster stays up, so there is nothing to fix.
    const attempt = () => {
        if (!stopped) video.play().catch(() => {});
    };

    button.addEventListener('click', () => {
        stopped = !stopped;
        label();
        if (stopped) video.pause();
        else attempt();
    });

    // Decoding a clip nobody is looking at burns battery for nothing.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) attempt();
                else video.pause();
            });
        }, { threshold: 0.15 }).observe(video);
    }
});

// Hamburger menu, below the 760px breakpoint where the links leave the bar.
const siteNav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const desktopNav = window.matchMedia('(min-width: 1201px)');

const setMenu = (open) => {
    siteNav.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
};

navToggle.addEventListener('click', () => {
    setMenu(!siteNav.classList.contains('menu-open'));
});

// An in-page link (#contact) leaves the panel open over the destination, and a
// tap outside it should dismiss it the way any menu does.
siteNav.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('click', (e) => {
    if (siteNav.classList.contains('menu-open') && !siteNav.contains(e.target)) setMenu(false);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav.classList.contains('menu-open')) {
        setMenu(false);
        navToggle.focus();
    }
});

// Widening past the breakpoint restores the inline links; drop the open state
// so the hamburger isn't left showing an X when it comes back.
desktopNav.addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

// Theme toggle: manual choice is saved; otherwise the site stays dark.
document.querySelector('.theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
});
