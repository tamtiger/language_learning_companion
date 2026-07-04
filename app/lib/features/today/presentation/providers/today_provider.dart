import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/datasources/curriculum_datasource.dart';
import '../../../../data/database/database_helper.dart';

class TodayData {
  final int streak;
  final LessonSummary? currentLesson;
  final int reviewCount;
  final int backlog;
  final int completedLessonsCount;
  final int totalLessons;

  const TodayData({
    this.streak = 0,
    this.currentLesson,
    this.reviewCount = 0,
    this.backlog = 0,
    this.completedLessonsCount = 0,
    this.totalLessons = 0,
  });
}

class LessonSummary {
  final String id;
  final String title;
  final int lessonNumber;
  final String estimatedTime;
  const LessonSummary({
    required this.id,
    required this.title,
    required this.lessonNumber,
    required this.estimatedTime,
  });
}

class TodayNotifier extends StateNotifier<AsyncValue<TodayData>> {
  TodayNotifier() : super(const AsyncValue.loading()) {
    _load();
  }

  final _dataSource = CurriculumDataSource();

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final lessons = await _dataSource.loadAllLessons();
      final completedIds = await DatabaseHelper.getCompletedLessonIds();
      final streak = await DatabaseHelper.getStreakCount();

      final firstIncomplete = lessons.indexWhere(
        (l) => !completedIds.contains(l.id),
      );

      LessonSummary? currentLesson;
      if (firstIncomplete >= 0 && firstIncomplete < lessons.length) {
        final l = lessons[firstIncomplete];
        currentLesson = LessonSummary(
          id: l.id,
          title: l.title,
          lessonNumber: l.lessonNumber,
          estimatedTime: l.estimatedTime,
        );
      }

      state = AsyncValue.data(TodayData(
        streak: streak,
        currentLesson: currentLesson,
        reviewCount: 0,
        backlog: 0,
        completedLessonsCount: completedIds.length,
        totalLessons: lessons.length,
      ));
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}

final todayProvider =
    StateNotifierProvider<TodayNotifier, AsyncValue<TodayData>>(
  (ref) => TodayNotifier(),
);
