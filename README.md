# Z.XTREAM

Streaming anime donghua sub Indo dari anichin.moe.

## Setup

```bash
npm install
npm run dev
```

- Backend: http://localhost:3002
- Frontend: http://localhost:3000

## Firebase RTDB Rules

Copy paste ke **Firebase Console → Realtime Database → Rules**:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true
    },
    "comments": {
      ".read": true,
      ".write": true
    },
    "codes": {
      ".read": true,
      ".write": true
    },
    "siteSettings": {
      ".read": true,
      ".write": true
    },
    "notifications": {
      ".read": true,
      ".write": true
    }
  }
}
```

> Authorization di-handle di backend code (isOwner check), bukan di Firebase rules.

## Rules Breakdown

| Path | Read | Write | Auth Check |
|------|------|-------|------------|
| `users` | Public | Public | Backend: owner or self |
| `comments` | Public | Public | Backend: owner or author |
| `codes` | Public | Public | Backend: owner only |
| `siteSettings` | Public | Public | Backend: owner only |
| `notifications` | Public | Public | Backend: self or owner |

## API Endpoints

### Anime
- `GET /api/anime/home` - Popular + recent episodes
- `GET /api/anime/search?q=` - Search anime
- `GET /api/anime/detail/:slug` - Anime detail + episodes
- `GET /api/anime/episode/stream?url=` - Stream servers (all, no filter)

### Users
- `GET /api/users/profile/:uid` - User profile
- `PUT /api/users/profile/:uid` - Update profile
- `POST /api/users/history` - Save watch history
- `POST /api/users/bookmark` - Toggle bookmark
- `POST /api/users/follow` - Toggle follow
- `GET /api/users/leaderboard/:type` - Leaderboard
- `GET /api/users/search?q=` - Search users

### Comments
- `GET /api/comments?type=&targetId=` - Get comments
- `POST /api/comments` - Post/like/delete comment

### Admin (owner only)
- `POST /api/admin/codes` - Generate redemption code
- `GET /api/admin/codes` - List all codes
- `GET /api/admin/users` - List all users
- `POST /api/admin/role` - Set user role
- `POST /api/admin/ban` - Ban user
- `POST /api/admin/unban` - Unban user
- `POST /api/admin/delete-user` - Delete user
- `POST /api/admin/delete-comment` - Delete any comment

### Redemption
- `POST /api/redeem` - Redeem code

### Site
- `GET /api/site/settings` - Get site settings
- `POST /api/site/settings` - Update site settings (owner)

## Code Types

| Type | Effect |
|------|--------|
| `owner` | Owner forever |
| `vvip` | VVIP role + crown badge |
| `vip` | VIP role + star badge |
| `premium` | Premium X days |
| `exp` | +X EXP |
| `coins` | +X Coins |

## Frontend Pages

- `/home` - Home with hero + popular + recent
- `/search` - Search anime
- `/anime/:slug` - Anime detail + episodes
- `/watch/:id` - Video player + servers + comments
- `/profile/:uid` - User profile
- `/history` - Watch history
- `/bookmarks` - Bookmarked anime
- `/leaderboard` - EXP leaderboard
- `/redeem` - Redeem code
- `/admin` - Admin panel (owner only)
- `/settings` - Settings + site settings (owner)

## Environment Variables (.env)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3002
DEV_UID=33333
```
