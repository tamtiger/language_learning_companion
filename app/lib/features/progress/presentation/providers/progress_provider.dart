import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/database/database_helper.dart';

class ProgressStats {
  final int lessonsCompleted;
  final int streak;
  final int xp;
  final int level;

  const ProgressStats({
    this.lessonsCompleted = 0,
    this.streak = 0,
    this.xp = 0,
    this.level = 1,
  });
}

class ProgressNotifier extends StateNotifier<AsyncValue<ProgressStats>> {
  ProgressNotifier() : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final completedIds = await DatabaseHelper.getCompletedLessonIds();
      final streak = await DatabaseHelper.getStreakCount();
      final lessonsCompleted = completedIds.length;

      final xp = lessonsCompleted * 100 + streak * 10;
      final level = (xp ~/ 500) + 1;

      state = AsyncValue.data(ProgressStats(
        lessonsCompleted: lessonsCompleted,
        streak: streak,
        xp: xp,
        level: level,
      ));
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}

final progressProvider =
    StateNotifierProvider<ProgressNotifier, AsyncValue<ProgressStats>>(
  (ref) => ProgressNotifier(),
);
