// ==========================================================================
// URL PARAMS
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('')) {
        const view = urlParams.get('');
        if (view === 'projects') {
            openProjectsView();
        } else if (view === 'about') {
            openAboutView();
        }
        else {
            updateURLParam('', null);
            closeAllViews();
        }
    }
    if (urlParams.has('project')) {
        const projectId = urlParams.get('project');
        const projectCard = document.querySelector('#' + projectId);
        if (projectCard) {
            projectCard.click();
        }
        else {
            updateURLParam('project', null);
        }
        openProjectsView();
        updateURLParam('', null);
    }
});

// update url params
function updateURLParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.replaceState({}, '', url);
}


// ==========================================================================
// LAYOUT & GEOMETRY LOGIC
// ==========================================================================
function updateLayout() {
    const h = window.innerHeight;
    const w = window.innerWidth;
    
    // Check for Mobile Width
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    // Variables to hold calculated geometry
    let angleY_deg, angleW_deg, angleY_hov, angleW_hov, distW, distY;
    let openY, openW, openPeekTab, peekMain, peekDeep;

    if (!isMobile) {
        // --- DESKTOP LOGIC (Pivot: Bottom-Left) ---
        
        // Calculate angles to span 25% (Yellow) and 12.5% (White) width at top
        const angleY_rad = Math.atan2(h, w * 0.25);
        angleY_deg = -(angleY_rad * 180 / Math.PI); // Convert to CCW degrees
        
        const angleW_rad = Math.atan2(h, w * 0.125);
        angleW_deg = -(angleW_rad * 180 / Math.PI);
        
        // Calculate Hypotneuse Length to position tabs at top
        distY = Math.sqrt(h*h + (w*0.25)**2);
        distW = Math.sqrt(h*h + (w*0.125)**2);
        
        // Set Interaction States
        angleY_hov = angleY_deg + 3;
        angleW_hov = angleW_deg + 3;
        openY = -5;
        openW = -5;
        openPeekTab = -2;
        peekMain = -25;
        peekDeep = -35;
        
        // Calculate Tab Positions (From Left Edge)
        const tabW = distW - 220;
        const tabY = distY - 460;
        
        // Apply Desktop Vars
        document.documentElement.style.setProperty('--tab-dist-white', tabW + 'px');
        document.documentElement.style.setProperty('--tab-dist-yellow', tabY + 'px');

    } else {
        // --- MOBILE LOGIC (Pivot: Top-Right) ---
        
        // Closed State: Hanging down (Negative angle relative to Top-Right pivot?)
        // Actually, CSS says top:auto, bottom:100vh. Pivot is Bottom-Right of element.
        // So -10deg rotates it CCW (Left/Up). -90deg is flat top.
        // Let's use negative values as established in CSS
        
        angleY_deg = -20;  // Hang down 20deg from horizontal
        angleW_deg = -10;  // Hang down 10deg
        
        angleY_hov = -23;  
        angleW_hov = -13;
        
        // Open State: Swing DOWN (CCW -> -90 approx)
        openY = -85; 
        openW = -85;
        openPeekTab = -82; 
        
        peekMain = -70; 
        peekDeep = -60;
        
        // Tab Positions: Distance from Pivot (Right Edge)
        const tabW = w * 0.25; // 25% from right
        const tabY = w * 0.55; // 55% from right
        
        document.documentElement.style.setProperty('--tab-dist-white', tabW + 'px');
        document.documentElement.style.setProperty('--tab-dist-yellow', tabY + 'px');
    }
    
    // Apply Shared Rotation Variables
    const root = document.documentElement;
    root.style.setProperty('--ang-yellow', angleY_deg + 'deg');
    root.style.setProperty('--ang-white', angleW_deg + 'deg');
    root.style.setProperty('--ang-yellow-hov', angleY_hov + 'deg');
    root.style.setProperty('--ang-white-hov', angleW_hov + 'deg');
    
    root.style.setProperty('--ang-open-yellow', openY + 'deg');
    root.style.setProperty('--ang-open-white', openW + 'deg');
    root.style.setProperty('--ang-open-peek-tab', openPeekTab + 'deg');
    
    root.style.setProperty('--ang-peek-main', peekMain + 'deg');
    root.style.setProperty('--ang-peek-deep', peekDeep + 'deg');
}

