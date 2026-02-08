# Nova — Known Issues & Technical Debt

> Ce fichier documente les problèmes connus et la dette technique à traiter dans un lot ultérieur (S4 ou post-MVP).

---

## Warnings à corriger

### 1. Pydantic BaseSettings — Config class deprecated

**Fichier concerné** : `api/app/core/config.py`

**Warning** :
```
PydanticDeprecatedSince20: Support for class-based config is deprecated
```

**Impact** : Aucun pour S1/S2/S3. Fonctionnel.

**Fix recommandé** :
```python
# Avant
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ...
    class Config:
        env_file = ".env"
        case_sensitive = False

# Après
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ...
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )
```

**Priorité** : Basse (cleanup S4)

---

### 2. Module `crypt` deprecated (Python 3.13+)

**Origine** : `passlib` utilise le module `crypt` de la stdlib Python.

**Warning** :
```
DeprecationWarning: 'crypt' is deprecated and slated for removal in Python 3.13
```

**Impact** : Aucun pour le MVP (Python 3.12 utilisé). Problème futur si upgrade vers Python 3.13+.

**Fix recommandé** :
- Attendre une mise à jour de `passlib` qui n'utilise plus `crypt`
- Ou migrer vers une autre lib de hashing (ex: `argon2-cffi` directement)
- Ou configurer passlib pour éviter les chemins qui utilisent `crypt`

**Priorité** : Basse (à surveiller si upgrade Python)

---

### 3. Argon2 version access warning

**Origine** : `passlib[argon2]` accède à la version d'argon2 de manière dépréciée.

**Warning** :
```
DeprecationWarning: 'version' is deprecated... use 'importlib.metadata'
```

**Impact** : Aucun. Warning cosmétique.

**Fix** : Attendre une mise à jour de `passlib`.

**Priorité** : Très basse

---

## Checklist S4 Cleanup

- [ ] Migrer `Settings` vers `SettingsConfigDict`
- [ ] Vérifier compatibilité passlib/Python 3.13
- [ ] Supprimer les warnings restants
- [ ] Ajouter `.dockerignore` pour exclure `tests/` en prod
- [ ] Envisager multi-stage Dockerfile pour images allégées

---

*Dernière mise à jour : S1 (Lot 3)*
