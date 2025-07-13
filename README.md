# 🚀 DocuScan AI - Complete Document Processing System

**AI-Powered Table Extraction from Images and PDFs**

Transform your documents into structured CSV data using Google's Gemini AI technology.

## ✨ Features

### 🖼️ **Image to CSV**
- Upload JPG, PNG, or other image formats
- AI-powered table detection and extraction
- Professional CSV output with structured data
- Real-time processing with Gemini AI

### 📄 **PDF to CSV**
- Upload PDF documents with tables
- Advanced PDF parsing and table extraction
- Smart fallback for PDFs without tables
- Helpful guidance for better results

### 🎨 **Beautiful UI**
- Modern React interface with Material-UI
- Glass gradient design with smooth animations
- Drag & drop file upload
- Real-time processing feedback
- CSV preview and download

### 🔧 **Robust System**
- Bulletproof error handling
- Smart fallback systems
- Connection status monitoring
- Cross-platform compatibility

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
# Double-click or run:
SBH/start_system.bat
```

### Option 2: Manual Startup

**1. Start Backend:**
```bash
cd SBH/BACKEND/MyFunctionApp
python local_server.py
```

**2. Start Frontend:**
```bash
cd SBH/FRONTEND/scanner-frontend
npm start
```

### Option 3: System Health Check
```bash
python SBH/check_system.py
```

## 🌐 Access URLs

- **Frontend:** http://localhost:3000
- **Backend Health:** http://localhost:7071/api/health
- **Features Page:** http://localhost:3000/features
- **History Page:** http://localhost:3000/history

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- Required packages (auto-installed):
  - google-generativeai
  - gmft
  - pandas
  - python-dotenv

### Frontend Requirements
- Node.js 16+
- npm or yarn
- React 18+
- Material-UI 5+

### API Configuration
- Gemini API key (configured in `.env`)
- Internet connection for AI processing

## 🔧 Configuration

### Environment Variables
Create `SBH/BACKEND/MyFunctionApp/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ENVIRONMENT=development
DEBUG=true
```

### Get Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `.env` file

## 📁 Project Structure

```
SBH/
├── BACKEND/
│   └── MyFunctionApp/
│       ├── local_server.py          # Main backend server
│       ├── .env                     # Environment variables
│       └── HttpTrigger1/
│           └── logic/               # Processing modules
├── FRONTEND/
│   └── scanner-frontend/
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── pages/              # Page components
│       │   ├── services/           # API services
│       │   └── types/              # TypeScript types
│       └── public/                 # Static assets
├── start_system.bat                # Automated startup
├── check_system.py                # System health check
└── README.md                      # This file
```

## 🎯 Usage Guide

### 1. **Upload Files**
- Drag & drop or click to select files
- Supported formats: JPG, PNG, PDF
- Multiple file processing supported

### 2. **AI Processing**
- Real-time processing with Gemini AI
- Progress indicators and status updates
- Smart error handling and recovery

### 3. **Results & Download**
- CSV preview in modal dialog
- Direct download of processed files
- Persistent history across sessions

### 4. **Connection Monitoring**
- Real-time backend connection status
- Automatic retry mechanisms
- Clear error messages and guidance

## 🛠️ Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:7071/api/health

# Restart backend
cd SBH/BACKEND/MyFunctionApp
python local_server.py
```

### Frontend Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Restart frontend
cd SBH/FRONTEND/scanner-frontend
npm start
```

### Common Solutions
- **Port conflicts:** Change ports in configuration
- **API key issues:** Verify Gemini API key in `.env`
- **Permission errors:** Run as administrator if needed
- **Network issues:** Check firewall and antivirus settings

## 🔒 Security & Privacy

- **Local Processing:** All files processed locally
- **No Data Storage:** Files automatically cleaned up
- **API Security:** Gemini API key stored securely
- **CORS Protection:** Proper cross-origin handling

## 📊 System Status

Run health check anytime:
```bash
python SBH/check_system.py
```

Expected output:
```
✅ Backend: HEALTHY
✅ Frontend: RUNNING
🎉 SYSTEM STATUS: ALL SYSTEMS OPERATIONAL
```

## 🎉 Success!

Your DocuScan AI system is now ready for production use!

**Features Working:**
- ✅ Real AI-powered table extraction
- ✅ Beautiful modern interface
- ✅ Robust error handling
- ✅ Professional CSV output
- ✅ Cross-platform compatibility

**Ready for:**
- ✅ Personal document processing
- ✅ Business workflow integration
- ✅ Educational and research use
- ✅ Production deployment

---

**Built with ❤️ using React, Python, and Google Gemini AI**
