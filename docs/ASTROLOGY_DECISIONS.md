# Astrological Conventions & Computational Decisions (JyotishVeda)

This document details the mathematical, astronomical, and traditional astrological rationale underlying all conventions adopted in the JyotishVeda engine.

---

## 1. Zodiac and Ayanamsa

### Default: Lahiri (Chitra Paksha)
- **Rationale**: The Lahiri ayanamsa (Chitra Paksha) is the official astronomical standard adopted by the Calendar Reform Committee (Government of India, 1952) and recognized by major astrological institutions worldwide. It defines the sidereal zero point such that the star Spica (Chitra, $\alpha$ Virginis) lies precisely at the center of Chitra Nakshatra at $180^\circ 00' 00''$ (opposite $0^\circ$ Aries / Mesha).
- **Alternative Options Supported**:
  - **KP (Krishnamurti Paddhati)**: Uses the Newcomb precession constant with a slight zero-year difference ($1900$ vs $285$ AD), resulting in approximately $6'$ difference from Lahiri. Essential for KP sub-lord analysis.
  - **B.V. Raman**: Based on Dr. B.V. Raman's research, placing the zero-year around $397$ AD, yielding an ayanamsa approximately $1^\circ 25'$ lower than Lahiri.

---

## 2. House System (Bhava Chalit)

### Default: Whole Sign (Rashi Bhava)
- **Rationale**: In classical Maharishi Parashara's *Brihat Parashara Hora Shastra* (BPHS), the basic and most authoritative house system is the Whole Sign system. The sign containing the Ascendant (Lagna) constitutes the entire 1st house ($1^\circ$ to $30^\circ$ of that sign), the subsequent sign is the 2nd house, and so on.
- **Alternative Options Supported**:
  - **Equal House**: Houses are $30^\circ$ spans beginning from the exact degree and minute of the Ascendant.
  - **Sripati (Porphyry/Sripathi)**: Based on the ancient Sanskrit astronomer Sripati Bhatta. The Midheaven (MC) and Ascendant define the quadrant vertices, which are trisected into three equal portions. The calculated cusp represents the **Bhava Madhya** (midpoint of the house).

---

## 3. Lunar Nodes (Rahu and Ketu)

### Default: Mean Node
- **Rationale**: The Mean Node represents the mathematically smoothed orbit of the lunar nodes. It moves strictly in retrograde motion without erratic forward oscillations. Most traditional ephemerides (including Lahiri Rashtriya Panchang) use Mean Nodes for natal astrology.
- **Alternative Option Supported**:
  - **True Node**: The instantaneous, oscillating point of intersection of the Moon's orbital plane with the ecliptic. Can turn direct for brief intervals.
- **Ketu Position**: Ketu is astronomically defined as exactly $180^\circ 00' 00''$ opposite Rahu:
  $$\lambda_{\text{Ketu}} = (\lambda_{\text{Rahu}} + 180^\circ) \pmod{360^\circ}$$

---

## 4. Vimshottari Dasha Engine

### Year Length
- We use the astronomical solar tropical/equinoctial year length of **$365.2425$ days** (Gregorian calendar standard) for date mapping:
  $$\text{Duration (days)} = \text{Duration (years)} \times 365.2425$$
- This prevents the cumulative multi-year drift that occurs with the $360$-day Savana year convention.

