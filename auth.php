<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$mysqli = new mysqli("localhost", "root", 'root', "pessiclicker_db");

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données: ' . $mysqli->connect_error]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['username'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

// Préparer la requête SELECT
$stmt = $mysqli->prepare("SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur préparation requête: ' . $mysqli->error]);
    exit;
}
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password_hash'])) {
        echo json_encode(['status' => 'connected', 'user_id' => $user['id'], 'username' => $user['username']]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Mot de passe incorrect']);
    }
} else {
    // L'utilisateur n'existe pas, création
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $insert_stmt = $mysqli->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    if (!$insert_stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur préparation insertion: ' . $mysqli->error]);
        exit;
    }
    $insert_stmt->bind_param("ss", $username, $password_hash);
    if ($insert_stmt->execute()) {
        $user_id = $insert_stmt->insert_id;
        echo json_encode(['status' => 'registered', 'user_id' => $user_id, 'username' => $username]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur création utilisateur: ' . $insert_stmt->error]);
    }
}

$mysqli->close();
?>
