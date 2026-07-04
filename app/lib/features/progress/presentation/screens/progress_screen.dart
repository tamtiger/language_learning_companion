import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/progress_provider.dart';

class ProgressScreen extends ConsumerWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(progressProvider);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Progress'),
      ),
      body: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load progress')),
        data: (stats) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _StatCard(
              icon: Icons.menu_book,
              label: 'Lessons Completed',
              value: '${stats.lessonsCompleted}',
              color: colorScheme.primary,
            ),
            const SizedBox(height: 8),
            _StatCard(
              icon: Icons.local_fire_department,
              label: 'Current Streak',
              value: '${stats.streak} days',
              color: Colors.orange,
            ),
            const SizedBox(height: 8),
            _StatCard(
              icon: Icons.star,
              label: 'XP',
              value: '${stats.xp}',
              color: Colors.amber,
            ),
            const SizedBox(height: 8),
            _StatCard(
              icon: Icons.emoji_events,
              label: 'Level',
              value: '${stats.level}',
              color: colorScheme.tertiary,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
