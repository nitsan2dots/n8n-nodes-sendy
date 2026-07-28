# Testing n8n-nodes-sendy on a self-hosted (Docker) n8n

Pre-publish sideload of the built tarball `n8n-nodes-sendy-0.1.0.tgz`, then a click-through of every
operation. **You chose to test against PRODUCTION** — read the safety section first.

---

## 1. Install the node (Docker)

The tarball is at `n8n-nodes-sendy-0.1.0.tgz` in this folder. Get it onto the machine that runs your
n8n container, then:

```bash
# find the container name/id
docker ps

# copy the tarball into the container
docker cp n8n-nodes-sendy-0.1.0.tgz <container>:/tmp/

# install it into n8n's user nodes dir (persists if ~/.n8n is a mounted volume)
docker exec -it <container> sh -lc '
  mkdir -p ~/.n8n/nodes &&
  cd ~/.n8n/nodes &&
  npm install /tmp/n8n-nodes-sendy-0.1.0.tgz
'

# restart n8n so it loads the node
docker restart <container>
```

The package is pure JS (no native builds), so `npm install <tarball>` just unpacks — no compiler
needed in the Alpine image. After restart, add a node and search **Sendy**.

> **Alternative (simplest if your n8n is remote):** publish to npm (`npm login` → `npm publish` in the
> node repo), then in n8n go **Settings → Community Nodes → Install** and enter `n8n-nodes-sendy`.

---

## 2. ⚠️ Production safety

Base URL in the credential = `https://sendy.co.il/api/v1`, with a **prod `sk_live_` key**. The key ties
to ONE workspace — **use a test workspace's key** so test data/charges don't land in a client's
workspace.

**Safe on prod — read-only, no charge, no data change (do these freely):**
- Credential test on save · Credit → Get Balance
- Segment / Sender / Custom Field → Get Many · both dropdowns
- Contact → Get · Contact → Get Many (list, pagination, phone lookup) · Message → Get

**Mutating on prod — real side effects:**
- **Message → Send** — charges **1 real credit** and delivers a **real SMS**. Send **only to your own
  test number**. Each run = real money + real delivery.
- **Contact → Create or Update** — writes a **real contact** into the key's workspace. There is **no
  DELETE** in v1 — remove test contacts via the Sendy UI afterward. Use a throwaway phone you control.
- **Idempotency double-send** — still one real charge.

---

## 3. Test checklist (run in this order)

### A. Credential + read-only sweep (safe)
- [ ] **Save credential** → green "connection tested" (issues `GET /credits`). Bad key → red 401.
- [ ] **Credit → Get Balance** → one item `{ balance: N }`.
- [ ] **Segment → Get Many** → one item per active segment `{id,name,contact_count,subscribed_count}`.
- [ ] **Sender → Get Many** → one item per approved sender `{value,type}`.
- [ ] **Custom Field → Get Many** → one item per named slot `{key,slot,label}`.
- [ ] **Contact → Get Many**, Return All off, Limit 5 → up to 5 contact rows (NOT a `{data,…}` wrapper).
      *(This is the path the double-unwrap bug broke — confirm rows are real, not empty/undefined.)*
- [ ] **Contact → Get Many**, Filters → Phone = an existing number → exactly 1 row (0 if none).
- [ ] **Contact → Get Many**, Return All ON (needs >100 contacts) → all contacts, no dupes/gaps;
      page 2 request adds `&cursor=…`, keeps `limit=100`.
- [ ] **Dropdowns:** open *Sender Name or ID* on Send → lists `value (type)`; open *Segment Names or
      IDs* on Create/Update → lists segment names.

### B. Contact write (mutates — throwaway phone)
- [ ] **Contact → Create or Update** (CREATE): Phone = a test number that doesn't exist, pick ≥1
      Segment, set First Name / Email / Birthday `yyyy-mm-dd` → **201**, `created:true`, phone
      normalized to `+972…`.
- [ ] **Contact → Get** with the returned id → same contact view.
- [ ] **Contact → Create or Update** (UPDATE/merge): same phone, change only First Name, add a second
      Segment → **200**, `created:false`, First Name changed, **Email/Birthday unchanged** (merge),
      **both** segments present (additive).
- [ ] Edge: create with **no segment** → 400 VALIDATION; bad segment id → 400 SEGMENT_NOT_FOUND;
      name >20 chars → 400; birthday `05/01/1990` → accepted but stored `null` (no 400).

### C. Message send (mutates — real charge + SMS, your test number only)
- [ ] **Message → Send**: To = your test number (no `+`), From = pick from dropdown, Message = short
      text → **202**, `status:"queued"`, `credits_charged:1`. SMS arrives.
- [ ] **Message → Get** with the returned id → poll `queued → sent → delivered`.
- [ ] Edge: unapproved sender (via expression) → 403 SENDER_NOT_APPROVED, **no charge**; unknown
      message id → 404; Additional Fields → Mode = Marketing to an unsubscribed number → 403
      RECIPIENT_UNSUBSCRIBED, no charge.
- [ ] Idempotency: add Additional Fields → Idempotency Key, run the SAME node twice → 1st 202
      (charged once), 2nd returns the **same id** (200 replay), balance unchanged.

### D. Cleanup
- [ ] Delete the test contact(s) via the Sendy UI (no API DELETE in v1).

---

Report any operation that doesn't match "expected" and I'll fix the routing and re-pack.
