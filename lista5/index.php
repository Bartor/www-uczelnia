<?php
session_start();

$db = new PDO('sqlite:./db.sqlite');
$zidx = 5;

if ($_SESSION["expire"] < time()) {
    session_destroy();
} else {
    $_SESSION["expire"] = time() + 5 * 60;
}

$ip = "";
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
}

$v = $db->query("select * from visits;");
$visits = 0;
$thisIpLastVisit = 0;
foreach ($v as $visit) {
    $visits++;
    if ($visit["timestamp"] > $thisIpLastVisit) $thisIpLastVisit = $visit["timestamp"];
}

if ($thisIpLastVisit < time() - 24 * 60 * 60 || $thisIpLastVisit == 0) {
    $timestamp = time();
    $db->query("insert into visits values(\"$ip\", $timestamp);");
    $visits++;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && session_status() == PHP_SESSION_ACTIVE) {
    $content = trim($_POST["content"]);
    $article = $_POST["article"];
    $author = $_SESSION["name"];

    if ($content != "") {
        $db->query("insert into comments (article, author, content) values ($article, \"$author\" , \"$content\");");
    }

    header("Location: ".$_SERVER['PHP_SELF']);
}

$comments = [];
foreach($db->query("select * from comments;") as $comment) {
    array_push($comments, $comment);
}

function generateCommentSection($articleId, $comments) {
    echo "<article><header>Komentarze</header>";

    foreach ($comments as $comment) {
        if ($comment["article"] == $articleId) {
            echo "<ul>";
            echo "<li><span class='bold'>" . $comment["author"] . "</span>: " . $comment["content"] .  "</li>";
            echo "</ul>";
        }
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        echo "<form action=\"/lista5/index.php\" method=\"post\">" .
        "<label>" .
        "<textarea name=\"content\"></textarea>" .
            "</label>" .
            "<input type=\"submit\" value=\"Napisz komentarz\">" .
            "<input name=\"article\" type=\"number\" value=\"" . $articleId . "\" style=\"display: none\">" .
            "</form>"  .
            "</article>";
    }
}

?>

