"""
Seed de données initiales pour Nova V2.
Prépare les comptes de démonstration et les produits pour la soutenance.
Idempotent : peut être lancé plusieurs fois sans doublons, met à jour les données existantes.

Usage: python -m app.seed
"""
import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.watch import Watch, WatchStatus, StockState
from app.models.watch_check import WatchCheck
from app.models.site_profile import SiteProfile

# --- CONFIGURATION DES COMPTES ---
# Mot de passe unique pour la démo, configurable via env
DEMO_PASSWORD = os.getenv("NOVA_DEMO_PASSWORD", "Demo123456789")

# Liste des utilisateurs à créer/mettre à jour
SEED_USERS = [
    {"email": "christopher@example.test", "role": UserRole.ADMIN},
    {"email": "user@example.test", "role": UserRole.USER},
    {"email": "florent@example.test", "role": UserRole.USER},
    {"email": "quentin@example.test", "role": UserRole.USER},
    {"email": "mathis@example.test", "role": UserRole.USER},
    {"email": "estelle@example.test", "role": UserRole.USER},
]

# --- DONNÉES DE DÉMO (PRODUITS) ---
PRODUCTS = [
    {
        "label": "Lampe chauffe-bougie « Halo »",
        "url": "https://lesprit-belle.test/products/lampe-halo",
        "domain": "lesprit-belle.test",
        "shop": "L’Esprit Belle",
        "stock_state": StockState.IN_STOCK
    },
    {
        "label": "Coffret 3 bougies « Solstice »",
        "url": "https://cassiopee-bougie.test/products/coffret-solstice",
        "domain": "cassiopee-bougie.test",
        "shop": "Cassiopée Bougie",
        "stock_state": StockState.OUT_OF_STOCK
    },
    {
        "label": "Bougie artisanale « Figuier »",
        "url": "https://cassiopee-bougie.test/products/bougie-figuier",
        "domain": "cassiopee-bougie.test",
        "shop": "Cassiopée Bougie",
        "stock_state": StockState.IN_STOCK
    },
    {
        "label": "Montre bois « Horizon »",
        "url": "https://terre-de-france.test/products/montre-horizon",
        "domain": "terre-de-france.test",
        "shop": "Terre de France",
        "stock_state": StockState.OUT_OF_STOCK
    },
    {
        "label": "Pull mérinos « Brume »",
        "url": "https://terre-de-france.test/products/pull-brume",
        "domain": "terre-de-france.test",
        "shop": "Terre de France",
        "stock_state": StockState.SOLD_OUT
    }
]

def seed_users(db: Session) -> None:
    """Crée ou met à jour les comptes Admin, User et Amis."""
    print("[seed] Vérification des utilisateurs (upsert)...")
    
    for user_data in SEED_USERS:
        email = user_data["email"]
        role = user_data["role"]
        
        # Hash séparé par utilisateur pour garantir un salt unique si supporté
        password_hash = hash_password(DEMO_PASSWORD)
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            db.add(User(
                email=email, 
                password_hash=password_hash, 
                role=role
            ))
            print(f"  + Utilisateur créé: {email} ({role})")
        else:
            user.password_hash = password_hash
            user.role = role
            print(f"  * Utilisateur mis à jour: {email} ({role})")
    
    db.commit()

def seed_site_profiles(db: Session) -> None:
    """Crée les profils de site pour les domaines de démo."""
    print("[seed] Vérification des profils de site...")
    domains = {}
    for p in PRODUCTS:
        domains[p["domain"]] = p["shop"]
    
    for domain, shop_name in domains.items():
        profile = db.query(SiteProfile).filter(SiteProfile.domain_pattern == domain).first()
        if not profile:
            db.add(SiteProfile(
                name=shop_name,
                domain_pattern=domain,
                fetch_mode="HTTP",
                rules_json={"selectors": {"price": ".price", "stock": ".stock"}}
            ))
            print(f"  + SiteProfile créé: {domain} ({shop_name})")
        else:
            profile.name = shop_name
            print(f"  . SiteProfile existe: {domain}")
            
    db.commit()

def seed_watches(db: Session) -> None:
    """Crée ou met à jour les suivis et leur historique pour l'utilisateur démo."""
    print("[seed] Vérification des suivis (watches - upsert)...")
    user_email = "user@example.test"
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        print(f"  ! Utilisateur {user_email} non trouvé, skip watches.")
        return

    for p in PRODUCTS:
        profile = db.query(SiteProfile).filter(SiteProfile.domain_pattern == p["domain"]).first()
        watch = db.query(Watch).filter(Watch.user_id == user.id, Watch.original_url == p["url"]).first()
        
        if not watch:
            watch = Watch(
                user_id=user.id,
                site_profile_id=profile.id if profile else None,
                original_url=p["url"],
                normalized_url=p["url"].replace("https://", "").replace("http://", ""),
                label=p["label"],
                watch_status=WatchStatus.ACTIVE,
                stock_state=p["stock_state"]
            )
            db.add(watch)
            db.flush()  # Pour récupérer l'ID de la watch
            print(f"  + Watch créée: {p['label']}")
        else:
            # Upsert : mise à jour des données de démo
            watch.label = p["label"]
            watch.site_profile_id = profile.id if profile else watch.site_profile_id
            watch.watch_status = WatchStatus.ACTIVE
            watch.stock_state = p["stock_state"]
            print(f"  * Watch mise à jour: {p['label']}")
            
        # --- GARANTIE DE L'HISTORIQUE (Idempotent) ---
        check_count = db.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).count()
        if check_count < 2:
            now = datetime.now(timezone.utc)
            # Ajout de l'historique manquant
            if check_count == 0:
                # Création de 2 checks si aucun
                db.add(WatchCheck(
                    watch_id=watch.id,
                    checked_at=now - timedelta(days=2),
                    stock_state=StockState.OUT_OF_STOCK.value,
                    fetch_mode="FIXTURE",
                    http_status=200,
                    details={"info": "Initial state"}
                ))
                db.add(WatchCheck(
                    watch_id=watch.id,
                    checked_at=now - timedelta(hours=5),
                    stock_state=p["stock_state"].value,
                    fetch_mode="FIXTURE",
                    http_status=200,
                    details={"info": "Last check"}
                ))
                print(f"    + Historique créé (2 checks) pour: {p['label']}")
            elif check_count == 1:
                # Ajout d'un 2ème check si un seul présent
                db.add(WatchCheck(
                    watch_id=watch.id,
                    checked_at=now - timedelta(hours=5),
                    stock_state=p["stock_state"].value,
                    fetch_mode="FIXTURE",
                    http_status=200,
                    details={"info": "Complementary check"}
                ))
                print(f"    + Historique complété (1 check ajouté) pour: {p['label']}")
        else:
            print(f"    . Historique déjà présent ({check_count} checks) pour: {p['label']}")
            # Mise à jour du dernier check pour refléter l'état actuel (cohérence démo)
            last_check = db.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).order_by(WatchCheck.checked_at.desc()).first()
            if last_check and last_check.stock_state != p["stock_state"].value:
                last_check.stock_state = p["stock_state"].value
                print(f"    * Dernier check mis à jour vers {p['stock_state'].value} pour: {p['label']}")
            
    db.commit()

def main() -> None:
    """Point d'entrée principal."""
    print("==> Démarrage du seed Nova V2...")
    db = SessionLocal()
    try:
        seed_users(db)
        seed_site_profiles(db)
        seed_watches(db)
        print("==> Seed terminé avec succès !")
    except Exception as e:
        print(f"ERREUR lors du seed: {e}", file=sys.stderr)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

# Seed.py