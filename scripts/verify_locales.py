import json
import collections

REAL_DIR = "/mnt/project"
OUT_DIR = "/mnt/user-data/outputs/odin-consolidated/messages"
LOCALES = ["en", "ru", "th", "zh"]


def flatten(d, prefix=""):
    keys = set()
    for k, v in d.items():
        p = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten(v, p)
        else:
            keys.add(p)
    return keys


def check_duplicate_keys(path):
    """Raises if the raw JSON text has duplicate keys within any object
    (Python's json module silently keeps the last value on duplicates, so
    this checks the raw structure explicitly rather than trusting a parse)."""
    dupes = []

    def hook(pairs):
        seen = collections.Counter(k for k, _ in pairs)
        for k, count in seen.items():
            if count > 1:
                dupes.append(k)
        return dict(pairs)

    with open(path, encoding="utf-8") as f:
        json.loads(f.read(), object_pairs_hook=hook)
    return dupes


print("=" * 70)
print("1. JSON VALIDITY + DUPLICATE KEY CHECK (output files)")
print("=" * 70)
parsed = {}
for locale in LOCALES:
    path = f"{OUT_DIR}/{locale}.json"
    try:
        dupes = check_duplicate_keys(path)
        with open(path, encoding="utf-8") as f:
            parsed[locale] = json.load(f)
        status = "VALID, no duplicate keys" if not dupes else f"VALID JSON but DUPLICATE KEYS: {dupes}"
        print(f"  {locale}.json: {status}")
    except json.JSONDecodeError as e:
        print(f"  {locale}.json: INVALID JSON — {e}")

print()
print("=" * 70)
print("2. FLATTENED KEY-PARITY ACROSS ALL FOUR LOCALES")
print("=" * 70)
flat = {locale: flatten(parsed[locale]) for locale in LOCALES}
all_keys = set()
for s in flat.values():
    all_keys |= s

mismatches = 0
for key in sorted(all_keys):
    present_in = [locale for locale in LOCALES if key in flat[locale]]
    if len(present_in) != len(LOCALES):
        mismatches += 1
        missing_from = [locale for locale in LOCALES if locale not in present_in]
        print(f"  MISMATCH: '{key}' missing from: {missing_from}")

if mismatches == 0:
    print(f"  All {len(all_keys)} keys present in all 4 locales. Exact parity confirmed.")
else:
    print(f"  {mismatches} key(s) out of parity.")

print()
print("=" * 70)
print("3. CONFIRM NO EXISTING NAMESPACE DISAPPEARED (output vs real file)")
print("=" * 70)
for locale in LOCALES:
    with open(f"{REAL_DIR}/{locale}.json", encoding="utf-8") as f:
        real = json.load(f)
    real_top = set(real.keys())
    out_top = set(parsed[locale].keys())
    missing = real_top - out_top
    if missing:
        print(f"  {locale}.json: MISSING TOP-LEVEL NAMESPACES vs real file: {missing}")
    else:
        print(f"  {locale}.json: all {len(real_top)} real top-level namespaces present ({sorted(real_top)})")

    # Also confirm every existing (non-booking) real key's VALUE is byte-identical
    # (i.e. we truly didn't rewrite/translate anything that already existed).
    def flatten_kv(d, prefix=""):
        out = {}
        for k, v in d.items():
            p = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                out.update(flatten_kv(v, p))
            else:
                out[p] = v
        return out

    real_flat = flatten_kv(real)
    out_flat = flatten_kv(parsed[locale])
    changed = [k for k in real_flat if k in out_flat and real_flat[k] != out_flat[k]]
    if changed:
        print(f"    VALUE CHANGED for existing keys (should be empty!): {changed}")
    else:
        print(f"    All {len(real_flat)} pre-existing key values byte-identical to the real file.")

print()
print("=" * 70)
print("4. EXPECTED NEW BOOKING NAMESPACES PRESENT (spot check, en)")
print("=" * 70)
en_booking = parsed["en"]["booking"]
for section in ["steps", "fields", "actions", "review", "success", "errors"]:
    print(f"  booking.{section}: {'present' if section in en_booking else 'MISSING'}"
          f" ({len(en_booking.get(section, {}))} keys)" if section in en_booking else "")
