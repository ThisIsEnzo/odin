import json
import sys

LOCALES = ["en", "ru", "th", "zh"]


def flatten(d, prefix=""):
    keys = set()
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys |= flatten(v, full)
        else:
            keys.add(full)
    return keys


def main():
    data = {}
    for loc in LOCALES:
        with open(f"messages/{loc}.json", encoding="utf-8") as f:
            data[loc] = json.load(f)

    key_sets = {loc: flatten(data[loc]) for loc in LOCALES}
    base = key_sets["en"]
    ok = True
    for loc in LOCALES[1:]:
        missing = base - key_sets[loc]
        extra = key_sets[loc] - base
        if missing or extra:
            ok = False
            print(f"[{loc}] MISMATCH")
            for k in sorted(missing):
                print(f"  missing in {loc}: {k}")
            for k in sorted(extra):
                print(f"  extra in {loc}:   {k}")
    if ok:
        print(f"OK — {len(base)} keys, identical across {LOCALES}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
