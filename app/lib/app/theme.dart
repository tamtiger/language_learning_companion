import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  AppTheme._();

  // Vibrant Indigo for modern, premium look
  static const _primaryColor = Color(0xFF6366F1); // Tailwind Indigo 500
  static const _secondaryColor = Color(0xFF14B8A6); // Tailwind Teal 500
  static const _tertiaryColor = Color(0xFFF59E0B); // Tailwind Amber 500

  // Soft background colors for cards
  static const _lightSurface = Color(0xFFFFFFFF);
  static const _darkSurface = Color(0xFF1E293B); // Tailwind Slate 800

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primaryColor,
          secondary: _secondaryColor,
          tertiary: _tertiaryColor,
          brightness: Brightness.light,
          surface: const Color(0xFFF8FAFC), // Tailwind Slate 50
        ),
        textTheme: GoogleFonts.nunitoTextTheme(ThemeData.light().textTheme),
        appBarTheme: AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          scrolledUnderElevation: 0,
          iconTheme: const IconThemeData(color: Color(0xFF334155)),
          titleTextStyle: GoogleFonts.nunito(
            color: const Color(0xFF0F172A),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: _lightSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: Color(0xFFE2E8F0), width: 1), // subtle border
          ),
          margin: EdgeInsets.zero,
        ),
        navigationBarTheme: NavigationBarThemeData(
          elevation: 0,
          backgroundColor: _lightSurface,
          indicatorColor: _primaryColor.withOpacity(0.15),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return GoogleFonts.nunito(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: _primaryColor,
              );
            }
            return GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF64748B),
            );
          }),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primaryColor,
          secondary: _secondaryColor,
          tertiary: _tertiaryColor,
          brightness: Brightness.dark,
          surface: const Color(0xFF0F172A), // Tailwind Slate 900
        ),
        textTheme: GoogleFonts.nunitoTextTheme(ThemeData.dark().textTheme),
        appBarTheme: AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          scrolledUnderElevation: 0,
          titleTextStyle: GoogleFonts.nunito(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: _darkSurface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: Color(0xFF334155), width: 1), // subtle border
          ),
          margin: EdgeInsets.zero,
        ),
        navigationBarTheme: NavigationBarThemeData(
          elevation: 0,
          backgroundColor: _darkSurface,
          indicatorColor: _primaryColor.withOpacity(0.25),
          labelTextStyle: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return GoogleFonts.nunito(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: _primaryColor,
              );
            }
            return GoogleFonts.nunito(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF94A3B8),
            );
          }),
        ),
      );
}
