# Backend Auth Review

This project uses **Spring Security + JWT** for backend auth.

## Explain Like I'm 5

Think of the backend like a clubhouse.

- `/auth/register` is how a new kid signs up.
- `/auth/login` is how an existing kid proves who they are.
- After that, the backend gives the kid a **special paper badge** called a **JWT token**.
- When the kid wants to use protected backend routes later, they must show that badge in the `Authorization` header like this:

```text
Authorization: Bearer <token>
```

- If the badge looks real and is not expired, the backend lets them in.
- If there is no badge, or the badge is bad, the backend treats them like a stranger.

## What The Backend Is Doing

### 1. Register

When someone calls `POST /auth/register`:

- The backend checks if the email is already taken.
- It hashes the password with `BCryptPasswordEncoder`, so the raw password is not stored as plain text.
- It creates a `User` in the database.
- It always gives new users the `USER` role.
- It creates a JWT token and sends it back.

The register request expects:

- `email`
- `password` with at least 8 characters
- `phone`

The response contains:

- `token`
- `email`
- `role`

### 2. Login

When someone calls `POST /auth/login`:

- The backend looks up the user by email.
- It compares the incoming password with the saved hashed password.
- If they match, it creates a new JWT token and sends it back.
- If they do not match, it throws `Invalid credentials`.

### 3. Token Creation

The JWT token is made by `JwtService`.

Inside the token, the backend stores:

- the user email as the token subject
- the user role as a claim called `role`
- the issue time
- the expiration time

Token lifetime is set in `application.yaml`:

- `expiration-ms: 86400000`
- That means **24 hours**

The token is signed with a secret key from:

- `app.jwt.secret`
- or `JWT_SECRET` from environment variables

### 4. Protecting Routes

`SecurityConfig` says:

- anything under `/auth/**` is public
- everything else requires authentication
- the backend is **stateless**, so it does **not** keep server-side login sessions

That means the server does not remember you by itself.  
You must keep sending the token on every protected request.

### 5. Checking The Token On Each Request

`JwtAuthenticationFilter` runs before normal username/password auth.

It does this:

1. Reads the `Authorization` header.
2. Checks that it starts with `Bearer `.
3. Pulls out the token.
4. Uses `JwtService` to read the email from the token.
5. Loads that user through `CustomUserDetailsService`.
6. Verifies the token belongs to that user and is not expired.
7. If valid, it puts the user into Spring Security's `SecurityContext`.

After that, controllers can access the logged-in user.

Example:

- `POST /profile/addresses` is protected
- it uses `@AuthenticationPrincipal UserDetails userDetails`
- then it reads `userDetails.getUsername()`, which is the user's email

## What The Frontend Is Doing

The frontend stores the returned token in `localStorage` under the key `token`.

Later, `apps/web/lib/api.ts` automatically adds:

```text
Authorization: Bearer <token>
```

to API requests if that token exists.

So the whole system works like this:

1. User registers or logs in.
2. Backend returns a token.
3. Frontend saves the token.
4. Frontend sends the token on later requests.
5. Backend checks the token every time.

## Simple Review

### What Is Good

- Passwords are hashed with BCrypt.
- Auth routes are separated cleanly from protected routes.
- JWT auth is stateless and straightforward.
- Expiration is built into the token.
- User lookup is based on email, which is unique in the database.

### What Is Missing Or Weak

### 1. No role-based authorization rules yet

The token includes a role, and `CustomUserDetailsService` creates authorities like `ROLE_USER` or `ROLE_ADMIN`.

But right now I do **not** see backend rules like:

- `hasRole("ADMIN")`
- `@PreAuthorize(...)`
- admin-only route protection

So today, auth mainly answers:

- "Are you logged in?"

It does **not** strongly answer:

- "Are you allowed to do this specific admin thing?"

### 2. No logout or token revocation

Because this is stateless JWT auth:

- there is no server-side session to destroy
- there is no token blacklist

If a token is stolen, it stays usable until it expires.

### 3. No refresh-token flow

When the 24-hour token expires, the user must log in again.

There is no refresh-token system for getting a new access token safely.

### 4. Frontend stores token in `localStorage`

This works, but it is usually weaker than using secure `HttpOnly` cookies, because JavaScript can read `localStorage`.

If the app ever has an XSS problem, a stolen token becomes easier.

### 5. Token validation only checks email match + expiry

That is enough for a basic setup, but there is no extra handling for things like:

- forced logout
- password-change invalidation
- account disabling
- token rotation

## Tiny Mental Model

The backend says:

- "If you can show me a valid signed token, I believe you are that user."

It does **not** currently say much beyond that, especially around:

- permission levels
- logout
- revoking bad tokens

## Files I Reviewed

- `apps/api/src/main/java/com/atinroy/orderly/auth/config/SecurityConfig.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/filter/JwtAuthenticationFilter.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/service/JwtService.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/service/AuthService.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/service/CustomUserDetailsService.java`
- `apps/api/src/main/java/com/atinroy/orderly/auth/controller/AuthController.java`
- `apps/api/src/main/java/com/atinroy/orderly/user/controller/UserController.java`
- `apps/api/src/main/resources/application.yaml`
- `apps/web/lib/api.ts`
