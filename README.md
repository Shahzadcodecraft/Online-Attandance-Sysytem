# FaceGuard - Online Attendance System

An AI-powered facial recognition attendance system built with React, AWS Rekognition, and face-api.js.

## Features

- **Face Registration**: Register employees with their facial data
- **Attendance Scanning**: Mark attendance via real-time face detection
- **AWS Rekognition Integration**: Cloud-based facial recognition
- **Responsive UI**: Modern, mobile-friendly interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui
- **Face Detection**: face-api.js, react-webcam
- **Backend**: AWS Rekognition (requires backend API)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running (see AWS setup below)

### Installation

```bash
# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## AWS Credentials Management

### Best Practices for Handling AWS Credentials

1. **Never commit credentials to git**
   - Add `.env` and any credential files to `.gitignore`
   - Use environment variables instead of hardcoded values

2. **Use IAM Roles (Recommended for Production)**
   - EC2: Attach IAM role to instance
   - Lambda: Use execution role
   - ECS/EKS: Use task/execution roles

3. **Local Development Options**

   **Option A: AWS CLI Configuration**
   ```bash
   aws configure
   # Credentials stored in ~/.aws/credentials
   ```

   **Option B: Environment Variables**
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```
   **Never commit this `.env` file!**

   **Option C: `.aws/credentials` file**
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   region = us-east-1
   ```

4. **Security Guidelines**
   - Use **temporary credentials** via AWS STS when possible
   - Apply **least privilege** principle - only grant required permissions
   - **Rotate credentials** regularly
   - Use **AWS Secrets Manager** or **Parameter Store** for production
   - Enable **MFA** for AWS accounts

5. **Required IAM Permissions for Rekognition**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "rekognition:CompareFaces",
           "rekognition:IndexFaces",
           "rekognition:SearchFacesByImage",
           "rekognition:DeleteFaces",
           "rekognition:ListFaces",
           "rekognition:DescribeCollection"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## Project Structure

```
src/
  components/       # Reusable UI components
  pages/            # Route pages (Index, NotFound)
  services/         # API service functions
  hooks/            # Custom React hooks
  lib/              # Utility functions
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run test` | Run tests |
| `bun run lint` | Lint code |

## License

MIT
