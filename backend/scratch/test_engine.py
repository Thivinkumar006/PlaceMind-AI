from sqlalchemy import create_engine
import sys

def try_engine(url):
    try:
        create_engine(url)
        print(f"SUCCESS: {repr(url)}")
    except Exception as e:
        print(f"FAIL: {repr(url)} -> {type(e).__name__}: {e}")

try_engine("")
try_engine("   ")
try_engine('""')
try_engine("postgresql://user:pass@host/db ")
try_engine(" postgresql://user:pass@host/db")
