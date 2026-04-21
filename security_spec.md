# NutriWise AI Security Specification

## Data Invariants
1. A meal log must have an ownerId matching the authenticated user.
2. Macro values (calories, protein, fat, carbs) must be non-negative.
3. Private profile data is only accessible to the owner.
4. Document IDs must conform to a strict alphanumeric pattern.
5. Timestamps must be server-validated.

## The "Dirty Dozen" Payloads

1. **Identity Injection**: Attempt to create a meal log for a different user.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { userId: "USER_B", ... }`
   - *Expected: REJECTED*

2. **Shadow Field Attack**: Adding `isVerified: true` to a meal log.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., isVerified: true }`
   - *Expected: REJECTED (Exact keys check)*

3. **Macro Overflow**: Logging `calories: 999999999`.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., calories: 1000000 }`
   - *Expected: REJECTED (Boundary limits)*

4. **Negative Nutrition**: Logging `protein: -50`.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., protein: -5 }`
   - *Expected: REJECTED (Type/Range safety)*

5. **Resource Poisoning**: Use a 2KB string as a document ID.
   - `path: /users/USER_A/meals/VERY_LONG_ID_...`, `payload: { ... }`
   - *Expected: REJECTED (isValidId size check)*

6. **PII Snooping**: An authenticated user attempting to read another user's `/private/profile`.
   - `path: /users/USER_B/private/profile`, `operation: get`
   - *Expected: REJECTED (isOwner check)*

7. **Timestamp Spoofing**: Setting `timestamp: 0` to manipulate historical data.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., timestamp: 123 }` (Client side timestamp)
   - *Expected: REJECTED (request.time comparison)*

8. **Empty String Bomb**: Setting `mealName: ""` to bypass UI checks.
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., mealName: "" }`
   - *Expected: REJECTED (min size check)*

9. **Enum Bypass**: Setting `type: "feast"` (not in breakfast, lunch, dinner, snack).
   - `path: /users/USER_A/meals/MEAL_1`, `payload: { ..., type: "feast" }`
   - *Expected: REJECTED (Enum validation)*

10. **Orphaned Record**: Creating a meal at `/users/NON_EXISTENT_USER/meals/M1`.
    - `path: /users/NON_EXISTENT_USER/meals/M1`
    - *Expected: REJECTED (exists check for user)*

11. **Massive Array Attack**: Submitting a profile with 10,000 medical conditions.
    - `path: /users/USER_A/private/profile`, `payload: { medicalConditions: ["cond1", ...x10000] }`
    - *Expected: REJECTED (Array size limit)*

12. **Update Gap**: Modifying `userId` of an existing meal log.
    - `path: /users/USER_A/meals/MEAL_1`, `update: { userId: "USER_B" }`
    - *Expected: REJECTED (Immutability check)*
