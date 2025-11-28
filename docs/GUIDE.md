# Complete Guide

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with credentials
npm start
```

## Deployment

```bash
./deploy.sh
```

## API Endpoints

### Users
- `GET /api/users` - List all
- `GET /api/users/:phone` - Get by phone
- `POST /api/users/verify` - Verify user
- `DELETE /api/users/:phone` - Delete
- `GET /api/users/:phone/images` - Business images

### Majelis
- `GET /api/majelis` - List all
- `GET /api/majelis/:id` - Get by ID
- `POST /api/majelis` - Create
- `PUT /api/majelis/:id` - Update
- `DELETE /api/majelis/:id` - Delete
- `POST /api/majelis/:id/members` - Add member
- `DELETE /api/majelis/:id/members/:phone` - Remove member

### Content
- `GET /api/knowledge/business-types` - Business classifications
- `GET /api/knowledge/financial-literacy` - Course modules (15 weeks)

## Environment Variables

**Required**:
- `MY_VERIFY_TOKEN` - WhatsApp webhook verification
- `WHATSAPP_TOKEN` - WhatsApp API token
- `PHONE_NUMBER_ID` - WhatsApp phone number ID
- `GEMINI_API_KEY` - Gemini API key
- `GCP_PROJECT_ID` - GCP project ID

**Optional**:
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment
- `FINANCIAL_LITERACY_FOLDER_ID` - Google Drive folder
- `BUSINESS_TYPES_FOLDER_ID` - Google Drive folder

## Demo Commands (For Hackathon Judges)

Inject predefined personas for demo purposes:

**Personas:**
| Command | Business | Description |
|---------|----------|-------------|
| `/demo:warung` | Warung Sembako | Maturity 3, 40% quiz |
| `/demo:toko` | Toko Kelontong | Maturity 2, 20% quiz |
| `/demo:makanan` | Usaha Makanan | Maturity 4, 60% quiz |
| `/demo:jahit` | Jasa Jahit | Maturity 2, 13% quiz |
| `/demo:pertanian` | Pertanian | Maturity 3, 53% quiz |
| `/demo:salon` | Salon Kecantikan | Maturity 3 |
| `/demo:laundry` | Jasa Laundry | Maturity 2 |
| `/demo:random` | Random | Random persona |

**Scenarios:**
| Command | Description |
|---------|-------------|
| `/demo:sukses` | Success story, 80% quiz, good payments |
| `/demo:baru` | New member, no loan, 0% quiz |
| `/demo:krisis` | Crisis, missed payments, struggling |
| `/demo:lulus` | Graduate, 100% quiz, fully paid |
| `/demo:fraud` | Suspicious activity flags |

**Combinations:** `/demo:warung+krisis`, `/demo:random+lulus`

**Reset:** `/demo:reset` - Clear all demo data

## Chatbot Commands (Bahasa Indonesia)

| Feature | Trigger Words |
|---------|---------------|
| Menu/Bantuan | menu, bantuan, help, tolong, bantu, halo, hi, hai |
| Mulai Kuis | kuis, quiz, belajar, tes, ujian, soal, mulai kuis |
| Lihat Nilai | nilai, hasil, skor, progress, hasil kuis, nilai saya |
| Cek Data Profil | cek data, data saya, profil, info saya, debug, data |
| Jadwal Majelis | jadwal, majelis, pertemuan, kapan ketemu, kumpul |
| Kirim Foto | Langsung kirim gambar (dengan/tanpa caption) |

## Testing

```bash
./tests/integration.test.sh
VERBOSE=true ./tests/integration.test.sh
TEST_URL=http://localhost:8080 ./tests/integration.test.sh
```

## Debugging

```bash
# View logs
gcloud run logs read whatsapp-bot --region asia-southeast2 --limit 50

# Follow logs
gcloud run logs tail whatsapp-bot --region asia-southeast2
```

## Troubleshooting

**WhatsApp not responding**:
1. Check webhook URL
2. Verify `MY_VERIFY_TOKEN`
3. Check logs
4. Test `/health` endpoint

**Dashboard not loading**:
1. Check Cloud Run deployment
2. Verify static files
3. Check browser console
4. Test API endpoints

**Import scripts failing**:
1. Verify Google Drive folder is public
2. Check `GEMINI_API_KEY`
3. Ensure Firestore is enabled
4. Check folder IDs

## Contributing

1. Create branch: `git checkout -b feature/name`
2. Follow SOLID principles
3. Add tests
4. Update docs
5. Run tests
6. Commit with conventional format
7. Push and create PR

### Commit Format
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
