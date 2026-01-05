<?php

require __DIR__ . '/_bootstrap.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  json_error('Method not allowed', 405);
}

$month = isset($_GET['month']) ? (string)$_GET['month'] : null; // YYYY-MM
if (!$month) {
  $month = date('Y-m');
}
if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
  json_error('Invalid month format (YYYY-MM)', 422);
}

$monthStart = $month . '-01';
$monthStartDt = DateTime::createFromFormat('Y-m-d', $monthStart);
$nextMonthStart = (clone $monthStartDt)->modify('first day of next month')->format('Y-m-d');
$prevMonth = (clone $monthStartDt)->modify('first day of previous month')->format('Y-m');

// Total this month
$stmt = $pdo->prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total_cents FROM expenses WHERE expense_date >= :start AND expense_date < :end');
$stmt->execute([':start' => $monthStart, ':end' => $nextMonthStart]);
$totalThis = (int)$stmt->fetch()['total_cents'];

// Total prev month
$prevStart = $prevMonth . '-01';
$prevStartDt = DateTime::createFromFormat('Y-m-d', $prevStart);
$prevEnd = (clone $prevStartDt)->modify('first day of next month')->format('Y-m-d');
$stmt = $pdo->prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total_cents FROM expenses WHERE expense_date >= :start AND expense_date < :end');
$stmt->execute([':start' => $prevStart, ':end' => $prevEnd]);
$totalPrev = (int)$stmt->fetch()['total_cents'];

$deltaCents = $totalThis - $totalPrev;
$deltaPct = $totalPrev > 0 ? ($deltaCents / $totalPrev) * 100.0 : null;

// Breakdown by category
$stmt = $pdo->prepare('SELECT c.id, c.name, c.color, c.icon, COALESCE(SUM(e.amount_cents), 0) AS total_cents FROM categories c LEFT JOIN expenses e ON e.category_id = c.id AND e.expense_date >= :start AND e.expense_date < :end GROUP BY c.id ORDER BY total_cents DESC');
$stmt->execute([':start' => $monthStart, ':end' => $nextMonthStart]);
$byCategory = $stmt->fetchAll();

// Expenses over time (daily)
$stmt = $pdo->prepare('SELECT expense_date AS day, SUM(amount_cents) AS total_cents FROM expenses WHERE expense_date >= :start AND expense_date < :end GROUP BY expense_date ORDER BY expense_date ASC');
$stmt->execute([':start' => $monthStart, ':end' => $nextMonthStart]);
$overTime = $stmt->fetchAll();

json_response([
  'ok' => true,
  'data' => [
    'month' => $month,
    'prev_month' => $prevMonth,
    'totals' => [
      'this_month_cents' => $totalThis,
      'last_month_cents' => $totalPrev,
      'delta_cents' => $deltaCents,
      'delta_pct' => $deltaPct,
    ],
    'by_category' => $byCategory,
    'over_time' => $overTime,
  ],
]);
