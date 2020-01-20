window.addEventListener('load', () => {
    let login = true;

    const loginRegisterButton = document.getElementById('login-register-button');
    const switchButton = document.getElementById('switch-to-register');
    const form = document.getElementById('login-form');

    switchButton.addEventListener('click', () => {
        form.action = login ? '/lista5/register.php' : '/lista5/login.php';

        loginRegisterButton.value = login ? 'Zarejestruj' : 'Zaloguj';
        switchButton.value = login ? 'Masz konto?' : 'Nie masz konta?';
        login = !login;
    });
});