// ==========================================================================
// INITIALIZATION SEQUENCE
// ==========================================================================
function startIntro() {
    updateLayout();
    // Staggered Entrance Animation
    setTimeout(() => {
        document.body.classList.add('step-1'); // White enters
        setTimeout(() => {
            document.body.classList.add('step-2'); // Yellow enters
            setTimeout(() => {
                document.body.style.overflow = 'auto'; // Unlock scroll
                document.body.classList.add('nav-active'); // Enable interaction
                initObservers(); 
            }, 1000);
        }, 600);
    }, 400);
}

// Run when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    startIntro();
} else {
    window.addEventListener('load', startIntro);
}

// Recalculate on resize
window.addEventListener('resize', updateLayout);

// ==========================================================================
// NAVIGATION & STATE MANAGEMENT
// ==========================================================================

// Open Projects
function openProjectsView() {
    updateURLParam('', 'projects');
    document.body.classList.remove('view-about');
    document.body.classList.add('view-projects');
    document.body.style.overflow = 'hidden';
}

function closeProjectsView() {
    updateURLParam('');
    document.body.classList.remove('view-projects');
    document.body.style.overflow = 'auto';
}

// Open About
function openAboutView() {
    updateURLParam('', 'about');
    document.body.classList.remove('view-projects');
    document.body.classList.add('view-about');
    document.body.style.overflow = 'hidden';
}

function closeAboutView() {
    updateURLParam('');
    document.body.classList.remove('view-about');
    document.body.style.overflow = 'auto';
}

// Universal Close (Background Click)
function closeAllViews() {
    updateURLParam('');
    if (document.body.classList.contains('view-projects')) closeProjectsView();
    if (document.body.classList.contains('view-about')) closeAboutView();
}

// ==========================================================================
// UTILITIES (Modals, Observers)
// ==========================================================================

// Intersection Observer for Scroll Fade-ins
function initObservers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Modal Logic
const modal = document.getElementById('projectModal');
const mTitle = document.getElementById('modalTitle');
const mDesc = document.getElementById('modalDesc');
const mImg = document.getElementById('modalImg');
const mLink = document.getElementById('modalLink');

function openModal(id, title, desc, imgSrc, link) {
    updateURLParam('project', id);
    updateURLParam('', null);
    mTitle.textContent = title;
    mDesc.textContent = desc;
    mImg.src = imgSrc;
    mLink.href = link;
    modal.classList.add('show');
}

function closeModal() {
    updateURLParam('project', null);
    updateURLParam('', 'projects');
    modal.classList.remove('show');
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeModal();
});


// ==========================================================================
// scroll at bottom of screen
// ==========================================================================

const projectsInner = document.querySelector('#projects-view .pv-inner');
const aboutInner = document.querySelector('#about-view .pv-inner');
const mainPage = document.querySelector('#content-wrapper');

// scroll in projects view
projectsInner.addEventListener('wheel', (event) => {
    // down (to about view)
    if (event.deltaY > 0) {
        if ((projectsInner.scrollHeight - projectsInner.clientHeight) <= projectsInner.scrollTop) {
            openAboutView();
        }
    }
    // up (to main page)
    if (event.deltaY < 0) {
        if (projectsInner.scrollTop === 0) {
            closeAllViews();
        }
    }
});

// scroll in about view
aboutInner.addEventListener('wheel', (event) => {
    // down (to main page)
    if (event.deltaY > 0) {
        if ((aboutInner.scrollHeight - aboutInner.clientHeight) <= aboutInner.scrollTop) {
            closeAllViews();
        }
    }
    // up (to projects view)
    if (event.deltaY < 0) {
        if (aboutInner.scrollTop === 0) {
            openProjectsView();
        }
    }
});

// scroll in main page
mainPage.addEventListener('wheel', (event) => {
    if (document.body.classList.contains('view-projects') || document.body.classList.contains('view-about')) {
        return; // Ignore if already in a view
    }
    else {
        // down (to projects view)
        if (event.deltaY > 0) {
            if ((mainPage.scrollHeight - mainPage.clientHeight) <= mainPage.scrollTop) {
                openProjectsView();
            }
        }
        // up (to about view)
        else if (event.deltaY < 0) {
            if (mainPage.scrollTop === 0) {
                openAboutView();
            }
        }
    }
});
