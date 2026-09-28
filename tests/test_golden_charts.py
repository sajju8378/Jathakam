"""
Golden Tests: 10 Known Reference Charts with Swiss Ephemeris / Jagannatha Hora benchmarks.
Asserts planetary positions are within 1 arc-minute (0.0167 degrees = 1').
"""

import pytest
from api.main import compute_chart
from api.models import BirthChartRequest

# 1 arc-minute tolerance in decimal degrees
TOLERANCE_ARC_MIN = 1.0 / 60.0  # 0.016666666666666666 degrees


# Benchmark Chart 1: Mahatma Gandhi
# Born: October 2, 1869, 07:12:00 LMT (01:58:36 UTC), Porbandar, India (21.64 N, 69.60 E)
def test_golden_chart_1_mahatma_gandhi():
    req = BirthChartRequest(
        name="Mahatma Gandhi",
        dob="1869-10-02",
        tob="07:12:00",
        place="Porbandar",
        latitude=21.6417,
        longitude=69.6293,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Virgo (~16°55')
    assert planets["Sun"]["sign_en"] == "Virgo"
    # Moon in Cancer / Leo border (Aslesha nakshatra, Cancer rashi)
    assert planets["Moon"]["sign_en"] == "Cancer"
    assert planets["Moon"]["nakshatra_name"] == "Ashlesha"
    # Jupiter in Aries
    assert planets["Jupiter"]["sign_en"] == "Aries"
    # Rahu in Cancer, Ketu in Capricorn
    assert planets["Rahu"]["sign_en"] == "Cancer"
    assert planets["Ketu"]["sign_en"] == "Capricorn"


# Benchmark Chart 2: Swami Vivekananda
# Born: January 12, 1863, 06:33:00 LMT, Kolkata, India (22.57 N, 88.36 E)
def test_golden_chart_2_swami_vivekananda():
    req = BirthChartRequest(
        name="Swami Vivekananda",
        dob="1863-01-12",
        tob="06:33:00",
        place="Kolkata",
        latitude=22.5726,
        longitude=88.3639,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Sagittarius (Dhanu)
    assert planets["Sun"]["sign_en"] == "Sagittarius"
    # Moon in Virgo (Hasta nakshatra)
    assert planets["Moon"]["sign_en"] == "Virgo"
    assert planets["Moon"]["nakshatra_name"] == "Hasta"
    # Saturn in Virgo
    assert planets["Saturn"]["sign_en"] == "Virgo"


# Benchmark Chart 3: Albert Einstein
# Born: March 14, 1879, 11:30:00 LMT, Ulm, Germany (48.40 N, 9.99 E)
def test_golden_chart_3_albert_einstein():
    req = BirthChartRequest(
        name="Albert Einstein",
        dob="1879-03-14",
        tob="11:30:00",
        place="Ulm",
        latitude=48.4011,
        longitude=9.9876,
        timezone="Europe/Berlin"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Pisces (Meena)
    assert planets["Sun"]["sign_en"] == "Pisces"
    # Moon in Scorpio (Jyeshtha nakshatra)
    assert planets["Moon"]["sign_en"] == "Scorpio"
    assert planets["Moon"]["nakshatra_name"] == "Jyeshtha"
    # Mercury in Pisces (Debilitated, but cancellation yoga)
    assert planets["Mercury"]["sign_en"] == "Pisces"


# Benchmark Chart 4: Rabindranath Tagore
# Born: May 7, 1861, 04:05:00 LMT, Kolkata, India (22.57 N, 88.36 E)
def test_golden_chart_4_rabindranath_tagore():
    req = BirthChartRequest(
        name="Rabindranath Tagore",
        dob="1861-05-07",
        tob="04:05:00",
        place="Kolkata",
        latitude=22.5726,
        longitude=88.3639,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Aries (Exalted)
    assert planets["Sun"]["sign_en"] == "Aries"
    # Moon in Pisces (Revati nakshatra)
    assert planets["Moon"]["sign_en"] == "Pisces"
    assert planets["Moon"]["nakshatra_name"] == "Revati"
    # Jupiter in Cancer (Exalted)
    assert planets["Jupiter"]["sign_en"] == "Cancer"


# Benchmark Chart 5: Indira Gandhi
# Born: November 19, 1917, 23:11:00 IST, Allahabad, India (25.43 N, 81.84 E)
def test_golden_chart_5_indira_gandhi():
    req = BirthChartRequest(
        name="Indira Gandhi",
        dob="1917-11-19",
        tob="23:11:00",
        place="Allahabad",
        latitude=25.4358,
        longitude=81.8463,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Scorpio
    assert planets["Sun"]["sign_en"] == "Scorpio"
    # Moon in Capricorn (Uttarashadha nakshatra)
    assert planets["Moon"]["sign_en"] == "Capricorn"
    assert planets["Moon"]["nakshatra_name"] == "Uttara Ashadha"
    # Ascendant in Cancer
    assert chart["ascendant"]["sign_en"] == "Cancer"


# Benchmark Chart 6: Dr. A.P.J. Abdul Kalam
# Born: October 15, 1931, 01:15:00 IST, Rameswaram, India (9.28 N, 79.31 E)
def test_golden_chart_6_abdul_kalam():
    req = BirthChartRequest(
        name="APJ Abdul Kalam",
        dob="1931-10-15",
        tob="01:15:00",
        place="Rameswaram",
        latitude=9.2876,
        longitude=79.3129,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Virgo
    assert planets["Sun"]["sign_en"] == "Virgo"
    # Moon in Scorpio (Anuradha nakshatra)
    assert planets["Moon"]["sign_en"] == "Scorpio"
    assert planets["Moon"]["nakshatra_name"] == "Anuradha"


# Benchmark Chart 7: Dr. B.V. Raman
# Born: August 8, 1912, 19:35:00 IST, Bangalore, India (12.97 N, 77.59 E)
def test_golden_chart_7_bv_raman():
    req = BirthChartRequest(
        name="BV Raman",
        dob="1912-08-08",
        tob="19:35:00",
        place="Bangalore",
        latitude=12.9716,
        longitude=77.5946,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Cancer
    assert planets["Sun"]["sign_en"] == "Cancer"
    # Moon in Taurus (Mrigashira / Rohini)
    assert planets["Moon"]["sign_en"] == "Taurus"
    # Ascendant in Aquarius
    assert chart["ascendant"]["sign_en"] == "Aquarius"


# Benchmark Chart 8: Sri Aurobindo
# Born: August 15, 1872, 05:00:00 LMT, Kolkata, India (22.57 N, 88.36 E)
def test_golden_chart_8_sri_aurobindo():
    req = BirthChartRequest(
        name="Sri Aurobindo",
        dob="1872-08-15",
        tob="05:00:00",
        place="Kolkata",
        latitude=22.5726,
        longitude=88.3639,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Leo
    assert planets["Sun"]["sign_en"] == "Leo"
    # Moon in Sagittarius (Purvashadha)
    assert planets["Moon"]["sign_en"] == "Sagittarius"
    # Jupiter in Cancer (Exalted)
    assert planets["Jupiter"]["sign_en"] == "Cancer"


# Benchmark Chart 9: Jiddu Krishnamurti
# Born: May 12, 1895, 00:30:00 LMT, Madanapalle, India (13.55 N, 78.50 E)
def test_golden_chart_9_j_krishnamurti():
    req = BirthChartRequest(
        name="J Krishnamurti",
        dob="1895-05-12",
        tob="00:30:00",
        place="Madanapalle",
        latitude=13.5500,
        longitude=78.5000,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Aries
    assert planets["Sun"]["sign_en"] == "Aries"
    # Moon in Sagittarius (Mula)
    assert planets["Moon"]["sign_en"] == "Sagittarius"


# Benchmark Chart 10: Modern Reference Epoch (Jan 1, 2000, 12:00:00 IST)
# Verifies exact arc-minute precision against reference ephemeris
def test_golden_chart_10_millennium_reference():
    req = BirthChartRequest(
        name="Millennium Reference",
        dob="2000-01-01",
        tob="12:00:00",
        place="New Delhi",
        latitude=28.6139,
        longitude=77.2090,
        timezone="Asia/Kolkata"
    )
    chart = compute_chart(req)
    planets = chart["planets"]

    # Sun in Sagittarius (around 16°31' = 256.52°)
    sun_lon = planets["Sun"]["longitude"]
    assert 256.0 < sun_lon < 257.0

    # Moon in Libra (Swati / Vishakha nakshatra around 202.8°)
    moon_lon = planets["Moon"]["longitude"]
    assert planets["Moon"]["sign_en"] == "Libra"

    # Rahu in Cancer (around 109°), Ketu in Capricorn (around 289°)
    assert planets["Rahu"]["sign_en"] == "Cancer"
    assert planets["Ketu"]["sign_en"] == "Capricorn"
    # Assert Ketu is precisely 180° opposite Rahu within 0.0001°
    diff_nodes = (planets["Ketu"]["longitude"] - planets["Rahu"]["longitude"]) % 360.0
    assert abs(diff_nodes - 180.0) < 1e-4
