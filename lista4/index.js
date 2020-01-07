window.addEventListener('load', () => {
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');

    const closeButton = document.getElementById('close');
    const barsButton = document.getElementById('bars');
    const links = [...document.querySelectorAll('body > nav > ul > li > a')];

    let navOpened = nav.className === 'opened';

    function toggleNav() {
        nav.className = (navOpened = !navOpened) ? 'opened' : 'closed';
        main.className = navOpened ? 'blurred' : '';
    }

    nav.addEventListener('click', (event) => {
        if (event.target === closeButton
            || event.target === barsButton
            || links.includes(event.target)) toggleNav();
    });
});