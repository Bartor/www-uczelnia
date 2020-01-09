window.addEventListener('load', () => {
    let login = true;

    const loginRegisterButton = document.getElementById('login-register-button');
    const switchButton = document.getElementById('switch-to-register');
    const form = document.getElementById('login-form');

    const cookiesButton = document.getElementById('cookies-click');

    switchButton.addEventListener('click', () => {
        form.action = login ? '/lista5/register.php' : '/lista5/login.php';

        loginRegisterButton.value = login ? 'Zarejestruj' : 'Zaloguj';
        switchButton.value = login ? 'Masz konto?' : 'Nie masz konta?';
        login = !login;
    });

    if (cookiesButton) cookiesButton.addEventListener('click', () => {
        document.cookie = 'cookies=1';

        let f = document.querySelector('footer');
        f.parentElement.removeChild(f);
    });
});