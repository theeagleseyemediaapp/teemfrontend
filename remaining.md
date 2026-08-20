📋 Full Audit & Deployment Guide
Created the 
audit_and_deployment_guide.md
 covering:

Mobile audit — 22 items checked, 4 missing (push notifications, offline caching, forgot password, receipts)
Web audit — 25 items checked, 3 missing (cookie consent, PWA, dynamic OG)
Backend audit — 22 items checked, key issues: SMTP is placeholder, no push notification service, no receipt generation
Priority improvements ranked by criticality
Complete EAS deployment walkthrough — Steps 1-9 from CLI install through store submission with eas.json config, app.json updates, and a pre-submission checklist
Please review the guide and let me know what you'd like to tackle first.

image upload

1. Target Format: Convert the input image into WebP format for optimal compression and modern browser compatibility.
2. Compression Logic: 
   - Dynamically resize images if they exceed a maximum width/height (e.g., 1920px), maintaining the original aspect ratio.
   - Reduce the quality factor to roughly 0.8 (80%) to balance sharp visual fidelity with drastic file size reduction.
   - Ensure the output is a standard Blob or File object.
3. Library Preference: Use a widely trusted client-side library like 'browser-image-compression' or 'compressorjs', or implement it using the native HTML5 Canvas API if no library is preferred.
4. Supabase Integration: Show how to take that compressed Blob and upload it directly to a Supabase Storage bucket using '@supabase/supabase-js'.

Provide clean, modular code with clear error handling for failed compressions or upload timeouts.
Use code with caution.