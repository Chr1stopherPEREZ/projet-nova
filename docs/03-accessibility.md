# Nova - Accessibilité (a11y) — minimum défendable

## Objectif
Atteindre un niveau “raisonnable” type WCAG AA sur les parcours clés, sans audit complet.

## Checklist MVP
### Clavier
- Navigation complète au clavier (Tab / Shift+Tab).
- Focus visible et cohérent.
- Pas de piège clavier.

### Formulaires
- Labels explicites (email, password, url).
- Messages d’erreur lisibles et associés au champ.

### Structure
- Un seul H1 par page.
- Landmarks : `header`, `nav`, `main`, `footer`.

### Contrastes
- Contraste suffisant sur textes, boutons, badges de statut.

### Couleur
- Statuts stock lisibles sans dépendre uniquement de la couleur (badge + texte).

## Tests a11y (preuves)
- Lighthouse (score a11y) + capture.
- axe DevTools (zéro violation critique sur pages : login, dashboard, admin profils).
- 5 scénarios clavier documentés.
