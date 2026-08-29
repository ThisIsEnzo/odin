import json
import collections

OUT_DIR = "/mnt/user-data/outputs/odin-consolidated/messages"
LOCALES = ["en", "ru", "th", "zh"]

NEW_LOCATION_KEYS = {
    "en": {
        "mapPlaceholder": "Map preview coming soon",
        "openInMaps": "Open in Google Maps",
    },
    "ru": {
        "mapPlaceholder": "Предпросмотр карты появится позже",
        "openInMaps": "Открыть в Google Картах",
    },
    "th": {
        "mapPlaceholder": "ตัวอย่างแผนที่จะเปิดให้บริการเร็วๆ นี้",
        "openInMaps": "เปิดใน Google Maps",
    },
    "zh": {
        "mapPlaceholder": "\u5730\u56fe\u9884\u89c8\u5373\u5c06\u63a8\u51fa",
        "openInMaps": "\u5728 Google \u5730\u56fe\u4e2d\u6253\u5f00",
    },
}

for locale in LOCALES:
    path = f"{OUT_DIR}/{locale}.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f, object_pairs_hook=collections.OrderedDict)

    if "location" not in data:
        raise RuntimeError(f"{locale}.json has no 'location' namespace — unexpected, stopping.")

    added = []
    for key, val in NEW_LOCATION_KEYS[locale].items():
        if key not in data["location"]:
            data["location"][key] = val
            added.append(key)
        else:
            print(f"  {locale}.json: 'location.{key}' already exists — left untouched")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{locale}.json: added {added}")
