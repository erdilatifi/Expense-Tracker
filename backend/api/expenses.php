<?php

require __DIR__ . '/_bootstrap.php';

$pdo = db();
$method = $_SERVER['REQUEST_METHOD'];

$id = null;
if (isset($_GET['id'])) {
  $id = (int)$_GET['id'];
}

if ($method === 'GET') {
  $month = isset($_GET['month']) ? (string)$_GET['month'] : null; // YYYY-MM
  $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 25;

  $where = '';
  $params = [];

  if ($month) {
    if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
      json_error('Invalid month format (YYYY-MM)', 422);
    }
    $where = 'WHERE DATE_FORMAT(e.expense_date, "%Y-%m") = :month';
    $params[':month'] = $month;
  }

  $sql = "
    SELECT
      e.id,
      e.amount_cents,
      e.expense_date,
      e.note,
      c.id AS category_id,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    {$where}
    ORDER BY e.expense_date DESC, e.id DESC
    LIMIT {$limit}
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();

  json_response(['ok' => true, 'data' => $rows]);
}

if ($method === 'POST') {
  $data = read_json_body();
  require_fields($data, ['amount', 'category_id', 'date']);

  $amount = $data['amount'];
  if (!is_numeric($amount)) {
    json_error('Invalid amount', 422);
  }
  $amountCents = (int)round(((float)$amount) * 100);
  if ($amountCents <= 0) {
    json_error('Amount must be > 0', 422);
  }

  $categoryId = to_int($data['category_id'], 'category_id');
  $date = to_date_ymd($data['date'], 'date');
  $note = array_key_exists('note', $data) ? to_string($data['note'], 'note', true) : null;

  $stmt = $pdo->prepare('INSERT INTO expenses (amount_cents, category_id, expense_date, note) VALUES (:amount_cents, :category_id, :expense_date, :note)');
  $stmt->execute([
    ':amount_cents' => $amountCents,
    ':category_id' => $categoryId,
    ':expense_date' => $date,
    ':note' => $note,
  ]);

  json_response(['ok' => true, 'data' => ['id' => (int)$pdo->lastInsertId()]], 201);
}

if ($method === 'PUT') {
  if (!$id) {
    json_error('Missing id', 422);
  }

  $data = read_json_body();
  require_fields($data, ['amount', 'category_id', 'date']);

  $amount = $data['amount'];
  if (!is_numeric($amount)) {
    json_error('Invalid amount', 422);
  }
  $amountCents = (int)round(((float)$amount) * 100);
  if ($amountCents <= 0) {
    json_error('Amount must be > 0', 422);
  }

  $categoryId = to_int($data['category_id'], 'category_id');
  $date = to_date_ymd($data['date'], 'date');
  $note = array_key_exists('note', $data) ? to_string($data['note'], 'note', true) : null;

  $stmt = $pdo->prepare('UPDATE expenses SET amount_cents = :amount_cents, category_id = :category_id, expense_date = :expense_date, note = :note WHERE id = :id');
  $stmt->execute([
    ':amount_cents' => $amountCents,
    ':category_id' => $categoryId,
    ':expense_date' => $date,
    ':note' => $note,
    ':id' => $id,
  ]);

  json_response(['ok' => true]);
}

if ($method === 'DELETE') {
  if (!$id) {
    json_error('Missing id', 422);
  }

  $stmt = $pdo->prepare('DELETE FROM expenses WHERE id = :id');
  $stmt->execute([':id' => $id]);

  json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
