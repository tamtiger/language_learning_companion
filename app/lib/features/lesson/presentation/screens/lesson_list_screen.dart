import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../providers/lesson_list_provider.dart';

class LessonListScreen extends ConsumerWidget {
  const LessonListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lessonsAsync = ref.watch(lessonListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('All Lessons'),
      ),
      body: lessonsAsync.when(
        loading: () => const LoadingWidget(message: 'Loading lessons...'),
        error: (e, _) => AppErrorWidget(
          message: 'Could not load lessons',
          onRetry: () => ref.invalidate(lessonListProvider),
        ),
        data: (lessons) => ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: lessons.length,
          itemBuilder: (context, index) {
            final lesson = lessons[index];
            return Card(
              child: ListTile(
                leading: CircleAvatar(
                  child: Text('${lesson.lessonNumber}'),
                ),
                title: Text(lesson.title),
                subtitle: Text(lesson.moduleName),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/lessons/${lesson.id}'),
              ),
            );
          },
        ),
      ),
    );
  }
}
