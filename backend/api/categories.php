<?php

require __DIR__ . '/_bootstrap.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_error('Method not allowed', 405);
}

$rows = $pdo->query('SELECT id, name, color, icon FROM categories ORDER BY sort_order ASC, name ASC')->fetchAll();
json_response(['ok' => true, 'data' => $rows]);
