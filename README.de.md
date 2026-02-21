![OpenLearn Cover](assets/readme.jpg)

# OpenLearn
> AI-mentorierte Entwicklung für opencode. Du schreibst den Code, wir leiten das Denken.

[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)

[English](README.md) | [Deutsch](README.de.md) | [Русский](README.ru.md)

## Was ist das?

OpenLearn verwandelt opencode von einem Code-Generator in einen Lehrmentor. Du schreibst 100% des Codes und erhältst sokratische Anleitung und Qualitätskontrollen.

## Installation

### Schnellinstallation (macOS/Linux)

Ein Befehl, der überall funktioniert. Erkennt automatisch deinen Package Manager (bun → npm → pnpm):

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh)
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/menshikow/openlearn/main/install.ps1 | iex
```

### Manuelle Installation

```bash
git clone https://github.com/menshikow/openlearn.git
cp -r openlearn/.opencode/ ./dein-projekt/
```

### Globales Profil

Während der Installation wirst du gefragt, ob du ein **globales Profil** erstellen möchtest unter:
- macOS: `~/Library/Application Support/openlearn/profile.json`
- Linux: `~/.config/openlearn/profile.json`

Globale Profile ermöglichen die Wiederverwendung von Einstellungen in allen Projekten.

## Verwendung

### Schritt 1: Initialisierung

```
/openlearn-init
```

Richtet dein Projekt ein mit:
- Benutzerprofil (global oder lokal)
- Projektmission, Stack und Roadmap
- Context7 MCP-Konfiguration
- Theory/Build Modus-Auswahl

**Neu**: Erkennt automatisch globale Profile und bietet deren Wiederverwendung an.

### Schritt 2: Task planen

```
/openlearn-task
```

Erstellt Spec-Dateien mit Akzeptanzkriterien und Aufgaben.

**Hinweis**: Umbenannt von `/openlearn-feature` für allgemeinere Terminologie.

### Schritt 3: Bauen

```
/openlearn-guide    # Sokratische Anleitung (Theory Mode)
/openlearn-stuck    # Debug mit Protokoll D
```

**Theory Mode** (Standard): Du schreibst ALLEN Code. OpenLearn bietet:
- Erklärungen und Anleitung
- Patterns (max **5 Zeilen** Beispielcode)
- **Nie** Dateien ohne Erlaubnis erstellen
- **Nie** Befehle ohne Nachfrage ausführen

**Build Mode**: Wird ausgelöst wenn du sagst "erstelle", "implementiere" oder `/openlearn-*` Befehle nutzt. Erfordert trotzdem Erlaubnis für jede Aktion.

### Schritt 4: Abschließen

```
/openlearn-done
```

Bestehe 6 Qualitäts-Gatter:
- Gatter 1 & 2 erfordern 75%+ zum Fortfahren
- Bereinigt automatisch temporäre Dateien (AGENTS.md, PROJECT.md) aus dem Root-Verzeichnis

### Schritt 5: Lernen verfolgen

```
/openlearn-retro    # Speichere was du gelernt hast
/openlearn-advise   # Abfrage vergangener Lektionen
/openlearn-status   # Prüfe Fortschritt
```

### Zusätzliche Befehle

```
/openlearn-setup-context7   # Context7 MCP konfigurieren
/openlearn-profile          # Einstellungen anzeigen/ändern
```

## Die 6 Gatter

| Gatter | Name | Blockierend | Zweck |
|--------|------|-------------|-------|
| 🔒 | Eigentum | ✅ Ja (75%+) | Code erklären |
| 🛡️ | Sicherheit | ✅ Ja (75%+) | Keine Schwachstellen |
| ⚠️ | Fehler | Nein | Fehlerbehandlung |
| ⚡ | Leistung | Nein | Skalierbarkeit |
| 📖 | Grundlagen | Nein | Code-Qualität |
| 🧪 | Testen | Nein | Testabdeckung |

## Befehle

| Befehl | Zweck |
|--------|-------|
| `/openlearn-init` | Projekt mit globalem Profil-Support initialisieren |
| `/openlearn-task` | Task mit Spec-Driven Development planen |
| `/openlearn-guide` | Sokratische Anleitung (Theory Mode) |
| `/openlearn-stuck` | Systematisches Debuggen (Protokoll D) |
| `/openlearn-done` | Mit 6 Gattern + Auto-Cleanup abschließen |
| `/openlearn-test` | Test-Anleitung |
| `/openlearn-docs` | Dokumentationshilfe |
| `/openlearn-retro` | Lektionen speichern |
| `/openlearn-advise` | Vergangene Lektionen abfragen |
| `/openlearn-status` | Fortschritt prüfen |
| `/openlearn-profile` | Einstellungen anzeigen/ändern |
| `/openlearn-setup-context7` | Context7 MCP konfigurieren |

## Inspiration

Inspiriert von [OwnYourCode](https://github.com/DanielPodolsky/ownyourcode) von Daniel Podolsky.

## Lizenz

MIT
