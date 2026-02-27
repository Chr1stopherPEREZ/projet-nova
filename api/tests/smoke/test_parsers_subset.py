from app.services.nike_parser import is_nike_url, extract_next_data
from app.services.shopify_parser import is_shopify_url

class TestParsersSubset:
    """Pack de tests Parsers (Check Engine) Lot 9."""

    def test_nike_url_detection(self):
        """Détecte correctement les URLs Nike."""
        assert is_nike_url("https://www.nike.com/fr/t/chaussures-air-max") is True
        assert is_nike_url("https://www.adidas.com/product") is False

    def test_shopify_url_detection(self):
        """Détecte correctement les URLs Shopify."""
        assert is_shopify_url("https://mercredimaison.com/products/chaussures") is True
        assert is_shopify_url("https://google.com") is False

    def test_extract_next_data_valid(self):
        """Extrait correctement le JSON Nike __NEXT_DATA__."""
        html = '''
        <html>
        <head>
            <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"test": true}}}</script>
        </head>
        </html>
        '''
        data = extract_next_data(html)
        assert data is not None
        assert data["props"]["pageProps"]["test"] is True

    def test_extract_next_data_missing(self):
        """Retourne None si __NEXT_DATA__ absent."""
        html = '<html><body>No data</body></html>'
        data = extract_next_data(html)
        assert data is None

# Test_Parsers_Subset.py