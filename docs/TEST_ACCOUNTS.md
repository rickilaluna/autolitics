# Test customer account setup

The app treats someone as a “customer” when:

1. They are logged in (Supabase Auth).
2. There is a **client** row whose `primary_email` matches the user’s email (case-insensitive).

Dashboard pages (Strategy Brief, Work With Ricki, forms, etc.) look up the client by the logged-in user’s email and then load engagements and deliverables for that client.

---

## Option A: Use the app (good for one-off testing)

1. **Create the Auth user**
   - Go to **Register** (`/register`).
   - Sign up with the email you want for the test customer (e.g. `test@example.com`) and a password.
   - If your project has email confirmation on, confirm the email (or turn confirmation off in Supabase → Authentication → Providers → Email for easier testing).

2. **Create the client record (as admin)**
   - Log in as an **admin** user (or use Supabase Dashboard in step 3).
   - Go to **Admin → Clients** (`/admin/clients`).
   - Click **New Client**.
   - Set **Primary Email** to the **exact same** email you used to register (e.g. `test@example.com`).
   - Fill **Primary Contact Name** and any other fields, then save.

3. **Optional: add an engagement**
   - In **Admin → Engagements**, create a new engagement and choose this client.
   - Set status to e.g. `active` or `delivered` so the customer dashboard has something to show.

4. **Use the test account**
   - Log out of admin, log in as the test user (`test@example.com`).
   - Open **Dashboard**; you should see the customer experience for that client.

---

## Option B: Supabase Dashboard + SQL (fast for automation or staging)

1. **Create the Auth user**
   - Supabase Dashboard → **Authentication** → **Users** → **Add user**.
   - Email: e.g. `testcustomer@example.com`, set a password (or use “Auto-generate” and then set it).

2. **Insert the client (and optional engagement)**
   - Go to **SQL Editor** and run (replace the email/name with your test user’s):

```sql
-- Insert test client (use the same email as the Auth user)
INSERT INTO public.clients (primary_contact_name, primary_email, location)
VALUES ('Test Customer', 'testcustomer@example.com', 'Austin, TX')
ON CONFLICT DO NOTHING;

-- Optional: create an engagement for this client so the dashboard has content
INSERT INTO public.engagements (client_id, status)
SELECT id, 'active'
FROM public.clients
WHERE primary_email = 'testcustomer@example.com'
LIMIT 1;
```

3. **Log in** in the app as `testcustomer@example.com` and use the dashboard.

---

## Summary

| Step | What to do |
|------|------------|
| 1 | Create a Supabase Auth user (app Register or Dashboard). |
| 2 | Ensure a `clients` row exists with `primary_email` = that user’s email. |
| 3 | Optional: create an `engagements` row for that client. |
| 4 | Log in as that user to use the customer dashboard. |

The link between “logged-in user” and “customer” is **email**: `auth.users.email` must match `clients.primary_email`.
