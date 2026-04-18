# 🚀 Deployment Guide

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- Server with at least 2GB RAM
- Domain name (optional)
- SSL Certificate (optional, for HTTPS)

---

## Docker Deployment

### 1. Prepare Environment

```bash
# Copy production template
cp .env.example .env

# Edit with production values
nano .env
```

**Production .env:**
```env
APP_PORT=8080
DB_HOST=db-malaschat
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secure_password_here
DB_NAME=malaschat_bot
OPENAI_API_KEY=sk-...
WHATSAPP_SESSION=./session
```

### 2. Deploy with Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.yml up -d

# Check logs
docker-compose logs -f

# Verify health
curl http://localhost:9092/health
```

### 3. Secure Setup

```bash
# Set restrictive permissions
chmod 600 .env

# Use strong database password
# Use API key with appropriate permissions
# Enable firewall rules
```

---

## Cloud Deployment

### AWS EC2

**Launch EC2 Instance:**
```bash
# t3.small or larger
# Ubuntu 22.04 LTS
# 20GB+ storage
# Security group: allow 80, 443, 22
```

**Setup:**
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/yourusername/MalasBalasChat.git
cd MalasBalasChat

# Deploy
docker-compose up -d
```

### Docker Hub Registry

```bash
# Build image with tag
docker build -f docker/Dockerfile -t yourusername/wa-bot:latest .

# Login to Docker Hub
docker login

# Push
docker push yourusername/wa-bot:latest

# Deploy on any server
docker pull yourusername/wa-bot:latest
docker-compose up -d
```

---

## Nginx Reverse Proxy

Setup reverse proxy for production:

```nginx
upstream wa_bot {
    server localhost:8080;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://wa_bot;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## Let's Encrypt SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

Update Nginx:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}
```

---

## Database Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DB_NAME="malaschat_bot"
DB_USER="postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
docker-compose exec -T db-malaschat pg_dump \
    -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Restore Backup

```bash
# Restore from backup
docker-compose exec -T db-malaschat psql \
    -U postgres malaschat_bot < backup_20240101_120000.sql
```

### Cron Job (Daily Backup)

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

## Monitoring & Logs

### Docker Logs

```bash
# View logs
docker-compose logs -f app-malaschat

# Last 100 lines
docker-compose logs --tail=100 app-malaschat

# With timestamps
docker-compose logs -f --timestamps app-malaschat
```

### System Resources

```bash
# Monitor containers
docker stats

# Check disk usage
docker system df

# Cleanup
docker system prune -a
```

---

## Health Checks

### Application Health

```bash
# API health endpoint
curl https://your-domain.com/health

# Should return
# {"status":"healthy"}
```

### Database Health

```bash
# Check PostgreSQL
docker-compose exec -T db-malaschat pg_isready -U postgres
```

### Setup Monitoring Script

```bash
#!/bin/bash
# monitor.sh

while true; do
    STATUS=$(curl -s http://localhost:9092/health | jq -r '.status')
    
    if [ "$STATUS" != "healthy" ]; then
        # Send alert
        echo "Alert: Bot is unhealthy"
        # Restart
        docker-compose restart app-malaschat
    fi
    
    sleep 60
done
```

---

## Performance Optimization

### Database Connection Pool

Adjust in `internal/infrastructure/database/database.go`:
```go
db.SetMaxOpenConns(50)      // Increase for high traffic
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(time.Hour)
```

### Add Redis Caching

```go
// For persona caching
cache := redis.NewClient(&redis.Options{
    Addr: "redis:6379",
})
```

---

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes:

```bash
# Docker Swarm
docker swarm init
docker service create --name wa-bot \
    --replicas 3 \
    yourusername/wa-bot:latest
```

### Load Balancer

```yaml
services:
  load-balancer:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  app1:
    image: yourusername/wa-bot:latest
    environment:
      - APP_PORT=8080

  app2:
    image: yourusername/wa-bot:latest
    environment:
      - APP_PORT=8081

  app3:
    image: yourusername/wa-bot:latest
    environment:
      - APP_PORT=8082
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs app-malaschat
docker-compose up --no-detach  # See errors in real-time
```

### Database connection issues
```bash
docker-compose exec db-malaschat pg_isready -U postgres
docker-compose restart db-malaschat
```

### Out of memory
```bash
# Check usage
docker stats

# Increase limits in docker-compose.yml
services:
  app-malaschat:
    mem_limit: 2g
```

### High CPU usage
```bash
# Profile application
docker top app-malaschat

# Check for infinite loops or inefficient queries
```

---

## Security Checklist

- [ ] Change default database password
- [ ] Use strong OpenAI API key
- [ ] Enable SSL/TLS
- [ ] Set proper file permissions (chmod 600 .env)
- [ ] Use firewall rules
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use secrets manager (e.g., AWS Secrets Manager)
- [ ] Rotate API keys regularly

---

## Rollback Plan

```bash
# Tag production version
docker tag yourusername/wa-bot:latest yourusername/wa-bot:prod-1.0

# If issues occur
docker pull yourusername/wa-bot:prod-1.0
docker-compose up -d
```

---

## Support & Issues

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify .env configuration
3. Test database connection
4. Check API documentation
5. Review error messages carefully
