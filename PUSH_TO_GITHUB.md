# Push to GitHub - Replace Backend & Frontend Folders

## 📋 **What We're Doing:**
- ✅ Replace `Backend` folder with `Back_smartcare-be`
- ✅ Replace `Frontend` folder with `Front-end`  
- ✅ Keep all other files intact (diagrams, README.md, etc.)

## 🚀 **Step-by-Step Commands:**

### **Step 1: Pull latest from GitHub (if needed)**
```bash
git pull origin main
```

### **Step 2: Remove old folders from git (if they exist locally)**
```bash
git rm -r Backend Frontend
```
(Only if these folders exist locally)

### **Step 3: Add new folders**
```bash
git add Back_smartcare-be Front-end
git add .gitignore
```

### **Step 4: Remove old folder references from git (even if not local)**
```bash
git rm -r --cached Backend Frontend 2>$null
```
(This removes them from git even if they don't exist locally)

### **Step 5: Commit**
```bash
git commit -m "Replace Backend and Frontend folders with updated Back_smartcare-be and Front-end"
```

### **Step 6: Push**
```bash
git push origin main
```

---

## ⚠️ **Important:**
- Make sure `.gitignore` excludes `node_modules/`, `.env`, etc.
- The old `Backend` and `Frontend` folders on GitHub will be replaced
- All other files (diagrams, README.md, SmartHealthcare.sql) will remain untouched

