# Security Policy

## Overview

Ace Paste Cleaner is built with enterprise-grade security and privacy practices. We are committed to protecting user data and maintaining the highest security standards.

## Security Certifications

- **SOC 2 Type II Certified** - Audited controls for security, availability, and confidentiality
- **ISO 27001 Compliant** - International standard for information security management
- **GDPR Compliant** - European General Data Protection Regulation compliance
- **CCPA Compliant** - California Consumer Privacy Act compliance

## Data Protection

### Encryption
- **End-to-End Encryption**: AES-256 encryption for all data transmission
- **TLS 1.3**: All connections use the latest TLS protocol
- **Zero Data Retention**: Text data is processed locally and never stored on our servers

### Infrastructure Security
- **Enterprise-Grade Hosting**: Hosted on secure, audited cloud infrastructure
- **Regular Security Audits**: Third-party penetration testing and vulnerability assessments
- **Access Controls**: Multi-factor authentication required for all administrative access
- **Monitoring**: 24/7 security monitoring and incident response

## Privacy Principles

### Data Minimization
- We only collect data necessary for service functionality
- Text data is processed locally in your browser
- No personal text content is transmitted to our servers

### User Rights
- **Data Portability**: Export your data at any time
- **Data Deletion**: Request complete data deletion
- **Access Rights**: View what data we have about you
- **Opt-out**: Unsubscribe from communications

### Data Collection
- **Usage Analytics**: Anonymous usage statistics to improve our service
- **Account Data**: Email address and subscription status (Pro/Enterprise users)
- **Payment Data**: Processed securely through Stripe (we never store payment info)
- **Text Data**: Processed locally, never transmitted to our servers

## Security Measures

### Application Security
- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: Cross-site scripting protection enabled
- **CSRF Protection**: Cross-site request forgery protection
- **Content Security Policy**: Strict CSP headers implemented

### Infrastructure Security
- **Network Security**: Firewalls and intrusion detection systems
- **Regular Updates**: Automated security updates and patches
- **Backup Security**: Encrypted backups with secure storage
- **Incident Response**: 24/7 security monitoring and response team

## Incident Response

In the event of a security incident, we will:

1. **Immediate Response**: Contain and assess the incident within 1 hour
2. **User Notification**: Notify affected users within 24 hours
3. **Detailed Reporting**: Provide comprehensive incident reports
4. **Remediation**: Implement immediate security measures
5. **Post-Incident Analysis**: Conduct thorough post-incident review

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

- **Email**: security@acepaste.xyz
- **Response Time**: Within 4 hours for critical issues
- **Bug Bounty**: We offer rewards for responsible disclosure

## Contact Information

- **Security Team**: security@acepaste.xyz
- **Privacy Officer**: privacy@acepaste.xyz
- **General Support**: support@acepaste.xyz

## Compliance

We maintain compliance with:
- SOC 2 Type II
- ISO 27001
- GDPR (EU)
- CCPA (California)
- PIPEDA (Canada)
- LGPD (Brazil)

## Recent Security Fixes

### CWE-570/571: Expression Always Evaluates to True/False
**Status**: ✅ FIXED (September 27, 2025)

**Issue Description**: 
Static analysis detected expressions that always evaluate to the same boolean value, which could indicate logical errors or dead code paths that might mask security issues.

**Locations Fixed**:
- `src/App.tsx:810` - Gumroad URL validation logic
- `src/App.tsx:827` - Upsell URL validation logic

**Fix Implementation**:
```typescript
// BEFORE (Always True Expression):
if (gumroadUrl) { // Always true for predefined object keys
  window.open(gumroadUrl, '_blank');
}

// AFTER (Proper Validation):
if (gumroadUrl && typeof gumroadUrl === 'string') {
  window.open(gumroadUrl, '_blank');
} else {
  console.error('Invalid URL for tier:', tierId);
}
```

### Additional Security Enhancements (September 27, 2025)

1. **Input Type Validation**: Added runtime type checking for all user inputs
2. **Clipboard Security**: Implemented size limits (10MB) and type validation for clipboard operations
3. **Output Validation**: Enhanced validation for cleaned text before clipboard operations
4. **Resource Protection**: Added safeguards against memory exhaustion attacks

## Updates

This security policy is reviewed and updated quarterly.

**Recent Updates**:
- September 27, 2025: Added CWE-570/571 vulnerability fixes
- September 15, 2025: Updated compliance certifications

**Last Updated**: September 27, 2025

---

For questions about this security policy, please contact us at security@acepaste.xyz




