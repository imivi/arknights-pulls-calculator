"""
This script simulates how much orundum is gained from fortune strips during N events
"""

import random
from time import time


FORTUNE_STRIP_VALUES = [200, 300, 400, 500, 600, 800]
DAYS = 14
RUNS = 1_000_000


def draw(draws: int) -> int:
    """Get the total orundum from N strips drawn"""
    orundums = [random.choice(FORTUNE_STRIP_VALUES) for _ in range(draws)]
    return max(orundums)


def simulate() -> int:
    """Pull fortune strips for the entire duration of the event"""
    total_orundum = 0
    extra_strip = False

    for _ in range(DAYS):
        orundum = draw(3 if extra_strip else 2)
        total_orundum += orundum
        extra_strip = orundum < 400

    return total_orundum


total_orundum = 0

start_time = time()
for _ in range(RUNS):
    total_orundum += simulate()
seconds_elapsed = round(time() - start_time, 1)

print(f"Executed {RUNS} runs in {seconds_elapsed}s")
print("Average orundum/run:", round(total_orundum / RUNS))
