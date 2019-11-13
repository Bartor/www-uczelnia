window.addEventListener('load', () => {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');
    const nav = document.querySelector('nav');

    // if browser doesn't support js, menu is always visible
    menu.classList.add('hidden');

    let opened = false;

    function toggleMenu() {
        if (opened) {
            hamburger.className = 'fas fa-chevron-down';
            menu.classList.add('hidden');
            nav.classList.remove('expanded');
        } else {
            hamburger.className = 'fas fa-chevron-up';
            menu.classList.remove('hidden');
            nav.classList.add('expanded');
        }
        opened = !opened;
    }

    hamburger.addEventListener('click', event => {
        toggleMenu();
    });

    menu.addEventListener('click', event => {
        if (event.target !== menu) toggleMenu();
    });
});