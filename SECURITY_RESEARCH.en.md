# Pattern lock research and implementation - background for specialists

English · [日本語](SECURITY_RESEARCH.md)

This document lists the sources of the numbers used in this tool (PatternLock Security Trainer) and the conditions behind them. Papers were checked in their full text and the Android implementation in the AOSP source code; only values confirmed this way are included. Anything that could not be confirmed is marked as such.

Dots are numbered 0–8 (0 is the top left, left to right and top to bottom). Some papers number them 1–9, so take care when quoting.

---

## 1. The Android implementation

### 1.1 Pattern rules

- Trace a single stroke over the nine dots of a 3×3 grid. The minimum is four dots (`MIN_LOCK_PATTERN_SIZE = 4` in `LockPatternUtils`). Wrong attempts shorter than four dots are not counted as failures
- If you jump over a dot that is not used yet, it is added automatically (`detectAndAddHit` in `LockPatternView`). This applies to lines to a dot two away horizontally, vertically or diagonally; a knight move (two across and one down, for example) adds nothing. You can pass over a used dot
- These rules allow 389,112 patterns (1,624, 7,152, 26,016, 72,912, 140,704 and 140,704 for lengths 4 to 9). The count in this tool matches Table 2.1 of Løge (2015)

### 1.2 How old Android stored the pattern (4.4 to 5.1)

- `LockPatternUtils.patternToHash` turns each dot into one byte `row*3+column` (0–8, not a character) and takes an unsalted SHA-1. The code comment says “Not the most secure”
- The result was stored in `/data/system/gesture.key`. Anyone who can read the file recovers the pattern by looking it up in a SHA-1 table of all 389,112 patterns. Forensic tools (Andriller, the sch3m4 script and others) use this method
- From android-6.0.0_r1, the pattern is enrolled with Gatekeeper instead. An old gesture.key is checked once with SHA-1 and then migrated

### 1.3 Waits after failures

From android-7.0.0_r1, `system/gatekeeper/gatekeeper.cpp` (`ComputeRetryTimeout`, the same on main) returns the following waits depending on the total number of failures.

| Failures | Wait before the next try |
|---|---|
| 1–4, 6–9 | No wait |
| 5, 10 | 30 seconds |
| 11–29 | 30 seconds each |
| 30–139 | 30 seconds, doubled every 10 failures (about 8.5 hours for 130–139) |
| 140 and later | 24 hours each |

- With this table, only 111 tries per day, 139 per week and 162 in 30 days are possible on the device
- In android-6.0.0_r1, the wait stays at 30 seconds from the 11th failure (no doubling). The lock screen of android-5.1.1 and earlier waited 30 seconds after every 5 failures (`FAILED_ATTEMPTS_BEFORE_TIMEOUT = 5`, `FAILED_ATTEMPT_TIMEOUT_MS = 30000L`)
- On real devices, Gatekeeper runs inside the vendor’s trusted execution environment (TEE). The official documentation does not fix the wait values, and vendors can change them

### 1.4 How current Android stores the credential

- According to the official documentation (File-based encryption), the screen lock PIN, pattern or password is stretched with scrypt (aiming at about 25 ms and about 2 MiB) and bound to a secret in a secure chip or the TEE (Weaver, or Gatekeeper with a Keystore key), which protects the synthetic password that encrypts the user’s data
- The same documentation says scrypt alone does not add much security, and the real protection is the attempt limit enforced by hardware

---

## 2. How people choose

| Source | What was studied | Top left | Corner | Center | Length |
|---|---|---|---|---|---|
| Løge 2015 | 802 people, 3,393 patterns | 44% | 77% (sum of Table 5.6) | 4% | Average 5.40 dots for smartphones |
| Uellenbeck et al., 2013 | Real patterns (105 people) | 38% | 75% | 6% | Average 5.63 dots |
| Uellenbeck et al., 2013 | Game-style study | 43–44% | 78% | 2% | Average 6.59 dots (defensive) |

- Lengths in Løge (2015) (values in Figure 5.5(b)): 4 dots 36%, 5 dots 23%, 6 dots 12%, 7 dots 12%, 8 dots 4%, 9 dots 12%. The 100 most common patterns made up 42% of all patterns
- Start dots in Løge (2015) (Table 5.6): top left 44%, top 9%, top right 15%, left 6%, center 4%, right 2%, bottom left 14%, bottom 2%, bottom right 4%
- The partial guessing entropy in Uellenbeck et al. (2013) for defensive patterns is 8.72, 9.10 and 10.90 bits (to guess 10%, 20% and 50%), against 18.57 bits for a uniform choice. About 4% were guessed within 10 guesses and about 9% within 30 (about 7% and 19% for patterns made in the offensive setting)
- Aviv et al. (2015) report that 20 guesses found 15% of 3×3 and 19% of 4×4 patterns. There are 4,350,069,823,024 valid 4×4 patterns, but the patterns people chose were not much harder to guess

---

## 3. Attacks that observe the pattern

| Attack | Value | Conditions | Source |
|---|---|---|---|
| Smudge | Part revealed 92%, all revealed 68% | Photographs of screen smudges. 37% and 14% in the worst conditions | Aviv et al., 2010 |
| Shoulder surfing | 6-dot patterns with lines shown 64.2%, lines hidden 35.3%, 6-digit PINs 10.8% | One observation. 79.9%, 52.1% and 26.5% with several | Aviv et al., 2017 |
| Video | Over 95% within 5 attempts. On the first attempt, “complex” 97.5% and “simple” 60% | 120 patterns, filmed from 2 m away | Ye et al., 2017 |
| Thermal | Patterns without overlaps 100%, patterns with overlaps 16.67% | Within 30 seconds of entry, 18 participants | Abdelrahman et al., 2017 |

