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
    {"email": "christopher@nova.dev", "role": UserRole.ADMIN},
    {"email": "user@nova.dev", "role": UserRole.USER},
    {"email": "florent@nova.dev", "role": UserRole.USER},
    {"email": "quentin@nova.dev", "role": UserRole.USER},
    {"email": "mathis@nova.dev", "role": UserRole.USER},
    {"email": "estelle@nova.dev", "role": UserRole.USER},
]

# --- DONNÉES DE DÉMO (PRODUITS) ---
PRODUCTS = [
    {
        "label": "Lampe Chauffe-Bougie TWENOW",
        "url": "https://lesprit-belle.fr/sv/products/lampe-chauffe-bougie-twenow",
        "domain": "lesprit-belle.fr",
        "shop": "L’Esprit Belle",
        "stock_state": StockState.IN_STOCK
    },
    {
        "label": "Coffret Origine",
        "url": "https://lesprit-belle.fr/sv/collections/bougies-parfumees/products/coffret-origine-1",
        "domain": "lesprit-belle.fr",
        "shop": "L’Esprit Belle",
        "stock_state": StockState.IN_STOCK
    },
    {
        "label": "Candle in 300g jars",
        "url": "https://cassiopee-bougie.myshopify.com/en/products/bougie-en-pots-300g",
        "domain": "cassiopee-bougie.myshopify.com",
        "shop": "Cassiopée Bougie",
        "stock_state": StockState.IN_STOCK
    },
    {
        "label": "La Montre Résistance",
        "url": "https://terredefrance.fr/products/la-montre-resistance",
        "domain": "terredefrance.fr",
        "shop": "Terre de France",
        "stock_state": StockState.OUT_OF_STOCK
    },
    {
        "label": "Le sweat “Le Tricolore”",
        "url": "https://terredefrance.fr/products/le-sweat-tricolore",
        "domain": "terredefrance.fr",
        "shop": "Terre de France",
        "stock_state": StockState.IN_STOCK
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
    user_email = "user@nova.dev"
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
        if check_count < 10:
            print(f"    + Génération d'historique (10 checks) pour: {p['label']}")
            # On enrichit l'historique pour le dashboard Nova V2
            db.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).delete()
            
            now = datetime.now(timezone.utc)
            for i in range(10):
                # Répartition sur les 7 derniers jours
                checked_at = now - timedelta(days=(9-i)*0.7)
                
                # On simule un changement d'état pour certains produits
                state = p["stock_state"].value
                if i < 3 and p["stock_state"] == StockState.IN_STOCK:
                    state = StockState.OUT_OF_STOCK.value
                
                # Détails avec prix et devise pour la démo
                price = 35.0
                if "cassiopee" in p["url"]: price = 21.0
                elif "terredefrance" in p["url"]: 
                    price = 185.0 if "resistance" in p["url"] else 65.0
                
                currency = "CHF" if "cassiopee" in p["url"] else "EUR"
                
                db.add(WatchCheck(
                    watch_id=watch.id,
                    checked_at=checked_at,
                    stock_state=state,
                    fetch_mode="FIXTURE",
                    http_status=200,
                    details={
                        "info": "Seed V2",
                        "price": price,
                        "currency": currency,
                        "changed": i == 3 # Simuler un changement au 4ème check
                    }
                ))
        else:
            print(f"    . Historique déjà présent ({check_count} checks) pour: {p['label']}")
            
    db.commit()

def cleanup_old_demo_data(db: Session) -> None:
    """Supprime les anciens comptes de démo et les suivis obsolètes."""
    # 1. Nettoyage des comptes
    emails_to_remove = [
        "demo@nova.dev",
        "christopher@example.test",
        "user@example.test",
        "florent@example.test",
        "quentin@example.test",
        "mathis@example.test",
        "estelle@example.test"
    ]
    for email in emails_to_remove:
        old_user = db.query(User).filter(User.email == email).first()
        if old_user:
            print(f"[seed] Nettoyage : suppression de l'ancien compte {email}...")
            db.delete(old_user)
    
    # 2. Nettoyage des suivis de l'utilisateur démo (user@nova.dev)
    # On ne garde que les URLs définies dans PRODUCTS
    user_email = "user@nova.dev"
    user = db.query(User).filter(User.email == user_email).first()
    if user:
        valid_urls = [p["url"] for p in PRODUCTS]
        old_watches = db.query(Watch).filter(
            Watch.user_id == user.id,
            ~Watch.original_url.in_(valid_urls)
        ).all()
        
        for ow in old_watches:
            print(f"[seed] Nettoyage : suppression de l'ancien suivi {ow.label} ({ow.original_url})")
            # Les WatchCheck seront supprimés en cascade si la relation est configurée (souvent le cas)
            # Sinon on peut les supprimer manuellement si besoin, mais SQLAlchemy gère souvent ça.
            db.delete(ow)
            
    # 3. Nettoyage des profils de site orphelins (optionnel mais propre)
    # On garde les domaines de PRODUCTS + ceux utilisés par d'autres montres
    valid_domains = [p["domain"] for p in PRODUCTS]
    # On récupère tous les domaines encore utilisés
    used_profile_ids = [r[0] for r in db.query(Watch.site_profile_id).filter(Watch.site_profile_id.isnot(None)).distinct().all()]
    
    # Suppression des profils qui ne sont pas dans PRODUCTS ET ne sont plus utilisés
    orphan_profiles = db.query(SiteProfile).filter(
        ~SiteProfile.domain_pattern.in_(valid_domains),
        ~SiteProfile.id.in_(used_profile_ids)
    ).all()
    
    for op in orphan_profiles:
        print(f"[seed] Nettoyage : suppression du profil de site orphelin {op.domain_pattern}")
        db.delete(op)

    db.commit()

def main() -> None:
    """Point d'entrée principal."""
    print("==> Démarrage du seed Nova V2...")
    db = SessionLocal()
    try:
        cleanup_old_demo_data(db)
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