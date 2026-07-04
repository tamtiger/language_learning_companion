class LessonModel {
  final String id;
  final String title;
  final String moduleName;
  final String difficulty;
  final String estimatedTime;
  final String prerequisites;
  final String content;
  final int lessonNumber;

  const LessonModel({
    required this.id,
    required this.title,
    required this.moduleName,
    required this.difficulty,
    required this.estimatedTime,
    required this.prerequisites,
    required this.content,
    required this.lessonNumber,
  });


  factory LessonModel.fromMap(Map<String, dynamic> map) {
    return LessonModel(
      id: map['id'] as String,
      title: map['title'] as String,
      moduleName: (map['module_name'] ?? map['moduleName'] ?? '') as String,
      difficulty: map['difficulty'] as String,
      estimatedTime: (map['estimated_time'] ?? map['estimatedTime'] ?? '') as String,
      prerequisites: map['prerequisites'] as String,
      content: map['content'] as String,
      lessonNumber: (map['lesson_number'] ?? map['lessonNumber'] ?? 0) as int,
    );
  }
}
