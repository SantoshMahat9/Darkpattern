import asyncio
from app.extensions import celery, db
from app.models import Site, Capture, Screen, Annotation, TaxonomyCategory
from crawler.playwright.scraper import PlaywrightScraper
from ml.inference.predictor import DarkPatternPredictor
from urllib.parse import urlparse

@celery.task(name='tasks.perform_async_scan')
def perform_async_scan(url: str):
    """
    Celery background task performing full page scraping and ML dark pattern inference.
    """
    scraper = PlaywrightScraper(headless=True)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        scrape_result = loop.run_until_complete(scraper.scrape(url))
        interactive_nodes = scrape_result.get("interactive_nodes", [])
        
        predictor = DarkPatternPredictor()
        detections = predictor.predict_dom_nodes(interactive_nodes)
        
        domain = urlparse(url).netloc or "unknown"

        # Record scan in database
        site = Site.query.filter_by(domain=domain).first()
        if not site:
            site = Site(url=url, domain=domain, split='test')
            db.session.add(site)
            db.session.commit()

        capture = Capture(site_id=site.id)
        db.session.add(capture)
        db.session.commit()

        screen = Screen(
            capture_id=capture.id,
            url=url,
            viewport_width=1280,
            viewport_height=800
        )
        db.session.add(screen)
        db.session.commit()

        return {
            "status": "COMPLETED",
            "url": url,
            "detections_count": len(detections),
            "detections": detections
        }
    except Exception as e:
        return {
            "status": "FAILED",
            "url": url,
            "error": str(e)
        }
    finally:
        loop.close()
