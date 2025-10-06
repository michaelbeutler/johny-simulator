# Sieb des Eratosthenes (Sieve of Eratosthenes)

## Algorithmus Beschreibung

Das Sieb des Eratosthenes ist ein effizienter Algorithmus zur Bestimmung aller Primzahlen bis zu einer gegebenen Obergrenze N. Der Algorithmus funktioniert durch systematisches "Aussieben" der zusammengesetzten Zahlen.

## Funktionsweise

1. **Initialisierung**: Erstelle eine Liste aller Zahlen von 2 bis N
2. **Markierung**: Beginne mit der kleinsten Primzahl (2)
3. **Vielfache streichen**: Markiere alle Vielfachen der aktuellen Primzahl als zusammengesetzt
4. **Nächste Primzahl**: Finde die nächste unmarkierte Zahl - diese ist eine Primzahl
5. **Wiederholen**: Wiederhole Schritte 3-4 bis alle Zahlen bis √N verarbeitet wurden
6. **Ausgabe**: Alle unmarkierten Zahlen sind Primzahlen

## Implementation Details

### Memory Layout
- **Address 100**: N (Obergrenze, z.B. 30)
- **Address 101**: Aktuelle zu testende Zahl (i)
- **Address 102**: Aktuelles Vielfaches zum Markieren (j)
- **Address 103**: Temporärer Speicher für Berechnungen
- **Address 104**: Approximation von √N
- **Address 105**: Ausgabe-Speicher für gefundene Primzahlen
- **Address 200-299**: Sieb-Array (0 = Primzahl, 1 = zusammengesetzt)

### Algorithmus Phasen

#### Phase 1: Initialisierung
- Setze N = 30 (oder gewünschte Obergrenze)
- Initialisiere Sieb-Array mit 0 (alle Zahlen zunächst als Primzahlen betrachtet)
- Setze i = 2 (erste Primzahl)

#### Phase 2: Sieben
- Für jede Zahl i von 2 bis √N:
  - Wenn i nicht markiert ist (Primzahl):
    - Markiere alle Vielfachen von i beginnend mit i²
    - Vielfache: i², i²+i, i²+2i, ...

#### Phase 3: Ausgabe
- Alle unmarkierten Zahlen von 2 bis N sind Primzahlen

## Optimierungen

1. **Start bei i²**: Beginne das Markieren der Vielfachen bei i², da kleinere Vielfachen bereits von kleineren Primzahlen markiert wurden

2. **Nur bis √N prüfen**: Es genügt, nur Primzahlen bis √N zu verwenden, da jede zusammengesetzte Zahl mindestens einen Primfaktor ≤ √N hat

3. **Ungerade Zahlen**: In einer erweiterten Version könnte man nur ungerade Zahlen speichern (außer 2)

## Beispiel für N = 30

Primzahlen bis 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29

### Schritte:
1. Markiere Vielfache von 2: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30
2. Markiere Vielfache von 3: 9, 15, 21, 27 (6, 12, 18, 24, 30 bereits markiert)
3. Markiere Vielfache von 5: 25 (10, 15, 20, 30 bereits markiert)
4. 7² = 49 > 30, also stoppen

Unmarkierte Zahlen: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29

## Komplexität

- **Zeitkomplexität**: O(N log log N)
- **Speicherkomplexität**: O(N)

## Historischer Hintergrund

Benannt nach dem griechischen Mathematiker Eratosthenes (3. Jahrhundert v. Chr.), obwohl das Verfahren bereits vorher bekannt war. Eratosthenes führte lediglich die Bezeichnung "Sieb" ein.

Das Verfahren ist die Grundlage für moderne Siebmethoden in der analytischen Zahlentheorie, entwickelt von Mathematikern wie Legendre, Brun, Selberg und anderen.