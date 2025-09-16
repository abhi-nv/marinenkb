# 🌊 Marine Data Verse

[![CI/CD Pipeline](https://github.com/abhi-nv/marine-data-verse/actions/workflows/deploy.yml/badge.svg)](https://github.com/abhi-nv/marine-data-verse/actions/workflows/deploy.yml)
[![Security Scan](https://github.com/abhi-nv/marine-data-verse/actions/workflows/security.yml/badge.svg)](https://github.com/abhi-nv/marine-data-verse/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-Driven Unified Data Platform for Oceanographic, Fisheries, and Molecular Biodiversity Insights. Built for CMLRE's Smart India Hackathon 2025 challenge to address critical data integration challenges in marine science.

## 🚀 Features

- **🔄 Unified Data Ingestion**: Multi-format support (CSV, JSON, DwC-A, OBIS-ENV)
- **🧠 AI-Powered Analysis**: CNN species identification, eDNA sequence matching
- **📊 Real-time Visualization**: Interactive maps, charts, environmental monitoring
- **📐 Standards Compliance**: Darwin Core and OBIS-ENV standardization
- **☁️ Cloud-Native**: Ready for deployment on AWS, Vercel, Netlify, and Docker

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **State Management**: TanStack Query
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Deployment**: Docker, GitHub Actions, Multi-cloud ready

## 📋 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/abhi-nv/marine-data-verse.git
cd marine-data-verse

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🚀 Deployment Options

This project supports multiple deployment platforms. Choose the one that best fits your needs:

### 🐳 Docker Deployment

```bash
# Build and run with Docker
docker build -t marine-data-verse .
docker run -p 80:80 marine-data-verse

# Or use Docker Compose
docker-compose up -d
```

### ⚡ Vercel (Recommended for React apps)

1. **One-click deployment:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abhi-nv/marine-data-verse)

2. **Manual deployment:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### 🌐 Netlify

1. **One-click deployment:**
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abhi-nv/marine-data-verse)

2. **Manual deployment:**
   ```bash
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=dist
   ```

### ☁️ AWS (S3 + CloudFront)

```bash
# Prerequisites: AWS CLI configured
chmod +x aws/deploy.sh
./aws/deploy.sh your-domain.com us-east-1
```

### 🖥️ Self-hosted

Use the deployment scripts for your platform:

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh production docker
```

**Windows:**
```powershell
.\deploy.ps1 -Environment "production" -Platform "docker"
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration  
VITE_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_REAL_TIME=true
```

### Build Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔒 Security

- GitHub Actions security scanning
- Docker image vulnerability scanning with Trivy
- Dependency scanning with Snyk
- Security headers implemented in Nginx/CDN configs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/abhi-nv/marine-data-verse/issues)
- 💬 [Discussions](https://github.com/abhi-nv/marine-data-verse/discussions)

## 🙏 Acknowledgments

- Built for CMLRE Smart India Hackathon 2025
- Powered by [Lovable](https://lovable.dev) for rapid development
- UI components from [shadcn/ui](https://ui.shadcn.com)
