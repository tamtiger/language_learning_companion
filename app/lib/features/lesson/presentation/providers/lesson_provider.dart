import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/datasources/curriculum_datasource.dart';
import '../../../../data/models/lesson_model.dart';

final _dataSource = CurriculumDataSource();

final lessonProvider =
    FutureProvider.family<LessonModel?, String>((ref, lessonId) {
  return _dataSource.loadLesson(lessonId);
});
