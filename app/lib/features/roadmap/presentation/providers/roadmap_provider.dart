import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/database/database_helper.dart';
import '../../../../data/datasources/curriculum_datasource.dart';

class RoadmapLesson {
  final String id;
  final String title;
  final int lessonNumber;
  final bool completed;
  const RoadmapLesson({
    required this.id,
    required this.title,
    required this.lessonNumber,
    this.completed = false,
  });
}

class RoadmapModule {
  final String moduleName;
  final List<RoadmapLesson> lessons;
  final int completedCount;
  const RoadmapModule({
    required this.moduleName,
    required this.lessons,
    required this.completedCount,
  });
}

class RoadmapNotifier extends StateNotifier<AsyncValue<List<RoadmapModule>>> {
  RoadmapNotifier() : super(const AsyncValue.loading()) {
    _load();
  }

  final _dataSource = CurriculumDataSource();

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final lessons = await _dataSource.loadAllLessons();
      final moduleNames = await _dataSource.loadModuleNames();
      final completedIds = await DatabaseHelper.getCompletedLessonIds();

      final modules = <String, List<RoadmapLesson>>{};
      for (final lesson in lessons) {
        final moduleName = lesson.moduleName.isNotEmpty
            ? lesson.moduleName
            : (moduleNames.isNotEmpty ? moduleNames.first : 'General');
        modules.putIfAbsent(moduleName, () => []);
        modules[moduleName]!.add(RoadmapLesson(
          id: lesson.id,
          title: lesson.title,
          lessonNumber: lesson.lessonNumber,
          completed: completedIds.contains(lesson.id),
        ));
      }

      final result = modules.entries.map((entry) {
        final moduleLessons = entry.value;
        moduleLessons.sort((a, b) => a.lessonNumber.compareTo(b.lessonNumber));
        return RoadmapModule(
          moduleName: entry.key,
          lessons: moduleLessons,
          completedCount: moduleLessons.where((l) => l.completed).length,
        );
      }).toList();

      result.sort((a, b) => a.moduleName.compareTo(b.moduleName));

      state = AsyncValue.data(result);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }
}

final roadmapProvider =
    StateNotifierProvider<RoadmapNotifier, AsyncValue<List<RoadmapModule>>>(
  (ref) => RoadmapNotifier(),
);
