import requests
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

def get_location_from_ip(ip_address: str) -> Optional[Dict]:
    """
    Get location data from an IP address using ip-api.com (free for development).
    In production, use a paid service like MaxMind or ipinfo.io.
    """
    if not ip_address or ip_address in ("127.0.0.1", "::1"):
        return None
        
    try:
        response = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                return {
                    "city": data.get("city"),
                    "region": data.get("regionName"),
                    "country": data.get("country"),
                    "country_code": data.get("countryCode"),
                    "latitude": data.get("lat"),
                    "longitude": data.get("lon"),
                    "ip_address": ip_address
                }
    except Exception as e:
        logger.error(f"Error fetching location for IP {ip_address}: {e}")
        
    return None

def parse_user_agent(ua_string: str) -> Dict:
    """
    Basic user agent parsing. In production, use 'user-agents' or 'ua-parser' library.
    """
    ua_string = ua_string.lower()
    device_type = "desktop"
    if "mobile" in ua_string:
        device_type = "mobile"
    elif "tablet" in ua_string or "ipad" in ua_string:
        device_type = "tablet"
        
    os = "Unknown"
    if "windows" in ua_string:
        os = "Windows"
    elif "android" in ua_string:
        os = "Android"
    elif "iphone" in ua_string or "ipad" in ua_string:
        os = "iOS"
    elif "macintosh" in ua_string:
        os = "macOS"
    elif "linux" in ua_string:
        os = "Linux"
        
    browser = "Other"
    if "chrome" in ua_string:
        browser = "Chrome"
    elif "safari" in ua_string:
        browser = "Safari"
    elif "firefox" in ua_string:
        browser = "Firefox"
    elif "edge" in ua_string:
        browser = "Edge"
        
    return {
        "device_type": device_type,
        "os": os,
        "browser": browser,
        "user_agent": ua_string
    }
