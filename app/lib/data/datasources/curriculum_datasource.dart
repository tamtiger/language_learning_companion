import 'dart:convert';
import 'package:flutter/services.dart';

import '../models/lesson_model.dart';

class CurriculumDataSource {
  Future<Map<String, dynamic>> _loadManifest() async {
    final jsonStr = await rootBundle.loadString('assets/curriculum_manifest.json');
    return json.decode(jsonStr) as Map<String, dynamic>;
  }

  Future<List<LessonModel>> loadAllLessons() async {
    try {
      final manifest = await _loadManifest();
      final lessons = <LessonModel>[];
      
      final modules = manifest['modules'] as List? ?? [];
      for (final module in modules) {
        final moduleLessons = module['lessons'] as List? ?? [];
        for (final lessonMeta in moduleLessons) {
          final lessonId = lessonMeta['id'] as String;
          final lesson = await loadLesson(lessonId);
          if (lesson != null) {
            lessons.add(lesson);
          }
        }
      }
      
      lessons.sort((a, b) => a.lessonNumber.compareTo(b.lessonNumber));
      return lessons;
    } catch (e) {
      throw Exception('Failed to load lessons from JSON assets: $e');
    }
  }

  Future<LessonModel?> loadLesson(String lessonId) async {
    try {
      final jsonStr = await rootBundle.loadString('assets/lessons/$lessonId.json');
      final map = json.decode(jsonStr) as Map<String, dynamic>;
      return LessonModel.fromMap(map);
    } catch (e) {
      print('Error loading lesson $lessonId from JSON: $e');
      return null;
    }
  }

  Future<List<String>> loadModuleNames() async {
    try {
      final manifest = await _loadManifest();
      final names = <String>[];
      
      final modules = manifest['modules'] as List? ?? [];
      for (final module in modules) {
        if (module['name'] != null) {
          names.add(module['name'] as String);
        }
      }
      return names;
    } catch (e) {
      throw Exception('Failed to load modules from JSON assets: $e');
    }
  }
}