### Balance of Birth Dasha
- The starting Mahadasha lord is determined by the Moon's nakshatra.
- The balance remaining at birth is computed from the unelapsed fraction of the nakshatra:
  $$\text{Fraction Remaining} = 1.0 - \frac{\lambda_{\text{Moon}} \pmod{13^\circ 20'}}{13^\circ 20'}$$
  $$\text{Balance (years)} = \text{Fraction Remaining} \times \text{Lord's Total Years}$$

### Antardasha (Sub-period) Formula
- Each Mahadasha of $M$ years is divided into 9 Antardashas of lord $A$ (total period $P_A$ years):
  $$\text{Duration of Antardasha (years)} = \frac{M \times P_A}{120}$$

---

## 5. Divisional Charts (Vargas)

- **D1 (Rashi)**: Primary natal chart ($30^\circ$ per division).
- **D9 (Navamsa)**: $3^\circ 20'$ per division ($9$ parts per sign):
  - Movable signs ($1, 4, 7, 10$): count begins from the sign itself.
  - Fixed signs ($2, 5, 8, 11$): count begins from the $9^{\text{th}}$ sign from the sign.
  - Dual signs ($3, 6, 9, 12$): count begins from the $5^{\text{th}}$ sign from the sign.
  - Maps continuously to the 108 nakshatra padas.
- **D10 (Dasamsa)**: $3^\circ 00'$ per division ($10$ parts per sign):
  - Odd signs: count begins from the sign itself.
  - Even signs: count begins from the $9^{\text{th}}$ sign from the sign.
- **Generic Engine**: Supports D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa), D7 (Saptamsa), D12 (Dwadasamsa), D16, D20, D24, D27, D30, and D60.

---

## 6. Yogas and Doshas

### Manglik (Kuja) Dosha & Cancellation
- **Criteria**: Mars situated in houses $1, 2, 4, 7, 8,$ or $12$ evaluated from:
  1. Lagna (Ascendant)
  2. Chandra Lagna (Moon)
  3. Shukra Lagna (Venus)
- **Authentic Parashari Cancellations (Bhanga)**:
  - Mars in Aries in 1st house, Scorpio in 4th, Capricorn in 7th, Sagittarius/Pisces in 8th, or Taurus/Libra in 12th.
  - Mars in own sign ($1, 8$) or exalted sign ($10$).
  - Mars conjunct or receiving full aspect from benefic Jupiter or Moon.

### Kaal Sarp Dosha
- Formed when all 7 classical planets (Sun through Saturn) fall on one side of the nodal axis between Rahu and Ketu.
- Classified into 12 traditional types based on Rahu's house (1st: Anant, 2nd: Kulik, 3rd: Vasuki, 4th: Shankhapal, 5th: Padma, 6th: Mahapadma, 7th: Takshak, 8th: Karkotak, 9th: Shankhachood, 10th: Ghatak, 11th: Vishdhar, 12th: Sheshnag).

### Sade Sati & Dhaiya
- Calculated using real-time Swiss Ephemeris transit positions of Saturn relative to the natal Moon sign:
  - 12th from Moon: First Phase (Rising / Charana Shani).
  - 1st (conjunction): Peak Phase (Janma / Hridaya Shani).
  - 2nd from Moon: Final Phase (Setting / Paada Shani).
  - 4th from Moon: Kantaka Shani ($2.5$ year Dhaiya).
  - 8th from Moon: Ashtama Shani ($2.5$ year Dhaiya).

---

## 7. Kundli Matching (Ashtakoota 36 Guna Milan)

| Koota | Max Points | Ruled Aspect | Evaluation Rules |
| :--- | :---: | :--- | :--- |
| **Varna** | 1 | Spiritual compatibility | Brahmin ($4$), Kshatriya ($3$), Vaishya ($2$), Shudra ($1$). Boy $\ge$ Girl. |
| **Vashya** | 2 | Mutual dominance & magnetic harmony | Chatushpada, Manava, Jalachara, Vanachara, Keeta. |
| **Tara** | 3 | Longevity & destiny | 9 Taras counted mutually: Sampat, Kshema, Sadhana, Mitra, Parama Mitra. |
| **Yoni** | 4 | Biological intimacy | 14 Animal Yonis with strict avoidance of sworn enemies (Cat-Rat, Cow-Tiger, etc.). |
| **Graha Maitri** | 5 | Psychological rapport | Friendship between rulers of the Moon signs. |
| **Gana** | 6 | Temperament | Deva (Divine), Manushya (Human), Rakshasa (Fiery/Demonic). |
| **Bhakoot** | 7 | Emotional welfare & prosperity | Relative house distance. Avoids $2/12$ (Dwirdwadash), $6/8$ (Shadashtak), $9/5$ (Navapancham) unless cancelled by common ruler or mutual friendship. |
| **Nadi** | 8 | Genetic health & progeny | Adi (Vata), Madhya (Pitta), Antya (Kapha). Mismatch gives $8$ pts; same Nadi causes Nadi Dosha unless cancelled. |

**Qualification Threshold**: A minimum of $18 / 36$ points is required for a favorable match.

---

## 8. Data Privacy (India DPDP Act 2023)

- **Personal Data**: Birth details (timestamp + geolocation) are processed ephemerally.
- **No Raw Logging**: Server logs omit raw user birth timestamps and coordinates.
- **Right to Erasure**: Endpoint `POST /v1/privacy/delete` allows users to purge all stored charts and cached sessions.
