# Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Steps

1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Configure Domain (Optional)**
   - In Pages settings, add your custom domain: `acepaste.xyz`
   - Update your DNS settings to point to GitHub Pages
   - Enable "Enforce HTTPS"

3. **Set up GitHub App (Optional)**
   - Go to GitHub Settings > Developer settings > GitHub Apps
   - Create a new GitHub App
   - Use the configuration from `.github/app.yml`

### Workflows

#### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Features**:
  - Automated testing
  - Security scanning with Trivy
  - Build verification
  - Automatic deployment to GitHub Pages

#### 2. Security Workflow (`.github/workflows/security.yml`)
- **Triggers**: Weekly schedule, Push to main, Pull requests
- **Features**:
  - Dependency review
  - Security audit
  - CodeQL analysis
  - Outdated package detection

#### 3. Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: Git tags (v*)
- **Features**:
  - Automatic release creation
  - Production build
  - Release notes generation

### Manual Deployment

If you need to deploy manually:

```bash
# Build the project
npm run build

# The dist folder contains the production files
# Upload contents to your hosting provider
```

### Environment Variables

Create these in your repository settings (Settings > Secrets and variables > Actions):

- `NODE_VERSION`: 18 (default)
- `GITHUB_TOKEN`: Automatically provided

### Custom Domain Setup

1. **Add CNAME file**:
   ```bash
   echo "acepaste.xyz" > public/CNAME
   ```

2. **Update DNS**:
   - Add CNAME record: `acepaste.xyz` → `sugarcypher.github.io`
   - Or A records pointing to GitHub Pages IPs

3. **Enable HTTPS**:
   - GitHub Pages will automatically provision SSL
   - Force HTTPS in repository settings

### Monitoring

- **Deployment Status**: Check Actions tab for workflow runs
- **Security Alerts**: Monitor Security tab for vulnerabilities
- **Performance**: Use GitHub Pages analytics
- **Uptime**: Monitor with external services

### Troubleshooting

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs in Actions tab

#### Deployment Issues
- Ensure GitHub Pages is enabled
- Check repository permissions
- Verify workflow file syntax

#### Domain Issues
- Verify DNS propagation
- Check CNAME file exists
- Ensure domain is properly configured

### Best Practices

1. **Always test locally** before pushing
2. **Use feature branches** for development
3. **Review security alerts** regularly
4. **Keep dependencies updated**
5. **Monitor deployment status**

### Support

For deployment issues:
- Check GitHub Actions logs
- Review GitHub Pages documentation
- Open an issue in this repository