- For shoulder surfing, length had a large effect. The effects of intersections, knight moves and position were unclear (Aviv et al., 2017)
- In the video attack, patterns with a higher Sun et al. complexity were cracked on the first attempt more often (Ye et al., 2017). Making a shape look complex can backfire against some attacks
- Overlaps blur the heat trace, so they resist thermal attacks. Knight moves do not blur the heat trace of the dots (Abdelrahman et al., 2017)
- By this tool’s count, if every drawn line (without direction) is visible, 50.2% of all patterns are narrowed to one and 90.3% to two or fewer. If only the dots used are known, the median number of candidates is 20,944

---

## 4. Strength meters

- The strength of Sun et al. (2014) is PS = dots × log₂(line length + intersections + overlaps). The range over all patterns is 6.340–46.807 (as described with Equation 2.1 in Løge 2015). The original paper could not be read, so the formula was confirmed through Løge (2015), Ye et al. (2017) and Golla et al. (2019), which cite it
- The counting rules for intersections and overlaps follow Golla et al. (2019): an intersection includes a touch at a dot, and an overlap is a retraced segment. Counting all patterns with these rules reproduces the range 6.340–46.807
- In the group shown the meter of Song et al. (2015), the guesses needed to crack about 10% of patterns rose from 16 to 48 (101 patterns, confirmed in the abstract)
- Golla et al. (2019) report that strength estimates based on visual properties (length, intersections, overlaps and so on) correlate poorly with how easily patterns are actually guessed

---

## 5. How to protect

### Users

- Use more dots (this matters for both shoulder surfing and brute force)
- Do not start at the top left or a corner (common starts are the first guesses)
- Turn off “Make pattern visible” (shoulder surfing dropped from 64.2% to 35.3%)
- Where shoulder surfing is a concern, a PIN of 6 or more digits is also an option
- A more complex-looking shape is not always safer (the video attack)

### Developers

- Set a minimum length and make users wait after repeated failures (the Gatekeeper table)
- Store the pattern with a salted, slow hash and enforce the attempt limit in hardware. An unsalted SHA-1 is recovered with a table of all patterns
- If you add a strength meter, explain its limits to users
- Offer a setting that hides the drawn lines

---

## 6. What could not be confirmed

- The original paper of Sun et al. (2014) (paywalled). The formula and range were confirmed through citing papers
- The originals of Andriotis et al. (WiSec 2013, HAS 2014) (access was blocked). They are not used in this tool
- The Gatekeeper waits of each vendor (only the default AOSP implementation was checked)

---

## 7. References

1. Marte Dybevik Løge, "Tell Me Who You Are and I Will Tell You Your Unlock Pattern", Master's thesis, NTNU, 2015. https://hdl.handle.net/11250/2380967
2. Uellenbeck, Dürmuth, Wolf, Holz, "Quantifying the Security of Graphical Passwords: The Case of Android Unlock Patterns", ACM CCS 2013. https://doi.org/10.1145/2508859.2516700
3. Aviv, Gibson, Mossop, Blaze, Smith, "Smudge Attacks on Smartphone Touch Screens", USENIX WOOT 2010. https://www.usenix.org/legacy/events/woot10/tech/full_papers/Aviv.pdf
4. Aviv, Budzitowski, Kuber, "Is Bigger Better? Comparing User-Generated Passwords on 3x3 vs. 4x4 Grid Sizes for Android's Pattern Unlock", ACSAC 2015. https://doi.org/10.1145/2818000.2818014
5. Aviv, Davin, Wolf, Kuber, "Towards Baselines for Shoulder Surfing on Mobile Authentication", ACSAC 2017. https://doi.org/10.1145/3134600.3134609
6. Ye, Tang, Fang, Chen, Kim, Taylor, Wang, "Cracking Android Pattern Lock in Five Attempts", NDSS 2017. https://www.ndss-symposium.org/wp-content/uploads/2017/09/ndss2017_03A-5_Ye_paper.pdf
7. Abdelrahman, Khamis, Schneegass, Alt, "Stay Cool! Understanding Thermal Attacks on Mobile-based User Authentication", CHI 2017. https://doi.org/10.1145/3025453.3025461
8. Sun, Wang, Zheng, "Dissecting pattern unlock: The effect of pattern strength meter on pattern selection", Journal of Information Security and Applications, 2014. https://doi.org/10.1016/j.jisa.2014.10.009
9. Golla, Rimkus, Aviv, Dürmuth, "On the In-Accuracy and Influence of Android Pattern Strength Meters", NDSS USEC 2019. https://www.ndss-symposium.org/wp-content/uploads/2019/02/usec2019_04-1_Golla_paper.pdf
10. Song, Cho, Oh, Kim, Huh, "On the Effectiveness of Pattern Lock Strength Meters: Measuring the Strength of Real World Pattern Locks", CHI 2015. https://doi.org/10.1145/2702123.2702365
11. Android Open Source Project, `system/gatekeeper/gatekeeper.cpp`. https://android.googlesource.com/platform/system/gatekeeper/+/refs/heads/main/gatekeeper.cpp
12. Android Open Source Project, File-based encryption. https://source.android.com/docs/security/features/encryption/file-based

This document is written for defense and learning.
