import React, { useState } from 'react';

const InstallationGuide: React.FC = () => {
  const [platform, setPlatform] = useState<'ubuntu' | 'iis'>('iis');

  const iisConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <staticContent>
            <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="7.00:00:00" />
            <remove fileExtension=".ts" />
            <remove fileExtension=".tsx" />
            <mimeMap fileExtension=".ts" mimeType="application/javascript" />
            <mimeMap fileExtension=".tsx" mimeType="application/javascript" />
            <mimeMap fileExtension=".json" mimeType="application/json" />
        </staticContent>
        <rewrite>
            <rules>
                <rule name="SocietySync SPA Route" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="index.html" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>`;

  const psScript = `# SocietySync IIS Automated Setup
$siteName = "SocietySync"
$port = 8080
$physicalPath = $PSScriptRoot

# 1. Create App Pool
New-WebAppPool -Name "SocietySyncPool"
Set-ItemProperty "IIS:\\AppPools\\SocietySyncPool" -Name "managedRuntimeVersion" -Value ""

# 2. Create Website
New-Website -Name $siteName -Port $port -PhysicalPath $physicalPath -ApplicationPool "SocietySyncPool"

# 3. Set Permissions
$acl = Get-Acl $physicalPath
$acl.SetAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule "IIS_IUSRS","ReadAndExecute","Allow"))
Set-Acl $physicalPath $acl`;

  const downloadPdfGuide = () => {
    const guideHtml = `
      <html>
        <head>
          <title>SocietySync Enterprise - IIS Installation Guide</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #1e293b; max-width: 800px; margin: auto; line-height: 1.6; }
            .header { border-bottom: 4px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-weight: 900; font-size: 32px; color: #4f46e5; letter-spacing: -1px; }
            .title { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 10px; text-transform: uppercase; }
            h2 { font-size: 20px; font-weight: 900; color: #4f46e5; margin-top: 40px; border-left: 4px solid #4f46e5; padding-left: 15px; }
            h3 { font-size: 16px; font-weight: 700; color: #334155; margin-top: 25px; }
            pre { background: #f1f5f9; padding: 20px; border-radius: 12px; font-family: monospace; font-size: 12px; overflow-x: auto; border: 1px solid #e2e8f0; white-space: pre-wrap; }
            .step { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; }
            .step-num { background: #4f46e5; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; items-center: center; justify-content: center; font-weight: 900; flex-shrink: 0; font-size: 14px; margin-top: 4px; }
            .warning { background: #fff7ed; border: 1px solid #ffedd5; color: #9a3412; padding: 20px; border-radius: 12px; margin-top: 30px; font-size: 14px; }
            .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SocietySync Enterprise</div>
            <div class="title">Official Deployment Documentation</div>
            <p>Version 3.0.1 • Windows Server / IIS Edition</p>
          </div>

          <h2>System Requirements</h2>
          <ul>
            <li>Windows Server 2016 or higher</li>
            <li>IIS 10.0+ with "Static Content" enabled</li>
            <li><strong>Microsoft URL Rewrite Module 2.1</strong> (Mandatory)</li>
          </ul>

          <h2>Deployment Steps</h2>
          
          <div class="step">
            <div class="step-num">1</div>
            <div>
              <h3>Automated Setup (Recommended)</h3>
              <p>Run the <code>setup-iis.ps1</code> script as Administrator from the application root folder. This will create the site and set permissions automatically.</p>
            </div>
          </div>

          <div class="step">
            <div class="step-num">2</div>
            <div>
              <h3>Manual MIME Setup</h3>
              <p>Ensure <strong>.ts</strong> and <strong>.tsx</strong> are mapped to <code>application/javascript</code> in IIS MIME Types.</p>
            </div>
          </div>

          <div class="step">
            <div class="step-num">3</div>
            <div>
              <h3>Web.Config</h3>
              <p>The included <code>web.config</code> handles SPA routing and MIME mapping automatically if URL Rewrite is installed.</p>
            </div>
          </div>

          <div class="warning">
            <strong>PRO TIP:</strong> If you see a "System Initialization Failure" on boot, check the browser console. Usually, it means the URL Rewrite module is missing or IIS is blocking .tsx files.
          </div>

          <div class="footer">
            &copy; 2024 SocietySync Team. Documentation valid for all Enterprise deployments.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;


    const blob = new Blob([guideHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SocietySync_IIS_Installation_Guide.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codeBlock = (title: string, code: string) => (
    <div className="bg-slate-900 rounded-2xl overflow-hidden my-6 border border-slate-800 shadow-lg">
      <div className="bg-slate-800/50 px-5 py-2 flex justify-between items-center border-b border-slate-700">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-[10px] font-black text-indigo-400 uppercase hover:text-indigo-300 transition-colors"
        >
          Copy Code
        </button>
      </div>
      <pre className="p-5 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Deployment Hub</h2>
          <p className="text-slate-500 mt-2 font-medium">Step-by-step production setup for SocietySync Core.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
            onClick={downloadPdfGuide}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <span>📥</span> Download Printable Guide
          </button>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setPlatform('ubuntu')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'ubuntu' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Linux (Nginx)
            </button>
            <button 
              onClick={() => setPlatform('iis')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'iis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Windows (IIS)
            </button>
          </div>
        </div>
      </div>

      {platform === 'ubuntu' ? (
        <div className="animate-in fade-in slide-in-from-left-4 duration-400">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">01</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ubuntu Environment</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">Update packages and install the Nginx web server engine.</p>
            {codeBlock("Terminal - Setup", 
`sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y`)}
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">02</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nginx VHost Config</h3>
            </div>
            {codeBlock("Config - /etc/nginx/sites-available/default", 
`server {
    listen 80;
    server_name _;
    root /var/www/societysync;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    types {
        application/javascript ts tsx;
    }
}`)}
          </section>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-400">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">01</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Automated IIS Setup</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">We've included a PowerShell script to automate the website creation and permission settings.</p>
            {codeBlock("PowerShell - setup-iis.ps1", psScript)}
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">02</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">IIS MIME Configuration</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">Add these to <strong>MIME Types</strong> in IIS Manager to avoid syntax errors:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Extension</p>
                <p className="text-sm font-bold text-slate-900">.ts</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase mt-2">application/javascript</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase">Extension</p>
                <p className="text-sm font-bold text-slate-900">.tsx</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase mt-2">application/javascript</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">03</div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Root web.config</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">Place this <code>web.config</code> in the same folder as <code>index.html</code>.</p>
            {codeBlock("XML - web.config", iisConfig)}
          </section>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-start">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl shrink-0">⚠️</div>
        <div>
          <h4 className="font-black text-amber-900 text-xl tracking-tight uppercase">Critical Troubleshooting</h4>
          <div className="mt-4 space-y-3 text-sm text-amber-800 leading-relaxed font-medium">
            <p>• <strong>MIME Conflict:</strong> Ensure no other system module is overriding the .ts/.tsx extensions.</p>
            <p>• <strong>Identity:</strong> Use <code>ApplicationPoolIdentity</code> for the App Pool but ensure folder permissions for <code>IIS_IUSRS</code>.</p>
            <p>• <strong>Babel:</strong> Do not pre-minify files; the current runtime requires human-readable TS for on-the-fly transpilation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallationGuide;