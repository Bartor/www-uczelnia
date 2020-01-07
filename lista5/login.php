<?php
session_start();

$username = $_POST["username"];
$password = hash("sha256", $_POST["password"]);

$db = new PDO('sqlite:./db.sqlite');
$result = $db->query("select password from users where username=\"$username\"");

foreach ($result as $row) {
    if ($row['password'] == $password) {

        $_SESSION["name"] = $username;
        $_SESSION["expire"] = time() + 5 * 60;

        header("Location: /lista5/index.php");
    }
}

echo "There was an error when logging in";