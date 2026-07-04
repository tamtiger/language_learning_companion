class LessonProgressModel {
  final int? id;
  final String lessonId;
  final bool completed;
  final String? completedAt;
  final String createdAt;
  final String updatedAt;

  const LessonProgressModel({
    this.id,
    required this.lessonId,
    this.completed = false,
    this.completedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() => {
        'lesson_id': lessonId,
        'completed': completed ? 1 : 0,
        'completed_at': completedAt,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };

  factory LessonProgressModel.fromMap(Map<String, dynamic> map) =>
      LessonProgressModel(
        id: map['id'] as int?,
        lessonId: map['lesson_id'] as String,
        completed: (map['completed'] as int) == 1,
        completedAt: map['completed_at'] as String?,
        createdAt: map['created_at'] as String,
        updatedAt: map['updated_at'] as String,
      );
}
