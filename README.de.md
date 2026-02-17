![OpenLearn Cover](assets/cover.jpg)

# OpenLearn
> AI-mentorierte Entwicklung für opencode. Du schreibst den Code, wir leiten das Denken.

[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)
[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

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

### Schritt 1: Projekt initialisieren

Starte opencode in deinem Projektverzeichnis, dann:

```
/openlearn-init
```

Dies fragt dich:
- Dein Programmierhintergrund
- Was du baust
- Dein Tech-Stack
- Wie Dokumentation verwendet werden soll (auto/suggest/manual)

Erstellt:
- `mission.md` - Dein Projektzweck
- `stack.md` - Technologieentscheidungen
- `roadmap.md` - Entwicklungsphasen

### Schritt 2: Feature planen

```
/openlearn-feature
```

Dies:
- Zeigt deine aktuelle Roadmap-Phase
- Hilft das Feature zu definieren
- Erstellt Spec-Dateien mit Akzeptanzkriterien
- Unterteilt in Aufgaben

Erstellt:
- `spec.md` - Anforderungen
- `design.md` - Technischer Ansatz
- `tasks.md` - Implementierungs-Checkliste

### Schritt 3: Bauen (Du schreibst den Code!)

Beim Coden nutze:

```
/openlearn-guide    # Sokratische Anleitung
/openlearn-stuck    # Debug mit Protokoll D
```

**Du schreibst ALLEN Code**. OpenLearn stellt nur bereit:
- Patterns (max 8 Zeilen)
- Fragen zum Denken
- Dokumentationsreferenzen

### Schritt 4: Mit Qualitäts-Gattern abschließen

```
/openlearn-done
```

Führt alle 6 Gatter aus:
1. 🔒 **Eigentum** (75%+ erforderlich) - Erkläre deinen Code
2. 🛡️ **Sicherheit** (75%+ erforderlich) - Keine Schwachstellen
3. ⚠️ **Fehler** - Ordnungsgemäße Fehlerbehandlung
4. ⚡ **Leistung** - Skaliert gut
5. 📖 **Grundlagen** - Sauberer Code
6. 🧪 **Testen** - Testabdeckung

Wenn du Gatter 1 oder 2 nicht bestehst, wiederhole bis du es verstehst.

### Schritt 5: Lernfortschritt verfolgen

```
/openlearn-retro    # Speichere was du gelernt hast
/openlearn-advise   # Erhalte Rat aus vergangenen Lektionen
/openlearn-status   # Zeige deinen Fortschritt
```

Alle Lektionen werden in SQLite-Datenbank + Markdown-Dateien gespeichert.

## Beispiel-Workflow

```bash
# 1. Installiere OpenLearn
curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash

# 2. Gehe zu deinem Projekt
cd my-todo-app

# 3. Starte opencode
opencode

# 4. Initialisiere
/openlearn-init
# → Beantworte Fragen zu deinem Projekt

# 5. Plane erstes Feature
/openlearn-feature
# → Erstellt Spec für "Todo hinzufügen" Feature

# 6. Baue es selbst
# Schreibe Code, nutze /openlearn-guide wenn du steckenbleibst

# 7. Schließe ab
/openlearn-done
# → Bestahe 6 Gatter, erkläre deinen Code

# 8. Reflektiere
/openlearn-retro
# → Speichere Lektionen in Datenbank
```

## Die 6 Gatter

Vor dem Release muss der Code bestehen:

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
| `/openlearn-stuck` | Debug mit Protokoll D |
| `/openlearn-done` | Mit Gattern abschließen |
| `/openlearn-retro` | Gelerntes in SQLite speichern |
| `/openlearn-advise` | Vergangene Lektionen abfragen |
| `/openlearn-status` | Fortschritt anzeigen |
| `/openlearn-test` | Test-Anleitung |
| `/openlearn-docs` | Dokumentationshilfe |
| `/openlearn-profile` | Einstellungen |

## Lernsystem

OpenLearn verfolgt deine Lernreise:

- **SQLite-Datenbank**: `.opencode/openlearn/openlearn.db`
- **Markdown-Dateien**: `.opencode/openlearn/learnings/`
- **Verfolgte Themen**: Technologien (React, TypeScript, etc.)
- **Gatter-Punkte**: Eigentums- und Sicherheitspunkte gespeichert

Jederzeit abfragen:
```
/openlearn-advise
→ "Als du an [ähnlicher Aufgabe] gearbeitet hast, hast du gelernt..."
```

## Context7

OpenLearn verwendet offizielle Dokumentation (via Context7), damit du lernst, Dokumentation zu lesen, statt auf KI-Halluzinationen zu vertrauen.
