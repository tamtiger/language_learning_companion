import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../providers/roadmap_provider.dart';

class RoadmapScreen extends ConsumerWidget {
  const RoadmapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roadmapAsync = ref.watch(roadmapProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        title: const Text('Curriculum'),
      ),
      body: roadmapAsync.when(
        loading: () => const LoadingWidget(message: 'Loading curriculum...'),
        error: (e, _) => AppErrorWidget(
          message: 'Could not load curriculum',
          onRetry: () => ref.invalidate(roadmapProvider),
        ),
        data: (modules) => RefreshIndicator(
          onRefresh: () async => ref.invalidate(roadmapProvider),
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            itemCount: modules.length,
            itemBuilder: (context, index) {
              final module = modules[index];
              return _ModuleCard(
                moduleName: module.moduleName,
                lessons: module.lessons,
                completedCount: module.completedCount,
                index: index,
                onLessonTap: (lessonId) => context.push('/lessons/$lessonId'),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final String moduleName;
  final List<RoadmapLesson> lessons;
  final int completedCount;
  final int index;
  final void Function(String lessonId) onLessonTap;

  const _ModuleCard({
    required this.moduleName,
    required this.lessons,
    required this.completedCount,
    required this.index,
    required this.onLessonTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final progress = lessons.isNotEmpty ? completedCount / lessons.length : 0.0;
    final isCompleted = progress == 1.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: isCompleted ? colorScheme.primary.withOpacity(0.5) : colorScheme.surfaceContainerHighest,
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: isCompleted ? colorScheme.primary : colorScheme.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${index + 1}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: isCompleted ? Colors.white : colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        moduleName,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$completedCount of ${lessons.length} lessons completed',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 8,
                backgroundColor: colorScheme.surfaceContainerHighest,
                valueColor: AlwaysStoppedAnimation<Color>(
                  isCompleted ? colorScheme.primary : colorScheme.secondary,
                ),
              ),
            ),
            const SizedBox(height: 24),
            ...lessons.map(
              (lesson) => _LessonRow(
                title: lesson.title,
                lessonNumber: lesson.lessonNumber,
                completed: lesson.completed,
                onTap: () => onLessonTap(lesson.id),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LessonRow extends StatelessWidget {
  final String title;
  final int lessonNumber;
  final bool completed;
  final VoidCallback onTap;

  const _LessonRow({
    required this.title,
    required this.lessonNumber,
    required this.completed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: completed ? colorScheme.primary : Colors.transparent,
                border: Border.all(
                  color: completed ? colorScheme.primary : colorScheme.outline.withOpacity(0.3),
                  width: 2,
                ),
              ),
              child: completed
                  ? const Icon(Icons.check, color: Colors.white, size: 18)
                  : Center(
                      child: Text(
                        '$lessonNumber',
                        style: TextStyle(
                          color: colorScheme.onSurfaceVariant,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: completed ? colorScheme.onSurfaceVariant : colorScheme.onSurface,
                      fontWeight: completed ? FontWeight.normal : FontWeight.w600,
                      decoration: completed ? TextDecoration.lineThrough : null,
                    ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: colorScheme.onSurfaceVariant.withOpacity(0.5), size: 24),
          ],
        ),
      ),
    );
  }
}
