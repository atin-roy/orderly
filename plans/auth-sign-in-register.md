# Plan: Working Sign-In and Register Flows (End-to-End)

## Context

All three register forms (customer, business, delivery) and the login form exist on the frontend. Customer register and login already call real backend endpoints. Business and delivery register are **frontend-only mocks** — they fake a 500ms delay and show a "staged" message. The goal is to make all four forms create real users in the database and return JWT tokens.

## Current State

| Form | Frontend | Backend | Status |
|------|----------|---------|--------|
| Login | `authLogin()` → `POST /auth/login` | `AuthService.login()` | Working |
| Customer Register | `registerCustomer()` → `POST /auth/register` | `AuthService.register()` | Working |
| Business Register | `submitBusinessSignup()` → **mocked** | No endpoint | Needs work |
| Delivery Register | `submitDeliverySignup()` → **mocked** | No endpoint | Needs work |

### Key gaps
- `Role` enum only has `USER`, `ADMIN` — missing `BUSINESS`, `DELIVERY_PARTNER`
- `User` entity has no `name` field
- No entities for business/delivery profile data
- No backend endpoints for business/delivery registration
- No global exception handler — backend errors return Spring's default HTML/JSON which the frontend can't parse reliably
- Business/delivery frontend forms don't store JWT or redirect after signup

---

## Plan

### Step 1: Expand the Role enum

**File:** `apps/api/src/main/java/com/atinroy/orderly/user/model/Role.java`

Add `BUSINESS` and `DELIVERY_PARTNER` to match the shared types package (`packages/types/src/user.ts`).

```java
public enum Role {
    USER,
    BUSINESS,
    DELIVERY_PARTNER,
    ADMIN
}
```

### Step 2: Add `name` field to User entity

**File:** `apps/api/src/main/java/com/atinroy/orderly/user/model/User.java`

Add a nullable `name` column. Business signup stores `ownerName`, delivery stores `fullName`, customer can leave it null for now.

```java
@Column
private String name;
```

### Step 3: Create BusinessProfile entity

**New file:** `apps/api/src/main/java/com/atinroy/orderly/user/model/BusinessProfile.java`

Fields (matching the frontend form):
- `user` (OneToOne → User, required)
- `businessName` (String, required)
- `city` (String, required)
- `serviceArea` (String, required)
- `businessType` (String, required) — Restaurant, Cloud Kitchen, Cafe, Bakery, Sweet Shop
- `cuisineFocus` (String/text, required)

Extends `BaseEntity` for id + audit timestamps.

### Step 4: Create DeliveryPartnerProfile entity

**New file:** `apps/api/src/main/java/com/atinroy/orderly/user/model/DeliveryPartnerProfile.java`

Fields (matching the frontend form):
- `user` (OneToOne → User, required)
- `city` (String, required)
- `vehicleType` (String, required)
- `preferredShift` (String, required)
- `serviceZones` (String/text, required)
- `deliveryExperience` (String, required)

Extends `BaseEntity`.

### Step 5: Create repositories for new entities

**New files:**
- `apps/api/src/main/java/com/atinroy/orderly/user/repository/BusinessProfileRepository.java`
- `apps/api/src/main/java/com/atinroy/orderly/user/repository/DeliveryPartnerProfileRepository.java`

Standard `JpaRepository` interfaces.

### Step 6: Create registration DTOs for business and delivery

**New files:**
- `apps/api/src/main/java/com/atinroy/orderly/auth/dto/BusinessRegisterRequest.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/dto/DeliveryRegisterRequest.java`

**BusinessRegisterRequest** fields: `ownerName`, `businessName`, `email`, `password`, `phone`, `city`, `serviceArea`, `businessType`, `cuisineFocus` — all `@NotBlank`, password `@Size(min=8)`, email `@Email`, phone `@Pattern`.

**DeliveryRegisterRequest** fields: `fullName`, `email`, `password`, `phone`, `city`, `vehicleType`, `preferredShift`, `serviceZones`, `deliveryExperience` — same validation pattern.

Note: Both business and delivery forms currently do NOT have password fields. We need to **add password + confirmPassword fields** to both frontend forms so users can set credentials during signup.

### Step 7: Expand AuthService with business and delivery registration

**File:** `apps/api/src/main/java/com/atinroy/orderly/auth/service/AuthService.java`

Add two new methods:

- `registerBusiness(BusinessRegisterRequest)` — creates User (role=BUSINESS, name=ownerName) + BusinessProfile in one `@Transactional` block, returns AuthResponse with JWT
- `registerDelivery(DeliveryRegisterRequest)` — creates User (role=DELIVERY_PARTNER, name=fullName) + DeliveryPartnerProfile, returns AuthResponse

### Step 8: Add new endpoints to AuthController

**File:** `apps/api/src/main/java/com/atinroy/orderly/auth/controller/AuthController.java`

```
POST /auth/register/business  → authService.registerBusiness(request)  → 201
POST /auth/register/delivery  → authService.registerDelivery(request)  → 201
```

