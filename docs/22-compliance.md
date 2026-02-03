# Nova - Conformité / RGPD (minimal)

> **Document de référence détaillé** : [`29-rgpd.md`](./29-rgpd.md) contient les informations complètes sur la conformité RGPD (données collectées, durées de rétention, droits utilisateurs, procédures).

Ce document présente un résumé des éléments de conformité. En cas de divergence, le document `29-rgpd.md` fait foi.

---

## Données collectées
- Email (compte)
- URLs suivies (suivis)
- Logs techniques (minimisés) : erreurs, timestamps, http_status

## Finalité
- Fournir une alerte de retour en stock.

## Conservation
- Logs techniques : **30 jours** (suppression automatique).
- Historique checks (`watch_checks`) : **90 jours** (suppression automatique).
- Notifications : **1 an** (preuve d'envoi, support).

## Droits utilisateur
- Suppression du compte : suppression des données associées.
- (Optionnel) Export minimal des suivis.

## Mentions
- Politique de confidentialité simple.
- Mentions légales (si exigées par le cadre pédagogique).

---

## Référence
- RGPD détaillé : [`29-rgpd.md`](./29-rgpd.md)
- Sécurité : [`05-security.md`](./05-security.md)
