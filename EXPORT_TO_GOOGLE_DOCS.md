# How to Export Technical Specification to Google Docs

## Method 1: Direct Upload (Recommended)

### Steps:
1. **Open Google Docs**
   - Go to https://docs.google.com
   - Sign in to your Google account

2. **Create New Document**
   - Click "Blank" to create a new document
   - Or go to File → New → Document

3. **Import the Markdown File**
   - Go to File → Open
   - Click "Upload" tab
   - Drag and drop `TECHNICAL_SPECIFICATION.md` file
   - Or click "Browse" and select the file

4. **Convert to Google Docs Format**
   - Once uploaded, Google Docs will automatically convert the Markdown
   - Formatting will be preserved (headings, lists, code blocks)

5. **Clean Up Formatting (Optional)**
   - Adjust heading styles if needed
   - Format code blocks with monospace font
   - Add table of contents: Insert → Table of contents

6. **Share the Document**
   - Click "Share" button (top right)
   - Set permissions (view/comment/edit)
   - Copy the shareable link

---

## Method 2: Copy-Paste

### Steps:
1. **Open the Markdown File**
   - Open `TECHNICAL_SPECIFICATION.md` in any text editor
   - Or view it on GitHub

2. **Copy All Content**
   - Select all (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

3. **Paste into Google Docs**
   - Create new Google Doc
   - Paste (Ctrl+V / Cmd+V)
   - Google Docs will preserve basic formatting

4. **Format Manually**
   - Apply heading styles (Heading 1, 2, 3)
   - Format code blocks with monospace font
   - Add colors to important sections

---

## Method 3: Use Pandoc (Advanced)

### Prerequisites:
```bash
# Install Pandoc
brew install pandoc  # macOS
# or
sudo apt install pandoc  # Linux
```

### Convert to DOCX:
```bash
pandoc TECHNICAL_SPECIFICATION.md -o TECHNICAL_SPECIFICATION.docx
```

### Upload DOCX to Google Docs:
1. Go to https://docs.google.com
2. File → Open → Upload
3. Select the .docx file
4. Google Docs will convert it automatically

---

## Method 4: GitHub to Google Docs

### Steps:
1. **Commit the file to GitHub** (already done)
   ```bash
   git add TECHNICAL_SPECIFICATION.md
   git commit -m "docs: add technical specification"
   git push
   ```

2. **View on GitHub**
   - Go to your repository
   - Click on `TECHNICAL_SPECIFICATION.md`
   - GitHub will render it nicely

3. **Copy from GitHub**
   - Click the "Copy raw contents" button
   - Or select all rendered content
   - Paste into Google Docs

---

## Recommended Formatting in Google Docs

### Heading Styles:
- **Title:** "Amartha WhatsApp Chatbot - Technical Specification"
- **Heading 1:** Main sections (Executive Summary, System Architecture, etc.)
- **Heading 2:** Subsections
- **Heading 3:** Sub-subsections

### Code Blocks:
- Font: Courier New or Consolas
- Background: Light gray (#f5f5f5)
- Border: 1px solid #ddd

### Colors:
- **Headings:** Dark blue (#1a73e8)
- **Important notes:** Yellow highlight
- **Code:** Gray background
- **Links:** Blue underline

### Table of Contents:
- Insert → Table of contents
- Choose "With page numbers" or "With blue links"

---

## Sharing Options

### Public Link:
```
Anyone with the link can view
```

### Restricted:
```
Only specific people can access
```

### Permissions:
- **Viewer:** Can only read
- **Commenter:** Can add comments
- **Editor:** Can make changes

---

## Tips for Better Presentation

1. **Add Cover Page**
   - Project name
   - Version number
   - Date
   - Your name/team

2. **Use Page Breaks**
   - Insert → Break → Page break
   - Separate major sections

3. **Add Images**
   - Architecture diagrams
   - Screenshots
   - Flowcharts

4. **Create Hyperlinks**
   - Link table of contents to sections
   - Link to external resources
   - Link to GitHub repository

5. **Use Comments**
   - Add notes for reviewers
   - Highlight areas needing attention
   - Track changes and feedback

---

## Example Google Docs Link Format

After uploading, your link will look like:
```
https://docs.google.com/document/d/DOCUMENT_ID/edit?usp=sharing
```

You can shorten it with:
- Google URL Shortener
- bit.ly
- Custom domain

---

## Quick Command (All-in-One)

```bash
# 1. Ensure file exists
ls TECHNICAL_SPECIFICATION.md

# 2. Open in browser for copy-paste
open TECHNICAL_SPECIFICATION.md  # macOS
xdg-open TECHNICAL_SPECIFICATION.md  # Linux

# 3. Or convert to DOCX
pandoc TECHNICAL_SPECIFICATION.md -o TECHNICAL_SPECIFICATION.docx

# 4. Open Google Docs
open "https://docs.google.com"
```

---

## Troubleshooting

### Issue: Formatting Lost
**Solution:** Use Method 3 (Pandoc) for better conversion

### Issue: Code Blocks Not Formatted
**Solution:** Manually apply monospace font and gray background

### Issue: Images Not Showing
**Solution:** Upload images separately and insert them

### Issue: Table of Contents Not Working
**Solution:** Use Google Docs' built-in TOC feature

---

## Next Steps

1. ✅ Upload `TECHNICAL_SPECIFICATION.md` to Google Docs
2. ✅ Format and clean up
3. ✅ Add table of contents
4. ✅ Share with stakeholders
5. ✅ Get feedback
6. ✅ Update as needed

---

**Need Help?**
- Google Docs Help: https://support.google.com/docs
- Markdown Guide: https://www.markdownguide.org
- Pandoc Manual: https://pandoc.org/MANUAL.html
