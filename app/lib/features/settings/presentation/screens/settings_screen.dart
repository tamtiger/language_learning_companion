import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text('Dark Mode'),
                  subtitle: const Text('Follow system theme'),
                  value: true,
                  onChanged: (_) {},
                  secondary: Icon(Icons.dark_mode, color: colorScheme.primary),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.notifications_outlined, color: colorScheme.primary),
                  title: const Text('Daily Reminder'),
                  subtitle: const Text('Not set'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.straighten, color: colorScheme.primary),
                  title: const Text('Daily Goal'),
                  subtitle: const Text('30 minutes'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.backup_outlined, color: colorScheme.primary),
                  title: const Text('Backup'),
                  subtitle: const Text('Export your progress'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.info_outline, color: colorScheme.primary),
                  title: const Text('About'),
                  subtitle: const Text('Version 0.1.0'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
