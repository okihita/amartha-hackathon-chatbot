# Voice Command Test Guide

Manual test cases for WhatsApp voice note commands.

## Prerequisites
- WhatsApp connected to the bot
- User registered (or test registration via voice)

---

## Test Cases

### 1. Quiz Commands
Say these phrases and verify quiz starts:

| Say This | Expected |
|----------|----------|
| "Quiz" | Quiz starts, shows question 1 |
| "Kuis" | Quiz starts |
| "Mulai kuis" | Quiz starts |
| "Saya mau belajar" | Quiz starts |
| "Tes literasi" | Quiz starts |

---

### 2. User Data Commands
Say these and verify data is shown:

| Say This | Expected |
|----------|----------|
| "Data saya" | Shows user profile |
| "Lihat profil saya" | Shows profile |
| "Info pinjaman" | Shows loan info |
| "Cek limit" | Shows loan limit |
| "Sisa pinjaman saya berapa" | Shows remaining loan |

---

### 3. Progress Commands
| Say This | Expected |
|----------|----------|
| "Nilai saya" | Shows quiz scores |
| "Progress kuis" | Shows progress |
| "Hasil belajar saya" | Shows literacy progress |

---

### 4. Majelis Commands
| Say This | Expected |
|----------|----------|
| "Info majelis" | Shows majelis info |
| "Jadwal pertemuan" | Shows meeting schedule |
| "Kapan kumpul" | Shows schedule |

---

### 5. General Questions
| Say This | Expected |
|----------|----------|
| "Halo" | Greeting response |
| "Cara menabung" | Financial advice |
| "Tips usaha warung" | Business tips |
| "Apa itu Amartha" | Amartha info |

---

### 6. Registration (New User)
| Say This | Expected |
|----------|----------|
| "Saya mau daftar, nama saya Siti, usaha warung sembako di Bogor" | Registration triggered |

---

### 7. Menu/Help
| Say This | Expected |
|----------|----------|
| "Menu" | Shows menu options |
| "Bantuan" | Shows help |
| "Bisa apa saja" | Shows capabilities |

---

## Test Checklist

- [ ] Quiz starts from voice
- [ ] Data saya works from voice  
- [ ] Progress shown from voice
- [ ] Majelis info from voice
- [ ] General chat works
- [ ] Registration works from voice
- [ ] Menu/help works

## Notes
- Speak clearly in Indonesian
- Short phrases work better than long sentences
- Bot transcribes then processes like text input
