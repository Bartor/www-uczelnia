window.addEventListener('load', () => {
    const nav = document.querySelector('nav');
    const navToggleButton = document.getElementById('nav-toggle-button');
    const main = document.querySelector('main');

    let navOpened = nav.className === 'opened';

    function toggleNav() {
        nav.className = (navOpened = !navOpened) ? 'opened' : 'closed';
        main.className = navOpened ? 'blurred' : '';
    }

    nav.addEventListener('click', (event) => {
        if (event.target !== nav) toggleNav();
    });
});