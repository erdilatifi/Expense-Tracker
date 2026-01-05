<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function json_response(array $data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void {
  json_response(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

function read_json_body(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') {
    return [];
  }

  $data = json_decode($raw, true);
  if (!is_array($data)) {
    json_error('Invalid JSON body', 400);
  }

  return $data;
}

function env(string $key, ?string $default = null): ?string {
  $val = getenv($key);
  if ($val === false) {
    return $default;
  }
  return $val;
}

function load_dotenv(string $filePath): void {
  if (!is_file($filePath)) {
    return;
  }

  $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if (!is_array($lines)) {
    return;
  }

  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#')) {
      continue;
    }

    $parts = explode('=', $line, 2);
    if (count($parts) !== 2) {
      continue;
    }

    $k = trim($parts[0]);
    $v = trim($parts[1]);
    $v = trim($v, " \t\n\r\0\x0B\"");

    if ($k !== '' && getenv($k) === false) {
      putenv("{$k}={$v}");
      $_ENV[$k] = $v;
    }
  }
}

load_dotenv(dirname(__DIR__) . '/.env');

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) {
    return $pdo;
  }

  $host = env('DB_HOST', '127.0.0.1');
  $port = env('DB_PORT', '3306');
  $name = env('DB_NAME', 'expense_tracker');
  $user = env('DB_USER', 'root');
  $pass = env('DB_PASS', '');

  $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
  try {
    $pdo = new PDO($dsn, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } catch (Throwable $e) {
    json_error('Database connection failed', 500);
  }

  return $pdo;
}

function require_fields(array $data, array $fields): void {
  foreach ($fields as $f) {
    if (!array_key_exists($f, $data)) {
      json_error("Missing field: {$f}", 422);
    }
  }
}

function to_int($v, string $field): int {
  if (!is_numeric($v)) {
    json_error("Invalid number: {$field}", 422);
  }
  return (int)$v;
}

function to_string($v, string $field, bool $allowNull = false): ?string {
  if ($v === null && $allowNull) {
    return null;
  }
  if (!is_string($v)) {
    json_error("Invalid string: {$field}", 422);
  }
  return $v;
}

function to_date_ymd($v, string $field): string {
  if (!is_string($v)) {
    json_error("Invalid date: {$field}", 422);
  }
  $dt = DateTime::createFromFormat('Y-m-d', $v);
  if (!$dt || $dt->format('Y-m-d') !== $v) {
    json_error("Invalid date format (YYYY-MM-DD): {$field}", 422);
  }
  return $v;
}
