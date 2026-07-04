import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:sqflite/sqflite.dart' show getDatabasesPath, openDatabase, Database;
import 'package:path/path.dart' as p;

class DatabaseHelper {
  DatabaseHelper._();

  static Database? _db;

  static Future<Database> get database async {
    if (kIsWeb) {
      throw UnsupportedError('SQLite not available on web');
    }
    if (_db != null) return _db!;
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'learning_companion.db');
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
    return _db!;
  }

  static Future<List<String>> getCompletedLessonIds() async {
    if (kIsWeb) return [];
    try {
      final db = await database;
      final rows = await db.query('lesson_progress',
          columns: ['lesson_id'], where: 'completed = 1');
      return rows.map((r) => r['lesson_id'] as String).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<int> getStreakCount() async {
    if (kIsWeb) return 0;
    try {
      final db = await database;
      final result = await db.rawQuery(
          'SELECT COUNT(*) as c FROM streak WHERE completed = 1');
      return (result.first['c'] as int?) ?? 0;
    } catch (_) {
      return 0;
    }
  }

  static Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id TEXT NOT NULL UNIQUE,
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS review_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id TEXT NOT NULL,
        word TEXT NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0,
        last_reviewed_at TEXT,
        next_review_at TEXT,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS streak (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        completed INTEGER NOT NULL DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    ''');
  }
}
