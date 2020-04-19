from datetime import datetime, date
import re
from collections import Counter
import json
from typing import Dict, List, Optional
import typing

from mypy_extensions import TypedDict

UNCONDITIONAL = "Unconditional"
CONDITIONAL = "Conditional"
REFUSED = "Refused"
NA = "N/A"


class DataHandler:

    def __init__(self):
        self._refused_count = Counter()
        self._uncond_count = Counter()
        self._cond_count = Counter()

    def _count_words(self, description: str, counter: Counter):
        for char in "-.,\n":
            description = description.replace(char, ' ')
        description = re.sub(r'[^a-z]+', ' ', description.lower())
        counter.update(Counter(description.split()))

    def _word_count(self, counter: Counter):
        return [(word, count) for (word, count) in counter.most_common(100) if len(word) > 3]

    @property
    def words_counts(self):
        return {
            REFUSED: self._word_count(self._refused_count),
            CONDITIONAL: self._word_count(self._cond_count),
            UNCONDITIONAL: self._word_count(self._uncond_count)
        }

    def handle_point(self, point: Dict, desc: str):
        dec = point["decision"]
        if dec == REFUSED:
            self._count_words(desc, self._refused_count)
        if dec == CONDITIONAL:
            self._count_words(desc, self._cond_count)
        if dec == UNCONDITIONAL:
            self._count_words(desc, self._uncond_count)


Output = Dict[int, Dict[int, List[dict]]]


def open_data(filename: str, *args, **kwargs):
    return open(f"public/data/{filename}", *args, **kwargs)


def write_small_geojson():
    with open_data("plans.geojson", "r") as plan_file:
        plans: Dict = json.load(plan_file)
        with open_data("small.geojson", "w") as small_file:
            json.dump({key: (val if key != "features" else val[::500]) for (key, val) in plans.items()},
                      small_file,
                      indent=2)


def clean_decision(decision: str):
    uppered = decision.upper()
    search_keyword = lambda words: any((word in uppered for word in words))
    if search_keyword(["GRANT", "UNCONDITIONAL"]):
        if search_keyword(["REFUSE"]):
            return CONDITIONAL
        return UNCONDITIONAL
    if search_keyword(["CONDITIONAL"]) or uppered == "C":
        return CONDITIONAL
    if search_keyword(["REFUSE", "INVALID"]) or uppered == "R":
        return REFUSED
    raise Exception("Couldn't parse decision")


def create_point(feature: Dict, handler: DataHandler) -> Optional[dict]:
    try:
        geom = feature.get("geometry")
        if not geom or geom["type"] != "Polygon":
            return None
        coord = geom["coordinates"][0][0]
        props = feature["properties"]
        point = {
            "name": props["DevelopmentAddress"] or "none",
            "lon": coord[0],
            "lat": coord[1],
            "date": datetime.fromisoformat(props["ReceivedDate"][:-1]).date(),
            "decision": clean_decision(props.get("Decision") or ""),
            "authority": (props.get("PlanningAuthority") or "").upper(),
        }
        handler.handle_point(point, props["DevelopmentDescription"])
        return point
    except Exception as e:
        return None


def create_points(data: dict, handler: DataHandler) -> Output:
    points = []
    for feature in data["features"]:
        point = create_point(feature, handler)
        if point:
            points.append(point)
    return sort_points(points)


def sort_points(points: List[dict]) -> Output:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    sorted_points: Output = {}

    def getOrCreateYear(d: Dict, year):
        if d.get(year) is None:
            d[year] = {month: [] for month in months}
        return d[year]

    for point in points:
        point_date: date = point["date"]
        if 2010 < point_date.year <= 2020: # Some junk dates present
            year = getOrCreateYear(sorted_points, point_date.year)
            year[months[point_date.month - 1]].append(point)
    return sorted_points


def write_output(points):
    with open_data("points.json", "w") as output:
        json.dump(points, output, default=str, sort_keys=True)


if __name__ == "__main__":
    # write_small_geojson()
    with open_data("plans.geojson", "r") as data_file:
        handler = DataHandler()
        points = create_points(json.load(data_file), handler)
        output = {"points": points, "words": handler.words_counts}
        write_output(output)
