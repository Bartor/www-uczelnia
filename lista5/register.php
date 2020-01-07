<?php
$username = $_POST["username"];
$password = hash("sha256", $_POST["password"]);

$db = new PDO('sqlite:./db.sqlite');

$result = $db->query("insert into users (username, password) values (\"$username\" , \"$password\");");

header("Location: /lista5/index.php");
