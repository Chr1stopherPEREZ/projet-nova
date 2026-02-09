"""
Tests pour le worker de check déterministe (LOT 4).
"""
import pytest
from sqlalchemy.orm import Session

from app.models.watch import Watch, WatchStatus, StockState
from app.models.watch_check import WatchCheck
from app.services.check_engine import load_fixture, analyze_fixture, run_check, FIXTURES_DIR


class TestFixtureLoading:
    """Tests pour le chargement des fixtures."""

    def test_load_existing_fixture(self):
        """Charge une fixture existante."""
        content = load_fixture("in_stock.html")
        assert content is not None
        assert len(content) > 0
        assert b"ADD_TO_CART" in content

    def test_load_out_of_stock_fixture(self):
        """Charge la fixture out_of_stock."""
        content = load_fixture("out_of_stock.html")
        assert content is not None
        assert b"ADD_TO_CART" not in content

    def test_load_nonexistent_fixture_raises(self):
        """Erreur si fixture inexistante."""
        with pytest.raises(FileNotFoundError):
            load_fixture("nonexistent.html")


class TestAnalyzeFixture:
    """Tests pour l'analyse déterministe des fixtures."""

    def test_in_stock_fixture_returns_in_stock(self):
        """Fixture avec ADD_TO_CART => IN_STOCK."""
        content = load_fixture("in_stock.html")
        stock_state, http_status = analyze_fixture(content, "in_stock.html")
        
        assert stock_state == StockState.IN_STOCK
        assert http_status == 200

    def test_out_of_stock_fixture_returns_out_of_stock(self):
        """Fixture sans ADD_TO_CART => OUT_OF_STOCK."""
        content = load_fixture("out_of_stock.html")
        stock_state, http_status = analyze_fixture(content, "out_of_stock.html")
        
        assert stock_state == StockState.OUT_OF_STOCK
        assert http_status == 200

    def test_determinism_same_fixture_same_result(self):
        """Déterminisme: même fixture => même résultat."""
        content = load_fixture("in_stock.html")
        
        result1 = analyze_fixture(content, "in_stock.html")
        result2 = analyze_fixture(content, "in_stock.html")
        result3 = analyze_fixture(content, "in_stock.html")
        
        assert result1 == result2 == result3
        assert result1[0] == StockState.IN_STOCK
        assert result1[1] == 200


class TestRunCheck:
    """Tests pour l'exécution d'un check avec persistance DB."""

    def test_run_check_creates_watch_check(self, db_session: Session):
        """run_check crée une ligne dans watch_checks."""
        # Créer une watch de test
        from app.models.user import User
        from app.core.security import hash_password
        
        user = User(
            email="test-worker@nova.dev",
            password_hash=hash_password("Test12345!"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        watch = Watch(
            user_id=user.id,
            original_url="https://example.com/product",
            normalized_url="example.com/product",
            watch_status=WatchStatus.ACTIVE,
        )
        db_session.add(watch)
        db_session.commit()
        db_session.refresh(watch)
        
        # Compter les checks avant
        count_before = db_session.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).count()
        assert count_before == 0
        
        # Exécuter le check
        check, _, _ = run_check(db_session, watch, "in_stock.html", commit=True)
        
        # Vérifier qu'un check a été créé
        count_after = db_session.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).count()
        assert count_after == 1
        
        # Vérifier les données du check
        assert check.watch_id == watch.id
        assert check.stock_state == StockState.IN_STOCK.value
        assert check.http_status == 200
        assert check.fetch_mode == "FIXTURE"

    def test_run_check_updates_watch_state(self, db_session: Session):
        """run_check met à jour l'état de la watch."""
        from app.models.user import User
        from app.core.security import hash_password
        
        user = User(
            email="test-worker2@nova.dev",
            password_hash=hash_password("Test12345!"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        watch = Watch(
            user_id=user.id,
            original_url="https://example.com/product2",
            normalized_url="example.com/product2",
            watch_status=WatchStatus.ACTIVE,
            stock_state=StockState.UNKNOWN,
        )
        db_session.add(watch)
        db_session.commit()
        db_session.refresh(watch)
        
        # État initial
        assert watch.stock_state == StockState.UNKNOWN
        assert watch.last_checked_at is None
        
        # Exécuter le check
        run_check(db_session, watch, "in_stock.html", commit=True)
        db_session.refresh(watch)
        
        # L'état de la watch est mis à jour
        assert watch.stock_state == StockState.IN_STOCK
        assert watch.last_checked_at is not None

    def test_determinism_multiple_runs_same_result(self, db_session: Session):
        """Déterminisme: plusieurs runs => même résultat stock_state."""
        from app.models.user import User
        from app.core.security import hash_password
        
        user = User(
            email="test-worker3@nova.dev",
            password_hash=hash_password("Test12345!"),
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        watch = Watch(
            user_id=user.id,
            original_url="https://example.com/product3",
            normalized_url="example.com/product3",
            watch_status=WatchStatus.ACTIVE,
        )
        db_session.add(watch)
        db_session.commit()
        db_session.refresh(watch)
        
        # Exécuter plusieurs checks avec la même fixture
        check1, _, _ = run_check(db_session, watch, "in_stock.html", commit=True)
        check2, _, _ = run_check(db_session, watch, "in_stock.html", commit=True)
        
        # Les deux checks ont le même résultat
        assert check1.stock_state == check2.stock_state == StockState.IN_STOCK.value
        assert check1.http_status == check2.http_status == 200

# Test_worker.py