Existing `/auth/register` stays for customer signup. The `/auth/**` permitAll rule already covers these new paths.

### Step 9: Add global exception handler

**New file:** `apps/api/src/main/java/com/atinroy/orderly/common/exception/GlobalExceptionHandler.java`

Handle:
- `IllegalArgumentException` (e.g., "Email already registered") → 409 Conflict with `{ "message": "..." }`
- `BadCredentialsException` → 401 with `{ "message": "Invalid credentials" }`
- `MethodArgumentNotValidException` (validation failures) → 400 with `{ "message": "first field error" }`
- Generic fallback → 500 with `{ "message": "Internal server error" }`

This ensures the frontend's `res.json()` parsing always gets a JSON body with a `message` field.

### Step 10: Add password fields to business and delivery frontend forms

**Files:**
- `apps/web/app/(auth)/register/business/page.tsx`
- `apps/web/app/(auth)/register/delivery/page.tsx`

Add `password` and `confirmPassword` state + inputs to both forms. Add validation (min 8 chars, must match). Place them after the email field.

### Step 11: Wire business/delivery frontend forms to real API

**File:** `apps/web/lib/api.ts`

Add:
- `authRegisterBusiness(payload)` → `POST /auth/register/business` with full business payload + password → stores token, returns AuthResponseData
- `authRegisterDelivery(payload)` → `POST /auth/register/delivery` with full delivery payload + password → stores token, returns AuthResponseData

**File:** `apps/web/lib/registration.ts`

Replace `submitBusinessSignup()` and `submitDeliverySignup()` mock functions with real calls to the new API functions. Update their return type from `StagedSignupResult` to `AuthResponseData`. Remove the `StagedSignupResult` type and `delay()` helper if no longer used.

### Step 12: Update business/delivery page components for real auth flow

**Files:**
- `apps/web/app/(auth)/register/business/page.tsx`
- `apps/web/app/(auth)/register/delivery/page.tsx`

Replace the staged result display with:
1. On success → store JWT (already handled by the api function), redirect to appropriate page
   - Business → redirect to `/owner/dashboard`
   - Delivery → redirect to `/delivery/deliveries`
2. On error → show error message (same pattern as customer form)
3. Remove the `StagedSignupResult` state and the staged success card UI

### Step 13: Update JwtService to include new roles in token claims

**File:** `apps/api/src/main/java/com/atinroy/orderly/auth/service/JwtService.java`

Verify the `generateToken` method puts `role` in claims — it already should since it reads `user.getRole().name()`. No change needed if it already works generically, but verify.

---

## File Summary

### Backend — modify
| File | Change |
|------|--------|
| `user/model/Role.java` | Add BUSINESS, DELIVERY_PARTNER |
| `user/model/User.java` | Add name field |
| `auth/service/AuthService.java` | Add registerBusiness(), registerDelivery() |
| `auth/controller/AuthController.java` | Add two new endpoints |

### Backend — create
| File | Purpose |
|------|---------|
| `user/model/BusinessProfile.java` | Business profile entity |
| `user/model/DeliveryPartnerProfile.java` | Delivery partner profile entity |
| `user/repository/BusinessProfileRepository.java` | Repository |
| `user/repository/DeliveryPartnerProfileRepository.java` | Repository |
| `auth/dto/BusinessRegisterRequest.java` | Business register DTO |
| `auth/dto/DeliveryRegisterRequest.java` | Delivery register DTO |
| `common/exception/GlobalExceptionHandler.java` | Error handling |

### Frontend — modify
| File | Change |
|------|--------|
| `lib/api.ts` | Add authRegisterBusiness(), authRegisterDelivery() |
| `lib/registration.ts` | Replace mocks with real API calls |
| `app/(auth)/register/business/page.tsx` | Add password fields, wire to API, redirect on success |
| `app/(auth)/register/delivery/page.tsx` | Add password fields, wire to API, redirect on success |

---

## Verification

1. `make up` — start PostgreSQL via docker-compose
2. Start backend: `cd apps/api && ./mvnw spring-boot:run`
3. Start frontend: `cd apps/web && npm run dev`
4. **Login test:** Go to `/login`, enter credentials of a previously registered user → should redirect to `/`
5. **Customer register test:** Go to `/register/customer`, fill form → should create user in DB with role=USER, redirect to `/explore`
6. **Business register test:** Go to `/register/business`, fill form including new password fields → should create user with role=BUSINESS + BusinessProfile row, redirect to `/owner/dashboard`
7. **Delivery register test:** Go to `/register/delivery`, fill form including new password fields → should create user with role=DELIVERY_PARTNER + DeliveryPartnerProfile row, redirect to `/delivery/deliveries`
8. **Duplicate email test:** Try registering with an existing email → should show "Email already registered" error
9. **Login after register:** Log out (clear localStorage), log back in with newly registered email/password → should work for all three user types
10. Check PostgreSQL tables via PgAdmin (localhost:5050) to verify `users`, `business_profiles`, `delivery_partner_profiles` tables have correct data
