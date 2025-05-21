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
if (!$data || !isset($data['user_id'], $data['saveData'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$user_id = intval($data['user_id']);
$saveData = json_encode($data['saveData']); // Stock JSON string

// Log taille JSON reçu (dans error_log)
error_log("Save data length for user {$user_id}: " . strlen($saveData));

if (strlen($saveData) > 100000) { // Ajuste la limite selon ta BDD
    error_log("Attention: Save data très volumineuse pour user {$user_id}");
}

// Vérification taille maximale du champ SQL (à ajuster côté BDD)

// Vérifier si sauvegarde existe déjà
$stmt = $mysqli->prepare("SELECT id FROM saves WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Mise à jour
    $stmt = $mysqli->prepare("UPDATE saves SET save_json = ? WHERE user_id = ?");
    $stmt->bind_param("si", $saveData, $user_id);
    $success = $stmt->execute();
} else {
    // Insertion nouvelle sauvegarde
    $stmt = $mysqli->prepare("INSERT INTO saves (user_id, save_json) VALUES (?, ?)");
    $stmt->bind_param("is", $user_id, $saveData);
    $success = $stmt->execute();
}

if ($success) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
}

$mysqli->close();
?>
