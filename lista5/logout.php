<?php
session_start();

session_destroy();

header("Location: /lista5/index.php");
