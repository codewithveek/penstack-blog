# Production Deployment Guide

## Pre-Deployment Checklist

### Environment Setup

1. **Generate Secure Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate ENCRYPTION_KEY
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Required Environment Variables**
   ```env
   # Database
   DB_NAME=your_production_db
   DB_PORT=3306
   DB_USER_NAME=your_db_user
   DB_USER_PASS=your_secure_password
   DB_HOST=your_db_host
   DB_SSL_CONFIG={"rejectUnauthorized":true}
   
   # Authentication
   NEXTAUTH_SECRET=<generated_secret>
   NEXTAUTH_URL=https://yourdomain.com
   
   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_ID=your_github_id
   GITHUB_SECRET=your_github_secret
   
   # Admin Account
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure_admin_password
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   
   # Security
   ENCRYPTION_KEY=<generated_64_char_hex>
   CRON_JOB_API_KEY=<random_secure_key>
   
   # Optional: CORS
   ALLOWED_ORIGIN=https://yourdomain.com
   
   # Webhooks (if using Resend)
   RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   bun run db:migrate
   
   # Seed initial data
   bun run db:seeds
   ```

### Build and Test

1. **Type Check**
   ```bash
   npx tsc --noEmit
   ```

2. **Lint**
   ```bash
   bun run lint
   ```

3. **Build**
   ```bash
   bun run build
   ```

4. **Test Production Build Locally**
   ```bash
   bun run start
   ```

### Security Verification

1. **Check Security Headers**
   ```bash
   curl -I https://yourdomain.com
   ```
   
   Verify presence of:
   - `Strict-Transport-Security`
   - `X-Frame-Options`
   - `X-Content-Type-Options`
   - `X-XSS-Protection`

2. **Test Rate Limiting**
   - Try multiple signup attempts (should limit after 5 in 1 minute)
   - Try multiple contact form submissions (should limit after 3 in 1 minute)

3. **Verify SSL/TLS**
   - Ensure HTTPS is enforced
   - Check SSL certificate validity

### Post-Deployment

1. **Monitor Logs**
   - Check application logs for errors
   - Monitor database connection pool
   - Watch for rate limit violations

2. **Test Critical Paths**
   - User signup and login
   - Post creation and publishing
   - Contact form submission
   - Newsletter subscription

3. **Performance Check**
   - Verify image optimization (AVIF/WebP serving)
   - Check API response caching
   - Monitor database query performance

### Rollback Plan

If issues occur:

1. **Immediate Actions**
   - Revert to previous deployment
   - Check error logs
   - Verify environment variables

2. **Database Rollback**
   ```bash
   # If migrations need rollback
   bun run db:rollback
   ```

### Monitoring Setup

Recommended monitoring:

1. **Application Monitoring**
   - Set up Sentry or similar for error tracking
   - Configure alerts for critical errors

2. **Performance Monitoring**
   - Monitor API response times
   - Track database query performance
   - Watch memory usage

3. **Security Monitoring**
   - Monitor failed login attempts
   - Track rate limit violations
   - Watch for suspicious activity

### Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update Node.js/Bun runtime

2. **Database Maintenance**
   - Regular backups
   - Monitor connection pool usage
   - Optimize slow queries

3. **Log Rotation**
   - Configure log rotation
   - Archive old logs
   - Monitor disk space

## Deployment Platforms

### Vercel

1. Connect repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Netlify

1. Connect repository
2. Configure build settings:
   - Build command: `bun run build`
   - Publish directory: `.next`
3. Set environment variables
4. Deploy

### Custom Server

1. Install dependencies:
   ```bash
   bun install --production
   ```

2. Build application:
   ```bash
   bun run build
   ```

3. Start with PM2:
   ```bash
   pm2 start "bun run start" --name blog
   pm2 save
   pm2 startup
   ```

4. Configure Nginx reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3025;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify credentials
   - Check SSL configuration
   - Ensure database is accessible from deployment environment

2. **Build Failures**
   - Clear `.next` directory
   - Check TypeScript errors
   - Verify all dependencies installed

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check OAuth callback URLs
   - Ensure NEXTAUTH_URL matches deployment URL

4. **Rate Limiting Not Working**
   - Verify X-Forwarded-For header is set
   - Check if behind proxy/load balancer
   - Review rate limit configuration

### Support

For issues:
1. Check application logs
2. Review error messages
3. Verify environment configuration
4. Test locally with production build
