import { readFileSync, writeFileSync } from 'fs';

const indexPath = './build/client/index.html';

const gaScript = `
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JTRTC28WCK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-JTRTC28WCK');
</script>`;

try {
    let html = readFileSync(indexPath, 'utf8');
    html = html.replace('<head>', gaScript);
    writeFileSync(indexPath, html);
    console.log('✅ Google Analytics tag injected.');
} catch (err) {
    console.error('❌ Error injecting GA tag:', err);
}