<!DOCTYPE html>
<html lang="pl">
    <head>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        <script>
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$']]
                },
                options: {
                    skipHtmlTags: ["script", "style", "textarea"]
                }
            };
        </script>
        <script type="text/javascript" src="../lista4/index.js"></script>
        <script type="text/javascript" src="/lista5/login.js"></script>
        <link rel="stylesheet" href="../lista4/index.css">
        <link rel="stylesheet" href="/lista5/login.css">
        <link href="https://fonts.googleapis.com/css?family=Inria+Serif&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
              integrity="sha256-+N4/V/SbAFiW1MPBCXnfnP9QSN3+Keu+NlB+0ev/YKQ=" crossorigin="anonymous"/>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zakamarki kryptografii</title>
    </head>
    <body>
        <nav class="closed">
            <header>
                <button id="nav-toggle-button">
                    <i class="fas fa-bars fa-3x" id="bars"></i>
                    <i class="fas fa-window-close fa-3x" id="close"></i>
                </button>
            </header>
            <ul>
                <?php
                    if (session_status() == PHP_SESSION_ACTIVE) {
                ?>
                <li>Witaj, <?php echo $_SESSION["name"] ?> <span> - <a href="/lista5/logout.php">wyloguj</a></span></li>
                <?php
                    }
                ?>
                <li>Łącznie odwiedzin strony: <?php echo $visits; ?></li>
                <li><a href="#goldwasser">Schemat Goldwasser-Micali</a></li>
                <li><a href="#square">Reszta kwadratowa</a></li>
                <li><a href="#jacobi">Symbol Jacobiego</a></li>
                <li><a href="#shamir">Schemat progowy</a></li>
                <li><a href="#legendre">Symbol Lagendre'a</a></li>
                <?php
                    if (session_status() != PHP_SESSION_ACTIVE) {
                ?>
                <li>
                    <form action="/lista5/login.php" method="post" id="login-form">
                        <section>
                            <label> Login <input type="text" name="username"> </label>
                            <label> Hasło <input type="password" name="password"> </label>
                        </section>
                        <section>
                            <input type="submit" value="Zaloguj" id="login-register-button">
                            <input type="button" value="Nie masz konta?" id="switch-to-register">
                        </section>
                    </form>
                </li>
                <?php
                    }
                ?>
            </ul>
        </nav>
        <main>
            <section id="goldwasser" style="<?php $zidx--; echo "z-index: $zidx" ?>">
                <header>Schemat Goldwasser-Micali szyfrowania probabilistycznego</header>
                <article>
                    <header>Algorytm generowania kluczy</header>
                    <ol type="a">
                        <li>Wybierz losowo dwie duże liczby pierwsze $p$ oraz $q$ (podobnego rozmiaru),</li>
                        <li>Policz $n = pq$,</li>
                        <li>Wybierz $y \in \mathbb{Z}_n$, takie, że $y$ jest nieresztą kwadratową modulo $n$ i symbol Jacobiego
                            $\left( \frac{y}{n} = 1 \right)$ (czyli $y$ jest pseudokwadratem modulo $n$),
                        </li>
                        <li>Klucz publiczny stanowi para $(n, y)$, zaś odpowiadający mu klucz prywatny to para $(p, q)$.</li>
                    </ol>
                </article>
                <article>
                    <header>Algorytm szyfrowania</header>
                    <p>Chcąc zaszyfrować wiadomość $m$ przy uzyciu klucza publicznego $(n, y)$ wykonaj kroki:</p>
                    <ol type="a">
                        <li>Przestaw $m$ w postaci łańcucha binarnego $m = m_1m_2...m_t$ długości $t$,</li>
                        <li>Dla $i$ od $1$ do $t$ wybierz losowe $x \in \mathbb{Z}_n^*$, jeżeli $m_i$ jest równe $1$,
                            ustaw $c_i$ na $yx^2modn$, w przeciwynm wypadku ustaw $c_i$ na $x^2modn$,
                        </li>
                        <li>Kryptogram wiadomości $m$ stanowi $c = (c_1, c_2, ... c_t)$</li>
                    </ol>
                </article>
                <article>
                    <header>Algorytm deszyfrowania</header>
                    <p>Chcąc odzyskać wiadomość z kryptogramu $c$ przy użyciu klucza prywatnego $(p, q)$ wykonaj
                       kroki:</p>
                    <ol type="a">
                        <li>Dla $i$ od $1$ do $t$ policz symbol Legendre'a $e_i = \frac{c_i}{p}$, jeżeli jest on
                            równy jeden, ustaw $m_i$ na zero, w przeciwnym wypadku ustaw $m_i$ na jeden,
                        </li>
                        <li>Zdeszyfrowana wiadomość to $m = m_1m_2...m_t$.</li>
                    </ol>
                </article>
                <?php
                generateCommentSection(1, $comments);
                ?>
            </section>
            <section id="square" style="<?php $zidx--; echo "z-index: $zidx" ?>">
                <header>Reszta/niereszta kwadratowa</header>
                <article>
                    <header>Definicja</header>
                    <p>Niech $a \in \mathbb{Z}_n$. Mówimy, że $a$ jest resztą kwadratową modulo $n$ (kwadratem modulo $n$,
                       jeżeli istnieje $x \in \mathbb{Z}^*_n$ takie, że $x^2 \equiv a (\mod p)$. Jeżeli takie $x$ nie istnieje,
                       to wówczas $a$ nazywamy nieresztą kwadratową modulo $n$. Zbiór wszystkich reszt kwadratowych modulo $n$
                       oznaczamy $Q_n$, zaś zbiór wszystkich niereszt kwadratowych modulo $n$ oznaczamy $\bar{Q}_n$.
                    </p>
                </article>
                <?php
                generateCommentSection(2, $comments);
                ?>
            </section>
            <section id="jacobi" style="<?php $zidx--; echo "z-index: $zidx" ?>">
                <header>Symbol Legendre'a i Jacobiego</header>
                <article>
                    <header>Definicja</header>
                    <p>Niech $p$ będzie nieparzystą liczbą pierwszą, a $a$ liczbą całkowitą.
                       Symbol Legendre'a $\left( \frac{a}{p}\right)$ jest zdefiniowany jako:
                       $$\left( \frac{a}{p} \right )= \left\{ \begin{array}{lll}
                       & 0 & \textrm{jeżeli $p | a$}\\
                       & 1 & \textrm{jeżeli $a \in Q_p$}\\
                       & -1 & \textrm{jeżeli $a \in \bar{Q}_p$}\\
                       \end{array} \right.
                       $$
                    </p>
                </article>
                <article>
                    <header>Właściwości symbolu Legendre'a</header>
                    <p>Niech $a, b \in \mathbb{Z}$, zaś $p$ to nieparzysta liczba pierwsza. Wówczas:</p>
                    <ul>
                        <li>$\left( \frac{a}{p} \right) \equiv a^{\frac{(p-1)}{2}} (\mod p)$</li>
                        <li>$\left( \frac{ab}{p} \right) = \left( \frac{a}{p} \right) \left( \frac{b}{p} \right)$</li>
                        <li>$a \equiv b (\mod p) \Rightarrow \left( \frac{a}{p} \right) = \left( \frac{b}{p} \right)$</li>
                        <li>$\left( \frac{2}{p} \right) = (-1)^{\frac{(p^2 - 1)}{8}}$</li>
                        <li>Jeżeli $q$ jest nieparzystą liczbą pierwszą inną od $p$ to:
                            $$\left( \frac{p}{q} \right) = \left( \frac{q}{p} \right) (-1)^{\frac{(p - 1)(q - 1)}{4}}$$
                        </li>
                    </ul>
                </article>
                <article>
                    <header>Definicja</header>
                    <p>Niech $n \geq 3$ będzie liczbą nieparzystą, a jej rozkład na czynniki pierwsze to $n =
                       p^{e_1}_1 p^{e_2}_2 \ldots p^{e_k}_k$. <i>Symbol Jacobiego</i> $\left( \frac{a}{n} \right)$ jest
                       zdefiniowany jako:
                       $$\left( \frac{a}{n} \right) = \left( \frac{a}{p_1} \right)^{e_1} \left( \frac{a}{p_2} \right)^{e_2} \ldots
                       \left( \frac{a}{p_k} \right)^{e_k} $$
                       Jeżeli $n$ jest liczbą pierwszą, to symbol Jacobiego jest symbolem Legendre'a.
                    </p>
                </article>
                <article>
                    <header>Własności symbolu Jacobiego</header>
                    <p>Niech $a, b \in \mathbb{Z}$, zaś $m, n \geq 3$ to nieparzyste liczby całkowite. Wówczas:</p>
                    <ul>
                        <li>$\left( \frac{a}{n} \right) = 0, 1$, albo -1. Ponadto $\left( \frac{a}{n} \right) = 0 \iff gcd(a, n) \neq 1$</li>
                        <li>$\left( \frac{ab}{n} \right) = \left( \frac{a}{n} \right) \left( \frac{b}{n} \right)$</li>
                        <li>$\left( \frac{a}{mn} \right) = \left( \frac{a}{m} \right) \left( \frac{a}{n} \right)$</li>
                        <li>$a \equiv b (\mod n) \Rightarrow \left( \frac{a}{n} \right) = \left( \frac{b}{n} \right)$</li>
                        <li>$\left( \frac{1}{n} \right) = 1$</li>
                        <li>$\left( \frac{-1}{n} \right) = (-1)^{\frac{(n - 1)}{2}}$</li>
                        <li>$\left( \frac{2}{n} \right) = (-1)^{\frac{(n^2 - 1)}{8}}$</li>
                        <li>$\left( \frac{m}{n} \right) = \left( \frac{n}{m} \right) (-1)^{\frac{(m - 1)(n - 1)}{4}}$</li>
                    </ul>
                </article>
                <article>
                    <header>
                        Algorytm obliczania symbolu Jacobiego $\left( \frac{a}{n} \right)$ (i Legendre'a) dla nieparzystej liczby
                        całkowitej $n \geq 3$ oraz całkowitego $0 \leq a \le n$
                    </header>
                    <p>JACOBI(a, n):</p>
                    <ol type="a">
                        <li>jeżeli $a = 0$, zwróć $0$</li>
                        <li>jeżeli $a = 1$, zwróć $1$</li>
                        <li>ustaw $a$ na $2^ea_1$, gdzie $a_1$ jest nieparzyste</li>
                        <li>jeżeli $e$ jest nieparzyste, ustaw $s \leftarrow 1$, w przeciwnym wypadku ustaw $s
                            \leftarrow 1$ jeżeli $n \equiv 1 mod 8 \lor n \equiv 7 mod 8$ lub ustaw $s \leftarrow
                            -1$ jeżeli $n \equiv 3 mod 8 \lor n \equiv 5 mod 8$
                        </li>
                        <li>jeżeli $n \equiv 3 mod 4 \land a_1 \equiv 3 mod 4$ zmień znak $s$</li>
                        <li>ustaw $n_1 \leftarrow n mod a_1$</li>
                        <li>jeżeli $a_1 = 1$, zwróć $s$, w przeciwnym wypadku zwróć $s*JACOBI(n_1, a_1)</li>
                    </ol>
                </article>
                <?php
                generateCommentSection(3, $comments);
                ?>
            </section>
            <section id="shamir" style="<?php $zidx--; echo "z-index: $zidx" ?>">
                <header>Schemat progowy $(t, n)$ dzielenia sekretu Shamira</header>
                <article>
                    <header>Cel</header>
                    <p>
                        Zaufana Trzecia Strona $T$ ma sekret $S \geq 0$, który chce podzielić pomiędzy $n$ uczestników tak,
                        aby dowolnych $t$ spośród niech mogło sekret odtworzyć.
                    </p>
                </article>
                <article>
                    <header>Faza inicjalizacji</header>
                    <ul>
                        <li>$T$ wybiera liczbę pierwszą $p \ge max(S, n)$ i definiuje $a_0 = S$,</li>
                        <li>$T$ wybiera losowo i niezależnie $t - 1$ współczynników $a_1, ..., a_{t-1} \in \mathbb{Z}_p$,</li>
                        <li>$T$ definiuje wielomian nad $\mathbb{Z}_p$: $$f(x) = a_0 + \sum^{t-1}_{j = 1} a_jx^j,$$</li>
                        <li>
                            Dla $1 \leq i \leq n$ Zaufana Trzecia Strona $T$ wybiera losowo $x_i \in \mathbb{Z}_p$, oblicza: $S_i =
                            f(x_i) \mod p$ i bezpiecznie przekazuje parę $(x_i, S_i)$ uzytkownikowi $P_i$.
                        </li>
                    </ul>
                </article>
                <article>
                    <header>Faza łączenia udziałów w sekret</header>
                    <p>
                        Dowolna grupa $t$ lub więcej użytkowników łączy swoje udziały - $t$ różnych punktów $(x_i, S_i)$
                        wielomianu $f$ i dzięki interpolacji Lagrange'a odzyskuje sekret $S = a_0 = f(0)$.
                    </p>
                </article>
                <?php
                generateCommentSection(4, $comments);
                ?>
            </section>
            <section id="legendre" style="<?php $zidx--; echo "z-index: $zidx" ?>">
                <header>Interpolacja Lagrenge'a</header>
                <article>
                    <header>Definicja</header>
                    <p>
                        Mając dane $t$ różnych punktów $(x_i, y_i)$ nienanego wielomianu $f$ stopnia mniejszego od $t$ możemy
                        policzyć jego współczynniki korzystając ze wzoru: $$f(x) = \sum^t_{i = 1}\left( y_i \prod_{1 \leqslant j
                        \leqslant t,\, j\neq i} \frac{x - x_j}{x_i - x_j} \right) \mod p$$
                    </p>
                </article>
                <article>
                    <header>Wskazówka</header>
                    <p>
                        W schemacie Shamira, aby odzyskać sekret $S$, użytkownicy nie muszą znać całego wielomianu $f$. Wstawiając
                        do wzoru na iterpolację Lagrange'a $x = 0$, dostajemy wersję uproszczoną, ale wystarczającą aby policzyć sekret $S = f(0)$:
                        $$f(x) = \sum^t_{i = 1} \left(y_i \prod_{1 \leqslant j \leqslant t,\, j\neq i} \frac{x_j}{x_j - x_i} \right) \mod p$$
                    </p>
                </article>
                <?php
                generateCommentSection(5, $comments);
                ?>
            </section>
        </main>

        <footer>
            XD
        </footer>
    </body>
</html>