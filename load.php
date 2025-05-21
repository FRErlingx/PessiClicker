<?php
header('Content-Type: application/json');
session_start();

$mysqli = new mysqli("localhost", "root", "root", "pessiclicker_db");
if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$user_id = intval($data['user_id']);
$stmt = $mysqli->prepare("SELECT save_json FROM saves WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $saveData = json_decode($row['save_json'], true);
    echo json_encode(['status' => 'success', 'saveData' => $saveData]);
} else {
    echo json_encode(['status' => 'no_save']);
}

$mysqli->close();
?>
