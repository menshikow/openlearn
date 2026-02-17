![OpenLearn Cover](assets/readme.jpg)

# OpenLearn
> AI-mentorierte Entwicklung für opencode. Du schreibst den Code, wir leiten das Denken.

[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)

[English](README.md) | [Deutsch](README.de.md) | [Русский](README.ru.md)

## Was ist das?

OpenLearn verwandelt opencode von einem Code-Generator in einen Lehrmentor. Du schreibst 100% des Codes und erhältst sokratische Anleitung und Qualitätskontrollen.

## Installation

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/menshikow/openlearn/main/install.ps1 | iex

# Oder manuell
git clone https://github.com/menshikow/openlearn.git
cp -r openlearn/.opencode/ ./dein-projekt/
```

## Verwendung

### Schritt 1: Initialisierung

```
/openlearn-init
```

Richtet dein Projekt ein mit Mission, Stack und Roadmap.

### Schritt 2: Feature planen

```
/openlearn-feature
```

Erstellt Spec-Dateien mit Akzeptanzkriterien und Aufgaben.

### Schritt 3: Bauen

```
/openlearn-guide    # Sokratische Anleitung
/openlearn-stuck    # Debug mit Protokoll D
```

Du schreibst ALLEN Code. OpenLearn stellt Patterns (max 8 Zeilen) und Anleitung bereit.

### Schritt 4: Abschließen

```
/openlearn-done
```

Bestahe 6 Qualitäts-Gatter. Gatter 1 & 2 erfordern 75%+ zum Fortfahren.

### Schritt 5: Lernen verfolgen

```
/openlearn-retro    # Speichere was du gelernt hast
/openlearn-advise   # Abfrage vergangener Lektionen
/openlearn-status   # Prüfe Fortschritt
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
| `/openlearn-init` | Projekt initialisieren |
| `/openlearn-feature` | Feature planen |
| `/openlearn-guide` | Sokratische Anleitung |
| `/openlearn-stuck` | Systematisches Debuggen |
| `/openlearn-done` | Mit Gattern abschließen |
| `/openlearn-retro` | Lektionen speichern |
| `/openlearn-advise` | Vergangene Lektionen abfragen |
| `/openlearn-status` | Fortschritt prüfen |

## Inspiration

Inspiriert von [OwnYourCode](https://github.com/DanielPodolsky/ownyourcode) von Daniel Podolsky.

## Lizenz

MIT
